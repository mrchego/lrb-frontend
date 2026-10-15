"use client";

import useSWR from "swr";
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { useAuth } from "@/components/auth-provider";
import { RequireSuperuser } from "@/components/require-superuser";
import { gqlFetch } from "@/lib/graphql-client";
import { getUserColumns } from "./columns";
import { UserDataTable } from "./data-table";
import { UserConnection } from "./type";
import { USERS_QUERY } from "./query";

export default function UsersPage() {
  return (
    <RequireSuperuser>
      <UsersPageContent />
    </RequireSuperuser>
  );
}

function UsersPageContent() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const isActive =
    statusFilter === "all" ? undefined : statusFilter === "active";

  const { data, error, isLoading, mutate } = useSWR<{ users: UserConnection }>(
    ["users", isActive, search, pagination.pageIndex, pagination.pageSize],
    () =>
      gqlFetch<{ users: UserConnection }>(USERS_QUERY, {
        isActive,
        search: search || undefined,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      }),
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  if (!user) return null;

  const columns = getUserColumns(user.id, () => mutate());

  if (error) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load users. {error instanceof Error ? error.message : ""}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage every account in your company. Only the owner can perform these
          actions.
        </p>
      </div>
      <UserDataTable
        columns={columns}
        data={data?.users.items ?? []}
        totalCount={data?.users.totalCount ?? 0}
        isLoading={isLoading}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
        pagination={pagination}
        onPaginationChange={setPagination}
        onBulkActionDone={() => mutate()}
      />
    </div>
  );
}

// 1. Understand the big picture first
// Imagine an owner opens the Users page.
// Here's what happens:
// 1. The application checks whether the user has permission to access the page.
// 2. It gets the currently logged-in user.
// 3. It determines which users should be displayed.
// 4. It requests the matching users from the server using GraphQL.
// 5. It passes the returned users to UserDataTable.
// 6. When the owner searches, filters, or changes pages, it requests the appropriate data.
// 7. When a bulk action finishes, it refreshes the user data.
// The most important thing to understand is that this file coordinates the page, while data-table.tsx handles the table's presentation and interactions.
// 2. Understanding the imports
// Let's start with the first section.
// "use client";

// import useSWR from "swr";
// import { useState } from "react";
// import type { PaginationState } from "@tanstack/react-table";

// A. "use client"
// This tells Next.js that this file is a Client Component entry point.
// Your component uses React state, authentication context, and interactive data-fetching behavior, so it needs client-side functionality.
// B. useSWR
// import useSWR from "swr";

// SWR is a React library for fetching and managing remote data.
// Think of it as a helper that manages the process of requesting data and keeping track of its loading, error, and cached states.
// For example, your code uses:
// const { data, error, isLoading, mutate } = useSWR(...);

// These four values help your component manage the request.
// Value	Meaning
// data	The data returned by the request.
// error	An error encountered while fetching data.
// isLoading	Indicates whether SWR is loading the data for the current key.
// mutate	Lets you update cached data or trigger revalidation.

// We'll examine these in detail later.
// C. useState
// import { useState } from "react";

// You use useState to remember three things:
// - The selected status filter.
// - The search text.
// - The current pagination settings.
// These values can change when the user interacts with the page.
// D. PaginationState
// import type { PaginationState } from "@tanstack/react-table";

// This is a TypeScript type that describes the pagination state.
// Your code uses it here:
// const [pagination, setPagination] = useState<PaginationState>({
//   pageIndex: 0,
//   pageSize: 10,
// });

// The state tells the application which page is selected and how many records should appear on each page.
// Now consider the remaining imports:
// import { useAuth } from "@/components/auth-provider";
// import { RequireSuperuser } from "@/components/require-superuser";
// import { gqlFetch } from "@/lib/graphql-client";
// import { getUserColumns } from "./columns";
// import { UserDataTable } from "./data-table";
// import { UserConnection } from "./type";
// import { USERS_QUERY } from "./query";

