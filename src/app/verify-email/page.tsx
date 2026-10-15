"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gqlFetch } from "@/lib/graphql-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REQUEST_EMAIL_VERIFICATION_MUTATION, VERIFY_EMAIL_CODE_MUTATION } from "./mutation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = await gqlFetch<{
      verifyEmailCode: { success: boolean; errors: any[] };
    }>(VERIFY_EMAIL_CODE_MUTATION, { email, code });
    if (data.verifyEmailCode.success) {
      router.push("/login");
    } else {
      setError(data.verifyEmailCode.errors?.[0]?.message ?? "Invalid code.");
    }
    setSubmitting(false);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await gqlFetch(REQUEST_EMAIL_VERIFICATION_MUTATION, { email });
      setResent(true);
    } finally {
      setResending(false);
    }
  };
  return (
    <div className="mx-auto max-w-sm py-16 px-4">
      <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Enter the 6-digit code sent to {email}. It expires in 5 minutes.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Verification code</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            placeholder="000000"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Verifying…" : "Verify"}
        </Button>
        <Button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-sm text-muted-foreground underline block mt-4"
        >
          {resending ? "Sending…" : resent ? "Code resent" : "Resend code"}
        </Button>
      </form>
    </div>
  );
}


// Understanding VerifyEmailPage

// This is a Next.js page and a client component. It is the screen after registration, at a path like app/verify-email/page.tsx. It reads the email from the URL, asks the user for a 6-digit code, sends the code to the backend, and offers a "Resend code" button.

// It repeats several patterns you already learned in RegisterPage (controlled input, handleSubmit shape, error && <p>). I'll explain those briefly and spend time on what is new.

// 1. What is it?
// Piece	Kind	Role
// "use client"	Next.js directive	Client component (uses hooks)
// VerifyEmailPage	page component (default export)	The screen at /verify-email
// router	useRouter() result	Changes pages from code
// params	useSearchParams() result	Reads the ?email=... part of the URL
// email	constant	The email taken from the URL
// code, error, submitting, resent, resending	state	Typed code, message, and two request flags
// handleSubmit	async handler	Sends the code to be checked
// handleResend	async handler	Asks the backend to send a new code

// Imports to note:

// useSearchParams is from next/navigation (Next.js), next to useRouter.
// REQUEST_EMAIL_VERIFICATION_MUTATION and VERIFY_EMAIL_CODE_MUTATION come from "./mutation". ./ means a file next to this page, whereas your earlier mutations lived in @/lib/mutation. Both work, but you now have mutations in three places (@/lib/queries, @/lib/mutation, ./mutation). Pick one convention.
// Button, Input, Label are shadcn/ui.
// 2. How is it written?

// New syntax:

// params.get("email"): .get is a method on the URLSearchParams object. It returns string | null.
// ?? "": nullish coalescing, "use the right side if the left is null or undefined."
// A nested ternary: a ? x : b ? y : z.
// try { } finally { } without catch: legal, and it behaves differently from what you might expect (see below).
// type="button" on a Button inside a form.
// maxLength={6}: a JavaScript number inside { }.
// inputMode="numeric": a plain string, so it uses quotes, not braces.
// Reading the email line
// tsx
// const email = params.get("email") ?? "";
// text
// params                   → the object holding all ?key=value pairs
// .get("email")            → find the pair named "email"; text if found, null if not
// ?? ""                    → if null, use an empty string instead
// const email =            → store the final text in a constant

// Remember the previous page: router.push(/verify-email?email=${encodeURIComponent(form.adminEmail)}). encodeURIComponent made the email URL-safe, and params.get decodes it back automatically. So a%2Bb%40x.com becomes a+b@x.com. The two files are two halves of one handoff.

// 3. Signature
// tsx
// export default function VerifyEmailPage() {

// Same shape as RegisterPage: export default (Next.js needs one default export per page), a capitalized name (so it is a component), empty () (no props), and an inferred return type.

