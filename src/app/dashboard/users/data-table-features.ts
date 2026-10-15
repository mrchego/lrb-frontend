import {
  columnVisibilityFeature,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";

export const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  columnMeta: metaHelper<{ className?: string }>(),
});

export type DataTableFeatures = typeof features;

// 1. What is this code doing?

// This code creates a configuration for a data table using @tanstack/react-table.

// Imagine a table showing users in your application:

// Name

// Email

// Role

// John

// john@example.com

// Admin

// Mary

// mary@example.com

// Editor

// Peter

// peter@example.com

// User

// You might want users to be able to:

// Sort rows by name or email.

// Select rows using checkboxes.

// Hide or show columns.

// Paginate results (view page 1, page 2, etc.).

// This code collects the features you want the table to support and packages them into one configuration called features.

// Think of it like choosing which functions your table should have before using it.

// 2. Understanding the imports

// Here is the first part:

// import {
//   columnVisibilityFeature,
//   createSortedRowModel,
//   metaHelper,
//   rowPaginationFeature,
//   rowSelectionFeature,
//   rowSortingFeature,
//   sortFn_alphanumeric,
//   sortFn_text,
//   tableFeatures,
// } from "@tanstack/react-table";
// What does import mean?

// import means:

// "I want to use something that someone else has already created in my code."

// The tools come from a library called @tanstack/react-table.

// Imagine that library is a toolbox. Instead of building every table feature yourself, you bring the tools you need into your file.

// What does { ... } mean here?
// import {
//   columnVisibilityFeature,
//   rowSelectionFeature,
//   tableFeatures,
// } from "@tanstack/react-table";

// The curly braces mean you're importing specific named exports from that library.

// You're saying:

// "From this toolbox, give me columnVisibilityFeature, rowSelectionFeature, and tableFeatures."

// You don't have to import everything the library contains.

// What does each imported tool do?

// Imported name

// Simple explanation

// columnVisibilityFeature

// Enables showing and hiding columns.

// createSortedRowModel

// Creates a row-processing model that can sort data.

// metaHelper

// Helps define the type of extra information that columns can carry.

// rowPaginationFeature

// Enables dividing rows into pages.

// rowSelectionFeature

// Enables selecting rows.

// rowSortingFeature

// Enables sorting rows.

// sortFn_alphanumeric

// A sorting function for alphanumeric values.

// sortFn_text

// A sorting function for text values.

// tableFeatures

// Combines the selected features into a configuration.

// One important distinction: importing a tool does not automatically use it. You must use it somewhere in your code. The next section shows how.

// 3. Understanding export const features = ...

// Here is the next part:

// export const features = tableFeatures({
//   columnVisibilityFeature,
//   rowPaginationFeature,
//   rowSelectionFeature,
//   rowSortingFeature,
//   sortedRowModel: createSortedRowModel(),
//   sortFns: {
//     alphanumeric: sortFn_alphanumeric,
//     text: sortFn_text,
//   },
//   columnMeta: metaHelper<{ className?: string }>(),
// });

// Let's read the first line.

// export const features = tableFeatures({

// There are four important pieces.

// export

// Makes features available for other files to import.

// const

// Creates a variable whose binding cannot be reassigned to a different value.

// features

// The name given to the variable. The programmer chose this name.

// tableFeatures(...)

// Calls a function that creates the table feature configuration using the object passed into it.

// In plain English, the line means:

// "Create a constant named features, give it the configuration produced by tableFeatures, and allow other files to import it."

// 4. Read the configuration one piece at a time
// A. Column visibility
// columnVisibilityFeature,

// This adds the column visibility feature to the configuration.

// For example, a user might hide the Email column to make the table less crowded.

// Notice there is no = sign. This is shorthand for an object property.

// It's equivalent to:

// columnVisibilityFeature: columnVisibilityFeature,

// The name on the left is the property name; the name on the right is the value being assigned.

// B. Pagination
// rowPaginationFeature,

// Adds pagination support.

// Imagine you have 1,000 users. Rather than displaying all 1,000 rows on one page, your table can display a smaller group at a time.

// C. Row selection
// rowSelectionFeature,

// Adds support for selecting rows.

// For example, you could select three users and then perform a bulk action on them.

// D. Row sorting
// rowSortingFeature,

