"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGISTER_COMPANY_MUTATION } from "./mutation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    adminEmail: "",
    adminPassword: "",
    adminFirstName: "",
    adminLastName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const data = await gqlFetch<{
        registerCompany: { success: boolean; errors: any[] };
      }>(REGISTER_COMPANY_MUTATION, { input: form });
      if (data.registerCompany.success) {
        router.push(
          `/verify-email?email=${encodeURIComponent(form.adminEmail)}`,
        );
      } else {
        setError(
          data.registerCompany.errors?.[0]?.message ?? "Registration failed.",
        );
      }
    } catch (err) {
      setError(
        err instanceof GraphQLError ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6">Register your company</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Company name</Label>
          <Input value={form.name} onChange={update("name")} required />
        </div>
        <div>
          <Label>Company email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={update("email")}
            required
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={update("phone")} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Country</Label>
            <Input value={form.country} onChange={update("country")} required />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={update("city")} required />
          </div>
        </div>
        <div>
          <Label>Address</Label>
          <Input value={form.address} onChange={update("address")} required />
        </div>
        <hr className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Your first name</Label>
            <Input
              value={form.adminFirstName}
              onChange={update("adminFirstName")}
              required
            />
          </div>
          <div>
            <Label>Your last name</Label>
            <Input
              value={form.adminLastName}
              onChange={update("adminLastName")}
              required
            />
          </div>
        </div>
        <div>
          <Label>Your email</Label>
          <Input
            type="email"
            value={form.adminEmail}
            onChange={update("adminEmail")}
            required
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={form.adminPassword}
            onChange={update("adminPassword")}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Registering…" : "Register"}
        </Button>
      </form>
    </div>
  );
}


// Understanding RegisterPage

// This file is a Next.js page and a client component. It draws a registration form, keeps what the user types in state, and sends it to your backend with gqlFetch. If registration works, it moves the user to a "verify your email" page.

// Its likely path is app/register/page.tsx, but check that, because the path decides the URL (/register).

// 1. What is it?
// Piece	Kind	Role
// "use client"	Next.js directive	Makes this a client component (it uses state and event handlers)
// RegisterPage	React component and Next.js page	The screen at /register
// form	state	Holds every field's current text
// error, submitting	state	Hold the error message and the "request in flight" flag
// update	helper function (inside the component)	Builds an onChange handler for one field
// handleSubmit	async event handler	Sends the data when the form is submitted

// Imports:

// useState is a React hook for remembering values.
// useRouter is from next/navigation (Next.js), used to change pages from code.
// gqlFetch and GraphQLError are your own code from the first file you showed me.
// REGISTER_COMPANY_MUTATION is your own GraphQL text. Notice it comes from @/lib/queries, while LOGIN_MUTATION came from @/lib/mutation. A mutation inside a "queries" file works, but it is inconsistent, so you may want to move it.
// Button, Input, Label are shadcn/ui components living in your components/ui/ folder.

// export default: Next.js requires a page file to have one default export. export default function RegisterPage() is that. Other files you showed used named exports (export function X), which you import with { }. A default export is imported without braces. Next.js imports the page for you, so you never import it yourself.

// 2. How is it written?

// New syntax in this file:

// React.ChangeEvent<HTMLInputElement>: a TypeScript type. It describes the event object created when someone types in an <input>. React. works without an import because React's type definitions provide it globally.
// (key: string) => (e) => ...: a function that returns another function (explained below).
// ...f: the spread operator. It copies every property of an object into a new one.
// [key]: value: a computed property name. The square brackets mean "use the value of key as the property name."
// ??: the nullish coalescing operator. a ?? b means "use a, unless it is null or undefined, then use b."
// ?.[0]: optional chaining on an array index.
// && in JSX: "if the left side is true, render the right side."
// try / catch / finally: error-handling blocks.
// `...${...}`: a template literal (backticks with inserted values).
// 3. Signature
// tsx
// export default function RegisterPage() {
// Part	Meaning
// export default	This is the one main export of the file; Next.js looks for it
// function	Declares a function
// RegisterPage	Capitalized, so React treats it as a component
// ()	Empty parameter list. Pages can receive props (params, searchParams), but this one needs none
// {	Body begins

// There is no return type written. TypeScript works out that it returns JSX.

