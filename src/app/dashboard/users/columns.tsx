"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { type DataTableFeatures } from "./data-table-features";
import { ManagedUser } from "./type";
import { UserRowActions } from "./user-row-actions";

const columnHelper = createColumnHelper<DataTableFeatures, ManagedUser>();

export function getUserColumns(currentUserId: string, mutateUsers: () => void) {
  return columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer text-sm select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email <ArrowUpDown className="ml-2 h-4 w-4 opacity-70" />
        </div>
      ),
    }),
    columnHelper.accessor("fullName", {
      header: "Name",
      cell: ({ row }) => row.original.fullName || "—",
      meta: { className: "hidden sm:table-cell" },
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
      meta: { className: "hidden lg:table-cell" },
    }),
    columnHelper.accessor("company", {
      header: "Company",
      cell: ({ row }) => row.original.company?.name ?? "—",
      meta: { className: "hidden md:table-cell" },
    }),
    columnHelper.accessor("isSuperuser", {
      header: "Role",
      cell: ({ row }) => {
        const { isSuperuser, isFounder } = row.original;
        if (isFounder) {
          return (
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              Founder
            </Badge>
          );
        }
        return isSuperuser ? (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Owner
          </Badge>
        ) : (
          <Badge variant="outline">Staff</Badge>
        );
      },
      meta: { className: "hidden sm:table-cell" },
    }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: ({ row }) => {
        const { isActive, isLocked, canLogin } = row.original;
        const isDeleted = !isActive && !canLogin;

        if (isDeleted) {
          return (
            <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Deleted
            </Badge>
          );
        }
        if (isLocked) {
          return (
            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
              Locked
            </Badge>
          );
        }
        return (
          <Badge
            className={
              isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      // stays visible — status is the other thing people scan a user list for
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <UserRowActions
            target={row.original}
            currentUserId={currentUserId}
            mutateUsers={mutateUsers}
          />
        </div>
      ),
      enableHiding: false,
    }),
  ]);
}

// The easiest way to understand this is to answer two questions:

// What is columnHelper.display() doing in this code?

// How do I know whether to use display() or accessor() when creating a column?

// Let's go slowly and use your exact code.

// 1. First, imagine the table

// Suppose you're building a page where an administrator manages users.

// Manage users

// Example of the selection column

// Email

// Role

// 	john@example.com	Owner

// 	mary@example.com	Staff

// 	peter@example.com	Staff

// Illustration only: the header checkbox is for selecting all rows on the current page, while each row has its own checkbox.

// Notice something important:

// The Email column displays a value from a user.

// The Role column displays information derived from a user.

// The checkbox column displays a control for selecting rows.

// That last column is different. A checkbox is not a property like email or fullName on the user object.

// That's why your code uses columnHelper.display().

// 2. What does columnHelper.display() mean?

// Here is the first line of your code:

// columnHelper.display({

// Let's break it into three pieces.

// columnHelper — the tool you created to help define table columns.

// .display — a method for defining a display column.

// ({...}) — the configuration object you're passing into that method.

// In plain English:

// "Create a table column whose content is something I want to display, rather than a value I need to access directly from the row's data."

// A display column is useful for things like:

// Checkboxes

// Action buttons

// Menus

// Expand/collapse buttons

// Other controls that don't represent a normal data field

// Now let's examine the individual properties.

// 3. id: "select"
// id: "select",

// This gives your column an identifier.

// Think of an ID as a name tag that lets the table distinguish this column from the others.

// For example:

// id: "select"

// means the column's ID is "select".

// It does not mean the column gets its value from a property called select on the user object.

// Compare that with:

// columnHelper.accessor("email", {
//   header: "Email",
// })

// Here, "email" refers to the user's data property.

// The distinction is:

// id: "select" identifies a column.

// accessor("email", ...) connects a column to a data property.

// 4. Understanding header

// Your code:

// header: ({ table }) => (
//   <Checkbox
//     checked={table.getIsAllPageRowsSelected()}
//     onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//     aria-label="Select all"
//   />
// ),

// First, understand what a table header normally does.

// For an Email column, you could write:

// header: "Email",

// This displays the word Email at the top of the column.