// Adds support for sorting rows.

// For example, you could click a column heading to sort users by name.

// These four lines use object shorthand. They pass imported features into the configuration without repeating their names.

// E. Creating the sorted row model
// sortedRowModel: createSortedRowModel(),

// This line is slightly different, so let's read it from left to right.

// sortedRowModel is the property name.

// : separates the property name from its value.

// createSortedRowModel() calls a function.

// The function's returned value becomes the value of sortedRowModel.

// The parentheses () mean the function is being called.

// Compare these two examples:

// // Passing a function itself
// someFunction: createSomething,
// // Calling a function and passing its result
// someFunction: createSomething(),

// Those are different. In your code, createSortedRowModel() is called immediately to provide a sorted row model for the configuration.

// F. Defining sorting functions
// sortFns: {
//   alphanumeric: sortFn_alphanumeric,
//   text: sortFn_text,
// },

// Here, sortFns is a property containing another object.

// You can picture it like a small dictionary of available sorting methods:

// sortFns

// alphanumeric

// Uses sortFn_alphanumeric as its sorting function.

// text

// Uses sortFn_text as its sorting function.

// Why do this?

// The configuration can refer to the sorting functions using the keys alphanumeric and text, rather than having to use the original imported names everywhere.

// The exact behavior of each sorting function depends on the library's implementation and version.

// G. Adding column metadata
// columnMeta: metaHelper<{ className?: string }>(),

// This is the most advanced line, so let's break it into smaller pieces.

// First: columnMeta

// This is the property being configured. It relates to metadata associated with table columns.

// Second: metaHelper(...)

// This calls the imported helper function.

// Third: <{ className?: string }>

// This is a TypeScript type argument. It tells TypeScript what shape of metadata you want to describe.

// Inside it:

// className is a property name.

// ? means the property is optional.

// string means that, if provided, its value must be text.

// For example, this metadata would match the type:

// { className: "text-right" }

// This would also match:

// {}

// But this would not:

// { className: 123 }

// Why? Because 123 is a number, not a string.

// Important: className is metadata here. This line does not, by itself, apply a CSS class to anything on the screen. Your table-rendering code would need to read that metadata and use it.

// Also, metaHelper is a library-specific helper. The type argument tells TypeScript the intended metadata shape; the precise runtime behavior comes from the library's implementation.

// 5. What does typeof features mean?

// The final line is:

// export type DataTableFeatures = typeof features;

// This line defines a TypeScript type.

// Let's break it down.

// export type

// Creates a type that other files can import. A type describes what kind of value something should be.

// DataTableFeatures

// The name given to the type. The programmer chose it.

// typeof features

// In this TypeScript context, typeof asks:

// "What is the type of the variable named features?"

// It does not call the variable like a function, and it does not create another configuration.

// Imagine the configuration is created here:

// export const features = tableFeatures({
//   // Configuration goes here
// });

// You could manually describe its type, but that could become inaccurate if the configuration changes.

// Instead:

// export type DataTableFeatures = typeof features;

// tells TypeScript to derive the type directly from features.

// This helps keep the type and the actual configuration in sync.

// Remember: features is a value that exists at runtime. DataTableFeatures is a type used by TypeScript during type checking.

// 6. How the whole file fits together

// @tanstack/react-table

// Provides the table features and helper functions.

// tableFeatures({...})

// Combines the selected features and settings.

// features

// Stores the resulting configuration for other code to use.

// DataTableFeatures

// Provides the corresponding TypeScript type.

// The distinction to remember is that this file configures the table; it does not render the table itself. Another part of the application would use this configuration when setting up or implementing the table.

// 7. A repeatable way to read code like this

// When you see unfamiliar code, use this order:

// Imports: Where do the tools come from?

// Declaration: What is being created, and what is it called?

// Function call: Which function is being called?

// Arguments: What information is being passed into that function?

// Nested objects: Are any settings grouped inside other settings?

// Types: Is TypeScript describing a value, or creating a type for later use?

// Exports: What can other files reuse?

// For this particular file, you can summarize the whole thing in one sentence:

// Import table-building tools, combine the desired table features into a configuration named features, and define DataTableFeatures as the TypeScript type of that configuration.

// That's the main idea. Once you understand that structure, the individual lines become much easier to read.
