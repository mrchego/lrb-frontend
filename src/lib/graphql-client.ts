const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql/";

export class GraphQLError extends Error {
  code?: string;
  field?: string;
  constructor(message: string, code?: string, field?: string) {
    super(message);
    this.code = code;
    this.field = field;
  }
}

export async function gqlFetch<T = any>(
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    const err = json.errors[0];
    throw new GraphQLError(err.message, err.extensions?.code);
  }
  return json.data as T;
}

export async function gqlUpload<T = any>(
  query: string,
  variables: Record<string, any>,
  files: Record<string, File>,
): Promise<T> {
  const form = new FormData();
  form.append("operations", JSON.stringify({ query, variables }));
  const fileKeys = Object.keys(files);
  const map: Record<string, string[]> = {};
  fileKeys.forEach((key, i) => {
    map[i] = [key];
  });
  form.append("map", JSON.stringify(map));
  fileKeys.forEach((key, i) => form.append(String(i), files[key]));

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const json = await res.json();
  if (json.errors?.length) {
    const err = json.errors[0];
    throw new GraphQLError(err.message, err.extensions?.code);
  }
  return json.data as T;
}



// Understanding gqlFetch and gqlUpload

// This file is a utility/helper module. It has no UI. Other files import it whenever they need to talk to your GraphQL backend (probably your Django server).

// 1. What is it?

// The file contains four things:

// Piece	Kind	Role
// GRAPHQL_URL	constant (variable)	The address of the backend
// GraphQLError	class (a custom error type)	A special error that carries code and field
// gqlFetch	async function	Sends a normal GraphQL query or mutation
// gqlUpload	async function	Sends a GraphQL mutation that includes files

// It is not a component, hook, or page. It is plain TypeScript, and it is not marked "use client" or "use server". That means it runs wherever it is imported. Your code uses File and credentials: "include", so in practice it runs in the browser.

// Key words:

// export makes something usable from other files.
// async marks a function that does slow work (like a network request) and returns a Promise.
// await means "pause here until the slow work finishes."
// class is a blueprint for making objects.
// extends means "build a new class on top of an existing one."
// fetch is the browser's built-in function for sending HTTP requests. It is JavaScript, not React or Next.js.
// FormData is a built-in browser object for building a form-style request body that can hold files.
// 2. How is it written?
// The constant
// ts
// const GRAPHQL_URL =
//   process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql/";

// Read it right side first:

// text
// process.env.NEXT_PUBLIC_GRAPHQL_URL
// ↓
// look inside process.env (an object of environment variables)
// and get the one named NEXT_PUBLIC_GRAPHQL_URL

// ||
// ↓
// "or": if the left side is empty/undefined, use the right side

// "http://localhost:8000/graphql/"
// ↓
// the fallback address (your local Django server)

// const GRAPHQL_URL =
// ↓
// store the final result in a constant
// . means "get the thing inside." process.env.X means "inside process, inside env, get X."
// Next.js-specific: a variable starting with NEXT_PUBLIC_ is copied into the browser bundle. Variables without that prefix stay on the server only. Here the URL is meant to be public, so that is fine. Never put secrets in a NEXT_PUBLIC_ variable.
// The line break after = is only formatting. It changes nothing.
// The class
// ts
// export class GraphQLError extends Error {
//   code?: string;
//   field?: string;
//   constructor(message: string, code?: string, field?: string) {
//     super(message);
//     this.code = code;
//     this.field = field;
//   }
// }
// code?: string; declares a property called code. The ? means it is optional (it can be undefined). : string is a TypeScript type annotation. The ; ends the statement.
// constructor(...) is a special function that runs once when you create an object with new GraphQLError(...).
// super(message) calls the constructor of the parent class (Error), so the normal error message setup still happens.
// this means "the object being created." this.code = code copies the parameter into the object.
// The generics and type syntax in the functions
// <T = any> is a generic. T is a placeholder for a type that the caller chooses. = any is the default if they choose nothing.
// variables?: Record<string, any> means an optional parameter. Record<string, any> means an object whose keys are strings and whose values can be anything.
// Promise<T> means "this function will eventually give you a T."
// json.errors?.length uses ?. (optional chaining). If errors is missing, the whole thing becomes undefined instead of crashing.
// json.data as T is a type assertion. You are telling TypeScript, "trust me, this is a T."
// { query, variables } is shorthand for { query: query, variables: variables }. This is called shorthand property syntax.
// 3. Signatures
// The constructor
// ts
// constructor(message: string, code?: string, field?: string)
// Part	Meaning
// constructor	The setup function for the class
// ( )	Holds the parameters (fill-in-the-blank slots)
// message: string	Required parameter, must be text
// code?: string	Optional parameter, text or missing
// ,	Separates parameters
// gqlFetch
// ts
// export async function gqlFetch<T = any>(
//   query: string,
//   variables?: Record<string, any>,
// ): Promise<T> {
// Part	Meaning
// export	Other files can import it
// async	Always returns a Promise, and allows await inside
// function	Declares a function
// gqlFetch	The name
// <T = any>	Generic type placeholder, defaulting to any
// query: string	The GraphQL text
// variables?: ...	Optional values to plug into the query
// trailing ,	Allowed after the last parameter, purely style
// ): Promise<T>	The return type: a Promise that resolves to T
// {	Start of the function body
// gqlUpload