// tsx
// const handleSubmit = async (e: React.FormEvent) => {
// const handleResend = async () => {

// Two async arrow functions stored in constants. handleSubmit takes the form event. handleResend takes nothing, because it needs no event.

// onClick={handleResend} passes the function without (). React will still call it with a click event, but a function may ignore extra arguments it does not declare.

// 4. Body, step by step
// State
// tsx
// const [code, setCode] = useState("");
// const [error, setError] = useState<string | null>(null);
// const [submitting, setSubmitting] = useState(false);
// const [resent, setResent] = useState(false);
// const [resending, setResending] = useState(false);

// Five times the same pattern: [value, setter] = useState(start). Notice that this page uses separate states because each piece is independent, while RegisterPage used one object because ten fields belong together. useState("") lets TypeScript infer string.

// email is not state: it never changes during this page's life, because the URL is its source. A value you can derive or read needs no state.

// The code input
// tsx
// <Input
//   value={code}
//   onChange={(e) => setCode(e.target.value)}
//   maxLength={6}
//   inputMode="numeric"
//   placeholder="000000"
//   required
// />

// Compared with the last page, this is the simple controlled input: value={code} shows state, and the inline arrow (e) => setCode(e.target.value) writes back to it. You did not write a type for e: TypeScript works it out from the Input component's onChange type. This is contextual typing.

// maxLength={6} makes the browser stop accepting more than 6 characters.
// inputMode="numeric" asks phones to show a number keyboard. It does not block letters from being pasted.
// placeholder is the gray hint text.
// handleSubmit, in order
// tsx
// e.preventDefault();
// setSubmitting(true);
// setError(null);
// const data = await gqlFetch<{ verifyEmailCode: { success: boolean; errors: any[] } }>(
//   VERIFY_EMAIL_CODE_MUTATION, { email, code });

// { email, code } is shorthand for { email: email, code: code }, the variables for the mutation. Then the result check:

// tsx
// if (data.verifyEmailCode.success) {
//   router.push("/login");
// } else {
//   setError(data.verifyEmailCode.errors?.[0]?.message ?? "Invalid code.");
// }
// setSubmitting(false);

// Success sends the user to /login (the user must then log in; there is no automatic login). Failure shows the first error message. As with login and register, a wrong code arrives as success: false, not as a thrown error.

// Important difference from RegisterPage: there is no try/catch/finally here. Read the flow:

// text
// setSubmitting(true)  →  await gqlFetch(...)  →  (check result)  →  setSubmitting(false)
//                               ↑
//                     if this THROWS, the lines below never run

// If the network fails, gqlFetch throws, the function stops, setSubmitting(false) never runs, and the button stays "Verifying…" and disabled forever. The user has to refresh. No error message is shown either.

// handleResend
// tsx
// setResending(true);
// try {
//   await gqlFetch(REQUEST_EMAIL_VERIFICATION_MUTATION, { email });
//   setResent(true);
// } finally {
//   setResending(false);
// }

// try { } finally { } without catch means: "run the finally block no matter what, but do not handle the error." If gqlFetch throws, finally resets the button, and then the error continues upward as an unhandled promise rejection. The user sees nothing.

// Also, the result is ignored. If the backend replies success: false (for example, "too many requests"), the code still runs setResent(true) and shows "Code resent." The label may lie.

// The nested ternary
// tsx
// {resending ? "Sending…" : resent ? "Code resent" : "Resend code"}

// Read it as a chain of questions, top to bottom:

// text
// resending?  → yes: "Sending…"
//             → no, then resent? → yes: "Code resent"
//                                → no:  "Resend code"

// A ternary is condition ? ifTrue : ifFalse, and here the ifFalse part is another ternary. It works, but two levels is the limit before it hurts readability.

// type="button"
// tsx
// <Button type="button" onClick={handleResend} ...>

// Inside a <form>, a <button> is a submit button by default. Without type="button", clicking "Resend" would also submit the form and try to verify an empty code. This one attribute prevents that. The first button uses type="submit" on purpose.

