import { type PaginationState } from "@tanstack/react-table"
import { type ReactNode } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// The only parts of a v9 table this footer touches. Any table whose features
// include rowPaginationFeature satisfies this, regardless of its other features.
export interface PaginatedTable {
  state: { pagination: PaginationState }
  getPageCount(): number
  getCanPreviousPage(): boolean
  getCanNextPage(): boolean
  getCanLastPage(): boolean
  firstPage(): void
  previousPage(): void
  nextPage(): void
  lastPage(): void
  setPageSize(size: number): void
}

interface DataTablePaginationProps {
  table: PaginatedTable
  /** Left-side text, e.g. "2 of 20 row(s) selected." Omit if not needed. */
  summary?: ReactNode
  pageSizeOptions?: number[]
}

export function DataTablePagination({
  table,
  summary,
  pageSizeOptions = [10, 20, 25, 30, 40, 50],
}: DataTablePaginationProps) {
  const { pageIndex, pageSize } = table.state.pagination

  return (
    <div className="flex flex-col gap-3 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 text-sm text-muted-foreground">{summary}</div>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.lastPage()}
            disabled={!table.getCanLastPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}


// DataTablePagination is a component that draws the footer under a table: selection count, "Rows per page" dropdown, "Page X of Y", and four buttons (first, previous, next, last). It has no data logic of its own. It receives the table object and calls its methods.

// It has no "use client" line, but it uses onClick handlers. That works only because its parent (the data table, which creates the table with hooks) is a client component, and everything a client component imports joins the client bundle. If you ever render it from a server component, add "use client".

// It also uses shadcn/ui (Button, Select), Lucide icons, and Tailwind classes.

// 2. How is it written?
// File 1
// ts
// import { columnFilteringFeature, ... , tableFeatures } from "@tanstack/react-table"

// import { a, b } from "x" means "take the named things a and b out of the package x." This is a third-party package, installed with npm. The names are in two styles:

// ...Feature are the feature switches.
// create...RowModel are factory functions (functions that build something). filterFn_... and sortFn_... are ready-made filter and sort functions.
// ts
// export const features = tableFeatures({
//   columnFilteringFeature,
//   ...
//   filteredRowModel: createFilteredRowModel(),
//   filterFns: { includesString: filterFn_includesString },
//   sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
// })

// Read it right side first, inside-out:

// text
// { ... }                  → an object literal (a bundle of named values)
// columnFilteringFeature,  → shorthand for columnFilteringFeature: columnFilteringFeature
// filteredRowModel: createFilteredRowModel()
//                          → key: value. The ( ) CALLS the factory now,
//                            and the result is stored under that key
// filterFns: { includesString: filterFn_includesString }
//                          → an object inside an object: a nickname
//                            ("includesString") pointing to a function
// tableFeatures( {...} )   → pass the object to a helper function
// const features =         → store what it returns
// { } here is an object, : separates a key from its value, and , separates entries. A trailing comma after the last entry is allowed.
// filterFn_includesString has no () because you pass the function itself. createFilteredRowModel() has () because you call it and keep the result. That difference (passing vs calling) is important to learn to see.
// tableFeatures(...) mainly helps TypeScript. It reads your object and remembers exactly which features you chose (I can't see its source, so check the library docs for its exact role).
// ts
// export type DataTableFeatures = typeof features
// type X = ... creates a type name.
// typeof features in a type position means "the type of the value called features." (This is different from the JavaScript typeof that returns text like "string".)
// Result: you never write the long type by hand. It always matches your list.
// File 2: new syntax
// import { type ReactTable, type RowData }: the word type marks things that exist only for TypeScript and are erased when the code runs. A line like import { type DataTableFeatures } from "./data-table-features" is a relative import (./ = same folder).
// interface X { ... } is another way to name an object shape.
// <TData extends RowData> is a generic with a constraint (explained next).
// className="..." is React's version of HTML class, filled with Tailwind utility classes.
// {" "} is JSX for "insert one space," because JSX trims spaces at line breaks.
// `${x}` is a template literal (backticks with ${ }).
// 3. Signature
// tsx
// interface DataTablePaginationProps<TData extends RowData> {
//   table: ReactTable<DataTableFeatures, TData>
// }
// Part	Meaning
// interface	Declares an object shape
// DataTablePaginationProps	Name. "Props" = the inputs of a component
// <TData extends RowData>	A placeholder type TData ("the type of one row"), which must fit RowData
// { table: ... }	The props object has one field, table
// ReactTable<DataTableFeatures, TData>	The table type, told which features exist and what a row looks like
// tsx
// export function DataTablePagination<TData extends RowData>({
//   table,
// }: DataTablePaginationProps<TData>) {
// Part	Meaning
// export function	Normal function others can import
// DataTablePagination	Capitalized, so it is a component
// <TData extends RowData>	Same generic placeholder, declared on the function
// ({ table }: ...)	One parameter (props), destructured to pull out table
// : DataTablePaginationProps<TData>	The type of that parameter, passing TData through
// {	Body begins

// What generics do here: the pagination does not care what a row is (a User, a Role, anything). TData says "I will work with whatever row type the table has." extends RowData is a rule: "but it must be a valid row type." When you write <DataTablePagination table={table} />, TypeScript infers TData from the table you pass, so you almost never write it by hand.

// 4. Body, step by step

// The function has no logic before return. It only describes UI. Read the JSX from the outside in.

// tsx
// <div className="flex items-center justify-between px-2">
//   <div ...> selection text </div>
//   <div ...> pagination controls </div>
// </div>

// Tailwind: flex = side by side, items-center = centered vertically, justify-between = pushes the two children to opposite ends, px-2 = horizontal padding.

// Selection text
// tsx
// {table.getFilteredSelectedRowModel().rows.length} of{" "}
// {table.getFilteredRowModel().rows.length} row(s) selected.

// Read the first { } in layers:

// text
// table                                → the object passed in
// .getFilteredSelectedRowModel()       → call a method: rows that are selected AND pass the filter
// .rows                                → the array of rows inside
// .length                              → how many
// { }                                  → insert that number into the page

// So it shows, for example, "2 of 25 row(s) selected." The class text-muted-foreground is a shadcn theme color (soft gray text).

// The "Rows per page" dropdown
// tsx
// <Select
//   value={`${table.state.pagination.pageSize}`}
//   onValueChange={(value) => { table.setPageSize(Number(value)) }}
// >
// table.state.pagination.pageSize is a number such as 10. Wrapping it in `${ }` turns it into the string "10". The Select works with strings, so this conversion is needed.
// onValueChange is a prop that takes a function (a callback). When the user picks an option, shadcn calls it with the chosen value as text.
// (value) => { ... } is an arrow function. Number(value) turns "20" back into 20. Then table.setPageSize(20) changes the table's state, the table re-renders, and fewer or more rows appear.

// This is a controlled component: its displayed value comes from the table's state, not from the Select's own memory.

// tsx
// <SelectTrigger className="h-8 w-[70px]">
//   <SelectValue placeholder={table.state.pagination.pageSize} />
// </SelectTrigger>

// shadcn's Select is built from small parts: SelectTrigger is the closed box, SelectValue shows the chosen value, and SelectContent holds the list. w-[70px] is an arbitrary value in Tailwind: exact width in square brackets.

// tsx
// <SelectContent side="top">
//   {[10, 20, 25, 30, 40, 50].map((pageSize) => (
//     <SelectItem key={pageSize} value={`${pageSize}`}>
//       {pageSize}
//     </SelectItem>
//   ))}
// </SelectContent>

// Inside-out:

// [10, 20, 25, 30, 40, 50] is an array of numbers.
// .map(fn) runs fn on each item and builds a new array from the results.
// (pageSize) => ( <SelectItem .../> ) is an arrow function. The ( ) after => (not { }) means "return this JSX directly."
// React gets six SelectItem elements.
// key={pageSize} is a special React prop: a unique label so React can track list items efficiently. Always give one when you render a list.
// side="top" opens the list upward (it sits at the bottom of the page).
// "Page X of Y"
// tsx
// Page {table.state.pagination.pageIndex + 1} of {table.getPageCount()}

// pageIndex starts at 0 (programmers count from 0), so + 1 shows humans "Page 1." getPageCount() gives the total number of pages.

// The four buttons
// tsx
// <Button
//   variant="outline"
//   size="icon"
//   className="hidden size-8 lg:flex"
//   onClick={() => table.setPageIndex(0)}
//   disabled={!table.getCanPreviousPage()}
// >
//   <span className="sr-only">Go to first page</span>
//   <ChevronsLeft />
// </Button>
// variant="outline" and size="icon" are shadcn Button options (a bordered style, a square size).
// className="hidden size-8 lg:flex": hidden hides it by default, and lg:flex means "from the large-screen breakpoint upward, show it as flex." So the first and last buttons exist only on large screens. size-8 sets width and height.
// onClick={() => table.setPageIndex(0)}: an arrow function wrapped in { }. It runs only on click. If you wrote onClick={table.setPageIndex(0)} (no () =>), it would run during render, a classic beginner mistake.
// disabled={!table.getCanPreviousPage()}: the table says whether a previous page exists, ! flips it, so the button is disabled when there is none.
// <span className="sr-only">: sr-only hides text visually but keeps it for screen readers. An icon-only button needs a text label, or blind users cannot tell what it does.
// <ChevronsLeft /> is a Lucide icon component (self-closing).

// The other three buttons follow the same pattern with different actions:

// Button	Click action	Disabled when
// First	setPageIndex(0)	no previous page
// Previous	previousPage()	no previous page
// Next	nextPage()	no next page
// Last	setPageIndex(table.getPageCount() - 1)	no next page

// (The last page index is count − 1, because counting starts at 0.)

// 5. Why?
// Features file in its own file. Both the table and the helper components need the same type. Putting it in one place avoids circular imports and duplication.
// Registering features keeps the bundle small. Unused abilities are not shipped to the browser.
// typeof features means the type can never drift from the real list.
// Pagination as a separate component. The footer is reusable. Any table can use it, because it asks the table object everything and does not own any state.
// Generics. One component works for every table without any.
// Table state, not local state. Page size and index live inside the table, so sorting, filtering, and paging stay in sync.
// Why shadcn here? shadcn components are copied into your project (components/ui/), so you own and can edit them. They are built on Radix primitives, which handle keyboard use and accessibility.

// Weak spots and security notes:

// All the paging is client-side. createPaginatedRowModel, createSortedRowModel, and createFilteredRowModel mean the browser holds all rows. That is fine for hundreds, but poor for tens of thousands. Large lists need server-side pagination: send page and pageSize as GraphQL variables and let the backend do the slicing.
// Security consequence: the browser has already received every row. Hiding a column (columnVisibilityFeature) or a page only hides it on screen. The data is still visible in the network tab. The backend must return only what the user may see, filtered by permission.
// Empty table. With no rows, getPageCount() can be 0, so you may see "Page 1 of 0." A small Math.max(1, ...) guard would fix it. Also the last-page button would go to index -1 (but it is disabled, since there is no next page).
// Page size list is hardcoded. If the table's default pageSize is not in [10, 20, ...] (say 15), the dropdown shows only the placeholder.
// Number(value) returns NaN for non-numeric text. It is safe here, because the options are fixed.
// includesString filter only. Only text "contains" filtering is registered. Number-range or exact-match filters would need more entries in filterFns.
// Row selection is a UI convenience. If a bulk action (like "delete selected") uses selected rows, the backend must verify permission for each id. Do not trust the list from the browser.
// Version note. Reading table.state.pagination appears to be the v9 style. If your installed version differs, check the docs for that version, because table libraries change APIs between major versions.
// 6. Connections
// text
// data-table-features.ts
//    └─ features  +  type DataTableFeatures
//         ├─ used when creating the table (in your data-table component)
//         │     useTable({ features, columns, data })   ← name is a guess; check your file
//         └─ used as a type here:  ReactTable<DataTableFeatures, TData>

// Page / component
//    └─ fetch rows with gqlFetch(QUERY)  → data
//         └─ <DataTable columns data>      (client component, creates `table`)
//               ├─ renders <table> rows
//               └─ <DataTablePagination table={table} />   ← this file
//                       ├─ reads  table.state.pagination, table.get...Model()
//                       └─ writes table.setPageSize(), nextPage(), ...
//                               ↓
//                        table state changes → re-render → new rows shown

// Missing context: the file that actually calls the table hook (probably data-table.tsx) and the columns definition. Those would show where features is used and how a RowData type like User gets in as TData. Also check components/ui/select.tsx and button.tsx to see what shadcn generated.

// 7. Advanced concepts

// Generics with constraints. <TData extends RowData> means "any type, as long as it fits RowData." Think of it as a template with a rule.

// Type-only imports. import { type X } tells the compiler "this is erased at runtime." It prevents accidental bundling of things that are not real code.

// Tree-shaking. Bundlers remove code that is imported but never used. The library gives each feature as a separate piece, so unregistered ones are left out.

// Controlled components. The Select's value comes from the table state, and changes go back through onValueChange. One source of truth.

// Factory functions. createXRowModel() builds the machinery that computes rows after filtering, sorting, and paging. The order is usually filter → sort → paginate, so the pages are made from the already-filtered, sorted rows.

// Responsive prefixes. In Tailwind, lg: means "only at this screen width and up." No prefix means "all sizes" (mobile first).

// 8. Small example

// The .map plus key pattern alone:

// tsx
// const names = ["Ann", "Bob"];

// return (
//   <ul>
//     {names.map((n) => (
//       <li key={n}>{n}</li>
//     ))}
//   </ul>
// );

// And a generic function:

// ts
// function first<T>(items: T[]): T {
//   return items[0];
// }
// first<number>([5, 6]); // 5
// 9. Reading pattern

// For a config file: look at the imports (what is available), then the object (what is chosen), then the exported names (what others can use).

// For a UI component:

// text
// 1. Signature → what props come in? what generics?
// 2. Body      → is there logic before return? (here: none)
// 3. JSX       → read outside-in, one nested level at a time
// 4. Every { } in JSX → "JavaScript here": evaluate it inside-out
// 5. Every onSomething={ } → a callback; read what it calls
// 6. Every className   → Tailwind: split on spaces, look up each word

// Common JSX shapes to recognize:

// text
// {array.map((x) => ( <Item key={x.id} /> ))}   → render a list
// onClick={() => doThing()}                      → run on click
// disabled={!condition}                          → disable when false

// To build a pagination footer yourself:

// Decide what the table exposes (page index, size, can-next, can-previous).
// Define the props: { table }, typed with a generic.
// Write the layout with flex.
// Add the text, the size select, the page label.
// Add the buttons, each with an action and a disabled rule.
// Add sr-only labels for icon buttons.
// Test: first page, last page, empty data, and a size change.
// 10. What I should remember
// key: value pairs inside { } form an object. fn passes a function, while fn() calls it.
// typeof x in a type position means "the type of the value x," so types stay in sync with real code.
// <T extends Something> is a generic with a rule: the component works with many types but not any.
// {list.map((x) => (<Item key={...} />))} is how React renders lists, and onClick={() => fn()} waits for the click.
// Client-side tables hold every row in the browser, so hiding columns or pages is for looks only. Real access control and large-data paging belong on the backend.
