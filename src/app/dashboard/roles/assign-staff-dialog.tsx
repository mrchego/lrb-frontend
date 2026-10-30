"use client";
import { useEffect, useRef, useState } from "react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { BULK_ASSIGN_ROLE_MUTATION } from "./mutation";
import { USERS_FOR_ROLE_ASSIGNMENT_QUERY } from "./query";
import { AssignableUser, BulkRoleActionResult } from "./type";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast, type ToastOptions } from "react-toastify";
import { Loading } from "@/components/loading";

const PAGE_SIZE = 50;

type UsersPage = { users: { items: AssignableUser[]; totalCount: number } };

export function AssignStaffDialog({
  roleId,
  roleName,
  existingUserIds,
  open,
  onOpenChange,
  onAssigned,
}: {
  roleId: string;
  roleName: string;
  existingUserIds: Set<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}) {
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [fetchedCount, setFetchedCount] = useState(0); // raw count from the server
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Bumped on every new search; responses from older searches are discarded.
  const requestId = useRef(0);

  const showError = (err: unknown, fallback: string) =>
    toast.error(err instanceof GraphQLError ? err.message : fallback);

  // Debounce typing so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset when the dialog opens. Selection survives searches, so the owner
  // can search "ann", tick her, search "bob", tick him, then assign both.
  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setSearch("");
    setDebouncedSearch("");
  }, [open]);

  // First page, re-run whenever the search term changes.
  useEffect(() => {
    if (!open) return;
    const id = ++requestId.current;
    setLoadingUsers(true);

    gqlFetch<UsersPage>(USERS_FOR_ROLE_ASSIGNMENT_QUERY, {
      search: debouncedSearch || undefined,
      canLogin: true,
      limit: PAGE_SIZE,
      offset: 0,
    })
      .then((d) => {
        if (id !== requestId.current) return;
        setUsers(d.users.items.filter((u) => !u.isSuperuser));
        setFetchedCount(d.users.items.length);
        setTotalCount(d.users.totalCount);
      })
      .catch((err) => {
        if (id === requestId.current) showError(err, "Could not load staff.");
      })
      .finally(() => {
        if (id === requestId.current) setLoadingUsers(false);
      });
  }, [open, debouncedSearch]);

  const hasMore = fetchedCount < totalCount;

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const id = requestId.current; // if the search changes meanwhile, id goes stale
    setLoadingMore(true);
    try {
      const d = await gqlFetch<UsersPage>(USERS_FOR_ROLE_ASSIGNMENT_QUERY, {
        search: debouncedSearch || undefined,
        canLogin: true,
        limit: PAGE_SIZE,
        offset: fetchedCount,
      });
      if (id !== requestId.current) return;
      setUsers((prev) => [
        ...prev,
        ...d.users.items.filter((u) => !u.isSuperuser),
      ]);
      setFetchedCount((c) => c + d.users.items.length);
      setTotalCount(d.users.totalCount);
    } catch (err) {
      showError(err, "Could not load more staff.");
    } finally {
      setLoadingMore(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    try {
      const data = await gqlFetch<{ bulkAssignRole: BulkRoleActionResult }>(
        BULK_ASSIGN_ROLE_MUTATION,
        { userIds: Array.from(selected), roleId },
      );
      const { succeededIds, failed } = data.bulkAssignRole;
      const okCount = succeededIds.length;

      if (failed.length === 0) {
        toast.success(
          `${okCount} staff member${okCount === 1 ? "" : "s"} added to ${roleName}.`,
        );
      } else {
        const reasons = Array.from(new Set(failed.map((f) => f.reason)));
        const options: ToastOptions = {
          style: { whiteSpace: "pre-line" },
          autoClose: 8000,
        };
        const lines = reasons.map((r) => `• ${r}`).join("\n");

        if (okCount === 0) {
          toast.error(`No one was added.\n${lines}`, options);
          return; // keep the dialog open so the selection can be fixed
        }
        toast.warning(
          `Added ${okCount}, skipped ${failed.length}.\n${lines}`,
          options,
        );
      }

      onOpenChange(false);
      onAssigned();
    } catch (err) {
      showError(err, "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add staff to {roleName}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-1 mt-2">
          {loadingUsers ? (
            <Loading variant="inline" size="sm" className="py-8" />
          ) : (
            <>
              {users.map((u) => {
                const alreadyIn = existingUserIds.has(u.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-start gap-2 text-sm py-1.5 ${
                      alreadyIn ? "opacity-60" : ""
                    }`}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={alreadyIn || selected.has(u.id)}
                      disabled={alreadyIn}
                      onCheckedChange={() => toggle(u.id)}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span>{u.fullName || u.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {u.email}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alreadyIn
                          ? `Already in ${roleName}`
                          : u.roles.length > 0
                            ? `Current: ${u.roles.map((r) => r.name).join(", ")}`
                            : "No roles yet"}
                      </p>
                    </div>
                  </label>
                );
              })}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  No matching staff.
                </p>
              )}
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </Button>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={submitting || selected.size === 0}
          >
            {submitting ? "Adding…" : `Add (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Big Picture
// This code is part of a component that lets you assign a role to users.

// When the dialog opens (open is true), it fetches a list of users from the backend.

// It filters out superusers and already‑assigned users.

// It lets you search through the list.

// You can toggle which users are selected.

// Finally, you can assign the role to all selected users with a bulk mutation.

// So the problem it solves is: “How do we show a list of assignable users, let the admin pick some, and then assign them a role?”

// Step by Step
// 1. useEffect(() => { ... }, [open, existingUserIds]);
// Runs whenever open or existingUserIds changes.

// If the dialog isn’t open (!open), it returns immediately.

// Otherwise, it resets state (setSelected(new Set()), setSearch("")) and fetches users.

// 2. gqlFetch<{ users: AssignableUser[] }>(USERS_FOR_ROLE_ASSIGNMENT_QUERY)...
// Calls the GraphQL query to get users.

// The generic <{ users: AssignableUser[] }> tells TypeScript: “Expect an object with a users array.”

// When the data comes back, it filters out:

// Superusers (!u.isSuperuser)

// Users already assigned (!existingUserIds.has(u.id))

// Then it sets the users state with the filtered list.

// 3. const filtered = users.filter(...)
// Creates a derived list of users based on the search string.

// Matches if the search text is found in either email or fullName (case‑insensitive).

// This is what you display in the UI when typing in a search box.

// 4. const toggle = (id: string) => { ... }
// Same toggle pattern you saw earlier with permissions.

// Copies the current selected set.

// If the user ID is already selected, remove it. Otherwise, add it.

// Returns the new set.

// This keeps track of which users are selected for assignment.

// 5. const handleAssign = async () => { ... }
// Triggered when the admin clicks “Assign.”

// If no users are selected, it returns early.

// Sets submitting to true (probably to disable the button or show a spinner).

// Calls the bulk mutation:

// ts
// gqlFetch<{ bulkAssignRole: BulkRoleActionResult }>(
//   BULK_ASSIGN_ROLE_MUTATION,
//   { userIds: Array.from(selected), roleId },
// );
// Converts the Set of selected IDs into an array.

// Sends it along with the roleId.

// When the response comes back:

// Destructures succeededIds and failed.

// If some failed, shows an alert with reasons.

// Closes the dialog (onOpenChange(false)).

// Calls onAssigned() to notify the parent component.

// If there’s an error, shows an alert.

// Finally, sets submitting back to false.

// Data Flow Example
// Dialog opens → useEffect runs → fetch users.

// User types in search → filtered updates.

// User clicks checkboxes → toggle updates selected.

// User clicks “Assign” → handleAssign runs → mutation sent.

// Backend responds → success/failure handled → dialog closes.

// Recap
// useEffect fetches users when the dialog opens.

// filtered handles search.

// toggle manages selected users.

// handleAssign sends the bulk mutation and handles results.

// The mental model: “Open dialog → fetch users → filter/search → select → assign.”

// Would you like me to now trace the GraphQL mutation response shape (BulkRoleActionResult) so you can see exactly what fields you can expect back and how they’re used in handleAssign?