// The text on screen
// tsx
// Enter the 6-digit code sent to {email}. It expires in 5 minutes.

// {email} inserts the variable into the text. React escapes it, so even if someone puts <script> in the URL, it is displayed as harmless text, not run. This is why React is safe against that kind of injection unless you use dangerouslySetInnerHTML.

// 5. Why?
// Email in the URL, not state: the verify page is a separate page, and state is lost when the page changes. The URL is a simple way to hand data across pages, and it survives a page refresh.
// useSearchParams instead of reading window.location: it is the Next.js way, and works with the router.
// Separate flags (submitting, resending): two actions can be in progress independently, and each button should disable only for its own action.
// resent flag: gives feedback so the user knows something happened.
// type="button" for resend: keeps the second action from triggering the first.
// When to do it differently: for sensitive flows, many apps keep the email in a short-lived cookie or server session, instead of the URL.

// Weak spots and security notes:

// Missing error handling in handleSubmit (above). Copy the try/catch/finally shape from RegisterPage. The catch should set an error, and setSubmitting(false) belongs in finally.
// Missing catch in handleResend. Add one that sets an error message, and check the mutation's success result.
// Next.js build issue: in recent Next.js versions, a page that uses useSearchParams() should have that component wrapped in <Suspense>, otherwise next build can fail with a "missing Suspense boundary" message (it may work fine in npm run dev, which hides the problem). The usual fix is to move the form into an inner component and render <Suspense><VerifyEmailForm /></Suspense> in the page. Check your Next.js version's docs to confirm.
// Brute force on a 6-digit code. There are only 1,000,000 possibilities. If the backend allows unlimited tries, an attacker can guess the code within the 5-minute window. The backend must limit attempts (for example 5 tries, then invalidate the code), rate-limit by email and by IP, store only a hash of the code, and use a secure random generator. The frontend cannot protect you here.
// The email comes from the URL, so anyone controls it. Anyone can open /verify-email?email=victim@x.com and press "Resend code." That lets an attacker spam someone's inbox. The backend must rate-limit resends per email and per IP, and apply a cooldown. The frontend should also add a cooldown timer (for example, disable resend for 60 seconds).
// Account enumeration. If the backend answers differently for "email exists" and "email unknown," it reveals who has an account. Ideally the response is the same either way.
// Hardcoded "6-digit" and "5 minutes." If the backend changes either value, the page becomes wrong silently. Keep them in sync, or return the expiry from the backend.
// Validation only checks "not empty." "12" passes required. Use pattern="\d{6}" (a regex, like the one you learned in resolveMediaUrl) or check code.length === 6 before sending. You can also filter non-digits as the user types: e.target.value.replace(/\D/g, ""), where \D means "any non-digit."
// Missing autoComplete="one-time-code" on the input. Phones use it to offer the code from the SMS or email automatically.
// The Resend button probably does not look like a link. shadcn's default Button has a filled background. Your classes override the text color, but not the background, so you likely get a filled button with gray text. Use variant="link" or variant="ghost".
// resent never goes back to false. After the first resend, the label says "Code resent" forever, and later clicks give no feedback.
// Empty email. If someone opens /verify-email directly, email is "". The page still shows "sent to ." and sends { email: "" }. Redirect them back to /register or /login when email is empty.
// router.push("/login") after success leaves /verify-email in the Back history. replace is a better fit here, because Back should not return to a finished step.
// Accessibility: like the last page, Label is not linked to Input. Add htmlFor and id. Error text should also be announced to screen readers (for example role="alert" on the error <p>).
// errors: any[]: define a proper type, as before.
// 6. Connections
// text
// /register  (RegisterPage)
//    │ success → router.push("/verify-email?email=...")
//    ▼
// /verify-email  ← this file
//    │ useSearchParams().get("email") → email
//    │
//    ├─ submit  → gqlFetch(VERIFY_EMAIL_CODE_MUTATION, { email, code })
//    │              ▼
//    │          Django: check code + expiry + attempts → mark email verified
//    │              ▼
//    │          { verifyEmailCode: { success, errors } }
//    │              ├─ success → router.push("/login")
//    │              └─ failure → setError(...)
//    │
//    └─ resend  → gqlFetch(REQUEST_EMAIL_VERIFICATION_MUTATION, { email })
//                   ▼
//               Django: generate new code → send email
// text
// register → verify-email → login → AuthProvider (ME_QUERY, permissions) → RequireAuth pages