// Here's what each one does.
// Import	Purpose
// useAuth	Provides access to the current user's authentication information.
// RequireSuperuser	Restricts access to users who satisfy the required authorization condition.
// gqlFetch	Sends a GraphQL request using your application's GraphQL client.
// getUserColumns	Creates the column definitions for the user table.
// UserDataTable	Renders the table UI.
// UserConnection	Describes the expected structure of the user results.
// USERS_QUERY	Contains the GraphQL query used to fetch users.

// Notice that the actual GraphQL query isn't written in this file. It's imported from ./query.
// That means you can separate the query definition from the logic that executes it.
// 3. Understanding UsersPage
// Look at this code:
// export default function UsersPage() {
//   return (
//     <RequireSuperuser>
//       <UsersPageContent />
//     </RequireSuperuser>
//   );
// }

// There are two components here:
// - UsersPage
// - UsersPageContent
// Let's understand why.
// A. UsersPage is the outer component
// export default function UsersPage() {

// This is the default export of the file.
// In a Next.js App Router project, a file named page.tsx typically defines the page component for its route.
// B. RequireSuperuser wraps the content
// <RequireSuperuser>
//   <UsersPageContent />
// </RequireSuperuser>

// This means the page content is placed inside the RequireSuperuser component.
// The intention is to ensure that only authorized users can access the user-management interface.
// Conceptually, it works like this:
// UsersPage
//     |
//     v
// RequireSuperuser
//     |
//     |-- User is authorized
//     |       |
//     |       v
//     |   UsersPageContent
//     |
//     |-- User is not authorized
//             |
//             v
//         Block access or show another UI

// The exact behavior depends on how RequireSuperuser is implemented.
// Important security note: A client-side wrapper is not sufficient by itself to secure sensitive operations. The server must also verify permissions when returning protected data or performing administrative actions.
// 4. Understanding UsersPageContent
// Now we reach the main logic.
// function UsersPageContent() {
//   const { user } = useAuth();

// This creates a component called UsersPageContent.
// The first line inside it is:
// const { user } = useAuth();

// Remember destructuring from the previous lesson?
// This uses the same idea.
// The useAuth() hook returns an object containing authentication information. The code extracts its user property.
// Conceptually, the returned object might look like:
// {
//   user: {
//     id: "user-101",
//     email: "owner@example.com",
//   }
// }

// This is only an example; your actual user object depends on the implementation of useAuth.
// By writing:
// const { user } = useAuth();

// you get direct access to the user value.
// Later, your code uses user.id to create the table's columns.
// 5. Understanding the three pieces of state
// Your next three lines are very important.
// const [statusFilter, setStatusFilter] =
//   useState<"all" | "active" | "inactive">("all");

// const [search, setSearch] = useState("");

// const [pagination, setPagination] = useState<PaginationState>({
//   pageIndex: 0,
//   pageSize: 10,
// });

// These store the current state of the page.
// Let's examine each one.
// A. statusFilter
// const [statusFilter, setStatusFilter] =
//   useState<"all" | "active" | "inactive">("all");

// This remembers which status filter is selected.
// The initial value is:
// "all"

// That means the page initially requests users without restricting the results to active or inactive users.
// The allowed values are:
// "all" | "active" | "inactive"

// This is a TypeScript union type, which we discussed in the previous explanation.
// Here's how it behaves:
// statusFilter	Intended behavior
// "all"	Show all matching users, regardless of active status.
// "active"	Show active users.
// "inactive"	Show inactive users.

// The setStatusFilter function changes the selected filter.
// For example:
// setStatusFilter("active");

// This updates the state to "active" and triggers a React render.
// B. search
// const [search, setSearch] = useState("");

// This remembers the search text.
// Initially:
// search = ""

// That means no search text has been applied.
// After searching for John, the state might become:
// search = "John"

// The setSearch function updates this state.
// Later, you'll see how the value is passed into the GraphQL request.
// C. pagination
// const [pagination, setPagination] = useState<PaginationState>({
//   pageIndex: 0,
//   pageSize: 10,
// });

// This remembers the current pagination settings.
// Initially:
// {
//   pageIndex: 0,
//   pageSize: 10,
// }

// That means:
// - pageIndex: 0 — the first page.
// - pageSize: 10 — request ten records per page.
// Remember that page indexing usually starts at zero.
// Page displayed to user	pageIndex
// Page 1	0
// Page 2	1
// Page 3	2
// Page 4	3

