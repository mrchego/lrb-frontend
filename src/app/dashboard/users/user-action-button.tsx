"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import {
  ACTIVATE_USER_MUTATION,
  DEACTIVATE_USER_MUTATION,
  DELETE_USER_MUTATION,
  LOCK_USER_MUTATION,
  UNLOCK_USER_MUTATION,
  FORCE_PASSWORD_RESET_MUTATION,
  RESTORE_USER_MUTATION,
  PROMOTE_TO_OWNER_MUTATION,
  DEMOTE_OWNER_MUTATION,
} from "./mutation";
import type { LucideIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/confirm-provider";

type Action =
  | "activate"
  | "deactivate"
  | "lock"
  | "unlock"
  | "delete"
  | "forcePasswordReset"
  | "restore"
  | "promote"
  | "demote";

const ACTION_MAP: Record<
  Action,
  { query: string; field: string; success: string }
> = {
  activate: { query: ACTIVATE_USER_MUTATION, field: "activateUser", success: "User activated." },
  deactivate: { query: DEACTIVATE_USER_MUTATION, field: "deactivateUser", success: "User deactivated." },
  lock: { query: LOCK_USER_MUTATION, field: "lockUser", success: "User locked for 15 minutes." },
  unlock: { query: UNLOCK_USER_MUTATION, field: "unlockUser", success: "User unlocked." },
  delete: { query: DELETE_USER_MUTATION, field: "deleteUser", success: "User deleted." },
  forcePasswordReset: {
    query: FORCE_PASSWORD_RESET_MUTATION,
    field: "forcePasswordReset",
    success: "Password reset required on next login.",
  },
  restore: { query: RESTORE_USER_MUTATION, field: "restoreUser", success: "User restored." },
  promote: { query: PROMOTE_TO_OWNER_MUTATION, field: "promoteToOwner", success: "User is now an owner." },
  demote: { query: DEMOTE_OWNER_MUTATION, field: "demoteOwner", success: "Owner access removed." },
};

export function UserActionButton({
  userId,
  action,
  icon: Icon,
  label,
  confirmMessage,
  onDone,
  disabled,
  disabledReason,
  destructive,
}: {
  userId: string;
  action: Action;
  icon: LucideIcon;
  label: string;
  confirmMessage: string;
  onDone: () => void;
  disabled?: boolean;
  disabledReason?: string;
  destructive?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);

  const confirm = useConfirm();

  const handleClick = async () => {
    if (disabled || submitting) return;
    const ok = await confirm({
    description: confirmMessage,
    confirmLabel: label,
    destructive,
  });
  if (!ok) return;

    setSubmitting(true);
    try {
      const { query, field , success } = ACTION_MAP[action];
      const variables =
        action === "lock" ? { userId, durationMinutes: 15 } : { userId };
      // promote/demote return { success, user, errors } — success/errors
      // still line up with this generic shape, so no special-casing needed.
      const data = await gqlFetch<
        Record<string, { success: boolean; errors?: any[] }>
      >(query, variables);
      if (data[field].success) {
        toast.success(success);
        onDone();
      } else {
        toast.error(data[field].errors?.[0]?.message ?? "Action failed.");
      }
    } catch (err) {
      toast.error(
        err instanceof GraphQLError ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      disabled={disabled || submitting}
      title={disabled ? disabledReason : undefined}
      className={destructive ? "text-red-600 focus:text-red-600" : undefined}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </DropdownMenuItem>
  );
}

// This file defines a reusable component called UserActionButton. It allows an administrator to perform actions on a user account, such as activating, deactivating, locking, unlocking, deleting, or changing the user's role.
// I'll explain it step by step in simple terms, including how it connects to the other files you've been studying.
// 1. First, understand what this component does
// Imagine you're on your Users page. Each user has a three-dot menu containing actions like these:
// - Activate user
// - Deactivate user
// - Lock user
// - Unlock user
// - Delete user
// - Reset password
// - Promote to owner
// - Demote owner
// When you click one of these actions, this component handles the process.
// The general flow is:
// Click action → Confirm → Send GraphQL request → Check result → Refresh the data or show an error.
// Let's see how the code makes that happen.
// 2. Understanding the imports
// "use client";

// This tells Next.js that the component runs on the client side, in the browser.
// Why does this component need to run in the browser?
// Because it uses browser functionality, such as:
// - useState to track whether an action is being submitted.
// - window.confirm() to ask for confirmation.
// - alert() to display error messages.
// - Click events to trigger actions.
// These require client-side behavior.
// Importing useState
// import { useState } from "react";

// useState lets the component remember information between renders.
// In this file, it remembers whether an action is currently being submitted.
// We'll look at that shortly.
// Importing DropdownMenuItem
// import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

// This imports a dropdown menu item from your UI components.
// Instead of building a clickable menu item from scratch, the component reuses this existing UI element.
// For example, a menu might display:
// ⋮
// ├── Activate
// ├── Lock
// └── Delete

// Each action can be rendered as a DropdownMenuItem.
// Importing the GraphQL client
// import { gqlFetch, GraphQLError } from "@/lib/graphql-client";

// There are two imports here.
// gqlFetch sends a request to your GraphQL API.
// For example, if the administrator clicks Lock, the component uses gqlFetch to send the lock mutation to the server.
// GraphQLError is an error class used by your GraphQL client. The component uses it to determine whether an error came from a GraphQL-related request failure.
// We'll examine the error handling later.
// Importing the mutations
// import {
//   ACTIVATE_USER_MUTATION,
//   DEACTIVATE_USER_MUTATION,
//   DELETE_USER_MUTATION,
//   LOCK_USER_MUTATION,
//   UNLOCK_USER_MUTATION,
//   FORCE_PASSWORD_RESET_MUTATION,
//   RESTORE_USER_MUTATION,
//   PROMOTE_TO_OWNER_MUTATION,
//   DEMOTE_OWNER_MUTATION,
// } from "./mutation";

// These are imported from your local mutation file.
// Each constant represents a GraphQL mutation for a particular action.
// For example:
// Constant	Purpose
// ACTIVATE_USER_MUTATION	Activate a user
// DEACTIVATE_USER_MUTATION	Deactivate a user
// DELETE_USER_MUTATION	Delete a user
// LOCK_USER_MUTATION	Temporarily lock a user
// UNLOCK_USER_MUTATION	Unlock a user
// FORCE_PASSWORD_RESET_MUTATION	Require a password reset
// RESTORE_USER_MUTATION	Restore a user
// PROMOTE_TO_OWNER_MUTATION	Promote a user to owner
// DEMOTE_OWNER_MUTATION	Demote an owner

// The actual GraphQL operations are defined in mutation.ts or mutation.tsx, depending on your project.
// Important distinction: This component doesn't define what each mutation does on the server. It selects the appropriate mutation and sends it to the API.
// Importing LucideIcon
// import type { LucideIcon } from "lucide-react";

// This imports a TypeScript type for icons from the lucide-react library.
// It tells TypeScript that the icon prop must be an appropriate Lucide icon component.
// For example, another component could pass a lock icon when creating a Lock action.
// The type keyword indicates that this import is used for type-checking rather than as a runtime value.
// 3. Understanding the Action type
// type Action =
//   | "activate"
//   | "deactivate"
//   | "lock"
//   | "unlock"
//   | "delete"
//   | "forcePasswordReset"
//   | "restore"
//   | "promote"
//   | "demote";

// This defines the possible values of Action.
// In TypeScript, the | symbol means OR in a union type.
// So an Action must be one of these nine strings.
// For example:
// const action: Action = "lock";

// This is valid.
// But:
// const action: Action = "ban";

// This produces a TypeScript error because "ban" isn't one of the allowed values.
// Why define this type?
// Without it, you could accidentally pass an unsupported action name.
// For example:
// action="locK"

// Because the spelling and capitalization are incorrect, TypeScript would reject it.
// The purpose is to restrict the component to the actions your application supports.
// 4. Understanding ACTION_MAP
// This is one of the most important parts of the file.
// const ACTION_MAP: Record<Action, { query: string; field: string }> = {
//   activate: { query: ACTIVATE_USER_MUTATION, field: "activateUser" },
//   deactivate: { query: DEACTIVATE_USER_MUTATION, field: "deactivateUser" },
//   lock: { query: LOCK_USER_MUTATION, field: "lockUser" },
//   unlock: { query: UNLOCK_USER_MUTATION, field: "unlockUser" },
//   delete: { query: DELETE_USER_MUTATION, field: "deleteUser" },
//   forcePasswordReset: {
//     query: FORCE_PASSWORD_RESET_MUTATION,
//     field: "forcePasswordReset",
//   },
//   restore: { query: RESTORE_USER_MUTATION, field: "restoreUser" },
//   promote: { query: PROMOTE_TO_OWNER_MUTATION, field: "promoteToOwner" },
//   demote: { query: DEMOTE_OWNER_MUTATION, field: "demoteOwner" },
// };

// Let's break this down.
// A. What is Record?
// Record<Action, { query: string; field: string }>

// Record is a TypeScript utility type.
// It means:
// Create an object with a key for every value in Action. Each key must contain an object with a query string and a field string.

// Because Action contains nine possible actions, ACTION_MAP must provide an entry for each of those actions.
// Each entry has this structure:
// {
//   query: "...",
//   field: "..."
// }

// - query identifies which GraphQL mutation to send.
// - field identifies which property to inspect in the returned GraphQL data.
// B. Why do we need this map?
// Imagine writing separate logic for every action:
// if (action === "activate") {
//   // Send activate mutation
// } else if (action === "deactivate") {
//   // Send deactivate mutation
// } else if (action === "lock") {
//   // Send lock mutation
// }

// You would need to repeat this pattern for all nine actions.
// Instead, ACTION_MAP stores the differences between the actions in one place.
// For example:
// ACTION_MAP["lock"]

// Returns the equivalent of:
// {
//   query: LOCK_USER_MUTATION,
//   field: "lockUser"
// }

// And:
// ACTION_MAP["activate"]

// Returns the equivalent of:
// {
//   query: ACTIVATE_USER_MUTATION,
//   field: "activateUser"
// }

// The component can now use the same logic for every action.
// C. Why are query and field different?
// Consider this entry:
// lock: {
//   query: LOCK_USER_MUTATION,
//   field: "lockUser"
// }

// The query is the GraphQL mutation document that gets sent to the server.
// The field is the name of the field expected in the response.
// For example, the response might look like this:
// {
//   lockUser: {
//     success: true,
//     errors: []
//   }
// }

// Notice that the response contains a lockUser property.
// The component needs to know that property name so it can check whether the operation succeeded.
// In simple terms: query tells the component what to send; field tells it where to look in the response.
// 5. Understanding the UserActionButton component
// export function UserActionButton({
//   userId,
//   action,
//   icon: Icon,
//   label,
//   confirmMessage,
//   onDone,
//   disabled,
//   disabledReason,
//   destructive,
// }: {
//   userId: string;
//   action: Action;
//   icon: LucideIcon;
//   label: string;
//   confirmMessage: string;
//   onDone: () => void;
//   disabled?: boolean;
//   disabledReason?: string;
//   destructive?: boolean;
// }) {

// This defines and exports the component.
// Other files can import it and use it to create different user actions.
// Let's understand its props.
// Prop	Meaning
// userId	The ID of the user being acted on
// action	The action to perform, such as "lock"
// icon	The icon to display
// label	The text displayed in the menu
// confirmMessage	The confirmation message shown before proceeding
// onDone	A callback to execute after a successful action
// disabled	Whether the action should be unavailable
// disabledReason	An explanation for why the action is disabled
// destructive	Whether to style the action as dangerous

// Some props are optional because they have a ? after their names:
// disabled?: boolean;
// disabledReason?: string;
// destructive?: boolean;

// The others are required.
// For example, userId, action, and label must be provided.
// What's happening with icon: Icon?
// This syntax is worth understanding:
// icon: Icon,

// It renames the icon prop to Icon when destructuring the props object.
// Suppose the parent component passes:
// icon={LockIcon}

// Inside UserActionButton, the variable Icon refers to LockIcon.
// Later, the component renders:
// <Icon className="h-4 w-4 mr-2" />

// React renders the supplied icon component.
// Why use an uppercase Icon?
// React treats uppercase JSX names as component references. This allows you to pass different icons into the same reusable component.
// For example, one button can display a lock icon and another can display a trash icon, while both use the same UserActionButton implementation.
// 6. Tracking whether an action is being submitted
// const [submitting, setSubmitting] = useState(false);

// This creates a state variable named submitting.
// Initially:
// submitting = false

// That means no action is currently being submitted by this component.
// When a request begins, the code will execute:
// setSubmitting(true);

// When the request finishes, it will execute:
// setSubmitting(false);

// Why is this useful?
// Suppose an administrator clicks Delete twice quickly.
// Without a submission guard, the component might send multiple requests.
// The submitting state helps prevent that.
// We'll see exactly how in the next section.
// 7. Understanding handleClick
// This function contains the main logic of the component.
// const handleClick = async () => {

// It is an asynchronous function that runs when the user clicks the menu item.
// The async keyword allows the function to use await when waiting for the API request to finish.
// Let's go through its steps.
// Step 1: Check whether the action can run
// if (disabled || submitting) return;

// This checks two conditions:
// - Is the action disabled?
// - Is an action already being submitted?
// The || operator means OR.
// Therefore, if either condition is true, the function stops immediately.
// For example:
// disabled = true
// submitting = false

// The function returns without doing anything.
// Likewise:
// disabled = false
// submitting = true

// The function also returns.
// This prevents the click handler from proceeding when the action shouldn't run.
// Step 2: Ask for confirmation
// if (!window.confirm(confirmMessage)) return;

// This displays a browser confirmation dialog.
// Suppose the parent component passes:
// confirmMessage="Are you sure you want to delete this user?"

// The browser displays a confirmation dialog with OK and Cancel options.
// window.confirm() returns:
// - true if the user confirms.
// - false if the user cancels.
// The ! operator means NOT.
// Therefore:
// if (!window.confirm(confirmMessage)) return;

// means:
// If the user does not confirm, stop the function.

// This is particularly useful for destructive actions such as deleting a user.
// Important: This confirmation is a user-interface safeguard. The server must still enforce authorization and any other rules required to perform the action.
// Step 3: Mark the action as submitting
// setSubmitting(true);

// Now the component records that a request is about to be processed.
// This helps prevent duplicate submissions.
// The code then enters a try block.
// 8. The try block: Selecting the mutation
// try {
//   const { query, field } = ACTION_MAP[action];

// This line uses the action prop to find the appropriate entry in ACTION_MAP.
// Suppose the component was created with:
// action="lock"

// Then:
// ACTION_MAP[action]

// is equivalent to:
// ACTION_MAP["lock"]

// That gives us:
// {
//   query: LOCK_USER_MUTATION,
//   field: "lockUser"
// }

// The code then extracts both properties:
// const { query, field } = ACTION_MAP[action];

// This is called object destructuring.
// It's a shorter way to write:
// const query = ACTION_MAP[action].query;
// const field = ACTION_MAP[action].field;

// Both versions do the same thing.
// After destructuring, the component has two variables:
// - query: the GraphQL mutation to execute.
// - field: the response property to inspect.
// 9. Preparing the variables
// const variables =
//   action === "lock"
//     ? { userId, durationMinutes: 15 }
//     : { userId };

// This is a ternary expression.
// Its structure is:
// condition ? valueIfTrue : valueIfFalse

// Here, the condition is:
// action === "lock"

// The code treats the Lock action differently from the other actions.
// If the action is lock
// The variables become:
// {
//   userId,
//   durationMinutes: 15
// }

// This is shorthand for:
// {
//   userId: userId,
//   durationMinutes: 15
// }

// It sends the user ID and a lock duration of 15 minutes.
// If the action is anything else
// The variables become:
// {
//   userId
// }

// For example, an activation request would send the target user's ID.
// Why does Lock need an extra variable?
// Because the mutation may require the duration of the lock.
// The other mutations, as used here, only receive the user ID.
// The actual requirements depend on how the GraphQL mutations are defined in your project.
// 10. Sending the GraphQL request
// const data = await gqlFetch<
//   Record<string, { success: boolean; errors?: any[] }>
// >(
//   query,
//   variables,
// );

// This is the line that sends the request to the server.
// Let's break it down.
// A. gqlFetch(query, variables)
// The component passes two arguments to gqlFetch:
// 1. query: the selected GraphQL mutation.
// 2. variables: the values needed by that mutation.
// For example, when locking a user, the request conceptually looks like this:
// gqlFetch(LOCK_USER_MUTATION, {
//   userId: "123",
//   durationMinutes: 15,
// });

// The actual user ID would come from the userId prop.
// The await keyword tells JavaScript to wait for the request to resolve before continuing.
// The result is stored in:
// data

// B. What is the generic type?
// <Record<string, { success: boolean; errors?: any[] }>>

// This is a TypeScript generic type argument.
// It tells TypeScript what general structure the returned data is expected to have.
// Let's break it down:
// Record<string, ...>

// This means the object can have string keys, such as:
// "activateUser"
// "lockUser"
// "deleteUser"

// Each key is expected to contain an object with this shape:
// {
//   success: boolean;
//   errors?: any[];
// }

// In other words:
// - success is a boolean indicating whether the action succeeded.
// - errors is an optional array of errors.
// A possible response is:
// {
//   lockUser: {
//     success: true,
//     errors: []
//   }
// }

// Another possible response is:
// {
//   lockUser: {
//     success: false,
//     errors: [
//       { message: "User cannot be locked." }
//     ]
//   }
// }

// The generic type helps TypeScript understand the expected shape of data.
// Important: A TypeScript generic doesn't validate the server's actual response at runtime. It describes the expected shape to the compiler.
// Also, any[] means an array of values whose types aren't checked by TypeScript. A more precise error type could improve type safety.
// 11. Checking whether the action succeeded
// if (data[field].success) {
//   onDone();
// } else {
//   alert(data[field].errors?.[0]?.message ?? "Action failed.");
// }

// This is where the field property from ACTION_MAP becomes useful.
// Remember:
// field = "lockUser"

// when the selected action is Lock.
// Therefore:
// data[field].success

// is equivalent to:
// data.lockUser.success

// for that action.
// For Activate, it would instead access:
// data.activateUser.success

// The same code can handle every action because field changes according to the selected action.
// Case A: The action succeeded
// if (data[field].success) {
//   onDone();
// }

// If success is true, the component calls:
// onDone();

// But what is onDone?
// It's a function passed in through the props.
// In your earlier columns.tsx, the UserRowActions component receives:
// mutateUsers={mutateUsers}

// And getUserColumns is called in page.tsx with:
// const columns = getUserColumns(user.id, () => mutate());

// This connects the action button to SWR's mutate() function.
// When the action succeeds, the parent-provided callback can refresh the users data so the table reflects the change.
// For example, after activating a user, the refreshed data may show the user's status as Active.
// This is an important connection between the files you've been studying.
// Case B: The action failed
// else {
//   alert(data[field].errors?.[0]?.message ?? "Action failed.");
// }

// If success is false, the component displays an error message.
// Let's examine the expression:
// data[field].errors?.[0]?.message ?? "Action failed."

// It contains two optional-chaining operators and a nullish-coalescing operator.
// errors?.[0]
// This means:
// If errors exists, get its first element.

// If errors is missing or null/undefined, the expression safely produces undefined instead of trying to access an element from a missing value.
// [0]?.message
// Arrays use zero-based indexing.
// So:
// errors[0]

// means the first error.
// Then:
// ?.message

// means to read the message property only if that first error exists.
// For example:
// errors = [
//   { message: "You cannot delete this account." }
// ];

// The expression returns:
// "You cannot delete this account."

// ?? "Action failed."
// The ?? operator provides a fallback if the expression on its left is null or undefined.
// So if there is no error message, the component displays:
// Action failed.

// This makes the error handling more useful because the user sees a specific message when one is available.
// 12. Understanding the catch block
// } catch (err) {
//   alert(err instanceof GraphQLError ? err.message : "Something went wrong.");
// }

// The catch block handles errors thrown while executing the code inside the try block.
// For example, a request might fail because of a network problem or an error reported by the GraphQL client.
// The code checks:
// err instanceof GraphQLError

// This asks whether err is an instance of the GraphQLError class.
// If it is a GraphQLError
// alert(err.message);

// The component displays the error's message.
// Otherwise
// alert("Something went wrong.");

// It displays a general error message.
// This is different from the previous if/else block.
// - The if/else block handles a response where the mutation returns success: false.
// - The catch block handles an exception thrown while the request is being processed.
// In short, the component handles both unsuccessful results and thrown errors.
// 13. Understanding finally
// finally {
//   setSubmitting(false);
// }

// The finally block runs after the try block completes or the catch block handles an exception.
// It resets the state:
// setSubmitting(false);

// Why is this important?
// The component previously set:
// setSubmitting(true);

// If it never reset the state, the component could remain stuck in the submitting state after the request finished.
// The finally block makes sure the component resets that state whether the request succeeds or an error occurs.
// The main sequence is:
// Start action
//     ↓
// setSubmitting(true)
//     ↓
// Send request
//     ↓
// Check success or handle error
//     ↓
// setSubmitting(false)

// One small detail: if the user cancels the confirmation dialog, the function returns before setting submitting to true. Therefore, the finally block isn't entered, and no reset is needed.
// 14. Understanding the returned JSX
// Now let's look at the part that displays the menu item.
// return (
//   <DropdownMenuItem
//     onClick={handleClick}
//     disabled={disabled || submitting}
//     title={disabled ? disabledReason : undefined}
//     className={destructive ? "text-red-600 focus:text-red-600" : undefined}
//   >
//     <Icon className="h-4 w-4 mr-2" />
//     {label}
//   </DropdownMenuItem>
// );

// A. onClick={handleClick}
// onClick={handleClick}

// When the user clicks the menu item, React calls handleClick.
// That starts the action workflow we just examined.
// Notice that the code passes the function itself:
// onClick={handleClick}

// It does not write:
// onClick={handleClick()}

// The latter would call the function during rendering instead of waiting for the click.
// B. disabled={disabled || submitting}
// disabled={disabled || submitting}

// The menu item is disabled if either condition is true:
// - The parent has disabled the action.
// - The component is currently submitting a request.
// This works together with the guard at the beginning of handleClick.
// The JSX disables the menu item visually and interactively, while the guard also prevents the function from proceeding if invoked when disabled or submitting.
// C. title={disabled ? disabledReason : undefined}
// title={disabled ? disabledReason : undefined}

// This is another ternary expression.
// It means:
// - If disabled is true, set the title to disabledReason.
// - Otherwise, set the title to undefined.
// The title can provide additional information when the action is disabled, often as a browser tooltip.
// For example, if the action is unavailable because the current user cannot delete their own account, the parent component could provide a reason explaining that restriction.
// The exact tooltip behavior depends on the rendered UI component and browser.
// D. className={destructive ? ... : undefined}
// className={
//   destructive
//     ? "text-red-600 focus:text-red-600"
//     : undefined
// }

// This conditionally applies CSS classes.
// If destructive is true, the item gets red text styling.
// If destructive is false or undefined, no additional class is supplied.
// This is useful for dangerous actions such as Delete.
// The red styling visually distinguishes destructive actions from ordinary ones.
// Remember: Styling an action red doesn't make it safe. Authorization and validation must still be enforced by the server.
// E. Rendering the icon
// <Icon className="h-4 w-4 mr-2" />

// This renders the icon passed in through the icon prop.
// The classes typically mean:
// - h-4: set the height to a small size.
// - w-4: set the width to a small size.
// - mr-2: add right margin to separate the icon from the label.
// F. Rendering the label
// {label}

// This displays the text passed into the component.
// For example, if the parent provides:
// label="Lock user"

// the menu item displays the icon followed by Lock user.
// Because both the icon and label are props, the same component can represent many different actions.
// 15. Putting everything together: What happens when you click Lock?
// Imagine the parent component creates a menu item with these props:
// <UserActionButton
//   userId="123"
//   action="lock"
//   icon={LockIcon}
//   label="Lock user"
//   confirmMessage="Are you sure you want to lock this user?"
//   onDone={refreshUsers}
// />

// This is an illustrative example of how the component could be used.
// Here is the complete workflow:
// Step 1: The user clicks Lock user.
// React calls:
// handleClick()

// Step 2: The component checks whether the action is allowed to run.
// if (disabled || submitting) return;

// If the action is disabled or another submission is in progress, it stops.
// Step 3: The browser asks for confirmation.
// window.confirm(confirmMessage)

// If the administrator cancels, nothing is sent to the API.
// Step 4: The component marks the request as in progress.
// setSubmitting(true);

// Step 5: The component selects the correct mutation.
// const { query, field } = ACTION_MAP[action];

// Because action is "lock", it selects LOCK_USER_MUTATION and "lockUser".
// Step 6: It prepares the variables.
// {
//   userId: "123",
//   durationMinutes: 15
// }

// Step 7: It sends the request.
// const data = await gqlFetch(query, variables);

// Step 8: It checks the response.
// If the response indicates success, it calls:
// onDone();

// In your application, that callback can refresh the user data.
// If the response indicates failure, it displays an error message.
// Step 9: It handles thrown errors if necessary.
// The catch block displays an appropriate message.
// Step 10: It resets the submitting state.
// setSubmitting(false);

// The action's request lifecycle is complete.
// 16. How this file connects to the rest of your project
// Based on the files you've shared, the relationship looks like this:
// File or component	Responsibility
// page.tsx	Fetches user data using SWR and manages filters and pagination
// data-table.tsx	Displays the table, search, status filters, selection, and pagination
// columns.tsx	Defines the columns and uses UserRowActions for row-level actions
// UserRowActions	Determines which actions appear in a user's menu and supplies their props
// UserActionButton	Handles confirmation, sending a mutation, handling the result, and calling onDone
// mutation.ts	Defines the GraphQL mutations
// graphql-client.ts	Provides the function used to send GraphQL requests

// The important connection is the onDone callback.
// In your page.tsx, you have:
// const columns = getUserColumns(user.id, () => mutate());

// That passes a function capable of refreshing the SWR data through the column definitions and row-action components.
// When UserActionButton successfully completes an action, it calls:
// onDone();

// That allows the parent component to refresh the data.
// This keeps the action button reusable: it doesn't need to know how SWR works or how the table is built.
// The main idea to remember
// UserActionButton is a reusable action handler.
// It doesn't need a separate component for each operation. Instead, it receives the action as a prop and uses ACTION_MAP to select the appropriate mutation.
// Its responsibilities are to:
// 1. Display the action in the dropdown.
// 2. Prevent the action from running when disabled or already submitting.
// 3. Ask the user to confirm.
// 4. Send the correct GraphQL mutation with the appropriate variables.
// 5. Handle success and failure.
// 6. Notify the parent component when the action succeeds.
// 7. Reset the submitting state.
// The most important lines are these three:
// const { query, field } = ACTION_MAP[action];

// Selects the mutation and response field.
// const data = await gqlFetch(query, variables);

// Sends the request and waits for the response.
// if (data[field].success) {
//   onDone();
// }

// Checks for success and tells the parent component to perform its follow-up action.
// Once you understand those three lines, the rest of the file is mainly about making the operation safe, reusable, and user-friendly.
