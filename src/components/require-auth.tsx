"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { useEffect } from "react";
import { Loading } from "./loading";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (!user) return null;
  return <>{children}</>;
}

// Understanding RequireAuth

// This is a client component that works as a route guard. It wraps other components and decides: show them, show a loading screen, or send the visitor to /login. It uses the useAuth hook from your last file.

// 1. What is it?
// Piece	Kind	Role
// "use client"	Next.js directive	Makes this a client component (it uses hooks)
// RequireAuth	React component	Wrapper that protects whatever is inside it

// The problem it solves: pages like a dashboard should only be seen by logged-in users. Without a guard, a logged-out visitor would see the page, or a broken version of it, because there is no user data.

// Imports:

// useRouter comes from next/navigation, which is Next.js. It gives you a router object for changing pages from code. Use next/navigation in the App Router (app/ folder). The older next/router belongs to the Pages Router and will not work here.
// useAuth comes from "./auth-provider". The ./ means "the same folder as this file." This is a relative import, in contrast to the @/ alias you saw before. Both work. This one is your own code.
// useEffect is React. Loading is your own component.
// 2. How is it written?
// Reading the first lines of the body
// tsx
// const { user, loading } = useAuth();
// const router = useRouter();
// text
// const                → create constants
// { user, loading }    → destructure: pull two values out of an object
// =                    → assign
// useAuth()            → call your hook; it returns the auth object

// useAuth() returns the whole object (user, permissions, login, ...). This line takes only the two values it needs and ignores the rest.

// The effect
// tsx
// useEffect(() => {
//   if (!loading && !user) router.replace("/login");
// }, [loading, user, router]);

// Symbols:

// ! means "not." !loading is true when loading has finished. !user is true when user is null.
// && means "and": both sides must be true. It also short-circuits: if the left side is false, the right side is not checked.
// router.replace("/login"): . goes inside router to get the replace function, and (...) calls it.
// The if has no { } because it has only one statement.
// The render section
// tsx
// if (loading)
//   return (
//     <div>
//       <Loading />
//     </div>
//   );
// if (!user) return null;
// return <>{children}</>;
// <Loading /> is a self-closing tag: a component with nothing inside it. The capital letter tells React it is a component, not an HTML tag like <div>.
// <> ... </> is a fragment: an invisible wrapper. React wants one parent element, and a fragment gives you one without adding an extra <div> to the page.
// {children} switches from JSX to JavaScript and inserts whatever was placed inside <RequireAuth>...</RequireAuth>.
// null means "render nothing."

// Formatting note: the last two lines have odd indentation and return<> has no space. JavaScript does not care, but run Prettier (or "Format Document" in your editor) so it matches the rest of the code.

// 3. Signature
// tsx
// export function RequireAuth({ children }: { children: React.ReactNode }) {
// Part	Meaning
// export function	A normal function others can import
// RequireAuth	Capitalized, so React treats it as a component
// ( )	Holds the single parameter: the props object
// { children }	Destructure children from the props
// :	A type annotation follows
// { children: React.ReactNode }	The props object must have children, and it can be anything React can render
// {	Start of the body

// About React.ReactNode: your last file wrote import { ReactNode } from "react". Here React.ReactNode is used without importing React. This works because the React type definitions (@types/react) make a global React namespace available for types. Both styles are fine. It is better to use one style across the project.

// It has no return type written, so TypeScript works it out. It returns JSX or null.

// 4. Body, step by step

// React runs the component function from top to bottom on every render. Here is what happens over time.

// Render 1 (page just loaded). AuthProvider starts with loading = true and user = null.

// useAuth() returns those values. useRouter() returns the router.
// useEffect registers the effect. It does not run yet. Effects run after the screen is drawn.
// if (loading) is true, so the function returns <Loading /> right away. The lines below it never run.
// After drawing, the effect runs: !loading is false, so && stops and nothing happens.

// Render 2 (AuthProvider finished refetch and called setLoading(false)). Everything runs again. There are two cases.

// Case A: logged in (user is an object).

// The loading check is false, if (!user) is false, so it returns <>{children}</>. The protected page appears.
// The effect re-runs because loading changed. !user is false, so nothing happens.

// Case B: not logged in (user is null).

// Loading is false, but if (!user) is true, so it returns null. The screen shows nothing.
// The effect runs: !loading && !user is true, so router.replace("/login") sends the visitor to the login page.

// What replace does: it changes the page without adding a history entry. If you used push, the Back button would return to the protected page, which would redirect again, trapping the user in a loop. replace avoids that.

// Logout works automatically. When logout() sets user to null, this component re-renders, user changes, the effect re-runs, and the visitor is sent to /login. You do not need to write a redirect in the logout button.