// If the user moves to the second page, the pagination state might become:
// {
//   pageIndex: 1,
//   pageSize: 10,
// }

// These three state variables are crucial because they determine which users the application requests from the server.
// 6. Understanding isActive
// Now look at this line:
// const isActive =
//   statusFilter === "all" ? undefined : statusFilter === "active";

// This might look complicated, but it is just a conditional expression.
// The general pattern is:
// condition ? valueIfTrue : valueIfFalse

// Your code asks:
// Is the selected status filter "all"?

// If yes, isActive becomes undefined.
// Otherwise, it checks whether the selected filter is "active".
// Let's examine the results.
// statusFilter	isActive
// "all"	undefined
// "active"	true
// "inactive"	false

// Why do this?
// Because the GraphQL query likely accepts a parameter named isActive.
// The application needs three different meanings:
// - true means active users.
// - false means inactive users.
// - undefined means don't restrict the results by active status.
// This is a common technique when an API uses a boolean filter but the UI has three filter options.
// One important distinction: The meaning of undefined depends on your GraphQL client and query implementation. Your code passes undefined for the All option, presumably intending to omit that filter. The query and gqlFetch implementation determine exactly how that value is serialized.
// 7. Understanding the useSWR request
// This is the most important section of the file.
// const { data, error, isLoading, mutate } = useSWR<{ users: UserConnection }>(
//   ["users", isActive, search, pagination.pageIndex, pagination.pageSize],
//   () =>
//     gqlFetch<{ users: UserConnection }>(USERS_QUERY, {
//       isActive,
//       search: search || undefined,
//       limit: pagination.pageSize,
//       offset: pagination.pageIndex * pagination.pageSize,
//     }),
//   { revalidateOnFocus: false, keepPreviousData: true },
// );

// Don't try to understand the entire line at once.
// Let's divide it into four parts:
// 1. The type.
// 2. The SWR key.
// 3. The fetcher function.
// 4. The SWR options.
// A. The type
// useSWR<{ users: UserConnection }>(...)

// The angle brackets provide a TypeScript generic type argument.
// It tells TypeScript what shape of data the fetcher is expected to return.
// Conceptually, the result might look like:
// {
//   users: {
//     items: [],
//     totalCount: 125,
//   }
// }

// This is illustrative; the actual shape is determined by UserConnection.
// The important part is:
// { users: UserConnection }

// It says that the response object has a users property whose value follows the UserConnection type.
// This helps TypeScript understand expressions such as:
// data?.users.items

// B. The SWR key
// Look at the first argument:
// [
//   "users",
//   isActive,
//   search,
//   pagination.pageIndex,
//   pagination.pageSize,
// ]

// This is the SWR key.
// Think of the key as an identifier for the particular data being requested.
// It tells SWR which version of the data this request represents.
// For example, suppose the current state is:
// statusFilter = "all";
// search = "";
// pagination = {
//   pageIndex: 0,
//   pageSize: 10,
// };

// The key would conceptually be:
// [
//   "users",
//   undefined,
//   "",
//   0,
//   10,
// ]

// Now imagine the user searches for "John".
// The key changes to:
// [
//   "users",
//   undefined,
//   "John",
//   0,
//   10,
// ]

// Because the key has changed, SWR treats this as a different data request and uses the fetcher to retrieve the corresponding data.
// Now imagine the user moves to page two.
// The key changes again:
// [
//   "users",
//   undefined,
//   "John",
//   1,
//   10,
// ]

// The search text is unchanged, but the page index is different.
// Therefore, the key identifies a different page of the search results.
// Why is this useful?
// SWR uses the key to manage cached data and determine when the requested data changes.
// The general principle is:
// If a value changes what data you need from the server, it usually belongs in the SWR key.
// Your code includes:
// - The resource identifier ("users").
// - The active-status filter.
// - The search text.
// - The page index.
// - The page size.
// These values collectively describe the requested result set.
// 8. Understanding the fetcher function
// The second argument is:
// () =>
//   gqlFetch<{ users: UserConnection }>(USERS_QUERY, {
//     isActive,
//     search: search || undefined,
//     limit: pagination.pageSize,
//     offset: pagination.pageIndex * pagination.pageSize,
//   })

