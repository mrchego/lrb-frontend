// components/company-provider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { gqlFetch } from "@/lib/graphql-client";
import { COMPANY_QUERY, COMPANY_SETTINGS_QUERY } from "@/lib/queries";

type ImageRef = { url: string; name: string } | null;

export type Company = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  logoLight: ImageRef;
  logoDark: ImageRef;
  isActive: boolean;
};

export type CompanySettings = {
  id: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  theme: string;
};

type CompanyContextValue = {
  company: Company | null;
  settings: CompanySettings | null;
  loading: boolean;
  setCompany: (c: Company) => void;
  setSettings: (s: CompanySettings) => void;
  refetch: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([
        gqlFetch<{ company: Company }>(COMPANY_QUERY),
        gqlFetch<{ companySettings: CompanySettings }>(COMPANY_SETTINGS_QUERY),
      ]);
      setCompany(c.company);
      setSettings(s.companySettings);
    } catch {
      setCompany(null);
      setSettings(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refetch();
      setLoading(false);
    })();
  }, [refetch]);

  return (
    <CompanyContext.Provider
      value={{ company, settings, loading, setCompany, setSettings, refetch }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}

// Yes — this is exactly the next piece you need to understand, because your previous useEffect was doing:

// await refetch();

// So now we need to understand what refetch actually is.

// I’ll go from the smallest pieces upward, just like before.

// const refetch = useCallback(async () => { ... })

// Your code:

// const refetch = useCallback(async () => {

//   try {

//     const [c, s] = await Promise.all([

//       gqlFetch<{ company: Company }>(COMPANY_QUERY),

//       gqlFetch<{ companySettings: CompanySettings }>(COMPANY_SETTINGS_QUERY),

//     ]);

//     setCompany(c.company);
//     setSettings(s.companySettings);

//   } catch {

//     setCompany(null);
//     setSettings(null);

//   }

// }, []);

// The first thing to understand is that this entire thing creates a function called refetch.

// Think:

// refetch
//    ↓
// a function
//    ↓
// when called, fetch company + settings
//    ↓
// save them into React state
// 1. Start with const refetch
// const refetch = ...

// You already saw const:

// Create a variable that we don't intend to reassign.

// The variable is called:

// refetch

// So we're essentially saying:

// "Create a variable called refetch."

// But what are we putting inside it?

// This:

// useCallback(...)
// 2. What is useCallback?

// useCallback is another React Hook.

// Its job is to remember a function between renders.

// Basic shape:

// const myFunction = useCallback(() => {
//   // do something
// }, []);

// You can mentally read that as:

// "React, remember this function for me."

// This is different from useEffect.

// useEffect
// useEffect(() => {
//   // do something
// }, []);

// means roughly:

// "React, run this code as an effect."

// useCallback
// useCallback(() => {
//   // do something
// }, []);

// means roughly:

// "React, remember this function."

// That's the important distinction.

// 3. What function is useCallback remembering?

// This:

// async () => {

//   // code

// }

// That's an async arrow function.

// Let's break it apart.

// 4. async

// You have:

// async () => {

// async means:

// This function can use await.

// For example:

// async () => {
//   await something();
// }

// The function is allowed to wait for asynchronous work.

// Your function does exactly that:

// await Promise.all(...)
// 5. ()

// You have:

// async () => {

// The:

// ()

// means:

// This function takes no parameters.

// Compare:

// async (userId) => {

// This function takes one parameter:

// userId

// But:

// async () => {

// takes nothing.

// 6. =>

// Again:

// =>

// is the arrow-function syntax.

// So:

// async () => {

// can roughly be understood as:

// async function
//      ↓
// takes no parameters
//      ↓
// here is what it does
// 7. So what is this whole thing?
// useCallback(async () => {
//    // ...
// }, []);

// You can temporarily simplify it to:

// useCallback(
//   FUNCTION,
//   DEPENDENCIES
// )

// Specifically:

// useCallback(
//   async () => {
//     // function
//   },
//   []
// )

// So you're telling React:

// "Remember this async function, and its dependency list is empty."

// 8. Now let's enter the function

// Inside you have:

// try {

// This is JavaScript's error-handling mechanism.

// The structure is:

// try {
//   // attempt something
// } catch {
//   // if something fails
// }

// Think:

// TRY
//  ↓
// Do this dangerous/uncertain operation
//  ↓
// Did it work?
//  ├── YES → continue
//  └── NO  → catch

// In your code:

// try {

//   // fetch company
//   // fetch settings
//   // update state

// } catch {

//   // reset state
// }
// 9. Why do we need try/catch?

// Because you're making API requests:

// gqlFetch(...)

// Network operations can fail.

// For example:

// Internet disconnected
// API unavailable
// Server error
// GraphQL error
// Authentication problem

// If something throws an error inside try, JavaScript jumps to:

// catch {
// 10. Now the most complicated line

// This:

// const [c, s] = await Promise.all([

// looks scary.

// But let's take it apart.

// There are four concepts here:

// const
// [c, s]
// =
// await
// Promise.all(...)

// Let's understand them separately.

// 11. Promise

// A Promise represents:

// work that will finish later.

// Your API call:

// gqlFetch(...)

// is asynchronous.

// So it probably returns a Promise.

// Think:

// gqlFetch()
//      ↓
// "I'll give you the data later."
//      ↓
// Promise
//      ↓
// eventually
//      ↓
// data

// You don't need to think of a Promise as something magical.

// For now:

// Promise = a value that will become available later.

// 12. What is Promise.all()?

// You have:

// Promise.all([
//   ...
// ])

// Promise.all allows you to wait for multiple Promises at the same time.

// You have two requests:

// gqlFetch(COMPANY_QUERY)

// and:

// gqlFetch(COMPANY_SETTINGS_QUERY)

// Instead of doing:

// const company = await gqlFetch(...);

// const settings = await gqlFetch(...);

// which waits for the first request before starting/waiting for the second, Promise.all groups them together.

// Conceptually:

// Request 1 ────────────────→ finished
// Request 2 ──────────→ finished
//               ↓
//         Promise.all
//               ↓
//        both are ready

// This is useful because the two requests don't depend on each other.

// 13. What is inside the []?

// You have:

// Promise.all([
//   gqlFetch(...),
//   gqlFetch(...)
// ])

// These square brackets create a JavaScript array.

// So:

// [
//   firstThing,
//   secondThing
// ]

// means:

// "Here is a list containing two things."

// Your list contains two Promises:

// [
//   gqlFetch<{ company: Company }>(COMPANY_QUERY),

//   gqlFetch<{ companySettings: CompanySettings }>(
//     COMPANY_SETTINGS_QUERY
//   )
// ]

// So:

// Array
// ├── Promise #1 → company request
// └── Promise #2 → settings request
// 14. Now await Promise.all(...)

// This:

// await Promise.all([
//   ...
// ])

// means:

// "Start/wait for all these asynchronous operations and continue when they have all finished."

// So:

// const [c, s] = await Promise.all([

// roughly means:

// "Wait until both requests finish, then give me their results."

// 15. Now the weird [c, s]

// This is array destructuring.

// Don't let the name scare you.

// Suppose:

// const results = ["company result", "settings result"];

// You could do:

// const c = results[0];
// const s = results[1];

// But JavaScript gives you a shorter way:

// const [c, s] = results;

// This means:

// first value  → c
// second value → s

// So:

// const [c, s] = await Promise.all(...)

// means:

// result #1 → c
// result #2 → s
// 16. So what are c and s?

// Look at the requests:

// gqlFetch<{ company: Company }>(COMPANY_QUERY)

// and:

// gqlFetch<{ companySettings: CompanySettings }>(
//   COMPANY_SETTINGS_QUERY
// )

// The first request returns something shaped like:

// {
//   company: ...
// }

// The second returns something shaped like:

// {
//   companySettings: ...
// }

// Therefore:

// c
// ↓
// company request result

// s
// ↓
// settings request result

// The developer probably chose:

// c

// for company

// and:

// s

// for settings.

// 17. Now let's understand this:
// gqlFetch<{ company: Company }>(COMPANY_QUERY)

// This contains another concept you need to recognize.

// There are actually two things happening:

// gqlFetch

// and:

// <{
//   company: Company
// }>

// and:

// (COMPANY_QUERY)
// 18. gqlFetch(...)

// The parentheses:

// (COMPANY_QUERY)

// mean:

// Call the gqlFetch function and give it COMPANY_QUERY.

// So:

// gqlFetch(COMPANY_QUERY)

// means:

// "Run gqlFetch using COMPANY_QUERY."

// 19. But what is <{ company: Company }>?

// This is TypeScript generic syntax.

// It's telling gqlFetch:

// "I expect the response data to have this TypeScript shape."

// The shape:

// {
//   company: Company
// }

// means:

// An object with a property called company, whose type is Company.

// For example, conceptually:

// {
//   company: {
//     id: "...",
//     name: "..."
//   }
// }

// The exact fields depend on your Company type.

// 20. Compare the two requests
// First:
// gqlFetch<{ company: Company }>(COMPANY_QUERY)

// Expected response:

// {
//   company: Company
// }
// Second:
// gqlFetch<{ companySettings: CompanySettings }>(
//   COMPANY_SETTINGS_QUERY
// )

// Expected response:

// {
//   companySettings: CompanySettings
// }

// So the code is telling TypeScript what kind of data should come back.

// 21. Now these two lines make sense
// setCompany(c.company);
// setSettings(s.companySettings);

// Remember:

// c
// ↓
// company response

// s
// ↓
// settings response

// And:

// c.company

// means:

// Get the company property from the response.

// Then:

// setCompany(c.company);

// means:

// Put that company into React state.

// Similarly:

// s.companySettings

// means:

// Get the companySettings property from the settings response.

// And:

// setSettings(s.companySettings);

// means:

// Put those settings into React state.

// 22. Notice the complete data flow

// This is the important part:

// refetch()
//    ↓
// Promise.all()
//    ↓
// ┌──────────────────────┐
// │                      │
// ↓                      ↓
// COMPANY_QUERY     SETTINGS_QUERY
// │                      │
// ↓                      ↓
// company response   settings response
// │                      │
// └──────────┬───────────┘
//            ↓
//        [c, s]
//            ↓
//     ┌──────┴──────┐
//     ↓             ↓
// c.company    s.companySettings
//     ↓             ↓
// setCompany() setSettings()
//     ↓             ↓
//  React state   React state

// That is what this function does.

// 23. Now catch

// After:

// try {
//    ...
// }

// you have:

// catch {

// This means:

// "If something inside try throws an error, come here."

// Then:

// setCompany(null);
// setSettings(null);

// So if the API request fails:

// request fails
//      ↓
// catch
//      ↓
// company = null
// settings = null

// The developer is essentially saying:

// "If we can't retrieve the company/settings, clear the existing values."

// 24. Why is there no error variable?

// You might have seen:

// catch (error) {
//   console.log(error);
// }

// But your code has:

// catch {

// That's perfectly valid.

// It means:

// "I know an error happened, but I don't need the actual error object."

// The developer doesn't need:

// error

// because they're simply resetting the state.

// 25. Now let's understand the final []

// At the bottom:

// }, []);

// This belongs to:

// useCallback

// NOT useEffect.

// That's important.

// You have:

// useCallback(
//   async () => {
//     ...
//   },
//   []
// )

// The empty dependency array tells React:

// "This callback doesn't depend on changing values from this component."

// So React can keep the same callback reference between renders.

// 26. Why use useCallback here?

// This is especially relevant because of your previous code.

// You had:

// useEffect(() => {

//   (async () => {

//     await refetch();

//     setLoading(false);

//   })();

// }, []);

// And now we know:

// refetch

// is created using:

// useCallback(...)

// So the relationship is:

// useCallback
//      ↓
// creates/remembers
//      ↓
// refetch function
//      ↓
// useEffect calls it
//      ↓
// refetch()
//      ↓
// fetch company + settings
// 27. Here's the entire thing in simple English

// Your code:

// const refetch = useCallback(async () => {
//   try {
//     const [c, s] = await Promise.all([
//       gqlFetch<{ company: Company }>(COMPANY_QUERY),
//       gqlFetch<{ companySettings: CompanySettings }>(
//         COMPANY_SETTINGS_QUERY
//       ),
//     ]);

//     setCompany(c.company);
//     setSettings(s.companySettings);
//   } catch {
//     setCompany(null);
//     setSettings(null);
//   }
// }, []);

// means:

// Create a reusable asynchronous function called refetch. When refetch is called, make two GraphQL requests at the same time: one for the company and one for the company settings. Wait for both requests to finish. Put the company response into the company React state and put the settings response into the settings React state. If either request fails, clear both pieces of state. React should remember this function because it has no dependencies.

// 28. Now connect it to your previous code

// You previously had:

// useEffect(() => {
//   (async () => {
//     await refetch();
//     setLoading(false);
//   })();
// }, []);

// Now we can expand refetch() mentally.

// When this happens:

// await refetch();

// think:

// refetch()
//    ↓
// try
//    ↓
// Promise.all()
//    ↓
//    ├── gqlFetch(COMPANY_QUERY)
//    │       ↓
//    │    company data
//    │
//    └── gqlFetch(COMPANY_SETTINGS_QUERY)
//            ↓
//        settings data
//    ↓
// [c, s]
//    ↓
// setCompany(c.company)
//    +
// setSettings(s.companySettings)
//    ↓
// finished
//    ↓
// setLoading(false)

// So your original useEffect is essentially saying:

// "When this component starts, refresh all the company information. Once that is finished, stop showing the loading state."

// 29. One more important thing: useCallback vs useEffect

// This distinction is worth burning into your brain.

// useCallback
// const refetch = useCallback(() => {
//   ...
// }, []);

// Think:

// "Remember this function."

// It gives you a function:

// refetch

// which you can later call:

// refetch();
// useEffect
// useEffect(() => {
//   ...
// }, []);

// Think:

// "React, run this side-effect when the dependency rules say so."

// So:

// useCallback
//      ↓
// creates/remembers a function
//      ↓
// refetch

// useEffect
//      ↓
// runs code
//      ↓
// calls refetch()
// 30. A reading pattern for code like this

// When you see something complicated like:

// const [c, s] = await Promise.all([
//   gqlFetch<{ company: Company }>(COMPANY_QUERY),
//   gqlFetch<{ companySettings: CompanySettings }>(
//     COMPANY_SETTINGS_QUERY
//   ),
// ]);

// Don't try to read it left-to-right in one go.

// Instead, use this order:

// ① Find the main operation
// Promise.all(...)

// Ask:

// What is the big thing happening?

// Answer:

// We're waiting for multiple Promises.

// ② Look inside it
// [
//   gqlFetch(...),
//   gqlFetch(...)
// ]

// Ask:

// What are we doing together?

// Answer:

// Two API requests.

// ③ Look at what happens afterward
// const [c, s] = ...

// Ask:

// Where do the results go?

// Answer:

// first result → c
// second result → s
// ④ Look at what happens with those values
// setCompany(c.company);
// setSettings(s.companySettings);

// Ask:

// What does the code do with the results?

// Answer:

// Saves them into React state.

// That is much easier than trying to understand the entire line at once.

// The mental picture to keep
//                   refetch()
//                      │
//                      ▼
//               ┌─────────────┐
//               │ Promise.all │
//               └──────┬──────┘
//                      │
//              ┌───────┴────────┐
//              ▼                ▼
//        COMPANY_QUERY    SETTINGS_QUERY
//              │                │
//              ▼                ▼
//           result 1          result 2
//              │                │
//              └───────┬────────┘
//                      ▼
//                   [c, s]
//                    / \
//                   /   \
//                  ▼     ▼
//             c.company  s.companySettings
//                 │          │
//                 ▼          ▼
//           setCompany() setSettings()
//                 │          │
//                 ▼          ▼
//              React State

// Once you understand this picture, the original code stops looking like a wall of symbols. It's really just:

// "Fetch two things → wait for both → take the results → put them into state."
