"use client";

import {
  useTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/data-table-pagination";
import { BulkActionsBar } from "./bulk-actions-bar";
import { features, type DataTableFeatures } from "./data-table-features";
import { ManagedUser } from "./type";
import { Loading } from "@/components/loading";

interface Props {
  columns: ColumnDef<DataTableFeatures, ManagedUser>[];
  data: ManagedUser[];
  totalCount: number;
  isLoading?: boolean;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (v: "all" | "active" | "inactive") => void;
  search: string;
  onSearchChange: (v: string) => void;
  pagination: PaginationState;
  onPaginationChange: (p: PaginationState) => void;
  onBulkActionDone: () => void;
}

export function UserDataTable({
  columns,
  data,
  totalCount,
  isLoading = false,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  pagination,
  onPaginationChange,
  onBulkActionDone,
}: Props) {
  // Selection stays controlled because we clear it whenever the data changes.
  // Sorting and column visibility are now owned by the table itself.
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => onSearchChange(searchInput), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const pageCount = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

  const table = useTable({
    features,
    data,
    columns,
    getRowId: (row) => row.id,
    manualPagination: true, // server (GraphQL limit/offset) does the paging
    pageCount,
    state: { rowSelection, pagination },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange(next);
    },
  });

  const selectedIds = Object.keys(rowSelection).filter(
    (id) => rowSelection[id],
  );

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  return (
    <div className="overflow-hidden rounded-md border">
      {/* Stacks on mobile, single row from sm up */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 px-4">
        <Input
          placeholder="Search users..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:max-w-sm"
          disabled={isLoading}
        />
        <div className="flex gap-1 flex-wrap sm:ml-auto">
          {(["all", "active", "inactive"] as const).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={statusFilter === v ? "default" : "outline"}
              onClick={() => onStatusFilterChange(v)}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <BulkActionsBar
        selectedIds={selectedIds}
        onDone={() => {
          setRowSelection({});
          onBulkActionDone();
        }}
      />

      {/* overflow-x-auto is the safety net: even with columns hidden per
          breakpoint, this keeps the table from blowing out the page width */}
      <div className="relative overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loading />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.className}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading ? <Loading /> : "No users found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}

// Let's understand this file using the same beginner-friendly approach we've been using.
// The previous file, user-columns.tsx, defined what each column looks like. This file, user-data-table.tsx, takes those columns and the user data and renders the actual table, manages selection, handles pagination, and provides search and status filters.
// I'll explain how the pieces work together, especially the parts that might look confusing when you're learning React and TypeScript.
// 1. First, understand the big picture
// Imagine your application has a page for managing users.
// This file brings together several things:
// Feature	What it does
// Search input	Lets you search for users.
// Status filters	Lets you filter users by All, Active, or Inactive.
// User table	Displays the user data in columns.
// Row selection	Lets you select individual users or all users on the current page.
// Bulk actions	Lets you perform an action on multiple selected users.
// Pagination	Lets you move between pages of users.
// Loading indicator	Shows a spinner while data is loading.

// Think of this file as the manager that coordinates all these parts.
// For example, when you click a checkbox, the table updates its selection state. When you change the search text, the component waits briefly before notifying the parent component that the search has changed.
// Let's see how the code achieves this.
// 2. Understanding the imports
// Here is the first part:
// "use client";

// import {
//   useTable,
//   type ColumnDef,
//   type PaginationState,
//   type RowSelectionState,
// } from "@tanstack/react-table";

// import { useEffect, useState } from "react";

// Let's break it down.
// A. "use client"
// "use client";

// This tells Next.js that this file is a Client Component entry point.
// Why does this matter?
// Your component uses interactive features such as:
// - useState to store changing values.
// - useEffect to run logic when certain values change.
// - Event handlers such as onChange and onClick.
// These are part of the client-side React functionality.
// B. Imports from TanStack Table
// import {
//   useTable,
//   type ColumnDef,
//   type PaginationState,
//   type RowSelectionState,
// } from "@tanstack/react-table";

// These names serve different purposes.
// Name	Purpose
// useTable	Creates the table instance used to manage and interact with the table.
// ColumnDef	A TypeScript type describing a column definition.
// PaginationState	A type describing the current pagination settings.
// RowSelectionState	A type describing which rows are selected.

// The keyword type indicates that ColumnDef, PaginationState, and RowSelectionState are imported for TypeScript type checking rather than as runtime values.
// A version-specific note: Standard TanStack React Table v8 normally uses useReactTable rather than useTable, and its column-helper types generally use the row-data type first. Your project appears to use a different or modified API. I'll explain the code as written, but we would need to inspect your installed package to confirm the exact API behavior.
// C. React imports
// import { useEffect, useState } from "react";

// These are two React Hooks.
// A Hook is a function that lets a React component use a particular React capability.
// - useState lets a component remember a value between renders.
// - useEffect lets a component run code in response to rendering and changes to dependencies.
// We'll examine both shortly.
// D. UI components
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// These are reusable UI components from your project.
// Instead of writing all the HTML and styling from scratch, the code imports components that are already defined elsewhere.
// For example:
// - Table represents the overall table.
// - TableHeader contains the table heading.
// - TableBody contains the data rows.
// - TableRow represents one row.
// - TableHead represents a heading cell.
// - TableCell represents a normal cell.
// - Input provides the search input.
// - Button provides the filter buttons.
// The remaining imports connect this component to other parts of your application:
// import { DataTablePagination } from "@/components/data-table-pagination";
// import { BulkActionsBar } from "./bulk-actions-bar";
// import { features, type DataTableFeatures } from "./data-table-features";
// import { ManagedUser } from "./type";

// Import	Why it is needed
// DataTablePagination	Displays the pagination controls.
// BulkActionsBar	Displays actions for selected users.
// features	Provides the table feature configuration you examined earlier.
// DataTableFeatures	Provides a TypeScript type associated with that configuration.
// ManagedUser	Describes the shape of a user record.

// Notice how your earlier files fit together:
// - data-table-features.ts defines the table configuration.
// - user-columns.tsx defines the columns.
// - user-data-table.tsx uses the configuration, columns, and data to render the table.
// That separation makes the project easier to organize.
// 3. Understanding interface Props
// Now let's examine:
// interface Props {
//   columns: ColumnDef<DataTableFeatures, ManagedUser>[];
//   data: ManagedUser[];
//   totalCount: number;
//   isLoading?: boolean;
//   statusFilter: "all" | "active" | "inactive";
//   onStatusFilterChange: (v: "all" | "active" | "inactive") => void;
//   search: string;
//   onSearchChange: (v: string) => void;
//   pagination: PaginationState;
//   onPaginationChange: (p: PaginationState) => void;
//   onBulkActionDone: () => void;
// }

// This section is extremely important because it tells you what information this component expects to receive from its parent.
// What is an interface?
// In TypeScript, an interface describes the shape of an object.
// For example:
// interface Person {
//   name: string;
//   age: number;
// }

// This tells TypeScript that an object described by Person should have:
// - A name property containing a string.
// - An age property containing a number.
// Your Props interface does the same thing, but it describes the information that UserDataTable needs.
// Let's break down its properties.
// A. columns
// columns: ColumnDef<DataTableFeatures, ManagedUser>[];

// This describes an array of column definitions.
// The [] at the end means an array of these items.
// Conceptually:
// columns: [
//   emailColumn,
//   nameColumn,
//   statusColumn,
// ]

// The actual entries are supplied by the parent component.
// B. data
// data: ManagedUser[];

// This means data is an array of user records.
// For example, conceptually:
// data: [
//   { id: "1", email: "john@example.com" },
//   { id: "2", email: "mary@example.com" },
// ]

// These are illustrative objects; the actual fields must match the ManagedUser type in your project.
// C. totalCount
// totalCount: number;

// This is the total number of matching records, not necessarily the number currently displayed.
// Imagine your server has 125 matching users, but your table displays only 10 at a time.
// Then:
// totalCount = 125;
// data.length = 10;

// These values represent different things.
// This distinction becomes important when calculating how many pages the table should have.
// D. isLoading?: boolean
// isLoading?: boolean;

// The ? means the property is optional.
// The parent can supply:
// isLoading={true}

// or:
// isLoading={false}

// It can also omit the property entirely.
// Later, your component supplies a default value of false when this property is omitted.
// E. Status filter
// statusFilter: "all" | "active" | "inactive";

// The vertical bars | mean OR in this TypeScript type.
// The property can contain exactly one of these string values:
// - "all"
// - "active"
// - "inactive"
// It cannot contain an arbitrary string such as "deleted" unless the type is changed.
// This is called a union type.
// F. Callback functions
// Consider:
// onStatusFilterChange: (v: "all" | "active" | "inactive") => void;

// This describes a function.
// Read it from left to right:
// - v is the parameter.
// - v must be one of the three allowed filter values.
// - => void means the function does not return a meaningful value.
// In plain English:
// The component expects a function that it can call when the user changes the status filter.

// The same pattern appears here:
// onSearchChange: (v: string) => void;

// This is a callback that accepts a string.
// And here:
// onPaginationChange: (p: PaginationState) => void;

// This callback accepts a pagination state.
// Finally:
// onBulkActionDone: () => void;

// This callback takes no arguments.
// The component can call it to notify the parent that a bulk action has finished.
// The main idea: Props is a contract. It describes the information the parent must supply so that UserDataTable can do its job.
// 4. Understanding the function parameters
// Now look at the component itself:
// export function UserDataTable({
//   columns,
//   data,
//   totalCount,
//   isLoading = false,
//   statusFilter,
//   onStatusFilterChange,
//   search,
//   onSearchChange,
//   pagination,
//   onPaginationChange,
//   onBulkActionDone,
// }: Props) {

// This looks complicated at first, but it uses a concept you can learn once and recognize everywhere: object destructuring.
// Imagine the parent component calls:
// <UserDataTable
//   columns={columns}
//   data={users}
//   totalCount={125}
//   search=""
//   // Other required props...
// />

// React passes these properties into UserDataTable as a single props object.
// Instead of writing:
// export function UserDataTable(props: Props) {
//   const columns = props.columns;
//   const data = props.data;
// }

// your code extracts the properties directly:
// export function UserDataTable({
//   columns,
//   data,
//   totalCount,
// }: Props) {

// That is destructuring.
// It means:
// Take the incoming props object and create local variables for the properties I need.

// What does isLoading = false mean?
// isLoading = false,

// This is a default value.
// If the parent doesn't supply isLoading, the local variable receives false.
// If the parent supplies isLoading={true}, the value is true.
// This is useful because the component can safely check isLoading without requiring every parent to provide it.
// 5. Understanding useState: storing selected rows
// Now we reach the first React Hook.
// const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

// Let's break it down carefully.
// A. What is useState?
// useState lets React remember a value between renders.
// Imagine the user selects three rows.
// Your component needs to remember which rows are selected so that:
// - The checkboxes display the correct state.
// - The bulk-actions bar knows which users to act on.
// - The selection can be cleared after an operation.
// That is what this state is for.
// B. Understanding the square brackets
// const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

// useState returns two things, which the code extracts into two variables.
// Variable	Purpose
// rowSelection	The current selection state.
// setRowSelection	The function used to update that state.

// You can think of them as:
// - rowSelection = the current answer.
// - setRowSelection = the way to change the answer.
// C. Why does it start with {}?
// useState<RowSelectionState>({})

// The {} is an empty object.
// Initially, no rows are selected.
// Later, the object might conceptually look like this:
// {
//   "user-101": true,
//   "user-205": true,
// }

// This means the rows with IDs user-101 and user-205 are selected.
// The row IDs are keys, and the boolean values indicate selection.
// The exact object contents depend on the table's row-selection behavior.
// D. What does <RowSelectionState> mean?
// This is a TypeScript type argument.
// It tells TypeScript what kind of state the component is storing.
// In other words:
// This state should follow the structure expected for row selection.

// The generic type does not create the selection object. The {} provides its initial value.
// 6. Understanding the search input state
// Next:
// const [searchInput, setSearchInput] = useState(search);

// This creates another piece of state.
// Notice that its initial value is search, which comes from the parent.
// Why not use search directly in the input?
// Because your component wants to allow the user to type freely while delaying the notification sent to the parent.
// For example, imagine the user types:
// john

// The input should update immediately with every keystroke.
// But you probably don't want to trigger a server search for every single character.
// Instead, your component waits 350 milliseconds after typing stops before calling onSearchChange.
// That is the purpose of the next section.
// One detail to remember: useState(search) uses search only as the initial value. If the parent later changes search, searchInput does not automatically update to match it. If the parent can reset the search externally, the component may need additional synchronization logic.
// 7. Understanding useEffect and the 350-millisecond delay
// Here is the code:
// useEffect(() => {
//   const id = setTimeout(() => onSearchChange(searchInput), 350);
//   return () => clearTimeout(id);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [searchInput]);

// This is one of the most useful patterns to understand in React.
// It implements a technique called debouncing.
// Debouncing means waiting until changes have stopped for a short period before running an action.
// Let's examine it line by line.
// A. useEffect(...)
// useEffect(() => {
//   // ...
// }, [searchInput]);

// useEffect lets React run code after rendering when the dependencies change.
// The dependency array here is:
// [searchInput]

// This tells React that the effect depends on searchInput.
// When searchInput changes, React runs the effect again.
// B. setTimeout(...)
// const id = setTimeout(() => onSearchChange(searchInput), 350);

// setTimeout schedules a function to run after a delay.
// The arguments are:
// setTimeout(functionToRun, delayInMilliseconds)

// In your code:
// - () => onSearchChange(searchInput) is the function to run.
// - 350 is the delay in milliseconds.
// Since 1,000 milliseconds equals one second, 350 milliseconds is 0.35 seconds.
// The code says:
// Wait 350 milliseconds, then notify the parent about the current search input.

// C. Why store the timeout ID?
// const id = setTimeout(...);

// setTimeout returns an identifier for the scheduled timeout.
// Your code stores that identifier in id so it can cancel the timeout if necessary.
// D. Understanding the cleanup function
// return () => clearTimeout(id);

// The effect returns a cleanup function.
// clearTimeout(id) cancels the scheduled timeout.
// Why is that useful?
// Imagine the user types:
// j

// A timeout is scheduled.
// Before 350 milliseconds pass, the user types:
// jo

// React cleans up the previous effect and cancels its timeout. Then it runs the effect again with the new input.
// If the user continues typing, each new change cancels the previous pending timeout.
// Only after the user stops typing for 350 milliseconds does the latest scheduled callback run.
// This is why the pattern is called debouncing.
// A timeline
// Time	Event
// 0 ms	User types j; timer starts.
// 100 ms	User types o; previous timer is cancelled.
// 200 ms	User types h; previous timer is cancelled.
// 300 ms	User types n; previous timer is cancelled.
// 650 ms	If no more input occurs, the callback runs.

// The precise timing can vary slightly because timers are not guaranteed to run at an exact instant.
// E. What about the ESLint comment?
// // eslint-disable-next-line react-hooks/exhaustive-deps

// This suppresses the relevant ESLint warning on the next line.
// Your effect uses onSearchChange as well as searchInput, but only searchInput appears in the dependency array.
// That may be intentional, but it deserves attention: if onSearchChange changes between renders, the effect won't rerun solely because that callback changed.
// A common improvement is to include all reactive dependencies used by the effect, or otherwise structure the code so the callback remains stable.
// For learning purposes, remember that the main purpose of this effect is to delay search updates until typing pauses.
// 8. Understanding pageCount
// Next:
// const pageCount = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

// This line calculates how many pages the table should have.
// Let's break it down from the inside out.
// A. totalCount / pagination.pageSize
// Imagine:
// - totalCount is 125.
// - pagination.pageSize is 10.
// Then:
// 125 / 10

// equals:
// 12.5

// But you cannot have 12.5 pages. You need 13 pages because the final page contains the remaining users.
// B. Math.ceil(...)
// Math.ceil(12.5)

// Math.ceil rounds a number up to the next whole number, unless it's already whole.
// So:
// Math.ceil(12.5) = 13

// Other examples:
// Expression	Result
// Math.ceil(12)	12
// Math.ceil(12.1)	13
// Math.ceil(12.9)	13

// C. Math.max(1, ...)
// Math.max(1, 13)

// Math.max returns the largest number among its arguments.
// Your code ensures that pageCount is at least 1.
// For example, if totalCount is zero:
// Math.ceil(0 / 10)

// returns 0.
// Then:
// Math.max(1, 0)

// returns 1.
// So the table's page count never falls below one.
// Important: This calculation determines the number of pages based on the total number of matching records and the page size. It doesn't fetch those records itself.
// 9. Understanding useTable(...)
// Now we reach the heart of the component.
// const table = useTable({
//   features,
//   data,
//   columns,
//   getRowId: (row) => row.id,
//   manualPagination: true,
//   pageCount,
//   state: { rowSelection, pagination },
//   onRowSelectionChange: setRowSelection,
//   onPaginationChange: (updater) => {
//     const next =
//       typeof updater === "function" ? updater(pagination) : updater;
//     onPaginationChange(next);
//   },
// });

// The purpose of this section is to create a table instance.
// Think of table as an object that gives you access to table operations, such as:
// - Getting the current rows.
// - Getting the table headers.
// - Checking and changing selection.
// - Reading pagination state.
// - Rendering the cells and headers through the configured API.
// The object passed to useTable tells the library how your table should behave.
// Let's examine each property.
// A. features
// features,

// This passes in the table feature configuration from data-table-features.ts.
// Because the property name and variable name are the same, this is object shorthand for:
// features: features,

// Remember, importing features makes the configuration available in this file. This line passes it into the table hook.
// B. data
// data,

// This passes the array of users into the table.
// For example, if the parent provides ten user records, those records become the table's current data.
// C. columns
// columns,

// This passes in the column definitions from the earlier file.
// Those definitions tell the table how to handle Email, Name, Phone, Company, Role, Status, selection, and Actions.
// So now the table has two important ingredients:
// - data — the records.
// - columns — the instructions for displaying those records.
// D. getRowId
// getRowId: (row) => row.id,

// This tells the table how to identify each row.
// The arrow function receives a row's data and returns its id property.
// For example:
// (row) => row.id

// If a row looks like:
// {
//   id: "user-101",
//   email: "john@example.com"
// }

// then the row ID will be:
// user-101

// Why is this useful?
// Your selection state needs stable identifiers for rows. Without a suitable ID strategy, selection can become unreliable when data is reordered or refreshed.
// This also explains why rowSelection can look like:
// {
//   "user-101": true,
//   "user-205": true,
// }

// The keys correspond to row IDs.
// E. manualPagination: true
// manualPagination: true,

// This tells the table that pagination is handled externally rather than by the table's normal client-side pagination process.
// Your comment explains where that happens:
// // server (GraphQL limit/offset) does the paging

// In plain English:
// The server returns the records for the requested page. The table displays those records rather than slicing the entire dataset itself.

// For example, suppose the server has 125 users and the page size is 10.
// The client requests a page using a limit and offset. The server returns the requested records, along with the total count.
// The table receives those records in data.
// Important: This flag doesn't fetch data from GraphQL by itself. Your parent component or data-fetching logic must handle the actual request.
// F. pageCount
// pageCount,

// This tells the table how many pages exist.
// The value comes from the calculation we covered earlier:
// const pageCount = Math.max(1, Math.ceil(totalCount / pagination.pageSize));

// The table can use it when determining whether there is another page.
// G. state
// state: { rowSelection, pagination },

// This is particularly important.
// It passes the current selection and pagination state into the table.
// Let's separate them:
// state: {
//   rowSelection,
//   pagination,
// },

// This is equivalent to:
// state: {
//   rowSelection: rowSelection,
//   pagination: pagination,
// },

// The table receives the current values.
// For example:
// pagination = {
//   pageIndex: 0,
//   pageSize: 10,
// }

// Typically, pageIndex: 0 means the first page because page indices start at zero.
// By supplying rowSelection and pagination in state, the component is controlling those parts of the table state.
// H. onRowSelectionChange
// onRowSelectionChange: setRowSelection,

// This tells the table which function to call when the row selection changes.
// Remember:
// const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

// The setRowSelection function updates the React state.
// When the table selection changes, the new state is sent to setRowSelection, causing React to render the component again with the updated selection.
// That keeps the checkboxes and bulk-actions bar synchronized.
// I. onPaginationChange
// onPaginationChange: (updater) => {
//   const next =
//     typeof updater === "function" ? updater(pagination) : updater;
//   onPaginationChange(next);
// },

// This section connects the table's pagination changes to the parent component.
// Let's unpack it.
// Step 1: Receive updater
// onPaginationChange: (updater) => {

// The table calls this function when the pagination state needs to change.
// Depending on the API, updater may be either:
// - A new pagination state object.
// - A function that calculates the next state from the previous state.
// Step 2: Determine what updater contains
// const next =
//   typeof updater === "function" ? updater(pagination) : updater;

// This uses a ternary expression.
// The general pattern is:
// condition ? valueIfTrue : valueIfFalse

// Your code checks:
// typeof updater === "function"

// If updater is a function, the code calls it with the current pagination state:
// updater(pagination)

// Otherwise, the code uses updater directly.
// The result is stored in next.
// Step 3: Notify the parent
// onPaginationChange(next);

// This calls the callback provided by the parent component.
// The parent can then use the new pagination state to request the appropriate page from the server.
// The key idea: this component doesn't own the entire pagination process. It communicates pagination changes to the parent, which can handle the data request.
// 10. Understanding selectedIds
// Next:
// const selectedIds = Object.keys(rowSelection).filter(
//   (id) => rowSelection[id],
// );

// This converts the selection object into an array of selected IDs.
// Let's use an example.
// Suppose:
// rowSelection = {
//   "user-101": true,
//   "user-205": false,
//   "user-309": true,
// };

// First:
// Object.keys(rowSelection)

// returns all the keys:
// ["user-101", "user-205", "user-309"]

// Then:
// .filter((id) => rowSelection[id])

// keeps only the IDs whose values are truthy.
// The result is:
// ["user-101", "user-309"]

// So:
// selectedIds

// contains the IDs of selected users.
// Why does the component need this array?
// Because the bulk-actions bar needs to know which users are selected.
// 11. Understanding the second useEffect
// Here is another effect:
// useEffect(() => {
//   setRowSelection({});
// }, [data]);

// This effect clears the selected rows when data changes.
// Let's examine it.
// [data]
// This is the dependency array.
// When React detects that data has changed, it runs the effect.
// setRowSelection({})
// This replaces the selection state with an empty object.
// In other words:
// When the user data changes, clear the current row selection.

// Why would the developer do this?
// Imagine you've selected three users on page one. Then you search for a different set of users or move to another page.
// The rows now represent different records. Keeping the previous selection might be confusing or unsafe, especially when the user is about to perform a bulk action.
// Clearing the selection avoids carrying those selected IDs into the new dataset.
// A subtle detail: React compares dependencies by identity. If the parent creates a new array for data on every render, the effect may run more often than intended. Normally, you want the parent to provide stable data references when the underlying records haven't changed.
// 12. Understanding the returned JSX
// Now that the component has prepared the state and table instance, it returns the UI.
// The structure is:
// return (
//   <div>
//     {/* Search and filters */}

//     <BulkActionsBar />

//     {/* Table and loading indicator */}

//     <DataTablePagination />
//   </div>
// );

// The outer <div> groups everything into one component.
// Let's look at each part.
// A. Search and filter controls
// <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 px-4">

// This is a div with Tailwind CSS classes.
// The classes control the layout:
// - flex — uses Flexbox.
// - flex-col — arranges children vertically.
// - sm:flex-row — arranges them horizontally at the small breakpoint and above.
// - sm:items-center — aligns the children along the cross-axis at that breakpoint.
// - gap-2 — adds spacing between children.
// - py-4 — adds vertical padding.
// - px-4 — adds horizontal padding.
// The search input comes first:
// <Input
//   placeholder="Search users..."
//   value={searchInput}
//   onChange={(e) => setSearchInput(e.target.value)}
//   className="w-full sm:max-w-sm"
//   disabled={isLoading}
// />

// Let's focus on the important properties.
// value={searchInput}
// This connects the input's displayed value to React state.
// The input displays whatever searchInput currently contains.
// onChange
// onChange={(e) => setSearchInput(e.target.value)}

// When the user types:
// 1. The event handler runs.
// 2. e.target.value reads the text in the input.
// 3. setSearchInput(...) updates the React state.
// 4. React renders the input with the new value.
// 5. The debouncing effect schedules a delayed search update.
// This is an example of a controlled input: React state determines the input's value.
// disabled={isLoading}
// The input is disabled while loading is true.
// This prevents the user from typing into it while the component is in that loading state.
// The filter buttons follow a similar pattern:
// {(["all", "active", "inactive"] as const).map((v) => (
//   <Button
//     key={v}
//     size="sm"
//     variant={statusFilter === v ? "default" : "outline"}
//     onClick={() => onStatusFilterChange(v)}
//   >
//     {v[0].toUpperCase() + v.slice(1)}
//   </Button>
// ))}

// There are a few concepts worth understanding here.
// as const
// (["all", "active", "inactive"] as const)

// This tells TypeScript to treat the array entries as specific literal values rather than as an ordinary array of strings.
// That helps TypeScript understand that v can only be "all", "active", or "inactive".
// .map(...)
// .map((v) => (
//   <Button key={v}>
//     ...
//   </Button>
// ))

// map goes through each item in an array and produces a corresponding result.
// Here, it creates three buttons.
// key={v}
// React uses the key to identify each item in a rendered list.
// For the three buttons, the keys are:
// all
// active
// inactive

// The conditional variant
// variant={statusFilter === v ? "default" : "outline"}

// This means:
// - If the button's value matches the current status filter, use the "default" variant.
// - Otherwise, use the "outline" variant.
// This visually distinguishes the selected filter.
// Formatting the button text
// {v[0].toUpperCase() + v.slice(1)}

// This turns the lowercase values into display labels.
// For example:
// all      → All
// active   → Active
// inactive → Inactive

// Finally, clicking a button calls:
// onStatusFilterChange(v)

// This notifies the parent that the selected filter has changed. The parent is responsible for updating the relevant state and, if necessary, fetching filtered data.
// 13. Understanding BulkActionsBar
// Next:
// <BulkActionsBar
//   selectedIds={selectedIds}
//   onDone={() => {
//     setRowSelection({});
//     onBulkActionDone();
//   }}
// />

// This renders the bulk-actions component.
// It receives two props.
// selectedIds
// selectedIds={selectedIds}

// This passes the array of selected user IDs.
// The bulk-actions component can use these IDs to determine which users should be affected by an action.
// onDone
// onDone={() => {
//   setRowSelection({});
//   onBulkActionDone();
// }}

// This passes a callback function to the child component.
// When the child calls onDone, two things happen:
// 1. setRowSelection({}) clears the selected rows.
// 2. onBulkActionDone() notifies the parent that the bulk action has finished.
// This is a common React pattern: a parent passes a function to a child so that the child can notify the parent when something happens.
// The exact actions available depend on the implementation of BulkActionsBar.
// 14. Understanding the loading overlay
// The next section is:
// <div className="relative overflow-x-auto">
//   {isLoading && (
//     <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
//       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
//     </div>
//   )}

//   <Table>
//     ...
//   </Table>
// </div>

// First, notice this expression:
// isLoading && (...)

// This is conditional rendering using the logical AND operator.
// It means:
// If isLoading is true, render the element on the right. Otherwise, render nothing for that expression.

// The outer div creates an overlay containing a spinner.
// The Tailwind classes control its appearance:
// Class	Meaning
// relative	Establishes a positioning context for the overlay.
// absolute	Positions the overlay relative to that context.
// inset-0	Stretches the overlay to all four edges.
// bg-background/50	Applies a partially transparent background.
// flex	Uses Flexbox.
// items-center	Centers along the cross-axis.
// justify-center	Centers along the main axis.
// z-10	Sets a higher stacking order.
// animate-spin	Animates the spinner by rotating it.

// The overflow-x-auto class makes the wrapper horizontally scrollable when the table is wider than the available space.
// This is particularly useful on mobile screens.
// 15. Understanding how the table headers are rendered
// Now we're at the actual table.
// <Table>
//   <TableHeader>
//     {table.getHeaderGroups().map((hg) => (
//       <TableRow key={hg.id}>
//         {hg.headers.map((header) => (
//           <TableHead
//             key={header.id}
//             className={header.column.columnDef.meta?.className}
//           >
//             {header.isPlaceholder ? null : (
//               <table.FlexRender header={header} />
//             )}
//           </TableHead>
//         ))}
//       </TableRow>
//     ))}
//   </TableHeader>
// </Table>

// This section takes the column definitions you created earlier and turns them into actual table headings.
// Let's read it from the outside inward.
// Step A: table.getHeaderGroups()
// This gets the table's header groups.
// The API supports multiple header rows, such as when columns are grouped under a shared heading.
// Step B: .map((hg) => ...)
// .map((hg) => (
//   <TableRow key={hg.id}>

// This goes through each header group and creates a table row for it.
// hg is simply the developer's chosen variable name for a header group.
// Step C: hg.headers.map(...)
// hg.headers.map((header) => (
//   <TableHead key={header.id}>

// This goes through the headers in the group and creates a TableHead for each one.
// Step D: Applying column metadata
// className={header.column.columnDef.meta?.className}

// This reads the optional className stored in the column's metadata.
// Remember the earlier column definition:
// meta: { className: "hidden sm:table-cell" }

// Here, the table component reads that metadata and passes the class to the rendered header cell.
// This is the connection between your column definitions and the responsive styling.
// The ?. is optional chaining. If the metadata is missing, the expression safely returns undefined.
// Step E: Rendering the header
// {header.isPlaceholder ? null : (
//   <table.FlexRender header={header} />
// )}

// This is another ternary expression.
// It means:
// - If header.isPlaceholder is true, render nothing.
// - Otherwise, render the actual header content.
// The FlexRender component renders the header definition supplied by your column configuration.
// For example, it could render:
// header: "Name"

// as the text Name.
// Or it could render the custom checkbox header from your Select column.
// API note: table.FlexRender is not the standard rendering form used in ordinary TanStack React Table v8 examples, which typically use the exported flexRender function. Your project's API may differ.
// 16. Understanding how the table rows are rendered
// The body is similar:
// <TableBody>
//   {table.getRowModel().rows?.length ? (
//     table.getRowModel().rows.map((row) => (
//       <TableRow
//         key={row.id}
//         data-state={row.getIsSelected() && "selected"}
//       >
//         {row.getVisibleCells().map((cell) => (
//           <TableCell
//             key={cell.id}
//             className={cell.column.columnDef.meta?.className}
//           >
//             <table.FlexRender cell={cell} />
//           </TableCell>
//         ))}
//       </TableRow>
//     ))
//   ) : (
//     // Empty-state row
//   )}
// </TableBody>

// There are two possible outcomes.
// If rows exist: render the user rows.
// If no rows exist: render the empty-state message.
// A. Check whether rows exist
// table.getRowModel().rows?.length

// This expression gets the current row model, accesses its rows array, and checks the array's length.
// The ?. means the code safely accesses length if rows is not nullish.
// In ordinary TanStack Table v8, the row model's rows property is an array, so optional chaining may not be necessary.
// B. Render each row
// table.getRowModel().rows.map((row) => (
//   <TableRow key={row.id}>

// For each row in the row model, the code creates a TableRow.
// The key={row.id} gives React a stable identifier for that rendered row.
// C. Add the selection state
// data-state={row.getIsSelected() && "selected"}

// This checks whether the row is selected.
// If the row is selected, the attribute receives "selected".
// Otherwise, it receives false.
// This kind of attribute is often used by styling rules to highlight selected rows.
// D. Render each visible cell
// row.getVisibleCells().map((cell) => (
//   <TableCell key={cell.id}>
//     <table.FlexRender cell={cell} />
//   </TableCell>
// ))

// This gets the visible cells for the row and renders each one.
// Notice the difference:
// - getVisibleCells() respects the table's column visibility.
// - cell.column.columnDef.meta?.className reads the column's styling metadata.
// - FlexRender renders the cell content from your earlier column definitions.
// This is where the code you studied in user-columns.tsx finally appears in the UI.
// For example, the Email cell renders the email value, the Role cell renders its badge, and the Select cell renders its checkbox.
// 17. Understanding the empty-state row
// When no rows exist, this branch runs:
// <TableRow>
//   <TableCell
//     colSpan={columns.length}
//     className="h-24 text-center"
//   >
//     {isLoading ? "Loading..." : "No users found."}
//   </TableCell>
// </TableRow>

// Let's examine the key pieces.
// colSpan={columns.length}
// colSpan controls how many table columns the cell spans.
// If the table has eight column definitions, the empty-state cell spans eight columns.
// This lets the message appear across the width of the table rather than occupying just one cell.
// One detail: because the table can hide columns, using columns.length may not always match the number of currently visible columns.
// The conditional message
// {isLoading ? "Loading..." : "No users found."}

// This is a ternary expression.
// If loading is true, it displays:
// Loading...

// Otherwise, it displays:
// No users found.

// There's a subtle UI detail here: your component also renders a loading overlay above the table. Depending on timing, the empty-state message may appear underneath that overlay.
// 18. Understanding DataTablePagination
// At the bottom:
// <DataTablePagination table={table} />

// This renders your reusable pagination component.
// Notice:
// table={table}

// The parent passes the entire table instance to the child component.
// That gives DataTablePagination access to the table's pagination-related operations and state.
// For example, a pagination component might use the table instance to:
// - Display the current page.
// - Display the total page count.
// - Move to the next or previous page.
// - Change the page size.
// The exact behavior depends on the implementation of DataTablePagination.
// 19. Put the entire flow together
// Let's connect all the pieces.
// Imagine an administrator opens the user-management page.
// Step 1: The parent supplies data.
// The parent passes user records, column definitions, the total record count, search state, and pagination state into UserDataTable.
// Step 2: The component initializes its state.
// It creates state for row selection and the local search input.
// Step 3: The table is configured.
// useTable(...) receives the data, columns, feature configuration, selection state, and pagination state.
// Step 4: The UI is rendered.
// The search input, status buttons, bulk-actions bar, table headings, table rows, and pagination controls are displayed.
// Step 5: The user interacts with the table.
// - Typing updates the local search input.
// - After typing pauses, the component calls onSearchChange.
// - Clicking a status button calls onStatusFilterChange.
// - Selecting rows updates rowSelection.
// - Changing pages calls onPaginationChange.
// Step 6: The parent responds.
// The parent can update its state, fetch the appropriate data from the server, and pass the new values back into the table.
// Step 7: The table updates.
// React renders the component using the latest state and data.
// That is the overall cycle.
// 20. The most important concepts to remember
// You don't need to memorize the entire file. Focus on these concepts first.
// Concept	What it means in this file
// Props	Describes what the parent must provide.
// useState	Stores values that can change over time.
// useEffect	Runs logic when dependencies change.
// setTimeout	Delays an action.
// clearTimeout	Cancels a pending timeout.
// map()	Turns each item in an array into a rendered element.
// filter()	Keeps only items that satisfy a condition.
// useTable(...)	Creates the table instance using the configured data, columns, and state.
// state	Supplies the table's current controlled state.
// Callback props	Allow this component to notify its parent about changes.
// FlexRender	Renders the configured header or cell content in this project's API.

// One final observation about your code
// Your component uses a controlled selection state, but its sorting and column visibility appear to be left to the table configuration or library defaults. That is consistent with your comment:
// // Selection stays controlled because we clear it whenever the data changes.
// // Sorting and column visibility are now owned by the table itself.

// The code also uses a nonstandard-looking TanStack API (useTable, table.FlexRender, and the types passed to createColumnHelper in your earlier file). If this is a customized wrapper or a different package version, those details may be correct for your project. If you intended to use standard TanStack React Table v8, those APIs should be checked against the installed version before making changes.
// My recommendation for learning this file: focus first on understanding Props, useState, and useEffect. Those three concepts explain how the component receives information, remembers changes, and reacts to user input. Once they make sense, the table-rendering section becomes much easier to follow.