// The update helper signature
// tsx
// const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
//   setForm((f) => ({ ...f, [key]: e.target.value }));

// Split on each =>:

// text
// (key: string)                                  → first function: takes the field name
// =>
// (e: React.ChangeEvent<HTMLInputElement>)       → second function: takes the typing event
// =>
// setForm(...)                                   → its single expression is returned automatically

// This pattern is called currying (a function that returns a function). Calling update("name") returns a ready-made function that remembers "name". That remembering is a closure. Then onChange={update("name")} passes the returned function to the input, and the input calls it with the event whenever the user types.

// handleSubmit
// tsx
// const handleSubmit = async (e: React.FormEvent) => {

// An async arrow function that takes one parameter: the form's submit event.

// 4. Body, step by step
// The state
// tsx
// const [form, setForm] = useState({
//   name: "", email: "", phone: "", country: "", city: "", address: "",
//   adminEmail: "", adminPassword: "", adminFirstName: "", adminLastName: "",
// });
// text
// useState({ ... })     → state whose starting value is this object, all fields empty
// [form, setForm]       → form = the current object, setForm = the way to replace it
// const                 → both names are fixed constants

// One object holds all ten fields, instead of ten separate useState calls. TypeScript infers the type from the starting value: an object with ten string fields.

// tsx
// const [error, setError] = useState<string | null>(null);
// const [submitting, setSubmitting] = useState(false);
// <string | null> is a generic saying "text or nothing." It starts at null (no error).
// submitting starts as false and is a boolean.
// update: what happens when the user types

// Say the user types "A" into the Company name box:

// The input fires onChange, calling the function made by update("name") with the event e.
// e.target.value is the input's current text. e.target is the element that fired the event.
// setForm((f) => ({ ...f, [key]: e.target.value })) runs. Read it inside-out:
// text
// { ...f, [key]: e.target.value }
//    ...f                → copy every field of the old form object
//    [key]: e.target.value → then set/overwrite just the field "name"
// ( ... )                 → the parentheses around { } tell JS: this is an object, not a function body
// (f) => ( ... )          → function: takes the previous state f, returns the new state
// setForm( fn )           → React calls fn with the latest state and stores the result
// React sees new state and re-renders. The input shows the new text.

// Why the arrow function inside setForm? It is a functional update: React hands you the latest state, which is safe when updates happen quickly. Why copy with ...f? React compares old and new state by identity. Changing the old object in place (form.name = "A") would not trigger a re-render. You must create a new object.

// handleSubmit
// tsx
// e.preventDefault();
// setSubmitting(true);
// setError(null);
// A browser form normally reloads the page when submitted. e.preventDefault() cancels that, so your code handles it.
// setSubmitting(true) disables the button. setError(null) clears any old message.
// tsx
// try {
//   const data = await gqlFetch<{ registerCompany: { success: boolean; errors: any[] } }>(
//     REGISTER_COMPANY_MUTATION,
//     { input: form }
//   );
// { input: form } is the variables object. The GraphQL mutation expects a variable shaped like $input, and form fills it. All ten fields go to the server in one object.
// await pauses until the answer arrives. The generic <{ ... }> is your promise about the result shape.
// tsx
//   if (data.registerCompany.success) {
//     router.push(`/verify-email?email=${encodeURIComponent(form.adminEmail)}`);
//   } else {
//     setError(data.registerCompany.errors?.[0]?.message ?? "Registration failed.");
//   }
// On success, router.push goes to the verification page. push adds a history entry (unlike replace), so the Back button returns to the form.
// encodeURIComponent(...) makes text safe for a URL. For example, a+b@x.com has a + that would otherwise be read as a space.
// On failure, it reads the first error message. errors?.[0]?.message safely walks in, and ?? "Registration failed." is the fallback text if anything is missing.

// As with login, a failed registration usually arrives as success: false with errors, not as a thrown error.

// tsx
// } catch (err) {
//   setError(err instanceof GraphQLError ? err.message : "Something went wrong.");
// } finally {
//   setSubmitting(false);
// }
// catch runs if something above threw: a network failure or a top-level GraphQL error.
// err instanceof GraphQLError asks "is this one of my custom errors?" If yes, show its message. If not (for example a network TypeError), show a generic message. This is where your custom class from the first file pays off.
// finally runs always, success or failure, so the button is re-enabled even after an error.
// The JSX
// tsx
// <div className="mx-auto max-w-lg py-16 px-4">

