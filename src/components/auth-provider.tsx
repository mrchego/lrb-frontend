"use client";
import { gqlFetch } from "@/lib/graphql-client";
import { LOGIN_MUTATION, LOGOUT_MUTATION } from "@/lib/mutation";
import { EFFECTIVE_PERMISSION_QUERY, ME_QUERY } from "@/lib/queries";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";


type ImageRef = { url: string; name: string } | null;

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  avatar: ImageRef;
  isSuperuser: boolean;
  company: { id: string; name: string } | null;
};

type AuthContextValue = {
  user: User | null;
  permissions: string[];
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; errors?: any[] }>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
  setUser: (u: User) => void;
  hasPermission: (codename: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async (userId: string) => {
    try {
      const data = await gqlFetch<{
        effectivePermissions: { codenames: string[] };
      }>(EFFECTIVE_PERMISSION_QUERY, { userId });
      setPermissions(data.effectivePermissions.codenames);
    } catch {
      setPermissions([]);
    }
  };

  const refetch = async () => {
    try {
      const data = await gqlFetch<{ me: User | null }>(ME_QUERY);
      setUser(data.me);
      if (data.me) {
        await fetchPermissions(data.me.id);
      } else {
        setPermissions([]);
      }
    } catch {
      setUser(null);
      setPermissions([]);
    }
  };

  useEffect(() => {
    (async () => {
      await refetch();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const onFocus = () => {
      if (user) {
        fetchPermissions(user.id);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    const data = await gqlFetch<{
      login: { success: boolean; user: User | null; errors: any[] };
    }>(LOGIN_MUTATION, { email, password });
    if (data.login.success) {
      await refetch();
    }
    return { success: data.login.success, errors: data.login.errors };
  };

  const logout = async () => {
    await gqlFetch(LOGOUT_MUTATION);
    setUser(null);
    setPermissions([]);
  };

  const hasPermission = (codename: string) =>
    !!user?.isSuperuser || permissions.includes(codename);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        login,
        logout,
        refetch,
        setUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}



// type ImageRef

// Now we get to TypeScript.

// type ImageRef = { url: string; name: string } | null;

// This is very important.

// type
// type

// means:

// "I'm creating a description of what a value is allowed to look like."

// We're creating a type called:

// ImageRef
// =
// =

// Here = means:

// "The type on the left is defined as the type on the right."

// So:

// type ImageRef = ...

// means:

// ImageRef is this type.

// { }
// {
//   url: string;
//   name: string;
// }

// Here { } describe an object.

// The object must contain:

// url

// and:

// name
// url: string
// url: string

// The colon:

// :

// means:

// "The type of url is..."

// So:

// url: string

// means:

// url must contain text.

// For example:

// {
//   url: "photo.jpg"
// }
// name: string

// Same thing:

// name: string

// means:

// name must be a string.

// ;
// url: string;
// name: string;

// The semicolon separates the properties.

// 7. The | null

// This part is extremely important:

// { url: string; name: string } | null

// The | means:

// OR

// So this type means:

// ImageRef can be:

//     an object
//        OR
//     null

// For example, this is valid:

// {
//   url: "photo.jpg",
//   name: "profile"
// }

// And this is also valid:

// null

// So:

// type ImageRef = { url: string; name: string } | null;

// can be translated into English:

// Create a type called ImageRef. It can either be an object containing a string url and string name, or it can be null.

// 8. type User

// Now:

// type User = {

// This means:

// Create a type called User.

// And { starts the description of the object.

// Properties
// id: string;
// email: string;
// firstName: string;
// lastName: string;
// fullName: string;
// phone: string;

// Every one follows the same pattern:

// propertyName: type;

// For example:

// id: string;

// means:

// A User object must have an id, and that id must be a string.

// Boolean
// isSuperuser: boolean;

// boolean means:

// true

// or:

// false

// So:

// isSuperuser: boolean;

// means:

// isSuperuser must be either true or false.

// 9. Nested object

// This:

// company: { id: string; name: string } | null;

// looks complicated, but we can read it in pieces.

// Start here:

// company:

// There is a property called company.

// Then:

// { id: string; name: string }

// Its value is an object containing id and name.

// Then:

// | null

// OR it can be null.

// So:

// company: { id: string; name: string } | null;

// means:

// company can be:

// {
//     id: "123",
//     name: "ABC Company"
// }

// OR

// null
// 10. AuthContextValue

// Now:

// type AuthContextValue = {

// We're creating another type.

// This type describes:

// "What is going to be stored inside our authentication context?"

// 11. user: User | null
// user: User | null;

// Read it:

// user
//  ↓
// is either
//  ↓
// User
// OR
// null

// This is a very common TypeScript pattern.

// 12. permissions: string[]
// permissions: string[];

// The important part is:

// string[]

// The [] means:

// An array/list of this type.

// So:

// string[]

// means:

// An array containing strings.

// For example:

// ["create_user", "delete_user", "edit_user"]

// So:

// permissions: string[];

// means:

// permissions is an array of strings.

// 13. loading: boolean
// loading: boolean;

// Again:

// loading
//    ↓
// must be
//    ↓
// true OR false
// 14. The login function type

// Now we reach something very important:

// login: (
//   email: string,
//   password: string,
// ) => Promise<{ success: boolean; errors?: any[] }>;

// Don't try to understand the entire line at once.

// Break it into:

// login: (...) => ...;

// This means:

// login is a function.

// Parameters

// Inside:

// (
//   email: string,
//   password: string,
// )

// we have two parameters:

// email: string

// and:

// password: string

// So the function expects:

// email → string
// password → string
// =>
// =>

// This is called an arrow.

// In a function type, it separates:

// INPUTS
//    ↓
// =>
//    ↓
// OUTPUT

// So:

// (email: string, password: string) => something

// means:

// A function that receives an email and password and produces something.

// 15. Promise

// The result is:

// Promise<{ success: boolean; errors?: any[] }>

// Promise means:

// This function produces its result asynchronously.

// Because login has to communicate with the server, we don't get the result immediately.

// < >

// These:

// Promise<...>

// are called angle brackets.

// They tell TypeScript:

// "What type of value will this Promise eventually give me?"

// So:

// Promise<string>

// means:

// A Promise that eventually gives a string.

// And:

// Promise<boolean>

// means:

// A Promise that eventually gives a boolean.

// Therefore:

// Promise<{ success: boolean; errors?: any[] }>

// means:

// A Promise that eventually gives an object.

// That object looks like:

// {
//   success: true,
//   errors: []
// }
// 16. The ?

// Look at:

// errors?: any[];

// The ? means:

// This property is optional.

// Compare:

// errors: any[];

// versus:

// errors?: any[];

// Without ?:

// {
//   errors: []
// }

// is expected.

// With ?:

// {}

// is also allowed.

// 17. any[]
// any[]

// means:

// An array containing values of any type.

// For example:

// ["wrong password"]

// or:

// [
//   { field: "email", message: "Invalid email" }
// ]

// any basically tells TypeScript:

// "Don't enforce a specific type here."

// 18. logout
// logout: () => Promise<void>;

// This says:

// logout is a function.

// It takes:

// ()

// nothing.

// And returns:

// Promise<void>

// void means:

// The function doesn't return a useful value.

// So:

// () => Promise<void>

// means:

// A function that takes nothing and asynchronously finishes without returning a value.

// 19. refetch
// refetch: () => Promise<void>;

// Exactly the same structure.

// refetch
//    ↓
// function
//    ↓
// takes nothing
//    ↓
// returns a Promise
//    ↓
// eventually gives nothing useful
// 20. setUser
// setUser: (u: User) => void;

// This means:

// setUser is a function.

// It receives:

// u: User

// and returns:

// void

// So:

// (u: User) => void

// means:

// A function that receives one User and doesn't return anything.

// 21. hasPermission
// hasPermission: (codename: string) => boolean;

// Means:

// hasPermission
//      ↓
// function
//      ↓
// takes codename
//      ↓
// codename is a string
//      ↓
// returns boolean

// So it could produce:

// true

// or:

// false
// 22. createContext

// Now:

// const AuthContext = createContext<AuthContextValue | null>(null);

// This is a big line.

// Let's start from:

// const AuthContext

// const means:

// Create a variable whose binding cannot later be reassigned.

// Then:

// =

// means:

// Put the result of the right side into AuthContext.

// So:

// const AuthContext = ...

// means:

// Create AuthContext and assign something to it.

// 23. createContext<...>
// createContext<AuthContextValue | null>

// The < > here tell TypeScript what type this context will contain.

// It can contain:

// AuthContextValue

// or:

// null

// So:

// createContext<AuthContextValue | null>

// means:

// Create a React context whose value can be an AuthContextValue or null.

// Then:

// (null)

// is the initial value.

// So the entire line:

// const AuthContext = createContext<AuthContextValue | null>(null);

// roughly reads:

// Create a constant called AuthContext. Make it a React context that can contain AuthContextValue or null, and initially give it null.

// 24. The AuthProvider function
// export function AuthProvider({ children }: { children: ReactNode }) {

// This looks scary, but we can break it apart.

// First:

// export

// means:

// Other files are allowed to import this.

// Then:

// function AuthProvider

// means:

// Create a function called AuthProvider.

// Then:

// (

// starts the function's parameters.

// 25. Destructuring { children }

// This:

// { children }

// is called object destructuring.

// Instead of:

// function AuthProvider(props) {

// and then:

// props.children

// we can directly extract children:

// function AuthProvider({ children }) {

// Meaning:

// "Give me the children property from the object passed into this function."

// 26. Typing the parameter

// Now:

// { children }: { children: ReactNode }

// There are actually two sets of { }.

// First:
// { children }

// This is the actual value being received.

// Second:
// { children: ReactNode }

// This describes its type.

// So:

// function AuthProvider(
//   { children }: { children: ReactNode }
// )

// means:

// This function receives an object containing a children property, and that children property must be a ReactNode.

// 27. ReactNode
// ReactNode

// is a React type representing things React can render.

// For example:

// <div>Hello</div>

// or:

// <MyComponent />

// or text.

// So children basically means:

// Whatever is placed inside <AuthProvider>...</AuthProvider>.

// 28. Function body { }

// Finally:

// {

// starts the function body.

// Everything until its matching:

// }

// belongs to the function.

// 29. useState

// Now:

// const [user, setUser] = useState<User | null>(null);

// This is one of the most important React lines to understand.

// Start with:

// useState

// This creates React state.

// <User | null>
// useState<User | null>

// says:

// The state can contain a User or null.

// (null)
// useState<User | null>(null)

// says:

// Start the state with null.

// [user, setUser]

// This is array destructuring.

// useState() gives us two things:

// [value, function]

// So:

// [user, setUser]

// means:

// user     → current value
// setUser  → function for changing it

// Therefore:

// const [user, setUser] = useState<User | null>(null);

// means:

// Create state called user, starting as null, and create setUser to change it.

// 30. Permissions state
// const [permissions, setPermissions] = useState<string[]>([]);

// Same structure.

// string[]

// means:

// array of strings.

// And:

// []

// means:

// Start with an empty array.

// So:

// permissions

// starts as:

// []
// 31. Loading state
// const [loading, setLoading] = useState(true);

// Here TypeScript can figure out the type automatically.

// Because:

// true

// is a boolean.

// So effectively:

// loading → boolean
// setLoading → function that changes loading
// 32. Function with parameter

// Now:

// const fetchPermissions = async (userId: string) => {

// Let's learn this pattern.

// const fetchPermissions =

// Create a constant named fetchPermissions.

// Then:

// async

// means:

// This function performs asynchronous work and returns a Promise.

// Then:

// (userId: string)

// means:

// The function receives one parameter called userId, and it must be a string.

// Then:

// =>

// means:

// Here comes the function body.

// Then:

// {

// starts that body.

// 33. try
// try {

// means:

// Try to execute this code.

// It's used with error handling.

// 34. await
// const data = await gqlFetch<...>(...);

// await means:

// Wait for this asynchronous operation to finish before continuing.

// So:

// await gqlFetch(...)

// means:

// Call gqlFetch, wait for its Promise to finish, then give me the result.

// 35. Generic function

// Look at:

// gqlFetch<{
//   effectivePermissions: { codenames: string[] };
// }>

// Again:

// <...>

// is telling TypeScript the expected result type.

// The expected result is:

// {
//   effectivePermissions: {
//     codenames: string[];
//   };
// }

// So TypeScript understands that data should look like:

// data.effectivePermissions.codenames
// 36. Function call ()

// This:

// gqlFetch(...)

// means:

// Call the function.

// Parentheses:

// ()

// are used to pass arguments to a function.

// For example:

// gqlFetch(ME_QUERY)

// means:

// Call gqlFetch and give it ME_QUERY.

// 37. Passing an object

// Here:

// gqlFetch(EFFECTIVE_PERMISSION_QUERY, { userId });

// There are two arguments:

// EFFECTIVE_PERMISSION_QUERY

// and:

// { userId }

// The second one is an object.

// This:

// { userId }

// is shorthand for:

// { userId: userId }

// That's an important JavaScript shortcut.

// 38. setPermissions
// setPermissions(data.effectivePermissions.codenames);

// Read the dots from left to right:

// data
//   .effectivePermissions
//   .codenames

// Meaning:

// Go into data, find effectivePermissions, then find codenames.

// Then:

// setPermissions(...)

// means:

// Put those codenames into the permissions state.

// 39. catch
// } catch {

// means:

// If the code inside try fails, execute this code.

// Then:

// setPermissions([]);

// means:

// Reset permissions to an empty array.

// 40. refetch
// const refetch = async () => {

// Same pattern:

// const name = async () => {

// means:

// Create an asynchronous function called name.

// 41. Generic type in gqlFetch
// const data = await gqlFetch<{ me: User | null }>(ME_QUERY);

// Let's read the type:

// {
//   me: User | null
// }

// This means data should look like:

// {
//   me: someUser
// }

// or:

// {
//   me: null
// }
// 42. if
// if (data.me) {

// if means:

// Only execute the following code if this condition is true.

// So:

// if (data.me)

// asks:

// Does data.me exist / have a truthy value?

// 43. await fetchPermissions
// await fetchPermissions(data.me.id);

// Break it down:

// data

// → get data

// data.me

// → get the user

// data.me.id

// → get the user's ID

// Then:

// fetchPermissions(data.me.id)

// → call the function using that ID.

// Then:

// await

// → wait for it to finish.

// 44. else
// } else {

// means:

// If the if condition was false, do this instead.

// 45. useEffect

// Now this important part:

// useEffect(() => {
//   (async () => {
//     await refetch();
//     setLoading(false);
//   })();
// }, []);

// There are several concepts here.

// Start with:

// useEffect

// This is a React function.

// Then:

// useEffect(

// we are calling it.

// The first argument is:

// () => {

// which is a function.

// The second argument is:

// []

// which is the dependency array.

// 46. Immediately invoked function

// This part looks strange:

// (async () => {
//   await refetch();
//   setLoading(false);
// })();

// Start with:

// async () => {

// That's an asynchronous function.

// Normally we might write:

// const doSomething = async () => {
// };

// But here we're not giving it a name.

// Then:

// (...)

// wraps the function.

// And:

// ()

// at the end immediately calls it.

// So this:

// (async () => {
//   ...
// })();

// basically means:

// Create an async function and immediately run it.

// 47. Event listener

// Now:

// window.addEventListener("focus", onFocus);

// Let's break it down.

// window

// means the browser's window.

// Then:

// .

// means:

// Access something belonging to window.

// Then:

// addEventListener

// is a function.

// Then:

// ("focus", onFocus)

// passes two arguments.

// "focus"

// is the event we're watching.

// onFocus

// is the function to run when that event happens.

// So:

// window.addEventListener("focus", onFocus);

// means:

// When the browser window gets focus, run onFocus.

// 48. Cleanup function

// This:

// return () => {
//   window.removeEventListener("focus", onFocus);
// };

// returns a function.

// That function removes the event listener.

// This is called cleanup.

// The important syntax is:

// return () => {

// Meaning:

// Return this function.

// 49. Dependency array

// At the end:

// }, [user]);

// The:

// [user]

// is an array containing user.

// React uses it to know when the effect should run again.

// So the important syntax is:

// useEffect(
//   () => {
//     // effect
//   },
//   [dependencies]
// );
// 50. Login function
// const login = async (email: string, password: string) => {

// You should now be able to read this yourself:

// const
//  ↓
// create variable

// login
//  ↓
// variable name

// =
//  ↓
// assign

// async
//  ↓
// asynchronous function

// (email: string, password: string)
//  ↓
// two parameters

// =>
//  ↓
// function body follows

// {
//  ↓
// start body
// 51. Returning an object

// At the end:

// return { success: data.login.success, errors: data.login.errors };

// return means:

// Give this value back to whoever called the function.

// The value is an object:

// {
//   success: ...,
//   errors: ...
// }
// 52. logout
// const logout = async () => {

// This means:

// const
//  ↓
// create variable

// logout
//  ↓
// name

// =
//  ↓
// assign

// async () => {}
//  ↓
// asynchronous function

// It doesn't have parameters because:

// ()

// is empty.

// 53. Optional chaining ?.

// This line is VERY important:

// !!user?.isSuperuser

// Let's break it down.

// Normally:

// user.isSuperuser

// means:

// Get isSuperuser from user.

// But what if:

// user === null

// Then:

// user.isSuperuser

// would cause an error.

// So JavaScript provides:

// user?.isSuperuser

// The ?. means:

// "Only access isSuperuser if user exists."

// 54. Double !!

// Now:

// !!user?.isSuperuser

// The first:

// !

// means:

// NOT.

// Two of them:

// !!

// are commonly used to convert something into a real boolean.

// So:

// !!user?.isSuperuser

// effectively gives:

// true

// or:

// false
// 55. ||

// Now:

// !!user?.isSuperuser || permissions.includes(codename)

// || means:

// OR

// So:

// superuser
//     OR
// has permission
// 56. .includes()
// permissions.includes(codename)

// means:

// Ask the permissions array whether it contains codename.

// For example:

// const permissions = ["create_user", "delete_user"];

// Then:

// permissions.includes("delete_user")

// returns:

// true
// 57. Arrow function without {}

// This:

// const hasPermission = (codename: string) =>
//   !!user?.isSuperuser || permissions.includes(codename);

// is an arrow function.

// Notice there are no {} after =>.

// When an arrow function doesn't have {}, the expression immediately after => is automatically returned.

// So this:

// const add = (a: number, b: number) => a + b;

// is roughly equivalent to:

// const add = (a: number, b: number) => {
//   return a + b;
// };

// That is a very useful JavaScript pattern to recognize.

// 58. The return

// Finally:

// return (
//   <AuthContext.Provider
//     value={{
//       user,
//       permissions,
//       loading,
//       login,
//       logout,
//       refetch,
//       setUser,
//       hasPermission,
//     }}
//   >
//     {children}
//   </AuthContext.Provider>
// );

// The outer:

// return (

// means:

// The AuthProvider function is going to return this React UI.

// 59. JSX

// This:

// <AuthContext.Provider>

// looks like HTML, but it is JSX.

// It represents a React component.

// 60. value={{ ... }}

// This is one of the most confusing pieces:

// value={{
//   user,
//   permissions,
//   loading,
//   login,
//   logout,
//   refetch,
//   setUser,
//   hasPermission,
// }}

// There are two {} concepts here.

// The outer:

// value={ ... }

// means:

// Put a JavaScript value inside JSX.

// The inner:

// {
//   user,
//   permissions,
//   loading,
//   ...
// }

// is a JavaScript object.

// So:

// value={{
//   user,
//   permissions,
//   loading,
// }}

// means:

// Give the Provider an object containing user, permissions, and loading.

// And because of object shorthand:

// user

// means:

// user: user
// 61. {children}

// Finally:

// {children}

// Inside JSX, {} means:

// "Evaluate this JavaScript expression here."

// So:

// {children}

// means:

// Render the children variable here.

// 62. useAuth

// Now:

// export function useAuth() {

// This creates and exports a function named:

// useAuth
// useContext
// const ctx = useContext(AuthContext);

// This means:

// Ask React for the current value stored in AuthContext.

// The result is stored in:

// ctx
// 63. !ctx
// if (!ctx)

// Remember:

// !

// means NOT.

// So:

// !ctx

// means:

// "ctx does not exist / is falsy."

// 64. Throwing an error
// throw new Error("useAuth must be used within AuthProvider");

// Break it down:

// new Error(...)

// creates an Error object.

// Then:

// throw

// means:

// Stop and report this error.

// So this line means:

// Create an error with this message and throw it.

// 65. return ctx
// return ctx;

// means:

// Give the context value back to whoever called useAuth().

// So a component can do:

// const { user, logout } = useAuth();

// and receive those values.

// The Most Important Syntax Patterns to Learn

// You don't need to memorize this entire file at once.

// These are the patterns I want you to recognize.

// Code	Meaning
// :	"has this type"
// =	"assign this value"
// =>	"function goes to result/body"
// ()	function parameters / function call
// {}	object / block / JSX JavaScript expression depending on location
// []	array
// string[]	array of strings
// |	OR
// ?	optional
// .	access something inside/on something
// ?.	safely access something if it exists
// `	
// !	NOT
// !!	convert to boolean
// < >	generic type information
// async	asynchronous function
// await	wait for Promise
// return	give a value back
// const	create a variable that cannot be reassigned
// if	execute code conditionally
// else	otherwise
// try	attempt code that might fail
// catch	handle failure
// new	create a new object
// throw	raise an error
// And there's one reading rule I especially want you to learn

// When you see something complicated like:

// const [user, setUser] = useState<User | null>(null);

// don't read it all at once.

// Use this order:

// 1. What is being created?
//        ↓
//    const [user, setUser]

// 2. What is being assigned?
//        ↓
//    useState<User | null>(null)

// 3. What does <User | null> mean?
//        ↓
//    the state type

// 4. What does (null) mean?
//        ↓
//    starting value

// 5. What do [user, setUser] mean?
//        ↓
//    value + function to change it

// That is the skill you're trying to develop: turning a line of code into small grammatical pieces instead of trying to understand the whole line at once.