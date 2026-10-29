"use client";

import { useState } from "react";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { ADMIN_UPDATE_USER_MUTATION } from "./mutation";
import { ManagedUser } from "./type";
import { toast } from "react-toastify";

export function EditUserSheet({
  user,
  onSaved,
}: {
  user: ManagedUser;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        adminUpdateUser: { success: boolean; errors: any[] };
      }>(ADMIN_UPDATE_USER_MUTATION, { input: { userId: user.id, ...form } });
      if (data.adminUpdateUser.success) {
        toast.success("User updated.");
        onSaved();
      } else {
        toast.error(
          data.adminUpdateUser.errors?.[0]?.message ?? "Could not update user.",
        );
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
    <SheetContent className="w-full sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Edit {user.email}</SheetTitle>
      </SheetHeader>
      <form onSubmit={handleSubmit} className="space-y-4 px-4">
        <div>
          <Label>First name</Label>
          <Input value={form.firstName} onChange={update("firstName")} />
        </div>
        <div>
          <Label>Last name</Label>
          <Input value={form.lastName} onChange={update("lastName")} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={update("phone")} />
        </div>
        <SheetFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

// This file defines a component called EditUserSheet, which allows an administrator to edit a user's first name, last name, and phone number.
// Since you've already looked at page.tsx, columns.tsx, and UserActionButton, we'll connect this file to what you already understand.
// 1. First, understand what this component does
// Imagine you're on the Users page and click Edit for a particular user.
// A panel opens from the side of the screen. It contains a form:
// ┌─────────────────────────────────┐
// │ Edit john@example.com           │
// │                                 │
// │ First name                      │
// │ [ John                        ] │
// │                                 │
// │ Last name                       │
// │ [ Doe                         ] │
// │                                 │
// │ Phone                           │
// │ [ 0712345678                  ] │
// │                                 │
// │             [ Save ]             │
// └─────────────────────────────────┘

// When you change the information and click Save, the component sends a GraphQL mutation to update the user.
// The general flow is:
// Receive user data → Display the form → Track changes → Submit the form → Update the server → Handle success or failure.
// Let's examine how the code does this.
// 2. Understanding the imports
// "use client";

// This tells Next.js that the component needs client-side functionality.
// It uses React state, handles form submissions, and responds to user input, so it needs to run in the browser.
// React state
// import { useState } from "react";

// useState allows the component to store information that can change.
// This component uses it for three things:
// 1. The current form values.
// 2. An error message, if something goes wrong.
// 3. Whether the form is currently being submitted.
// We'll examine each one shortly.
// Sheet components
// import {
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetFooter,
// } from "@/components/ui/sheet";

// These components build the side panel.
// Component	Purpose
// SheetContent	Contains the panel's main content
// SheetHeader	Groups the heading area
// SheetTitle	Displays the panel's title
// SheetFooter	Groups the footer content, such as the Save button

// These are UI building blocks. They help you organize the interface without having to implement the panel's layout from scratch.
// Other UI components
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// These provide the button, input fields, and labels.
// For example:
// <Label>First name</Label>
// <Input value={form.firstName} onChange={update("firstName")} />

// The label identifies the field, and the input displays and edits its value.
// GraphQL imports
// import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
// import { ADMIN_UPDATE_USER_MUTATION } from "./mutation";

// These connect the form to your backend.
// - gqlFetch sends the GraphQL request.
// - GraphQLError helps identify GraphQL client errors.
// - ADMIN_UPDATE_USER_MUTATION contains the GraphQL mutation used to update the user.
// The user type
// import { ManagedUser } from "./type";

// ManagedUser describes the structure of a user in your application.
// The component uses this type to understand which properties are available on user.
// For example:
// user.id
// user.email
// user.firstName
// user.lastName
// user.phone

// The exact definition is in your type file.
// 3. Understanding the component's props
// export function EditUserSheet({
//   user,
//   onSaved,
// }: {
//   user: ManagedUser;
//   onSaved: () => void;
// }) {

// This declares the EditUserSheet component.
// It receives two props: user and onSaved.
// A. The user prop
// user: ManagedUser;

// This is the user whose information should be edited.
// Imagine the selected user has this information:
// {
//   id: "123",
//   email: "john@example.com",
//   firstName: "John",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// The parent component passes that user into EditUserSheet.
// The component then uses the user's existing information to populate the form.
// B. The onSaved prop
// onSaved: () => void;

// This is a callback function supplied by the parent component.
// A callback is simply a function that one component receives from another component and calls when something happens.
// Here, onSaved is intended to run after the user has been successfully updated.
// For example, the parent could pass a function that refreshes the users table.
// Important: EditUserSheet doesn't need to know how the parent refreshes the table. It only needs to call onSaved() when the update succeeds.
// This is similar to the onDone() callback you saw in UserActionButton.
// 4. Creating the form state
// This is one of the most important parts of the component.
// const [form, setForm] = useState({
//   firstName: user.firstName,
//   lastName: user.lastName,
//   phone: user.phone,
// });

// Let's break it down.
// A. What is form?
// form stores the current values entered into the form.
// Initially, it copies three properties from the selected user:
// {
//   firstName: user.firstName,
//   lastName: user.lastName,
//   phone: user.phone,
// }

// Suppose the user object contains:
// {
//   firstName: "John",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// Then the initial form state becomes:
// form = {
//   firstName: "John",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// The form starts with the user's existing information instead of empty fields.
// B. What is setForm?
// const [form, setForm] = useState(...);

// This creates two things:
// - form: the current form values.
// - setForm: the function used to update those values.
// For example, when the first name changes from "John" to "James", the component uses setForm to update its state.
// React then renders the component again with the new state.
// A key concept
// The form state is separate from the original user object.
// Think of it like this:
// - user contains the existing information received from the parent.
// - form contains the information currently being edited.
// That distinction lets someone change a field without immediately changing the user object or sending a request to the server.
// The server is updated when the form is submitted.
// 5. Tracking errors
// const [error, setError] = useState<string | null>(null);

// This state stores an error message.
// Let's look at the type:
// string | null

// It means the value can be either:
// - A string, such as "Could not update user."
// - null, meaning there is currently no error message.
// Initially:
// error = null

// When an error occurs, the component can do this:
// setError("Could not update user.");

// React updates the state, and the component can display the message.
// When a new submission begins, the component clears the previous error:
// setError(null);

// This prevents an old error from continuing to appear after the user tries again.
// 6. Tracking the submission state
// const [submitting, setSubmitting] = useState(false);

// This state indicates whether the form is currently being submitted.
// Initially:
// submitting = false

// When the user submits the form:
// setSubmitting(true);

// When the request finishes:
// setSubmitting(false);

// Later, you'll see that this state controls the Save button.
// While the request is running, the button becomes disabled and its text changes from Save to Saving….
// This gives the user feedback and helps prevent repeated submissions.
// 7. Understanding the update function
// This is another important section:
// const update =
//   (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
//     setForm((f) => ({ ...f, [key]: e.target.value }));

// Although this looks complicated, its purpose is simple:
// It creates a function that updates a particular form field whenever that field changes.
// Let's break it into smaller pieces.
// A. keyof typeof form
// key: keyof typeof form

// This is a TypeScript type expression.
// First:
// typeof form

// refers to the type of the form object.
// The object has these keys:
// {
//   firstName: string;
//   lastName: string;
//   phone: string;
// }

// Then:
// keyof typeof form

// means the allowed property names of that object.
// Therefore, key must be one of:
// "firstName"
// "lastName"
// "phone"

// This prevents you from accidentally trying to update an unrelated property.
// For example:
// update("firstName")

// is valid.
// But:
// update("email")

// would produce a TypeScript error because email isn't a key in this form state.
// B. Why are there two arrow functions?
// const update = (key) => (e) => {
//   // Update the form
// };

// This is called a function that returns another function.
// The first function receives the field name.
// The second function receives the input's change event.
// You can think of it as two steps.
// First: Choose which field to update
// update("firstName")

// This creates a function specifically for updating the first name.
// Second: React calls that function when the input changes
// onChange={update("firstName")}

// When someone types into the First name field, React calls the returned function with an event object.
// That event contains information about the input that changed.
// C. Understanding e.target.value
// Inside the function:
// e.target.value

// means the current value of the input field.
// Suppose the user changes the first name to "James".
// Then:
// e.target.value

// returns:
// "James"

// The function needs to store that value in the form state.
// D. Understanding setForm
// setForm((f) => ({ ...f, [key]: e.target.value }));

// Let's break this down.
// The f parameter
// setForm((f) => ...)

// Here, f represents the previous form state.
// It might be:
// {
//   firstName: "John",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// React allows you to pass a function to a state setter when you want to calculate the next state from the previous state.
// The spread operator
// ...f

// The spread operator copies the existing properties into a new object.
// For example:
// {
//   ...f
// }

// produces an object containing the same properties and values as f.
// The computed property name
// [key]: e.target.value

// The square brackets mean the property name comes from the value of the variable key.
// For example, if:
// key = "firstName"

// then:
// [key]: e.target.value

// becomes equivalent to:
// firstName: e.target.value

// Putting it all together
// Suppose the current form state is:
// {
//   firstName: "John",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// The user types "James" into the first-name input.
// The function effectively creates:
// {
//   ...f,
//   firstName: "James"
// }

// The new state becomes:
// {
//   firstName: "James",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// Notice that the last name and phone number remain unchanged.
// Why not simply replace the whole form with { firstName: "James" }?
// Because that would remove the other two properties from the state object.
// Using { ...f, [key]: e.target.value } preserves the other values while updating only the selected field.
// 8. Understanding handleSubmit
// Now we reach the function that saves the form.
// const handleSubmit = async (e: React.FormEvent) => {

// This function runs when the form is submitted.
// It receives a form event, represented by e.
// The async keyword allows the function to wait for the GraphQL request using await.
// Let's go step by step.
// Step 1: Prevent the browser's default form behavior
// e.preventDefault();

// By default, submitting an HTML form can cause the browser to navigate or reload the page.
// Calling preventDefault() stops that normal behavior.
// Instead, the component handles the submission itself using JavaScript and React.
// This is important because you want to send the request in the background rather than reload the whole page.
// Step 2: Clear any previous error
// setError(null);

// Suppose the previous attempt failed and displayed:
// Could not update user.

// When the user tries again, the component clears the old message.
// If the next attempt also fails, a new message can be displayed.
// Step 3: Mark the form as submitting
// setSubmitting(true);

// The component records that the request is in progress.
// This will disable the Save button and change its label.
// Step 4: Start the request
// try {
//   // Send the request
// }

// The try block contains the code that sends the request and processes the response.
// If an exception occurs, the catch block handles it.
// 9. Sending the update mutation
// Here is the request:
// const data = await gqlFetch<{
//   adminUpdateUser: {
//     success: boolean;
//     errors: any[];
//   };
// }>(
//   ADMIN_UPDATE_USER_MUTATION,
//   { input: { userId: user.id, ...form } },
// );

// Let's examine the two arguments passed to gqlFetch.
// A. The mutation
// ADMIN_UPDATE_USER_MUTATION

// This is the GraphQL mutation imported from your mutation file.
// It tells the backend which operation the application wants to perform.
// B. The variables
// { input: { userId: user.id, ...form } }

// This is the data sent along with the mutation.
// Let's break it down.
// userId: user.id
// userId: user.id

// This identifies the user being updated.
// For example:
// userId: "123"

// The component gets the ID from the original user passed in through the user prop.
// ...form
// ...form

// This copies the current form values into the object.
// Suppose the user has changed the first name to "James" and left the other fields unchanged.
// The form state might be:
// {
//   firstName: "James",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// The expression:
// { userId: user.id, ...form }

// then produces an object equivalent to:
// {
//   userId: "123",
//   firstName: "James",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// That entire object is wrapped inside input:
// {
//   input: {
//     userId: "123",
//     firstName: "James",
//     lastName: "Doe",
//     phone: "0712345678"
//   }
// }

// In simple terms: The mutation receives the target user's ID and the three current form values.
// The exact input requirements depend on the GraphQL mutation defined in your project.
// C. What does await do here?
// const data = await gqlFetch(...);

// The function waits for the request to finish before continuing.
// When the request resolves successfully, its returned data is stored in data.
// For example, the server might return a response conceptually like this:
// {
//   adminUpdateUser: {
//     success: true,
//     errors: []
//   }
// }

// The code then checks whether the update succeeded.
// 10. Handling a successful update
// if (data.adminUpdateUser.success) {
//   onSaved();
// }

// This checks the success property in the GraphQL response.
// If it is true, the component calls:
// onSaved();

// Remember that onSaved is a callback passed in through the props.
// The parent component can use it to perform follow-up work, such as refreshing the users table and closing the sheet.
// The callback itself doesn't automatically refresh the data or close the sheet. Those things happen only if the parent has implemented them in the function it passes.
// This design keeps the component reusable.
// EditUserSheet doesn't need to know how the parent manages the table or the side panel. It simply tells the parent:
// The update succeeded.

// The parent decides what happens next.
// 11. Handling a failed update
// else {
//   setError(
//     data.adminUpdateUser.errors?.[0]?.message ??
//       "Could not update user.",
//   );
// }

// This runs if the server returns a response where:
// success: false

// The component attempts to find the first error message.
// For example, the response might contain:
// {
//   adminUpdateUser: {
//     success: false,
//     errors: [
//       {
//         message: "This phone number is already in use."
//       }
//     ]
//   }
// }

// The expression:
// data.adminUpdateUser.errors?.[0]?.message

// extracts:
// "This phone number is already in use."

// Let's understand the operators.
// - ?. is optional chaining. It safely accesses a property or array element when the preceding value might be missing.
// - [0] accesses the first item in the array.
// - ?? is the nullish-coalescing operator. It supplies a fallback when the preceding expression evaluates to null or undefined.
// So if no error message is available, the component uses:
// "Could not update user."

// The message is stored using setError().
// React then renders the error message in the form.
// 12. Understanding the catch block
// } catch (err) {
//   setError(
//     err instanceof GraphQLError
//       ? err.message
//       : "Something went wrong.",
//   );
// }

// The catch block handles exceptions thrown while the request is being processed.
// There are two possibilities.
// Case A: The error is a GraphQLError
// err instanceof GraphQLError

// If this condition is true, the component uses:
// err.message

// This gives the user the error message provided by the GraphQL client.
// Case B: It's another kind of error
// If the error isn't a GraphQLError, the component displays:
// "Something went wrong."

// The message is saved in state with setError().
// Later, the JSX displays it.
// What's the difference between else and catch?
// This is an important distinction.
// Situation	Where it is handled
// The server returns success: false with an error message	The else block
// The GraphQL request throws an exception	The catch block

// The else block processes an unsuccessful result.
// The catch block processes an exception.
// 13. Understanding finally
// finally {
//   setSubmitting(false);
// }

// This block runs after the try block completes or an exception is handled by catch.
// It resets the submission state:
// setSubmitting(false);

// Remember that the function previously executed:
// setSubmitting(true);

// If the state remained true, the Save button would stay disabled.
// The finally block ensures that the submitting state is reset whether the request succeeds or fails.
// The complete submission lifecycle looks like this:
// User clicks Save
//        |
//        v
// Prevent page reload
//        |
//        v
// Clear previous error
//        |
//        v
// Set submitting = true
//        |
//        v
// Send GraphQL mutation
//        |
//        v
//   Did it succeed?
//     /       \
//   Yes        No
//    |          |
//    v          v
// onSaved()   Save error
//    \          /
//     \        /
//        v
// Set submitting = false

// One small detail: this finally block runs only after execution enters the try block. In this component, setSubmitting(true) is called before entering try, so an exception thrown by that state-setting call itself would not be handled by this try/catch. Normally, that isn't a practical concern for this code.
// 14. Understanding the returned JSX
// Now let's examine how the form is displayed.
// return (
//   <SheetContent className="w-full sm:max-w-md">

// SheetContent is the main container for the side panel.
// The CSS classes indicate that:
// - w-full makes it use the available width.
// - sm:max-w-md limits its maximum width at the sm responsive breakpoint and above.
// A. The heading
// <SheetHeader>
//   <SheetTitle>Edit {user.email}</SheetTitle>
// </SheetHeader>

// This displays the panel heading.
// Suppose:
// user.email = "john@example.com"

// Then the title reads:
// Edit john@example.com

// The email identifies which user's information is being edited.
// Notice that the email is displayed in the heading, but it isn't one of the editable form fields.
// B. The form element
// <form onSubmit={handleSubmit} className="space-y-4 px-4">

// This creates the form.
// Two important properties are being set here.
// onSubmit={handleSubmit}
// When the form is submitted, React calls handleSubmit.
// This includes clicking a submit button or submitting the form through other standard form interactions, such as pressing Enter in an appropriate input.
// className="space-y-4 px-4"
// These Tailwind CSS classes control the layout:
// - space-y-4 adds vertical spacing between direct child elements.
// - px-4 adds horizontal padding.
// 15. Understanding the input fields
// Let's look at the first field.
// <div>
//   <Label>First name</Label>
//   <Input
//     value={form.firstName}
//     onChange={update("firstName")}
//   />
// </div>

// The other fields use the same pattern.
// A. value={form.firstName}
// This sets the input's displayed value to the current first name in React state.
// If:
// form.firstName = "John"

// the input displays "John".
// If the form state changes to "James", the input displays "James".
// This is an example of a controlled input: React state controls the value displayed by the input.
// B. onChange={update("firstName")}
// When the user changes the input, this invokes the update function we examined earlier.
// The function reads the new input value and updates the corresponding property in form.
// The relationship is:
// Input changes
//      |
//      v
// update("firstName")
//      |
//      v
// Read e.target.value
//      |
//      v
// Update form.firstName
//      |
//      v
// React renders the new value

// The other fields work the same way:
// <Input
//   value={form.lastName}
//   onChange={update("lastName")}
// />

// And:
// <Input
//   value={form.phone}
//   onChange={update("phone")}
// />

// The only difference is which property they read and update.
// Why reuse update?
// Without the reusable function, you might have to write three separate event handlers:
// onChange={(e) =>
//   setForm((f) => ({ ...f, firstName: e.target.value }))
// }

// Then repeat similar code for lastName and phone.
// Your update function avoids that repetition.
// You only specify which field should be updated:
// update("firstName")
// update("lastName")
// update("phone")

// 16. Displaying an error message
// {error && <p className="text-sm text-red-600">{error}</p>}

// This uses conditional rendering.
// The && operator allows the paragraph to be rendered when error has a truthy value.
// If:
// error = null

// there is no error message to display.
// If:
// error = "This phone number is already in use."

// the form displays that message in red text.
// This connects directly to the earlier code:
// setError("This phone number is already in use.");

// When the error state changes, React renders the paragraph.
// 17. Understanding the Save button
// <SheetFooter>
//   <Button type="submit" disabled={submitting}>
//     {submitting ? "Saving…" : "Save"}
//   </Button>
// </SheetFooter>

// Let's examine the three important parts.
// A. type="submit"
// type="submit"

// This makes the button submit the surrounding form.
// When clicked, the form's onSubmit handler runs:
// onSubmit={handleSubmit}

// Therefore, clicking Save calls handleSubmit.
// B. disabled={submitting}
// disabled={submitting}

// If the form is currently submitting, the button becomes disabled.
// This helps prevent the user from clicking Save repeatedly while the request is in progress.
// C. The ternary expression
// {submitting ? "Saving…" : "Save"}

// This changes the button text based on the submission state.
// If:
// submitting = false

// the button displays:
// Save

// If:
// submitting = true

// the button displays:
// Saving…

// This gives the user visual feedback that the request is being processed.
// 18. How this component connects to your other files
// Based on the code you've shared, your user management page has several layers.
// File or component	Main responsibility
// page.tsx	Fetches users and manages search, status filters, and pagination
// data-table.tsx	Displays the users table and handles table interactions
// columns.tsx	Defines the table columns
// UserRowActions	Provides the actions available for a particular user
// UserActionButton	Executes actions such as locking, activating, and deleting
// EditUserSheet	Displays a form and submits changes to a user's details
// mutation.ts	Defines the GraphQL mutations
// graphql-client.ts	Sends GraphQL requests

// The key relationship for this file is the callback:
// onSaved();

// The component itself doesn't need to know what happens after the update succeeds.
// The parent can decide whether to:
// - Refresh the table.
// - Close the sheet.
// - Display a success notification.
// - Perform another follow-up action.
// For example, a parent might pass a callback like this:
// onSaved={() => {
//   mutate();
//   setEditSheetOpen(false);
// }}

// Here, mutate() would refresh the SWR data, and setEditSheetOpen(false) would close the sheet—assuming the parent has defined that state.
// This is just an example of how the callback could be used; your actual parent component determines the behavior.
// 19. One important detail about the form's initial values
// There's a subtle React behavior worth knowing.
// Your code initializes the form like this:
// const [form, setForm] = useState({
//   firstName: user.firstName,
//   lastName: user.lastName,
//   phone: user.phone,
// });

// useState uses these initial values when the component mounts. It does not automatically reset the form whenever the user prop changes.
// Suppose the component initially receives User A:
// {
//   firstName: "John",
//   lastName: "Doe",
//   phone: "0712345678"
// }

// The form initializes with User A's values.
// If the same mounted component later receives User B, React does not automatically replace the existing form state with User B's values.
// Whether this matters depends on how the parent opens and switches between users.
// If the parent mounts a fresh EditUserSheet for each selected user, this may already work as intended. If it reuses the same mounted component for different users, you may need to reset the form when the selected user changes.
// This is worth checking when you look at the parent component that opens the sheet.
// Final summary
// The main purpose of EditUserSheet is to edit a user's details and send those changes to the backend.
// Remember these five key parts:
// Code	Meaning
// useState({...})	Stores the form's current values
// update("firstName")	Updates a particular field when its input changes
// handleSubmit	Handles the form submission
// gqlFetch(ADMIN_UPDATE_USER_MUTATION, ...)	Sends the update request to the backend
// onSaved()	Notifies the parent when the update succeeds

// The entire process is:
// The user edits the inputs → React updates form → The user clicks Save → handleSubmit sends the mutation → The component handles the response → onSaved() runs if the update succeeds.
// The most important concept to understand is that the form state holds the changes locally until the user submits the form. Typing into an input does not itself update the backend; the GraphQL mutation does that when Save is clicked.