// Tailwind: mx-auto centers horizontally, max-w-lg limits the width, py-16 is vertical padding, px-4 is horizontal padding.

// tsx
// <form onSubmit={handleSubmit} className="space-y-4">

// onSubmit={handleSubmit} passes the function itself (no ()), so React calls it later. space-y-4 adds vertical gaps between children. Pressing Enter or clicking the type="submit" button triggers the submit.

// Each field repeats one pattern:

// tsx
// <div>
//   <Label>Company name</Label>
//   <Input value={form.name} onChange={update("name")} required />
// </div>
// text
// value={form.name}        → the input SHOWS what's in state
// onChange={update("name")} → typing WRITES back into state
// required                 → shorthand for required={true}: the browser blocks submit if empty

// This is a controlled component: state is the single source of truth, and the input is just a display of it. The loop is: type → onChange → setForm → re-render → input shows new value.

// type="email" makes the browser check the format. type="password" hides the characters.

// tsx
// <div className="grid grid-cols-2 gap-4">

// A Tailwind two-column grid with a gap, used to put Country/City and the two name fields side by side.

// tsx
// {error && <p className="text-sm text-red-600">{error}</p>}

// If error is null (falsy), the whole expression is null, and React renders nothing. If it is text, the <p> appears.

// tsx
// <Button type="submit" disabled={submitting} className="w-full">
//   {submitting ? "Registering…" : "Register"}
// </Button>
// disabled={submitting} blocks double clicks while the request runs.
// a ? b : c is the ternary. The label changes while waiting.
// 5. Why?
// Controlled inputs keep one source of truth, so you can read, validate, or clear the form any time.
// One object for the whole form keeps the code short and matches the single input the mutation wants.
// Curried update avoids ten nearly identical handler functions.
// submitting flag prevents duplicate registrations and gives feedback.
// finally guarantees the UI is never stuck in the "Registering…" state.
// error as a string keeps the UI simple: show one message or none.
// Why a client component? It needs useState and event handlers, which only work in the browser.
// When not to use this style: large forms with many rules are usually easier with a form library (for example React Hook Form with Zod), which handles validation, field errors, and types for you.

// Weak spots and security notes:

// All validation here is only the browser's required. Anyone can skip the frontend and send any data directly. The backend must validate every field, enforce password rules, and reject duplicates.
// No password rules or confirmation. There is no minimum length and no "confirm password" field, so one typo locks the person out. Strength must be enforced by the backend (ideally using Django's password validators), and the UI can add guidance.
// The email goes into the URL (/verify-email?email=...). URLs end up in browser history, server logs, and analytics. It also allows anyone to craft a link that prefills an address. It is not a password, so the risk is lower, but consider storing it in a short-lived cookie or state, or having the verify page ask for it.
// Only the first error is shown, and field is ignored. Your backend returns field with each error (see LOGIN_MUTATION's errors {message code field}). A better design shows the message next to the matching input.
// Raw err.message for GraphQLError is shown to the user. If the backend ever sends internal text (a stack hint, a database message), the user sees it. Prefer showing messages by code.
// Account enumeration. A message like "email already registered" tells an attacker which emails exist. Many apps accept that for sign-up, but for sensitive systems the backend should respond identically and send an email instead.
// Abuse protection is missing from the frontend view. Registration endpoints attract bots. The backend should rate-limit and may need a CAPTCHA.
// The password is held in React state and sent in a request body. That is normal, but it needs HTTPS in production, and the password must never be logged (including by error trackers that capture variables).
// Accessibility: <Label> is not linked to its <Input>. Without htmlFor="x" on the label and id="x" on the input, clicking the label does not focus the input, and screen readers lose the connection. Also add autoComplete values ("email", "new-password", "given-name") so password managers and browsers can help.
// Loose typing: update(key: string) accepts any string, so update("nmae") compiles and silently adds a bad field. Use key: keyof typeof form so TypeScript catches typos. Also errors: any[] should be a real type.
// Sending form directly means every field in state goes to the server. That is fine now, but if you later add a UI-only field (like confirmPassword), it would also be sent, and the backend might reject it.
// Already logged-in users can still open /register. You might redirect them. That is the opposite of RequireAuth: a "guest only" guard.
// Registration creates an admin. The form creates both a company and its first admin user. The backend must ensure this endpoint cannot be used to attach a new admin to an existing company, and that the first user gets permissions through the normal permission system, not a hardcoded role name.
// 6. Connections
// text
// app/register/page.tsx          ← this file (URL: /register)
//    │  user types → setForm → re-render
//    │  submit
//    ▼
// gqlFetch(REGISTER_COMPANY_MUTATION, { input: form })   (graphql-client.ts)
//    │  POST + cookies
//    ▼
// Django GraphQL → resolver → service layer → database
//    │  creates Company + admin user, sends verification email
//    ▼
// { data: { registerCompany: { success, errors } } }
//    │
//    ├─ success  → router.push("/verify-email?email=...")
//    ├─ success:false → setError(errors[0].message)
//    └─ thrown   → catch → setError(...)

