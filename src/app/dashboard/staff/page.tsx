"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { RequireSuperuser } from "@/components/require-superuser";
import { gqlFetch } from "@/lib/graphql-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PromoteStaffDialog } from "@/app/dashboard/staff/promote-staff-dialog";

import {
  ROLES_QUERY,
  USERS_QUERY,
  STAFF_MEMBERS_QUERY,
  INVITATIONS_QUERY,
} from "./query";

import { INVITE_STAFF_MUTATION } from "./mutation";

import { StaffMembersTable } from "./staff-members-table";
import { InvitationsTable } from "./invitations-table";
import { ManagedUser, UserConnection } from "../users/type";
import {
  Invitation,
  InvitationConnection,
  StaffMember,
  StaffMemberConnection,
} from "./type";

type Role = { id: string; name: string };

export default function StaffPage() {
  return (
    <RequireSuperuser>
      <StaffPageContent />
    </RequireSuperuser>
  );
}

function StaffPageContent() {
  const { user } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [invitationFilter, setInvitationFilter] = useState<
    "all" | "pending" | "accepted"
  >("pending");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [recordsOnly, setRecordsOnly] = useState<ManagedUser[]>([]);
  const [loadingRecordsOnly, setLoadingRecordsOnly] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    canLogin: boolean;
    roleId: string | null;
  }>({ email: "", firstName: "", lastName: "", canLogin: true, roleId: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadRoles = () =>
    gqlFetch<{ roles: Role[] }>(ROLES_QUERY).then((res) => setRoles(res.roles));

  const STAFF_TAB_PAGE_SIZE = 100;

  const loadMembers = async () => {
    setLoadingMembers(true);
    const res = await gqlFetch<{ staffMembers: StaffMemberConnection }>(
      STAFF_MEMBERS_QUERY,
      {
        limit: STAFF_TAB_PAGE_SIZE,
        offset: 0,
      },
    );
    setMembers(res.staffMembers.items);
    setLoadingMembers(false);
  };

  const loadInvitations = async (filter = invitationFilter) => {
    setLoadingInvitations(true);
    const used = filter === "all" ? undefined : filter === "accepted";
    const res = await gqlFetch<{ invitations: InvitationConnection }>(
      INVITATIONS_QUERY,
      {
        used,
        limit: STAFF_TAB_PAGE_SIZE,
        offset: 0,
      },
    );
    setInvitations(res.invitations.items);
    setLoadingInvitations(false);
  };

  const loadRecordsOnly = async () => {
    setLoadingRecordsOnly(true);
    const res = await gqlFetch<{ users: UserConnection }>(USERS_QUERY, {
      canLogin: false,
      limit: STAFF_TAB_PAGE_SIZE,
      offset: 0,
    });
    setRecordsOnly(res.users.items);
    setLoadingRecordsOnly(false);
  };

  useEffect(() => {
    loadRoles();
    loadMembers();
    loadInvitations();
    loadRecordsOnly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update =
    (key: "email" | "firstName" | "lastName") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const refreshAfterInvite = async (canLogin: boolean) => {
    if (canLogin) {
      await loadInvitations();
    } else {
      await loadRecordsOnly();
    }
  };

  const handleInvite = async () => {
    setSubmitting(true);
    setError(null);
    const data = await gqlFetch<{
      inviteStaff: { success: boolean; invitation: any; errors: any[] };
    }>(INVITE_STAFF_MUTATION, { ...form });
    if (data.inviteStaff.success) {
      setSuccess(
        form.canLogin
          ? `Invitation sent to ${form.email}`
          : `${form.firstName} ${form.lastName} added as a staff record (no system login).`,
      );
      setOpen(false);
      await refreshAfterInvite(form.canLogin);
      setForm({
        email: "",
        firstName: "",
        lastName: "",
        canLogin: true,
        roleId: null,
      });
    } else {
      setError(data.inviteStaff.errors?.[0]?.message ?? "Failed to add staff.");
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <div>
      {/* stacks on mobile, "Add Staff" no longer competes with the heading
          for horizontal space on a phone */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Staff</h1>
          <p className="text-sm text-muted-foreground">
            Only the owner can manage staff, invitations, and login access.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="w-full sm:w-auto" />}>
            Add Staff
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Staff</DialogTitle>
            </DialogHeader>
            {/* single column on mobile, two columns from sm up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>First Name*</Label>
                <Input value={form.firstName} onChange={update("firstName")} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={update("lastName")} />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label>Email*</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                />
              </div>

              <div className="col-span-1 sm:col-span-2 flex items-start sm:items-center gap-2 rounded-md border p-3">
                <Checkbox
                  className="mt-0.5 sm:mt-0"
                  checked={form.canLogin}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      canLogin: !!v,
                      roleId: v ? f.roleId : null,
                    }))
                  }
                />
                <div>
                  <p className="text-sm font-medium">
                    Can log in and operate the system
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uncheck this to add them as a staff record only — e.g. for
                    HR tracking, without giving them any system access.
                  </p>
                </div>
              </div>

              {form.canLogin && (
                <div className="col-span-1 sm:col-span-2">
                  <Label>Role*</Label>
                  <Select
                    value={form.roleId ?? ""}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, roleId: v || null }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={
                  submitting ||
                  !form.email ||
                  !form.firstName ||
                  (form.canLogin && !form.roleId)
                }
                className="w-full sm:w-auto"
              >
                {submitting
                  ? "Saving…"
                  : form.canLogin
                    ? "Send Invite"
                    : "Add Staff Record"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {success && <p className="text-sm text-green-600 mb-4">{success}</p>}

      <Tabs defaultValue="members" className="w-full">
        {/* horizontal scroll instead of wrap/shrink — three tab labels
            wrapping mid-word looks worse than a swipeable strip */}
        <div className="overflow-x-auto">
          <TabsList className="w-max min-w-full sm:w-auto">
            <TabsTrigger value="members">Staff Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="records">Records Only</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members" className="mt-4">
          <StaffMembersTable
            members={members}
            isLoading={loadingMembers}
            currentUserId={user.id}
            onRefresh={loadMembers}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <div className="flex gap-1 mb-3 flex-wrap">
            {(["pending", "accepted", "all"] as const).map((v) => (
              <Button
                key={v}
                size="sm"
                variant={invitationFilter === v ? "default" : "outline"}
                onClick={() => {
                  setInvitationFilter(v);
                  loadInvitations(v);
                }}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </div>
          <InvitationsTable
            invitations={invitations}
            isLoading={loadingInvitations}
            onRefresh={() => loadInvitations()}
          />
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          {loadingRecordsOnly ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : recordsOnly.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Everyone with a staff record can already log in.
            </p>
          ) : (
            <div className="grid gap-3">
              {recordsOnly.map((u) => (
                <div
                  key={u.id}
                  className="rounded-md border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {u.fullName || u.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email}
                    </p>
                  </div>
                  <PromoteStaffDialog
                    userId={u.id}
                    roles={roles}
                    onDone={loadRecordsOnly}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

//   const loadRoles = () =>
//     gqlFetch<{ roles: Role[] }>(ROLES_QUERY).then((res) => setRoles(res.roles));

//   4. Understand .then((res) => setRoles(res.roles))
// Now we reach the second half:
// .then((res) => setRoles(res.roles))

// This is where the code handles the result of the request.

// To understand it, we need two concepts: Promises and callbacks.
// A. Why do we use .then()?
// Requests to a backend take time.

// Your application sends a request, the server processes it, and the response comes back later. JavaScript doesn't normally stop all other work while waiting for that response.

// A Promise represents the eventual outcome of an asynchronous operation.

// A simplified example:
// fetch("/api/roles").then((response) => {
//   console.log("The response has arrived");
// });

// The callback passed to .then() runs when the Promise fulfills.

// In your code:
// gqlFetch<{ roles: Role[] }>(ROLES_QUERY)
//   .then(...)

// the intention is to run the callback after gqlFetch successfully produces its result.

// This assumes gqlFetch returns a Promise, as its use of .then() indicates it is expected to do.
// B. What is res?
// .then((res) => ...)

// res is a parameter of the callback.

// It represents the value produced by the successful request.

// The name res is short for response or result.

// You could rename it without changing the intended behavior:
// .then((result) => setRoles(result.roles))

// The name is arbitrary. What matters is the value it receives.

// Because the generic specifies:
// { roles: Role[] }

// TypeScript can understand that res is expected to have a roles property containing an array of roles.

// For example:
// res = {
//   roles: [
//     { id: "1", name: "Admin" },
//     { id: "2", name: "Editor" }
//   ]
// };

// C. What does res.roles mean?
// res.roles

// This accesses the roles property of the response object.

// Consider:
// const res = {
//   roles: [
//     { id: "1", name: "Admin" },
//     { id: "2", name: "Editor" }
//   ]
// };

// Then:
// res.roles

// returns just the array:
// [
//   { id: "1", name: "Admin" },
//   { id: "2", name: "Editor" }
// ]

// Why do we access res.roles rather than use res directly?

// Because res represents the whole response object, while the component's role state presumably needs only the array inside its roles property.

// 5. What does setRoles(res.roles) do?
// setRoles(res.roles)

// This is a React state update.

// Somewhere in the component, you might find code like:
// const [roles, setRoles] = useState<Role[]>([]);

// This is an example of the state declaration that would fit your function; we would need to inspect the actual component to confirm it.

// Let's break it down:
// Expression	Meaning
// useState<Role[]>([])	Creates state intended to hold an array of roles, initially empty
// roles	The current array stored in state
// setRoles	The setter used to request an update to that state
// setRoles(res.roles)	Supplies the newly fetched array as the next state value
// Suppose the initial state is:
// roles = [];

// The backend returns:
// res.roles = [
//   { id: "1", name: "Admin" },
//   { id: "2", name: "Editor" }
// ];

// Then the code calls:
// setRoles(res.roles);

// React schedules the state update. Once the component renders with the updated state, code that reads roles can access the fetched roles.

// For example:
// return (
//   <ul>
//     {roles.map((role) => (
//       <li key={role.id}>{role.name}</li>
//     ))}
//   </ul>
// );

// After the state update, the UI can display:
// - Admin
// - Editor
// React doesn't require you to manually modify the DOM. Updating the state lets React render the UI using the new value.

// One detail to remember: setRoles(...) doesn't mean that the roles variable immediately changes everywhere in the currently executing function. React schedules the state update, and the component receives the updated state on a subsequent render.

// 6. Trace the data from the backend to the screen
// Let's connect all the pieces using sample data.

// Suppose your component starts with:
// const [roles, setRoles] = useState<Role[]>([]);

// The state is initially an empty array.

// Then another part of the application calls:
// loadRoles();

// Here is what happens conceptually:
// Step 1
// Function is called
// loadRoles();

// The function starts executing.

// Step 2
// GraphQL request is started
// gqlFetch<{ roles: Role[] }>(ROLES_QUERY)

// The fetching helper executes the query.

// Step 3
// The request resolves
// {
//   roles: [
//     { id: "1", name: "Admin" },
//     { id: "2", name: "Editor" }
//   ]
// }

// The callback receives this object as res.

// Step 4
// The roles array is extracted
// res.roles

// The code gets the array without the surrounding response object.

// Step 5
// React state is updated
// setRoles(res.roles);

// The component can now render the fetched roles.

// The overall flow is:
// loadRoles()
//     ↓
// gqlFetch(ROLES_QUERY)
//     ↓
// Promise resolves with response data
//     ↓
// .then((res) => ...)
//     ↓
// setRoles(res.roles)
//     ↓
// React renders using the updated state

// Notice that the query, the response object, and the React state are three different things:
// - ROLES_QUERY describes the request.
// - res contains the returned response data.
// - roles is the state value used by the component.
// Keeping those three separate in your mind makes asynchronous React code much easier to understand.