// A fetcher is the function SWR calls to retrieve data.
// Here, the fetcher calls your gqlFetch helper.
// Let's examine its arguments.
// A. USERS_QUERY
// gqlFetch(USERS_QUERY, ...)

// This provides the GraphQL query that should be executed.
// The actual query is imported from:
// import { USERS_QUERY } from "./query";

// So this file doesn't need to contain the query string itself.
// B. The variables object
// {
//   isActive,
//   search: search || undefined,
//   limit: pagination.pageSize,
//   offset: pagination.pageIndex * pagination.pageSize,
// }

// This object contains the variables passed to the GraphQL request.
// Let's look at each property.
// isActive
// isActive

// This passes the value calculated from the status filter.
// As a shorthand property, it is equivalent to:
// isActive: isActive

// search: search || undefined
// This uses JavaScript's logical OR operator.
// It means:
// If search is truthy, use it. Otherwise, use undefined.

// For example:
// search	Value passed
// "John"	"John"
// "Mary"	"Mary"
// ""	undefined

// The idea is to avoid sending an empty search string when there is no search text.
// Note that a string containing only spaces, such as "   ", is truthy. This expression does not trim whitespace.
// limit
// limit: pagination.pageSize

// This tells the server how many records to return.
// If:
// pagination.pageSize = 10

// then:
// limit = 10

// offset
// offset: pagination.pageIndex * pagination.pageSize

// This tells the server how many records to skip before returning the requested page.
// The formula is:
// offset = page index × page size
// For example:
// Page	Page index	Page size	Offset
// 1	0	10	0
// 2	1	10	10
// 3	2	10	20
// 4	3	10	30

// Suppose the user requests page three.
// The calculation is:
// offset = 2 * 10;

// Therefore:
// offset = 20;

// The request asks the server to skip the first 20 matching records and return the next 10.
// This technique is called limit-offset pagination.
// Your comment in the previous file mentioned that the server handles pagination through GraphQL limit and offset. This is where those values are calculated and passed to the request.
// 9. Understanding the SWR options
// The final argument is:
// {
//   revalidateOnFocus: false,
//   keepPreviousData: true,
// }

// These are options that control SWR's behavior.
// A. revalidateOnFocus: false
// Normally, SWR can revalidate data when the browser window regains focus.
// For example, a user switches to another browser tab and then returns.
// Setting:
// revalidateOnFocus: false

// disables that automatic focus-triggered revalidation for this hook.
// This can reduce unnecessary requests when the user returns to the page.
// However, it also means that simply returning to the tab won't trigger that particular refresh mechanism.
// B. keepPreviousData: true
// This option helps make changes between different SWR keys feel smoother.
// Imagine the user is viewing page one and clicks page two.
// The new page requires a different key.
// Without retaining previous data, the component may temporarily have no data for the new key while the request is loading.
// With:
// keepPreviousData: true

// SWR can continue returning the previous key's data while the new request is in progress.
// This helps avoid the table immediately becoming empty during the transition.
// It also explains why your table might temporarily display the previous results while isLoading is true.
// 10. Understanding if (!user) return null
// Next:
// if (!user) return null;

// This checks whether the user value exists.
// The ! operator means logical NOT.
// So:
// !user

// means that user is falsy, such as null or undefined.
// If that condition is true, the component returns:
// null

// In React, returning null means that the component renders no UI.
// In plain English:
// If there is no authenticated user available, don't render the rest of this page.

// This is a separate check from RequireSuperuser.
// - RequireSuperuser is intended to enforce the page's access requirement.
// - if (!user) return null prevents the content below it from rendering without a user object.
// One subtle detail: this check appears after the SWR hook. Therefore, the component still invokes useSWR before reaching the early return. If your intention is to prevent fetching until authentication is available, the fetcher/key should be configured to pause or avoid the request until the user is ready.
// Also, this client-side check is not a substitute for server-side authorization.
// 11. Understanding getUserColumns
// Now look at:
// const columns = getUserColumns(user.id, () => mutate());