// How it relates to your other files:

// It does not use AuthProvider or useAuth, because the visitor is not logged in yet.
// It must not be wrapped in RequireAuth, or it would redirect to /login forever.
// After the email is verified, the user logs in with LOGIN_MUTATION, and AuthProvider loads their data and permissions.

// Missing context: REGISTER_COMPANY_MUTATION (to see the exact input names and what it returns), the verify-email page, and components/ui/input.tsx and label.tsx (to see what shadcn generated).

// 7. Advanced concepts

// Controlled components. An input's value always comes from state. React is the boss, and the browser only displays.

// Closures. update("name") returns a function that remembers "name" even after update has finished. This is how one helper creates ten different handlers.

// Functional state updates. setForm((f) => ...) gives you the freshest state. Use this form whenever the new state depends on the old state.

// Immutability. React state should be replaced, never changed in place. Spread (...) makes a shallow copy so the original stays untouched.

// Event objects. In onChange, e.target is the DOM element and e.target.value is its text. In onSubmit, e.preventDefault() stops the browser's default behavior.

// async event handlers. React does not mind that handleSubmit returns a Promise. It simply ignores the return value. That is why you must handle errors yourself inside it (the try/catch).

// Computed property names. { [key]: value } builds an object whose property name is decided at runtime.

// 8. Small example

// The whole controlled-input pattern in miniature:

// tsx
// const [name, setName] = useState("");

// return (
//   <input value={name} onChange={(e) => setName(e.target.value)} />
// );

// And the spread plus computed key:

// ts
// const old = { a: "1", b: "2" };
// const key = "b";
// const next = { ...old, [key]: "9" };   // { a: "1", b: "9" }
// 9. Reading pattern

// For a form page, read in this order:

// text
// 1. Directive/exports → client or server? default export = a page
// 2. State            → what does it remember? (data, error, loading)
// 3. Handlers         → what happens on change? on submit?
// 4. JSX              → each field is: label + input + value + onChange
// 5. Submit flow      → read it like a story:
//                       prevent default → set loading → try (send) → check result
//                       → catch → finally

// Recognize these shapes:

// text
// value={x} onChange={...}        → controlled input
// setX((prev) => ({ ...prev, ... })) → update one piece of an object in state
// {cond && <Thing />}             → show only if cond
// {cond ? "A" : "B"}              → choose between two
// try { } catch { } finally { }   → attempt / handle failure / always cleanup

// To build a form like this yourself:

// List the fields and make one state object with empty strings.
// Write update (or a single handleChange using e.target.name).
// Write the JSX: for each field, label, input, value, onChange.
// Write handleSubmit: prevent default, set loading, try/catch/finally.
// Decide on the success action (redirect) and failure action (show error).
// Disable the button while loading.
// Add accessibility (htmlFor/id, autoComplete) and real validation.
// Test: empty submit, wrong data, server down, success, double click.
// 10. What I should remember
// A controlled input needs two props together: value={state} and onChange={...setState...}.
// To change an object in state, create a new object: setForm((f) => ({ ...f, [key]: value })).
// Submit handlers follow a fixed shape: preventDefault, set loading, try, catch, finally (reset loading).
// A GraphQL call can fail in two places: thrown errors (network, top-level) and success: false inside the result. Handle both.
// Frontend validation is for convenience only. The backend must validate and protect every field, and sensitive details (like emails in URLs) should be treated with care.