// Like RegisterPage, this page is for visitors who are not logged in, so it does not use useAuth and must not be inside RequireAuth.

// Missing context: ./mutation (to see the exact variable names and return fields), the backend resolver and service for the code (expiry, attempt limits, hashing), and the /login page. Also check how RegisterPage and this page share the email convention.

// 7. Advanced concepts

// Query string (search params). The part of a URL after ?, such as ?email=a@b.com&x=1. It is a list of key=value pairs separated by &. useSearchParams reads them, but the object is read-only. To change the URL you use the router.

// Suspense boundary. <Suspense> is a React component that shows a fallback while something inside is not ready. Next.js uses it so that the static part of a page can be built in advance, while the part that depends on the URL waits for the browser.

// Try/finally without catch. finally is for cleanup, catch is for handling. They solve different problems. Without catch, the error is not handled, only cleaned up after.

// Unhandled promise rejection. When an async function throws and nobody catches it, the browser logs an error in the console, and your UI does not react.

// Contextual typing. TypeScript can infer the type of a function parameter from where the function is used. The inline (e) => ... in onChange gets its type from Input's props.

// Derived values vs state. If a value can be computed or read from somewhere else (like email from the URL), do not copy it into state. Two copies can disagree.

// One-time codes. A short secret, valid for a short time, that proves control of an inbox. Their security depends almost entirely on the backend: expiry, limited attempts, rate limits, and hashed storage.

// 8. Small example

// Reading a query string:

// tsx
// const params = useSearchParams();      // URL: /page?name=Ann
// const name = params.get("name") ?? "guest";   // "Ann"
// // URL: /page  →  params.get("name") is null  →  name is "guest"

// A safe submit handler shape:

// tsx
// const run = async () => {
//   setBusy(true);
//   try {
//     await doThing();
//   } catch {
//     setError("Something went wrong.");
//   } finally {
//     setBusy(false);   // always runs
//   }
// };
// 9. Reading pattern

// For a page that takes data from the URL and calls the backend:

// text
// 1. Top of body → where does its data come from? (URL, state, props)
// 2. State       → what changes? one flag per separate action
// 3. Handlers    → for each: what is the start? the call? the success path? the failure path?
// 4. Is there a try/catch/finally? → if not, ask: "what happens if this throws?"
// 5. JSX         → each interactive element: what does it call? is it type="button" or "submit"?

// Ask the same two questions of any async handler:

// text
// 1. What does the user see while waiting?
// 2. What does the user see if it fails?

// To build this kind of page yourself:

// Decide where the data comes from (here: the URL) and read it at the top.
// Create state for each input and each in-progress action.
// Write the submit handler with try/catch/finally.
// Write the secondary action (resend) the same way, and give it feedback.
// Add a cooldown, input cleaning, and an empty-email guard.
// Check success inside the result, not just whether the call threw.
// Test: wrong code, correct code, expired code, server down, empty URL, double click, resend spam.
// 10. What I should remember
// useSearchParams().get("key") reads a URL value and returns text or null, so pair it with ?? "". Data passed through URLs is controlled by the user, so never trust it.
// A <button> inside a <form> submits by default. Use type="button" for any button that should do something else.
// finally cleans up, but only catch handles an error. Every await on the network needs a plan for failure, or the UI can get stuck in a loading state.
// Check both failure routes for a GraphQL call: a thrown error, and success: false inside the result.
// A frontend page cannot protect a one-time code. Expiry, limited attempts, and rate limits must be enforced by the backend.