// This connects the current user and SWR's refresh function to your column definitions.
// Remember the earlier file:
// export function getUserColumns(
//   currentUserId: string,
//   mutateUsers: () => void
// ) {
//   return columnHelper.columns([
//     // Column definitions...
//   ]);
// }

// The function expects two arguments.
// Your page supplies them here.
// First argument: user.id
// user.id

// This is passed as currentUserId.
// Your Actions column uses it here:
// <UserRowActions
//   target={row.original}
//   currentUserId={currentUserId}
//   mutateUsers={mutateUsers}
// />

// That gives the row-actions component the current user's ID, which can be useful when deciding which operations are permitted or appropriate.
// The exact rules depend on the implementation of UserRowActions.
// Second argument: () => mutate()
// () => mutate()

// This is an arrow function.
// It creates a function that calls mutate() when invoked.
// That function is passed to getUserColumns as mutateUsers.
// Later, a row action can call mutateUsers() to ask SWR to revalidate the user data.
// Conceptually:
// User clicks an action
//         |
//         v
// UserRowActions performs an operation
//         |
//         v
// mutateUsers() is called
//         |
//         v
// mutate() asks SWR to revalidate
//         |
//         v
// Updated data is fetched
//         |
//         v
// The table displays the latest data

// This is how an operation performed inside a table row can trigger a refresh of the page's data.
// 12. Understanding the error check
// Next:
// if (error) {
//   return (
//     <div className="p-8 text-sm text-red-600">
//       Failed to load users. {error instanceof Error ? error.message : ""}
//     </div>
//   );
// }

// This handles a failed data request.
// If error exists, the component returns an error message instead of rendering the table.
// Let's break down the conditional expression:
// error instanceof Error ? error.message : ""

// It asks whether error is an instance of JavaScript's Error class.
// - If yes, display its message.
// - If not, display an empty string.
// For example, if the request fails with:
// new Error("Network request failed")

// the UI could display:
// Failed to load users. Network request failed

// The instanceof Error check prevents the component from assuming that every possible error value has a valid message property.
// The styling classes:
// className="p-8 text-sm text-red-600"

// add padding, smaller text, and a red text color.
// 13. Understanding the returned page
// If the component has a user and no error, it renders the page.
// return (
//   <div>
//     <div className="mb-6">
//       <h1 className="text-xl font-semibold">Users</h1>
//       <p className="text-sm text-muted-foreground">
//         Manage every account in your company. Only the owner can perform these actions.
//       </p>
//     </div>

//     <UserDataTable
//       ...
//     />
//   </div>
// );

// The first section displays the page heading and description.
// The second section renders UserDataTable.
// This is where the data fetched by SWR is passed into the table.
// Let's examine the props one by one.
// A. Passing the columns
// columns={columns}

// These are the columns created by:
// getUserColumns(user.id, () => mutate())

// The table uses them to determine what each column should display.
// B. Passing the data
// data={data?.users.items ?? []}

// This expression contains two important JavaScript operators.
// Optional chaining: ?.
// data?.users.items

// This safely accesses users.items when data is not null or undefined.
// If data is missing, the expression evaluates to undefined instead of throwing an error.
// Nullish coalescing: ??
// data?.users.items ?? []

// The ?? operator uses the value on the right when the value on the left is null or undefined.
// So the expression means:
// Use the fetched user records if they exist. Otherwise, use an empty array.

// For example:
// data?.users.items	Value passed to the table
// An array of 10 users	That array
// An empty array []	That empty array
// undefined	[]

// This ensures that the table receives an array even before data is available.
// C. Passing the total count
// totalCount={data?.users.totalCount ?? 0}

// This passes the total number of matching records.
// If the response hasn't arrived yet, the fallback value is 0.
// The table uses this number to calculate the page count.
// Remember the formula from the previous file:
// Math.max(1, Math.ceil(totalCount / pagination.pageSize))

// This is how the page's fetched data and total count work together with pagination.
// D. Passing the loading state
// isLoading={isLoading}