// Same shape, but:

// variables is required (no ?).
// There is a third parameter, files: Record<string, File>: an object whose keys are strings and whose values are browser File objects.

// This is a normal function declaration, not an arrow function. An arrow function would look like const gqlFetch = async (query: string) => { ... }. The main practical difference is style (and how this behaves, which does not matter here).

// 4. Body, step by step
// gqlFetch
// ts
// const res = await fetch(GRAPHQL_URL, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   credentials: "include",
//   body: JSON.stringify({ query, variables }),
// });

// Inside-out:

// { query, variables } builds a JavaScript object.
// JSON.stringify(...) turns that object into a JSON string, because HTTP bodies are text.
// The options object says: use POST, tell the server "this is JSON" (the header), and credentials: "include" means "send cookies too, even to another origin."
// fetch(...) sends the request. await pauses until the response headers arrive.
// const res = stores the response object.
// ts
// const json = await res.json();

// res.json() reads the body and parses the text back into an object. It is also slow, so it needs await.

// ts
// if (json.errors?.length) {
//   const err = json.errors[0];
//   throw new GraphQLError(err.message, err.extensions?.code);
// }
// GraphQL servers usually reply with HTTP status 200 even on failure, and put problems in an errors array. So this code checks for that array.
// If the array exists and has items, take the first error ([0]; counting starts at 0).
// new GraphQLError(...) builds your custom error. throw stops the function and sends the error to whoever called it.
// ts
// return json.data as T;

// If nothing went wrong, return the data part, labelled as type T.

// gqlUpload

// Files cannot go inside JSON, so this function follows the GraphQL multipart request spec, which has three parts:

// operations: the query and variables as JSON text.
// map: a JSON object saying which uploaded file goes into which variable.
// The files themselves, named "0", "1", and so on.
// ts
// const form = new FormData();
// form.append("operations", JSON.stringify({ query, variables }));

// Creates an empty form and adds part 1.

// ts
// const fileKeys = Object.keys(files);

// Object.keys returns an array of the object's keys. For { "variables.avatar": file } you get ["variables.avatar"].

// ts
// const map: Record<string, string[]> = {};
// fileKeys.forEach((key, i) => {
//   map[i] = [key];
// });
// forEach runs a function once per array item. key is the item and i is its position.
// (key, i) => { ... } is an arrow function, written inline as a callback.
// map[i] = [key] sets map["0"] = ["variables.avatar"].
// The [key] is an array with one item. The spec allows one file to fill several places, hence an array.
// ts
// form.append("map", JSON.stringify(map));
// fileKeys.forEach((key, i) => form.append(String(i), files[key]));
// Adds part 2.
// String(i) turns the number 0 into text "0".
// files[key] looks up the file by its key ([] here means "get by name").
// This arrow function has no {}, so the value of form.append(...) is automatically returned. Here that value is ignored.

// Then fetch is called with body: form. There is no Content-Type header on purpose. The browser must create it itself, because it includes a random "boundary" string that separates the parts. If you set it manually, uploads break.

// The error handling and return are identical to gqlFetch.

// 5. Why?
// One place for all requests. Without this, every component would repeat fetch, headers, JSON parsing, and error checks. One mistake would then have to be fixed in 50 places.
// Custom GraphQLError. A plain Error only has a message. Callers can now check err.code (for example "UNAUTHENTICATED") and react differently from a generic failure. instanceof GraphQLError lets you tell your API errors apart from network errors.
// Generics <T>. The function does not know what data comes back. The caller says so: gqlFetch<{ users: User[] }>(...), and gets autocomplete on the result.
// credentials: "include". This suggests your backend uses cookie-based authentication (session or HTTP-only cookie JWT). This is a good security choice: JavaScript never touches the token, which reduces theft through XSS. The trade-off is that your backend must enable CORS with credentials for your frontend origin and protect against CSRF.
// Plain fetch instead of Apollo or urql. This is simple and dependency-free, but you lose automatic caching, loading states, and retries. It fits a small project. A bigger one may want a real GraphQL client.

