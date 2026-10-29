import { toast, type ToastOptions } from "react-toastify";
import { BulkUserActionResult } from "./type";

export function notifyBulkResult(
  result: BulkUserActionResult,
  verb: string,
  noun = "user",
): void {
  const okCount = result.succeededIds.length;
  const failCount = result.failed.length;
  const plural = (n: number) => `${noun}${n === 1 ? "" : "s"}`;

  if (failCount === 0) {
    toast.success(`${verb}: ${okCount} ${plural(okCount)} updated.`);
    return;
  }

  const reasons = Array.from(new Set(result.failed.map((f) => f.reason)));
  const reasonLines = reasons.map((r) => `• ${r}`).join("\n");
  const options: ToastOptions = {
    style: { whiteSpace: "pre-line" },
    autoClose: 8000,
  };

  if (okCount === 0) {
    toast.error(`${verb}: no ${noun}s were updated.\n${reasonLines}`, options);
  } else {
    toast.warning(
      `${verb}: ${okCount} succeeded, ${failCount} skipped.\n${reasonLines}`,
      options,
    );
  }
}




// This code defines a helper function called summarizeBulkResult. Its job is to take the results of a bulk action on multiple users and turn them into a readable message.
// For example, imagine an administrator selects 10 users and tries to deactivate them. If 8 succeed and 2 fail, this function creates a message explaining the outcome.
// Let's go through it step by step.
// 1. Importing the type
// import { BulkUserActionResult } from "./type";


// This imports a TypeScript type from your type file.
// BulkUserActionResult describes the structure of the result received after a bulk action.
// From the code, we can see that it has at least these two properties:
// - succeededIds — an array of IDs for users whose actions succeeded.
// - failed — an array containing information about users whose actions failed or were skipped, including a reason for each.
// We don't see the complete type definition here, but those are the properties this function uses.
// 2. Defining the function
// export function summarizeBulkResult(
//   result: BulkUserActionResult,
//   verb: string,
// ): string {


// This declares and exports a function named summarizeBulkResult.
// It receives two arguments:
// Argument	Meaning
// result	The outcome of the bulk operation
// verb	A string describing the action, such as "Deactivate" or "Delete"
// The : string at the end means the function returns a string.
// For example, another component could call:
// summarizeBulkResult(result, "Deactivate");


// And receive a message such as:
// Deactivate: 3 users updated.


// The function doesn't perform the bulk action itself. It summarizes the results after the action has been attempted.
// 3. Counting successful and failed users
// const okCount = result.succeededIds.length;
// const failCount = result.failed.length;


// These two lines count the outcomes.
// First line
// const okCount = result.succeededIds.length;


// - result.succeededIds is an array of successful user IDs.
// - .length gives the number of items in that array.
// - The result is stored in okCount.
// For example:
// result.succeededIds = ["user1", "user2", "user3"];


// Then:
// okCount = 3;


// Second line
// const failCount = result.failed.length;


// This counts the entries in the failed array.
// For example:
// result.failed = [
//   { reason: "User is locked." },
//   { reason: "Insufficient permissions." },
// ];


// Then:
// failCount = 2;


// Important: The function counts entries in failed, not necessarily unique users. If that array contains duplicate entries for the same user, they would all be counted.
// 4. Checking whether everything succeeded
// if (failCount === 0) {
//   return `${verb}: ${okCount} user${okCount === 1 ? "" : "s"} updated.`;
// }


// This checks whether there were any failures.
// failCount === 0


// means that the number of failed entries is zero.
// If there are no failures, the function immediately returns a success message.
// Understanding the template literal
// `${verb}: ${okCount} user${okCount === 1 ? "" : "s"} updated.`


// Backticks allow you to insert variables and expressions into a string using ${...}.
// Suppose:
// verb = "Deactivate";
// okCount = 3;


// The message becomes:
// Deactivate: 3 users updated.


// But notice this part:
// user${okCount === 1 ? "" : "s"}


// It uses a ternary expression to handle singular and plural wording.
// The structure is:
// condition ? valueIfTrue : valueIfFalse


// So:
// - If okCount === 1, append "" — nothing.
// - Otherwise, append "s".
// That gives the correct grammar:
// okCount	Result
// 0	0 users updated.
// 1	1 user updated.
// 3	3 users updated.
// The return also ends the function immediately. If everything succeeded, the remaining code is not executed.
// 5. Collecting the failure reasons
// If at least one entry failed, the function continues here:
// const reasons = result.failed
//   .map((f) => `• ${f.reason}`)
//   .filter((v, i, arr) => arr.indexOf(v) === i);


// This section uses two array methods: .map() and .filter().
// A. .map() — convert each failure into a message
// .map((f) => `• ${f.reason}`)


// .map() goes through every item in the failed array and transforms it into a new value.
// Here, f represents one failure entry.
// For example, if:
// result.failed = [
//   { reason: "User is locked." },
//   { reason: "Insufficient permissions." },
// ];