// But for the Select column, you want a checkbox instead of text.

// So you write:

// header: ({ table }) => (
//   <Checkbox ... />
// ),

// Let's decode the beginning:

// header: ({ table }) => (

// header — defines what appears in the column heading.

// ({ table }) — receives an object and extracts its table property.

// => — introduces an arrow function.

// ( — begins the JSX that the function returns.

// In everyday language:

// "When the table needs to display this column's heading, run this function and return a checkbox."

// The table object gives you access to table-level operations, such as checking whether all rows on the current page are selected.

// 5. What does checked do?
// checked={table.getIsAllPageRowsSelected()}

// The checked property controls whether the checkbox appears checked.

// The expression inside the curly braces is JavaScript code.

// Let's break it down:

// table.getIsAllPageRowsSelected()

// Read it from left to right:

// table — the table instance.

// . — access something belonging to that table.

// getIsAllPageRowsSelected — the method that checks the selection state of the current page's rows.

// () — call the method to get its result.

// It returns a boolean: true or false.

// For example:

// If all rows on the current page are selected, it returns true.

// If not all rows on the current page are selected, it returns false.

// That result controls the checkbox.

// Important: this checks the current page, not necessarily every row in your entire database.

// 6. What does onCheckedChange do?
// onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}

// This is the part that tells the checkbox what to do when someone changes it.

// Read it in three steps.

// Step A: onCheckedChange

// This is a callback property on your Checkbox component. It runs when the checkbox's checked state changes.

// Step B: (value) => ...

// This is an arrow function.

// value represents the new checked state supplied by the checkbox component.

// For example, it might be true when the checkbox is checked and false when it is unchecked.

// Step C: !!value
// !!value

// This converts value into a boolean.

// For example:

// value

// !!value

// true

// true

// false

// false

// undefined

// false

// null

// false

// This is useful because some checkbox components can provide a value representing an indeterminate state as well as checked or unchecked.

// Then:

// table.toggleAllPageRowsSelected(!!value)

// tells the table to select or deselect the rows on the current page according to that boolean.

// Putting it together:

// When the user clicks the header checkbox, take its new state and tell the table to select or deselect the current page's rows.

// 7. Why is there another checkbox inside cell?

// Now let's examine the second part:

// cell: ({ row }) => (
//   <Checkbox
//     checked={row.getIsSelected()}
//     onCheckedChange={(value) => row.toggleSelected(!!value)}
//     aria-label="Select row"
//   />
// ),

// The cell property defines what appears in each row of this column.

// Notice the difference:

// header receives { table }.

// cell receives { row }.

// Why?

// The header checkbox operates on the current page's rows as a group.

// Each row checkbox operates on one specific row.

// A. Check the current row's selection state
// checked={row.getIsSelected()}

// row represents the particular row being rendered.

// getIsSelected() checks whether that row is selected.

// The returned boolean controls whether its checkbox is checked.

// B. Change the current row's selection state
// onCheckedChange={(value) => row.toggleSelected(!!value)}

// When the user changes this checkbox, the table updates the selection state of that individual row.

// So the difference is:

// Header checkbox

// Row checkbox

// Uses table

// Uses row

// Selects or deselects all rows on the current page

// Selects or deselects one row

// Uses getIsAllPageRowsSelected()

// Uses getIsSelected()

// Uses toggleAllPageRowsSelected()

// Uses toggleSelected()

// 8. What do aria-label, enableSorting, and enableHiding mean?
// aria-label
// aria-label="Select all"

// This gives the checkbox an accessible name, helping screen readers explain what it does.

// The individual checkboxes use:

// aria-label="Select row"
// enableSorting
// enableSorting: false,

// This disables sorting for the selection column.

// That makes sense because sorting a column of checkboxes is not useful for your intended behavior.

// enableHiding
// enableHiding: false,

// This prevents the column from being hidden through TanStack Table's column-hiding functionality.

// That is useful because the checkbox column is part of how users select rows for bulk actions.

// 9. The big question: display() or accessor()?

// Here's the easiest rule to remember:

// Use accessor() when the column represents data.

// For example: email, full name, phone number, company, or account status.

// columnHelper.accessor("email", {
//   header: "Email",
// })