// 5. Why?
// Why the effect for redirecting? Navigation is a side effect: it changes something outside the component. Render code should only calculate what to show. Side effects belong in useEffect. Calling router.replace during render would cause errors.
// Why return null when there is no user? The redirect happens after drawing. For a brief moment, user is null and loading is false. Without the null guard, children would render with no user and could crash (for example, user.fullName on null) or flash private UI.
// Why a loading state? Without it, every page refresh would look "logged out" for a moment, and the visitor would be sent to /login even though their cookie is valid. loading means "I don't know yet."
// Why a wrapper component? You write the guard once and reuse it, so each page does not repeat the same check.
// Why the three dependencies [loading, user, router]? The effect uses all three. Listing them makes the effect re-run when any of them changes.

// Where the guard sits: put it in a layout, so everything under that layout is protected.

// tsx
// // app/(dashboard)/layout.tsx
// <RequireAuth>{children}</RequireAuth>

// The (dashboard) folder is a route group: parentheses make a folder that groups files without adding to the URL. Do not wrap /login in RequireAuth, or it would redirect to itself.

// Weak spots and security notes:

// This is a UX feature, not security. Any visitor can change the frontend code or state in browser dev tools. The real protection must be in the Django backend. Every resolver must check the session and permissions, whatever the frontend does.
// Server components can still leak data. The guard runs in the browser. If a page passed as children is a server component that fetches private data, that data may already be in the response sent to the browser, even though the guard hides it on screen. For truly private pages, check the cookie on the server too (for example in Next.js middleware, or in a server layout), in addition to backend checks.
// It checks authentication only, not permission. Logged-in is not the same as allowed. A page like "Manage Users" also needs hasPermission("users.view"). You could add a permission prop, or build a separate guard on top of this one. Remember to check permissions, not role names.
// The redirect forgets where the user was going. After login, the user always lands on the default page. A common fix is /login?next=/some/page, plus validating that next is a path on your own site (otherwise it becomes an open-redirect problem).
// Temporary network failure looks like logout. Remember refetch sets user to null on any error. A short outage on page load sends the visitor to /login even though their session is fine.
// Redundant wrapper. <div><Loading /></div> has a div that adds nothing. return <Loading /> is enough, unless you need the div for layout.
// router in the dependency list is fine. In Next.js it does not change between renders, so it will not cause extra runs.
// Rules of hooks: hooks (useAuth, useRouter, useEffect) must run on every render, in the same order. That is why they are all above the early returns. If you put a return before useEffect, React would break.
// 6. Connections
// text
// app/layout.tsx
//    └─ <AuthProvider>                      (auth-provider.tsx)
//         └─ app/(dashboard)/layout.tsx
//              └─ <RequireAuth>             ← this file
//                   └─ {children} = the actual page

// Decision flow:

// text
// useAuth() ──► { user, loading }
//    │
//    ├─ loading = true  ──► <Loading />
//    ├─ user = null     ──► render null + router.replace("/login")
//    └─ user = object   ──► render the page

// How it ties to the files you have shown me so far:

// text
// gqlFetch + ME_QUERY ─► AuthProvider (user, loading) ─► useAuth ─► RequireAuth ─► page

// Missing context: to see exactly what Loading renders, look at loading.tsx. To see where RequireAuth is used, search for it in your layouts.

// 7. Advanced concepts

// Route guard pattern. A component checks a condition and chooses between three outputs: "wait," "go away," or "show the content." This is common for authentication and for permissions.

// Early returns in components. A component may return different things in different situations. Three outcomes exist here: a loading screen, nothing, or the children.

// Client-side navigation. router.replace changes the page without a full browser reload. Next.js swaps the page content.

// Effect dependencies. The list [loading, user, router] is a set of things the effect reads. React compares them to the previous render and re-runs the effect only if one changed.

// Children as composition. RequireAuth does not know or care what it wraps. This is called composition: components that accept other components as children, so behavior can be added around content.

// 8. Small example

// The same idea in miniature:

// tsx
// function Guard({ ready, children }: { ready: boolean; children: React.ReactNode }) {
//   if (!ready) return <p>Wait...</p>;
//   return <>{children}</>;
// }

// <Guard ready={true}><h1>Secret page</h1></Guard>
// 9. Reading pattern

// For a wrapper component, read in layers:

// text
// 1. Props?        children → it wraps something
// 2. Top?          hooks → what data does it depend on?
// 3. useEffect?    read [deps] first → when; then the body → what; any return () => cleanup?
// 4. Returns?      read each `return` from top to bottom as a list of situations:
//                    situation 1 → output 1
//                    situation 2 → output 2
//                    default     → output 3

// To write a guard yourself:

// List the situations: unknown yet, not allowed, allowed.
// Get the data you need from a hook.
// Write the redirect in useEffect, because it is a side effect.
// Write one early return per situation, with the normal case last.
// Wrap your layout with it and test all three situations, including a hard refresh.
// 10. What I should remember
// A wrapper component takes children and decides whether to show them. Most guards are three outputs: loading, blocked, or allowed.
// Do side effects such as redirects in useEffect, not in the render body. router.replace goes there, from next/navigation in the App Router.
// replace leaves no history entry. push does.
// Hooks must be called before any early return, every render, in the same order.
// A frontend guard only improves the user experience. Real protection must be enforced on the server and by the backend on every request.