// This connects SWR's loading state to the table.
// The table uses it to display the loading overlay and disable the search input.
// E. Passing the current status filter
// statusFilter={statusFilter}

// This tells the table which status filter is currently selected.
// The table uses it to highlight the appropriate button.
// 14. Understanding how the status filter changes
// Here's the callback:
// onStatusFilterChange={(v) => {
//   setStatusFilter(v);
//   setPagination((p) => ({ ...p, pageIndex: 0 }));
// }}

// When the user clicks a status filter button, the table calls this function.
// Two things happen.
// First: update the filter
// setStatusFilter(v);

// The value v is the newly selected filter.
// For example:
// setStatusFilter("active");

// This updates the status filter.
// Because isActive depends on statusFilter, its value changes too.
// That changes the SWR key, so SWR requests the data for the new filter.
// Second: return to page one
// setPagination((p) => ({ ...p, pageIndex: 0 }));

// Let's break this down.
// The setter receives a function:
// (p) => ({ ...p, pageIndex: 0 })

// Here, p represents the previous pagination state.
// The spread operator:
// ...p

// copies the existing pagination properties.
// Then:
// pageIndex: 0

// sets the page index to zero.
// For example, suppose the previous state was:
// {
//   pageIndex: 4,
//   pageSize: 10,
// }

// The new state becomes:
// {
//   pageIndex: 0,
//   pageSize: 10,
// }

// The page size remains 10, but the page index resets to zero.
// Why reset the page?
// Imagine you're on page five of all users and then select Active.
// There might be only two pages of active users.
// If you stayed on page five, you could end up requesting a page that doesn't exist.
// Resetting to the first page avoids that problem.
// 15. Understanding how search changes
// Now consider:
// search={search}

// This passes the current search string into UserDataTable.
// The table uses it to initialize the search input.
// Then the callback:
// onSearchChange={(v) => {
//   setSearch(v);
//   setPagination((p) => ({ ...p, pageIndex: 0 }));
// }}

// updates the page's search state and resets pagination.
// This connects directly to the debouncing logic from the previous file.
// Here's the complete flow:
// 1. The user types into the search input.
// 2. searchInput changes immediately inside UserDataTable.
// 3. The table waits 350 milliseconds after typing pauses.
// 4. The table calls onSearchChange with the new text.
// 5. This page receives that text as v.
// 6. setSearch(v) updates the search state.
// 7. Pagination resets to the first page.
// 8. The SWR key changes because search has changed.
// 9. SWR requests the matching data.
// 10. The updated results are passed back to the table.
// This is an excellent example of how two components can work together while keeping their responsibilities separate.
// One detail worth remembering: the search prop initializes the table's local search state, but does not automatically synchronize it if the parent later changes search externally. If you need external changes to reset the visible input too, the table component will need to synchronize that state.
// 16. Understanding pagination changes
// Here is the pagination connection:
// pagination={pagination}
// onPaginationChange={setPagination}

// The first prop gives the table the current pagination state.
// The second gives it the function to update that state.
// Suppose the user clicks the next-page button.
// The table calculates the next pagination state and calls its onPaginationChange callback.
// Your UserDataTable component forwards the resulting state to this page.
// Then:
// setPagination(...)

// updates the pagination state here.
// The SWR key contains:
// pagination.pageIndex,
// pagination.pageSize

// Therefore, the new state causes SWR to request the appropriate page.
// The entire flow looks like this:
// User clicks Next Page
//         |
//         v
// UserDataTable updates pagination
//         |
//         v
// onPaginationChange(newState)
//         |
//         v
// setPagination(newState)
//         |
//         v
// SWR key changes
//         |
//         v
// GraphQL request runs with new offset
//         |
//         v
// Server returns the requested users
//         |
//         v
// UserDataTable displays the new page

// The important idea is that changing the pagination state triggers the data-fetching process indirectly through the SWR key.
// You don't need to call gqlFetch manually inside the pagination callback.
// 17. Understanding onBulkActionDone
// Finally:
// onBulkActionDone={() => mutate()}

// This passes a callback to the table.
// When a bulk action finishes, UserDataTable calls its onBulkActionDone callback.
// That callback calls:
// mutate()