// Weak spots worth noticing (this is useful for learning to review code):

// No res.ok check. If the server crashes and returns an HTML error page, res.json() throws a confusing parse error.
// Only the first error is thrown. Other errors (like multiple field validation errors) are dropped.
// field is never used. The class accepts field, but the code never passes it, so it is always undefined. Either pass err.extensions?.field or remove it.
// any turns off type checking. unknown would be safer.
// json.data as T is unchecked. If the server sends something different, TypeScript will not catch it at runtime.
// Duplicated code. The error-handling block appears twice. A small helper such as handleResponse(res) would remove that.
// Upload key format. The keys in files must be variable paths like "variables.avatar". Per the spec, the matching spot inside variables should be null. That is a caller convention the code does not enforce.
// 6. Connections
// text
// React Component (form, page, hook)
//         ↓ calls
// gqlFetch(QUERY_STRING, { variables })
//         ↓ fetch POST + cookies
// http://.../graphql/   (Django GraphQL endpoint)
//         ↓
// Resolvers → Services/Selectors → Database
//         ↓
// JSON { data } or { errors }
//         ↓
// gqlFetch checks errors
//    ├─ errors → throw GraphQLError → component catch → show message
//    └─ data   → return T → component sets state → UI
// Backend link: the code in err.extensions?.code comes from the backend. Your Django GraphQL layer decides the code (for example a permission failure), and this file only reads it.
// Environment link: .env.local (in your Next.js project) sets NEXT_PUBLIC_GRAPHQL_URL.
// Missing context: to know how errors and codes are shaped, look at how your backend formats extensions. To see how this is used, look at any file that imports gqlFetch.
// 7. Advanced concepts

// Promises and async/await. A network request takes time. A Promise is an object that means "a value will arrive later." await unwraps it. Without await, res would be a Promise object, not the response.

// Generics. Think of T as a blank labeled "result type." Promise<T> becomes Promise<User[]> once filled in. TypeScript uses this only while checking your code. It disappears at runtime.

// Type assertion (as T). This does not convert or check anything. It only silences TypeScript. If the data is wrong, you find out at runtime.

// Class inheritance. GraphQLError extends Error gets message, stack, and other features free from Error. That is why super(message) is needed: it runs the parent's setup first.

// Cookies and CORS. With credentials: "include", the browser sends cookies cross-origin only if the server replies with Access-Control-Allow-Credentials: true and a specific (not *) allowed origin.

// 8. Small example
// tsx
// type UsersData = { users: { id: string; name: string }[] };

// try {
//   const data = await gqlFetch<UsersData>(
//     "query { users { id name } }"
//   );
//   console.log(data.users[0].name);
// } catch (e) {
//   if (e instanceof GraphQLError) console.log(e.code);
// }

// Upload:

// ts
// await gqlUpload(
//   "mutation($file: Upload!) { uploadAvatar(file: $file) { ok } }",
//   { file: null },
//   { "variables.file": someFile },
// );
// 9. Reading pattern

// For any function like this, read in layers:

// text
// 1. Main verb?         → "sends a request, returns data"
// 2. Who does it?       → fetch(...)
// 3. Input data?        → query, variables (and files)
// 4. Nested calls?      → evaluate inside-out:
//                         JSON.stringify(...) before fetch(...)
// 5. Assignments?       → right side first, then the name on the left
// 6. What if it fails?  → find every `throw` and every `if`

// To write something like this yourself:

// Decide the input and output (query in, data out).
// Write the raw fetch call.
// Parse the response.
// Handle the failure path.
// Add types.
// Remove duplication.
// 10. What I should remember
// await pauses until a Promise finishes. Any function that uses await must be marked async.
// <T> is a blank that the caller fills in with a type. It exists only for TypeScript checking.
// ? after a name means optional, and ?. means "safely go inside if it exists."
// NEXT_PUBLIC_ environment variables are visible to everyone in the browser.
// GraphQL errors often arrive with HTTP 200 inside errors, so you must check the body, not just the status.




// Claude is AI and can make mistakes. Please doub