// The column is connected to the email property of a row.

// Use display() when the column represents a control or UI element.

// For example: a checkbox, an Actions menu, or an expand button.

// columnHelper.display({
//   id: "select",
//   cell: ({ row }) => <Checkbox />,
// })

// The column doesn't need to read a normal value from the row's data.

// 10. Let's classify your actual columns

// Column

// Method

// Why?

// Select

// display()

// Contains checkboxes for row selection.

// Email

// accessor("email")

// Uses the user's email property.

// Name

// accessor("fullName")

// Uses the user's name property.

// Phone

// accessor("phone")

// Uses the user's phone property.

// Company

// accessor("company")

// Connects to the user's company data.

// Role

// accessor("isSuperuser")

// Uses a user property to determine the role display.

// Status

// accessor("isActive")

// Uses a user property to determine the status display.

// Actions

// display()

// Contains the UserRowActions component.

// Notice an important detail: the Role and Status columns still use accessor() even though they display badges instead of the raw values true or false.

// That's because they are connected to user data properties and use those properties to produce their display.

// The decision is not simply "Does this column display JSX?" Both methods can display JSX. The more useful question is whether the column represents a data value or is primarily a standalone UI control.

// 11. Test your understanding

// Question: You're building a products table. You need a column containing a button that says "Add to cart." Which method would you choose?

// columnHelper.accessor()

// columnHelper.display()

// The rule to carry into your next file is simple: data columns use accessor(); action and control columns usually use display().

// What is this file responsible for?

// Imagine your application has a page where an administrator manages users.

// The table might look something like this:

// Manage users

// Example of how the columns are used

// ☐	Email	Name	Role	Status	Actions
// ☐	john@example.com	John	Owner	Active	•••
// ☐	mary@example.com	Mary	Staff	Inactive	•••

// Your code defines the instructions for columns such as Email, Name, Role, Status, and Actions.

// It does not, by itself, render the entire table. Another component will take these column definitions and the user data and render the table.

// 2. Understand the imports first

// Let's read each import.

// "use client";

// import { Badge } from "@/components/ui/badge";
// import { Checkbox } from "@/components/ui/checkbox";
// import { createColumnHelper } from "@tanstack/react-table";
// import { ArrowUpDown } from "lucide-react";
// import { type DataTableFeatures } from "./data-table-features";
// import { ManagedUser } from "./type";
// import { UserRowActions } from "./user-row-actions";

// Think of an import as bringing a tool into the current file so that you can use it.

// Import

// What it gives this file

// "use client"

// Marks this module as a Client Component entry point in Next.js.

// Badge

// A UI component for labels such as Owner, Staff, and Active.

// Checkbox

// A checkbox component for selecting rows.

// createColumnHelper

// A TanStack Table helper for defining columns with type information.

// ArrowUpDown

// An icon that visually suggests sorting.

// DataTableFeatures

// A TypeScript type imported from your earlier file.

// ManagedUser

// A type describing the user data.

// UserRowActions

// A component that provides actions for an individual user row.

// Two important details
// "use client"

// This tells Next.js that this file belongs to the client-side part of your application. That matters because this code uses interactive features such as click handlers and checkboxes.

// @/ versus ./

// These are two ways of referring to files.

// import { Badge } from "@/components/ui/badge";

// @/ is commonly configured as an alias for a project directory, often src/.

// import { UserRowActions } from "./user-row-actions";

// ./ means the file is in the same directory as the current file.

// The exact destination of @/ depends on your project's TypeScript or bundler configuration.

// 3. Understand createColumnHelper

// Now we reach the first important line of logic.

// const columnHelper = createColumnHelper<DataTableFeatures, ManagedUser>();

// Read this from left to right.

// const — declares a variable.

// columnHelper — the name of the variable.

// = — assigns a value to the variable.

// createColumnHelper<...>() — calls a function that creates a column helper.

// <DataTableFeatures, ManagedUser> — supplies two TypeScript type arguments.

// You can think of columnHelper as a specialized tool for building column definitions.

// For example, instead of manually writing all the details for every column, you can use:

// columnHelper.accessor("email", {
//   header: "Email",
// });

// The helper gives TypeScript information that helps it check the column definition.

// A note about the two types