// SWR's mutate function can revalidate the current request, causing the application to fetch fresh user data.
// For example, imagine an owner deactivates several users.
// Before the operation, the table might show:
// User	Status
// John	Active
// Mary	Active

// After the operation, those users might need to display a different status.
// The callback requests fresh data so that the table can reflect the latest server state.
// The intended flow is:
// Owner performs bulk action
//         |
//         v
// Bulk action completes
//         |
//         v
// onBulkActionDone()
//         |
//         v
// mutate()
//         |
//         v
// SWR revalidates the current request
//         |
//         v
// Fresh data reaches the table

// The exact result depends on whether the action succeeded and whether the server returns the updated records.
// 18. Putting everything together
// Let's walk through a realistic example.
// Suppose an owner wants to find active users whose names or other searchable fields match "John".
// Step 1: The owner selects Active
// The table calls:
// onStatusFilterChange("active")

// This page updates:
// statusFilter = "active"

// The calculated value becomes:
// isActive = true

// Pagination resets to the first page.
// Step 2: The owner types John
// The table's local search state updates as the user types.
// After 350 milliseconds without further typing, it calls:
// onSearchChange("John")

// This page updates:
// search = "John"

// Pagination remains on the first page.
// Step 3: SWR sees the changed key
// The key now represents a request for active users matching the search text:
// [
//   "users",
//   true,
//   "John",
//   0,
//   10,
// ]

// SWR runs the fetcher for this key.
// Step 4: The fetcher calculates the request variables
// The GraphQL request receives:
// {
//   isActive: true,
//   search: "John",
//   limit: 10,
//   offset: 0,
// }

// Step 5: The server returns the results
// The response might conceptually look like:
// {
//   users: {
//     items: [
//       // Matching user records
//     ],
//     totalCount: 18,
//   },
// }

// The actual response depends on the query and the server's data.
// Step 6: The page passes the results to the table
// <UserDataTable
//   data={data?.users.items ?? []}
//   totalCount={data?.users.totalCount ?? 0}
//   // Other props...
// />

// The table displays the results and calculates the number of pages.
// Step 7: The owner moves to page two
// The pagination state becomes:
// {
//   pageIndex: 1,
//   pageSize: 10,
// }

// The SWR key changes, and the next request uses:
// {
//   isActive: true,
//   search: "John",
//   limit: 10,
//   offset: 10,
// }

// The server returns the next page of matching users.
// That's how all the pieces work together.
// 19. The five most important things to remember
// If you remember only five things from this file, remember these:
// 1. useState stores the page's current settings.
// statusFilter
// search
// pagination

// These values describe what the owner wants to see.
// 2. isActive converts the three UI filter options into an optional boolean filter.
// const isActive =
//   statusFilter === "all" ? undefined : statusFilter === "active";

// 3. The SWR key describes which data is needed.
// ["users", isActive, search, pagination.pageIndex, pagination.pageSize]

// When those values change, SWR can fetch the corresponding data.
// 4. gqlFetch sends the GraphQL request.
// gqlFetch(USERS_QUERY, {
//   isActive,
//   search: search || undefined,
//   limit: pagination.pageSize,
//   offset: pagination.pageIndex * pagination.pageSize,
// })

// This passes the query and its variables to your GraphQL client.
// 5. UserDataTable displays the data and reports user interactions.
// <UserDataTable
//   data={data?.users.items ?? []}
//   totalCount={data?.users.totalCount ?? 0}
//   // Other props...
// />

// The page and table communicate through props and callback functions.
// One final mental model
// Think of your application as three layers:
// Layer	File	Main responsibility
// Data layer	page.tsx	Manages search/filter/pagination state and requests data.
// Table behavior and UI	data-table.tsx	Displays the table and handles user interactions.
// Column configuration	columns.tsx	Defines what each column displays and how it behaves.

// And underneath those layers, data-table-features.ts provides the table's configured capabilities.
// Once you understand these responsibilities, the project becomes much easier to navigate: when you want to change how users are fetched, look at page.tsx; when you want to change how the table is displayed, look at data-table.tsx; and when you want to change a column's content, look at columns.tsx.