// Then .map() produces:
// [
//   "• User is locked.",
//   "• Insufficient permissions."
// ]


// The • character adds a bullet point to each reason.
// The .map() method doesn't modify the original array. It creates a new array containing the transformed values.
// B. .filter() — remove duplicate reasons
// .filter((v, i, arr) => arr.indexOf(v) === i);


// This removes repeated reason strings.
// To understand it, first look at the three parameters:
// - v — the current value.
// - i — the current item's index.
// - arr — the entire array being filtered.
// The important part is:
// arr.indexOf(v) === i


// indexOf(v) returns the index of the first occurrence of value v in the array.
// The filter keeps an item only if its current index equals that first occurrence.
// For example, suppose the mapped reasons are:
// [
//   "• User is locked.",
//   "• Insufficient permissions.",
//   "• User is locked."
// ]


// For the first "• User is locked.":
// - Its index is 0.
// - Its first occurrence is also at index 0.
// - 0 === 0 is true, so it stays.
// For "• Insufficient permissions.":
// - Its index is 1.
// - Its first occurrence is also at index 1.
// - 1 === 1 is true, so it stays.
// For the second "• User is locked.":
// - Its index is 2.
// - Its first occurrence is at index 0.
// - 0 === 2 is false, so it is removed.
// The resulting array is:
// [
//   "• User is locked.",
//   "• Insufficient permissions."
// ]


// This is called deduplication: keeping only one copy of each repeated value.
// The comment explains the intention:
// // dedupe repeated reasons


// One subtle point: the function removes duplicate reason strings, not duplicate user IDs. Two different users who fail for the same reason will share one displayed reason, even though both failures are counted in failCount.
// 6. Building the final message
// const lines = [
//   `${verb}: ${okCount} succeeded, ${failCount} skipped.`,
//   "",
//   ...reasons,
// ];


// This creates an array of strings that will become the final message.
// Let's examine each part.
// First element: the summary
// `${verb}: ${okCount} succeeded, ${failCount} skipped.`


// Suppose:
// verb = "Deactivate";
// okCount = 3;
// failCount = 2;


// The first line becomes:
// Deactivate: 3 succeeded, 2 skipped.


// Notice that this code uses the word "skipped" for every entry in result.failed, even though the property is named failed. Whether "skipped" is the best description depends on what those entries actually represent in your application.
// Second element: an empty string
// ""


// This inserts a blank line between the summary and the list of reasons.
// Without it, the message would be more compact.
// Third part: the spread operator
// ...reasons


// The spread operator inserts each element of reasons into the new array as a separate element.
// For example:
// const reasons = [
//   "• User is locked.",
//   "• Insufficient permissions."
// ];


// Then:
// const lines = [
//   "Deactivate: 3 succeeded, 2 skipped.",
//   "",
//   ...reasons,
// ];


// Produces:
// [
//   "Deactivate: 3 succeeded, 2 skipped.",
//   "",
//   "• User is locked.",
//   "• Insufficient permissions."
// ]


// Without ..., writing reasons directly would make it a nested array element instead.
// 7. Joining the lines together
// return lines.join("\n");


// Finally, .join("\n") combines all elements of the lines array into one string.
// The "\n" represents a newline character.
// For example:
// [
//   "Deactivate: 3 succeeded, 2 skipped.",
//   "",
//   "• User is locked.",
//   "• Insufficient permissions."
// ].join("\n");


// Returns:
// Deactivate: 3 succeeded, 2 skipped.

// • User is locked.
// • Insufficient permissions.


// The empty string in the array creates the blank line after the summary.
// The function now returns one complete message that another component can display, for example in a toast or alert.

// 8. Complete example
// Imagine this input:
// const result = {
//   succeededIds: ["user1", "user2", "user3"],
//   failed: [
//     { reason: "User is locked." },
//     { reason: "Insufficient permissions." },
//     { reason: "User is locked." },
//   ],
// };

// summarizeBulkResult(result, "Deactivate");


// The function works through these steps:

// 1. Count the results
// 3 succeeded, 3 failed entries




// 2. Deduplicate reasons
// Two unique reasons remain; the repeated “User is locked.” appears once.




// 3. Return the message
// Deactivate: 3 succeeded, 3 skipped.

// • User is locked.
// • Insufficient permissions.



// Notice that the message reports 3 failed entries but displays only 2 distinct reasons. That is intentional: the summary counts failures, while the reason list avoids repeating the same explanation.
// 9. The whole function in plain English
// The function says:
// 1. Count how many users succeeded and how many failed.
// 2. If nobody failed, return a simple success message with correct singular or plural wording.
// 3. Otherwise, create a list of failure reasons.
// 4. Remove repeated reasons.
// 5. Put the success/failure summary at the top.
// 6. Add a blank line and list the unique reasons.
// 7. Join everything into one readable string and return it.
// The main concept to remember: this function doesn't perform any user actions. It takes the results of actions that have already been attempted and formats them into a message that is easy for an administrator to understand.