// Your earlier file defined:

// export type DataTableFeatures = typeof features;

// And this file uses:

// createColumnHelper<DataTableFeatures, ManagedUser>()

// That means the first type argument is the type derived from features, and the second is the type named ManagedUser.

// Important: In the standard TanStack React Table v8 API, createColumnHelper normally expects the row-data type first and an optional value type second. Its standard API does not normally take a table-features type as its first argument.

// So this exact line looks unusual for standard TanStack Table v8. It may indicate that your project uses a modified API, a different version, or code that needs correcting. We would need to inspect your package version and the definition of ManagedUser to determine which applies.

// 4. Understand the function that builds the columns
// export function getUserColumns(
//   currentUserId: string,
//   mutateUsers: () => void
// ) {

// This creates a function named getUserColumns.

// Let's break it down:

// export — allows other files to import this function.

// function — declares a function.

// getUserColumns — the function's name.

// currentUserId: string — accepts a parameter containing the current user's ID as text.

// mutateUsers: () => void — accepts a function that takes no arguments and returns no meaningful value.

// { — begins the function's body.

// Why does it need these parameters?

// currentUserId can help the row-actions component know which user is currently signed in. For example, it may need to prevent someone from deleting their own account.

// mutateUsers is a callback passed to the row-actions component. Based on its name, it likely refreshes or revalidates the user data after an action. Its exact behavior depends on how it is implemented.

// Think of the function as a recipe:

// Give me the current user's ID and a callback for refreshing users, and I'll return the column definitions for the users table.

// 5. Understand columnHelper.columns([...])

// The next line is:

// return columnHelper.columns([

// Read it in three steps:

// return — sends a value back to whoever called the function.

// columnHelper.columns(...) — calls a method on columnHelper.

// [...] — contains an array of column definitions.

// An array is a list of values. Here, each item in the array describes one table column.

// Your code contains nine column definitions:

// 1

// Select

// Checkboxes for selecting rows

// 2

// Email

// Email addresses and sorting

// 3

// Name

// Full name

// 4

// Phone

// Phone number

// 5

// Company

// Company name

// 6

// Role

// Founder, Owner, or Staff

// 7

// Status

// Deleted, Locked, Active, or Inactive

// 8

// Actions

// Actions for each user

// There are eight definitions in the code as written: one Select, six data columns (Email, Name, Phone, Company, Role, Status), and one Actions column.

// Now let's examine the patterns used to define them.

// 6. The two ways columns are defined

// Your code uses two methods:

// columnHelper.display(...)

// and

// columnHelper.accessor(...)

// These serve different purposes.

// A. display() — a column for UI elements

// Your first column uses:

// columnHelper.display({
//   id: "select",
//   // ...
// })

// A display column is useful when you want to show something that is not simply a value from the user's data.

// For example, a checkbox for selecting a user.

// The id: "select" line assigns an identifier to this column. It doesn't have to match a property on the user object.

// B. accessor() — a column connected to user data

// Your Email column uses:

// columnHelper.accessor("email", {
//   header: ({ column }) => (
//     // ...
//   ),
// })

// The string "email" tells the column helper which property of a user to read.

// Imagine a user object like this:

// const user = {
//   email: "john@example.com",
//   fullName: "John",
//   phone: "0712345678",
// };

// When you use:

// columnHelper.accessor("email", {
//   header: "Email",
// })

// you're telling the table that this column is associated with the user's email property.

// The accessor connects the column to data; the header describes what appears at the top of the column.

// 7. Understand the Email column's sorting logic

// This is one of the more complex parts:

// columnHelper.accessor("email", {
//   header: ({ column }) => (
//     <div
//       className="flex items-center cursor-pointer text-sm select-none"
//       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//     >
//       Email <ArrowUpDown className="ml-2 h-4 w-4 opacity-70" />
//     </div>
//   ),
// })

// Let's break it down.

// Step 1: header
// header: ({ column }) => (

// The header property defines what to display at the top of the column.

// Instead of giving it plain text, the code gives it a function that returns JSX (React's syntax for describing UI).

// The function receives an object and extracts its column property. This is called destructuring.

// Step 2: onClick
// onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}

