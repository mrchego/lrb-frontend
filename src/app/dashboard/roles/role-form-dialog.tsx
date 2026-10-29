"use client";
import { useEffect, useState } from "react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { CREATE_ROLE_MUTATION, UPDATE_ROLE_MUTATION } from "./mutation";
import { Permission, Role } from "./type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

export function RoleFormDialog({
  mode,
  role,
  permissions,
  trigger,
  triggerIsNativeButton = true,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  onSaved,
}: {
  mode: "create" | "edit";
  role?: Role;
  permissions: Permission[];
  // Uncontrolled usage (e.g. RolesPage "New Role" button): pass `trigger`.
  // Controlled usage (e.g. from inside a menu that must close independently
  // of the dialog, like RoleRowActions): pass `open` + `onOpenChange` instead,
  // and render this component as a sibling of the menu, not inside it.
  trigger?: React.ReactElement;
  triggerIsNativeButton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved: () => void;
}) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const [name, setName] = useState(role?.name ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(role?.permissions.map((p) => p.codename) ?? []),
  );
  const [submitting, setSubmitting] = useState(false);

useEffect(() => {
  if (open) {
    setName(role?.name ?? "");
    setSelected(new Set(role?.permissions.map((p) => p.codename) ?? []));
  }
}, [open, role]);

  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  const toggle = (codename: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(codename) ? next.delete(codename) : next.add(codename);
      return next;
    });
  };

 const handleSubmit = async () => {
  const trimmed = name.trim();
  if (!trimmed || submitting) return;

  setSubmitting(true);
  try {
    if (mode === "create") {
      const data = await gqlFetch<{
        createRole: { success: boolean; errors: any[] };
      }>(CREATE_ROLE_MUTATION, {
        name: trimmed,
        permissionCodenames: Array.from(selected),
      });
      if (!data.createRole.success) {
        toast.error(
          data.createRole.errors?.[0]?.message ?? "Failed to create role.",
        );
        return; // keep the dialog open so the form can be fixed
      }
      toast.success(`Role "${trimmed}" created.`);
    } else {
      const data = await gqlFetch<{
        updateRole: { success: boolean; errors: any[] };
      }>(UPDATE_ROLE_MUTATION, {
        input: {
          roleId: role!.id,
          name: trimmed,
          permissionCodenames: Array.from(selected),
        },
      });
      if (!data.updateRole.success) {
        toast.error(
          data.updateRole.errors?.[0]?.message ?? "Failed to update role.",
        );
        return;
      }
      toast.success(`Role "${trimmed}" updated.`);
    }
    setOpen(false);
    onSaved();
  } catch (err) {
    toast.error(
      err instanceof GraphQLError ? err.message : "Something went wrong.",
    );
  } finally {
    setSubmitting(false);
  }
};
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger render={trigger} nativeButton={triggerIsNativeButton} />
      )}
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Role" : `Edit ${role?.name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Role name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Rep"
            />
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            {Object.entries(grouped).map(([category, perms]) => (
              <div key={category} className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {category}
                </p>
                {perms.map((p) => (
                  <label
                    key={p.codename}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selected.has(p.codename)}
                      onCheckedChange={() => toggle(p.codename)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Big Picture
// This code takes a flat array of permissions and reorganizes it into an object where each key is a category name and each value is an array of permissions belonging to that category.
// It’s essentially building “bins” for each category and dropping the permissions into the right bin.

// Line by Line
// ts
// const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
//     (acc[p.category] ??= []).push(p);
//     return acc;
//   }, {});
// permissions.reduce<Record<string, Permission[]>>(...)

// reduce is an array method that processes items one by one and builds up a single result.

// The type Record<string, Permission[]> tells TypeScript: “the result will be an object where keys are strings (categories) and values are arrays of Permission objects.”

// (acc, p) => { ... }

// This is the callback function that runs for each permission.

// acc is the accumulator (the object we’re building).

// p is the current permission being processed.

// (acc[p.category] ??= []).push(p);

// acc[p.category]: Look up the array for this category.

// ??=: Nullish coalescing assignment. If acc[p.category] is null or undefined, assign it to [].

// .push(p): Add the current permission into that category’s array.

// In plain English: “Make sure there’s an array for this category, then put the permission into it.”

// return acc;

// Each iteration returns the updated accumulator object.

// {}, at the end

// This is the initial value for the accumulator: an empty object.

// Without this, reduce would try to use the first permission as the starting value, which wouldn’t work here.

// Data Flow Example
// Suppose permissions looks like this:

// ts
// [
//   { name: "editUser", category: "User" },
//   { name: "deleteUser", category: "User" },
//   { name: "viewReports", category: "Reports" }
// ]
// Step by step:

// Start: acc = {}

// First item: category "User" doesn’t exist, so create [], then push → {"User": [editUser]}

// Second item: category "User" exists, push → {"User": [editUser, deleteUser]}

// Third item: category "Reports" doesn’t exist, create [], then push → {"User": [...], "Reports": [viewReports]}

// Final result:

// ts
// {
//   "User": [editUser, deleteUser],
//   "Reports": [viewReports]
// }
// Recap
// The code groups permissions by category.

// It uses reduce to build an object step by step.

// ??= ensures each category has an array before pushing.

// The mental model: think of it as “sorting items into labeled bins.”

// Would you like me to show you an alternative version using a simpler loop (forEach) so you can compare how reduce and forEach solve the same problem?


// Big Picture
// This function toggle is used to add or remove a permission codename from a set of selected permissions.
// Think of it like a checkbox list: when you click a checkbox, it either gets added to the “selected” set or removed if it was already there.

// So the problem it solves is:
// “How do we keep track of which permissions are currently selected, and update that list when the user toggles one?”

// Line by Line
// ts
// const toggle = (codename: string) => {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(codename) ? next.delete(codename) : next.add(codename);
//       return next;
//     });
//   };
// const toggle = (codename: string) => { ... }

// Declares a function named toggle.

// It takes one argument: codename, which is a string (like "editUser" or "viewReports").

// This codename identifies the permission we want to toggle.

// setSelected((prev) => { ... })

// setSelected is a React state setter (probably from useState).

// Instead of passing a new value directly, we pass a function (prev) => { ... }.

// prev is the previous state value (the current set of selected permissions).

// This pattern ensures we always update based on the latest state, which is important in React because state updates can be asynchronous.

// const next = new Set(prev);

// Creates a new Set based on the previous one.

// A Set is like an array, but it only stores unique values and has fast .has, .add, and .delete operations.

// We copy into a new Set because React state should be treated as immutable — we don’t want to mutate prev directly.

// next.has(codename) ? next.delete(codename) : next.add(codename);

// This is a ternary operator: condition ? doIfTrue : doIfFalse.

// If next already contains the codename, remove it (delete).

// Otherwise, add it (add).

// In plain English: “If it’s already selected, unselect it. If it’s not selected, select it.”

// return next;

// Returns the updated set.

// React will then use this as the new state value for selected.

// Data Flow Example
// Suppose the current state is:

// ts
// selected = new Set(["editUser", "viewReports"]);
// Call toggle("editUser"):

// next.has("editUser") is true → delete it.

// Result: {"viewReports"}

// Call toggle("deleteUser"):

// next.has("deleteUser") is false → add it.

// Result: {"editUser", "viewReports", "deleteUser"}

// So each call flips the presence of that codename in the set.

// Recap
// The toggle function updates a React state selected that holds a Set of permission codenames.

// It works by copying the old set, checking if the codename is present, and either removing or adding it.

// The mental model: think of it as a light switch for each permission — clicking toggles it on or off.

// Great question — this is exactly the kind of detail that makes GraphQL feel tricky at first. Let’s walk through how you know what the variables object should look like when the mutation says $input: UpdateRoleInput!.

// Step 1: Look at the mutation definition
// graphql
// mutation UpdateRole($input: UpdateRoleInput!) {
//   updateRole(input: $input) {
//     success
//     role { id name isDefault permissions { codename } staffCount }
//     errors { message code field }
//   }
// }
// The mutation declares one variable: $input.

// Its type is UpdateRoleInput!.

// The ! means it’s required (cannot be null).

// Inside the mutation body, you see updateRole(input: $input). That tells you the mutation expects an argument called input, and you must pass the variable $input into it.

// Step 2: Check the GraphQL schema
// The schema defines what UpdateRoleInput looks like. For example, it might be:

// graphql
// input UpdateRoleInput {
//   roleId: ID!
//   name: String!
//   permissionCodenames: [String!]!
// }
// This is where you learn what fields must go inside the input object.
// So UpdateRoleInput is basically a “shape” that says:

// roleId must be provided.

// name must be provided.

// permissionCodenames must be provided as a list of strings.

// Step 3: Match your variables object to the schema
// Because the mutation expects $input: UpdateRoleInput!, your variables object must look like:

// ts
// {
//   input: {
//     roleId: role!.id,
//     name,
//     permissionCodenames: Array.from(selected),
//   }
// }
// Notice the outer input: { ... }. That matches the mutation’s argument name (updateRole(input: $input)).

// Inside that, the fields (roleId, name, permissionCodenames) match exactly what the schema says UpdateRoleInput requires.

// Step 4: Compare with the CreateRole mutation
// For CREATE_ROLE_MUTATION, the definition was:

// graphql
// mutation CreateRole($name: String!, $permissionCodenames: [String!]!) {
//   createRole(input: { name: $name, permissionCodenames: $permissionCodenames }) {
//     success
//     role { id name }
//     errors { message code field }
//   }
// }
// Here, the mutation declares two separate variables: $name and $permissionCodenames.
// So the variables object is simply:

// ts
// {
//   name,
//   permissionCodenames: Array.from(selected)
// }
// No outer input wrapper is needed, because the mutation doesn’t define $input.

// Recap
// $input: UpdateRoleInput! means: “You must pass a variable called input, and it must match the shape of UpdateRoleInput.”

// The schema tells you what fields go inside UpdateRoleInput.

// Your variables object must mirror that shape exactly.

// If the mutation defines separate variables ($name, $permissionCodenames), you pass them directly.

// If the mutation defines a single $input, you wrap everything inside input: { ... }.


// Let’s break down this line carefully so you can see exactly what’s happening:

// tsx
// onChange={(e) => setName(e.target.value)}
// Big Picture
// This is an event handler attached to an input element (like <input /> or <textarea />).
// Its job is: whenever the user types something into the input, update the React state variable name with the new text.

// So the problem it solves is: “How do we keep the React state in sync with what the user types into the input field?”

// Step by Step
// onChange={...}

// onChange is a prop you give to an input element in React.

// It tells React: “When the value of this input changes (like when the user types), run this function.”

// (e) => setName(e.target.value)

// This is an arrow function.

// e is the event object that React passes in. It represents the change event.

// e.target is the element that triggered the event (the input field).

// e.target.value is the current text inside that input field.

// setName(...) is the React state setter (from useState). It updates the name state variable with the new value.

// So in plain English:
// “When the input changes, grab the new text from the input (e.target.value) and store it in the name state.”

// Data Flow Example
// Suppose you have:

// tsx
// const [name, setName] = useState("");
// And your input:

// tsx
// <input value={name} onChange={(e) => setName(e.target.value)} />
// User types "Alice" into the input.

// onChange fires with an event e.

// e.target.value is "Alice".

// setName("Alice") runs.

// React updates the name state to "Alice".

// Because the input’s value={name}, the input now displays "Alice".

// This is what makes it a controlled component: the input’s displayed value always comes from React state, and React state is updated whenever the user types.

// Recap
// onChange is the event handler for input changes.

// (e) => setName(e.target.value) means: “Take the new input value and update the name state.”

// This pattern is how you make controlled inputs in React — the input value is always tied to state, and state changes whenever the user types.

// Would you like me to also show you the difference between controlled and uncontrolled inputs so you can see why this pattern is preferred in React?

// Big Picture
// This code is rendering permissions grouped by category.

// Each category gets a heading (<p> with the category name).

// Under each heading, it lists the permissions (perms) as labeled checkboxes.

// The checkboxes are controlled by React state (selected) and updated with the toggle function.

// So the problem it solves is: “How do we display permissions grouped by category, and let the user select/unselect them with checkboxes?”

// Step by Step
// tsx
// {Object.entries(grouped).map(([category, perms]) => (
//   <div key={category} className="space-y-2">
//     <p className="text-xs font-semibold uppercase text-muted-foreground">
//       {category}
//     </p>
//     {perms.map((p) => (
//       <label
//         key={p.codename}
//         className="flex items-center gap-2 text-sm"
//       >
//         <Checkbox
//           checked={selected.has(p.codename)}
//           onCheckedChange={() => toggle(p.codename)}
//         />
//         {p.label}
//       </label>
//     ))}
//   </div>
// ))}
// Object.entries(grouped)

// grouped is an object like { "User": [...], "Reports": [...] }.

// Object.entries(grouped) turns it into an array of [key, value] pairs:

// ts
// [["User", [permissions...]], ["Reports", [permissions...]]]
// This lets you loop over categories and their permissions.

// .map(([category, perms]) => ( ... ))

// Destructures each entry into category (string) and perms (array of permissions).

// For each category, render a <div> containing the heading and its permissions.

// <div key={category} className="space-y-2">

// key={category}: React requires a unique key for each list item. Here, the category name is unique.

// className="space-y-2": Tailwind CSS utility that adds vertical spacing between child elements.

// <p className="text-xs font-semibold uppercase text-muted-foreground">

// Renders the category name.

// Styling: small text, bold, uppercase, muted color.

// {perms.map((p) => ( ... ))}

// Loops through each permission in the category.

// p is a permission object with fields like codename and label.

// <label key={p.codename} className="flex items-center gap-2 text-sm">

// Each permission is wrapped in a <label>.

// key={p.codename} ensures uniqueness.

// flex items-center gap-2: Tailwind classes to align checkbox and text side by side with spacing.

// <Checkbox checked={selected.has(p.codename)} onCheckedChange={() => toggle(p.codename)} />

// Controlled checkbox component.

// checked={selected.has(p.codename)}: The checkbox is checked if the codename is in the selected set.

// onCheckedChange={() => toggle(p.codename)}: When clicked, call toggle to add/remove the codename from selected.

// {p.label}

// Displays the human‑readable label for the permission next to the checkbox.

// Data Flow Example
// Suppose grouped is:

// ts
// {
//   "User": [
//     { codename: "editUser", label: "Edit User" },
//     { codename: "deleteUser", label: "Delete User" }
//   ],
//   "Reports": [
//     { codename: "viewReports", label: "View Reports" }
//   ]
// }
// The code renders:

// Heading “USER”

// Checkbox + “Edit User”

// Checkbox + “Delete User”

// Heading “REPORTS”

// Checkbox + “View Reports”

// When you click a checkbox:

// onCheckedChange calls toggle(codename).

// toggle updates the selected set.

// Because checked={selected.has(p.codename)}, the checkbox reflects the new state immediately.

// Recap
// Object.entries(grouped) lets you loop over categories and their permissions.

// Each category is rendered with a heading and a list of labeled checkboxes.

// The checkboxes are controlled by React state (selected) and updated with toggle.

// The mental model: “For each category, show its name and a list of checkboxes that reflect and update the selected permissions.”