// This sets up what happens when the user clicks the Email heading.

// Read it from the outside inward:

// onClick — the event handler for a click.

// () => ... — an arrow function that runs when the click occurs.

// column.getIsSorted() — asks the column for its current sorting state.

// === "asc" — checks whether that state equals the string "asc".

// column.toggleSorting(...) — changes the sorting state based on the boolean passed to it.

// In this code, clicking the heading requests descending order if the current order is ascending; otherwise, it requests ascending order.

// The sorting will only work fully if the table is configured with the appropriate sorting functionality and its state is handled correctly.

// Step 3: ArrowUpDown
// <ArrowUpDown className="ml-2 h-4 w-4 opacity-70" />

// This renders the sorting icon next to Email.

// The className property supplies CSS utility classes:

// ml-2 — adds left margin.

// h-4 — sets the height.

// w-4 — sets the width.

// opacity-70 — makes the icon slightly transparent.

// The icon itself does not perform sorting. The click handler does that.

// 8. Understand cell — how a cell's contents are chosen

// A column's cell property defines what should be displayed inside each row for that column.

// For example:

// columnHelper.accessor("fullName", {
//   header: "Name",
//   cell: ({ row }) => row.original.fullName || "—",
//   meta: { className: "hidden sm:table-cell" },
// })

// Let's examine each property.

// header: "Name"

// The heading displayed above the column is Name.

// cell: ({ row }) => ...

// This function receives information about the current row and returns the content for that cell.

// row.original.fullName

// row — information about the current table row.

// original — the original user object associated with that row.

// fullName — the property containing the user's full name.

// || "—"

// This is a fallback.

// If row.original.fullName is a falsy value, such as an empty string or undefined, the expression returns "—" instead.

// For example:

// row.original.fullName || "—"

// If the name is "John", the result is "John".

// If the name is "", the result is "—".

// This makes the table display a dash when the name is missing or empty.

// What does meta do?
// meta: { className: "hidden sm:table-cell" }

// This attaches metadata to the column.

// The metadata says that the class name should be hidden sm:table-cell.

// In Tailwind CSS, these classes generally mean:

// hidden — hide the element by default.

// sm:table-cell — display it as a table cell at the small breakpoint and above.

// But metadata does not apply the class automatically. Your table-rendering component must read column.columnDef.meta?.className and apply that class to the appropriate element.

// Your earlier data-table-features.ts file defines the intended type for this metadata.

// 9. Understanding the Company column
// columnHelper.accessor("company", {
//   header: "Company",
//   cell: ({ row }) => row.original.company?.name ?? "—",
//   meta: { className: "hidden md:table-cell" },
// })

// The key expression here is:

// row.original.company?.name ?? "—"

// This uses two related operators.

// ?. — optional chaining

// row.original.company?.name

// It means:

// "If company exists, read its name. If company is null or undefined, stop safely and return undefined."

// ?? — nullish coalescing

// row.original.company?.name ?? "—"

// It means:

// "If the result on the left is null or undefined, use the dash instead."

// For example:

// Company data

// Displayed result

// { name: "Acme" }

// Acme

// null

// —

// undefined

// —

// { name: "" }

// Empty string

// Notice that ?? differs from ||: an empty string is kept by ??, but replaced by ||.

// 10. Understanding the Role column

// This section decides which badge should appear for each user.

// columnHelper.accessor("isSuperuser", {
//   header: "Role",
//   cell: ({ row }) => {
//     const { isSuperuser, isFounder } = row.original;

//     if (isFounder) {
//       return (
//         <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
//           Founder
//         </Badge>
//       );
//     }

//     return isSuperuser ? (
//       <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
//         Owner
//       </Badge>
//     ) : (
//       <Badge variant="outline">Staff</Badge>
//     );
//   },
//   meta: { className: "hidden sm:table-cell" },
// })

// First, understand this line:

// const { isSuperuser, isFounder } = row.original;

// This is object destructuring. It extracts two properties from the original user object and creates local variables for them.

// The decision logic is:

// Is isFounder true?

// Yes

// Founder

// No

// Check isSuperuser

// If true

// Owner

// If false

// Staff

// The first if has priority. A founder receives the Founder badge even if isSuperuser is false.

// After that, the ternary expression:

// return isSuperuser ? (
//   <Badge>Owner</Badge>
// ) : (
//   <Badge variant="outline">Staff</Badge>
// );

// means:

// If isSuperuser is true, return the Owner badge.

// Otherwise, return the Staff badge.

// A ternary is a compact way of writing an if/else decision.

// 11. Understanding the Status column

// The Status column is similar, but it has three possible conditions before the final active/inactive decision.

// columnHelper.accessor("isActive", {
//   header: "Status",
//   cell: ({ row }) => {
//     const { isActive, isLocked, canLogin } = row.original;
//     const isDeleted = !isActive && !canLogin;

//     if (isDeleted) {
//       return (
//         <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
//           Deleted
//         </Badge>
//       );
//     }

//     if (isLocked) {
//       return (
//         <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
//           Locked
//         </Badge>
//       );
//     }

//     return (
//       <Badge
//         className={
//           isActive
//             ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
//             : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
//         }
//       >
//         {isActive ? "Active" : "Inactive"}
//       </Badge>
//     );
//   },
// })

// The important line is:

// const isDeleted = !isActive && !canLogin;

// Read the symbols:

// !isActive means isActive is false.

// && means AND.

// !canLogin means canLogin is false.

// So a user is treated as deleted when both conditions are true.

// The order of the checks matters:

// If isDeleted is true, display Deleted.

// Otherwise, if isLocked is true, display Locked.

// Otherwise, display Active or Inactive based on isActive.

// This means a user who is both locked and inactive will display Locked, provided the deleted condition is false.

// 12. Understanding the Actions column

// The last column is another display column:

// columnHelper.display({
//   id: "actions",
//   header: () => <div className="text-right">Actions</div>,
//   cell: ({ row }) => (
//     <div className="flex justify-end">
//       <UserRowActions
//         target={row.original}
//         currentUserId={currentUserId}
//         mutateUsers={mutateUsers}
//       />
//     </div>
//   ),
//   enableHiding: false,
// })

// Let's focus on the most important part:

// <UserRowActions
//   target={row.original}
//   currentUserId={currentUserId}
//   mutateUsers={mutateUsers}
// />

// This renders another React component and passes three props to it.

// Prop

// Value passed

// Meaning

// target

// row.original

// The user this row belongs to.

// currentUserId

// currentUserId

// The current user's ID.

// mutateUsers

// mutateUsers

// A callback that the actions component can invoke.

// This is an important concept in React: components can be placed inside other components, and information can be passed to them through props.

// The actual buttons or menu items for editing, deleting, or managing a user are likely defined inside user-row-actions.tsx, not in this file.

// Finally:

// enableHiding: false

// This tells the table that this column should not be hideable through its column-hiding functionality.

// 13. What is the purpose of the checkboxes?

// Your Select column contains two different checkboxes.

// The header checkbox:

// checked={table.getIsAllPageRowsSelected()}
// onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}

// table.getIsAllPageRowsSelected() checks whether all rows on the current page are selected.

// table.toggleAllPageRowsSelected(...) changes the selection of rows on the current page.

// !!value converts the value into a boolean (true or false).

// The checkbox in each row:

// checked={row.getIsSelected()}
// onCheckedChange={(value) => row.toggleSelected(!!value)}

// row.getIsSelected() checks whether that row is selected.

// row.toggleSelected(...) changes that row's selection.

// The aria-label values provide accessible names for the checkboxes, which helps assistive technologies explain what each checkbox does.

// 14. Putting it all together

// Here's how the pieces fit:

// getUserColumns(...)

// Receives the current user ID and refresh callback.

// columnHelper

// Helps define the table columns.

// Array of column definitions

// Select, Email, Name, Phone, Company, Role, Status, Actions.

// The table component

// Uses the definitions and user data to render the actual table.

// The five things to remember

// Imports bring tools and types into this file.

// createColumnHelper helps define the table columns.

// getUserColumns returns the definitions for the users table.

// accessor and display are two different ways to define columns.

// header, cell, and meta control the heading, cell contents, and extra column information, respectively.

// The next file worth understanding is user-row-actions.tsx, because that's where the per-user actions passed into this table are likely implemented.
