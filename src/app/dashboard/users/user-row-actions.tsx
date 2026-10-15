"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet } from "@/components/ui/sheet";
import {
  Edit,
  KeyRound,
  Lock,
  MoreHorizontal,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
  Unlock,
  UserCheck,
  UserX,
} from "lucide-react";
import { EditUserSheet } from "./edit-user-sheet";
import { UserActionButton } from "./user-action-button";
import { ManagedUser } from "./type";

export function UserRowActions({
  target,
  currentUserId,
  mutateUsers,
}: {
  target: ManagedUser;
  currentUserId: string;
  mutateUsers: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const isSelf = target.id === currentUserId;

  // delete_user() sets both is_active=False and can_login=False.
  // deactivate_user() only sets is_active=False, leaving can_login=True.
  // These are different states and need different undo actions —
  // "Activate" alone can't restore login access to a deleted user.
  const isDeleted = !target.isActive && !target.canLogin;

  // The founder is permanently immune to deactivate/delete/lock/demote —
  // assert_not_last_owner() enforces this server-side regardless of what
  // the UI does, but disabling proactively avoids a pointless failed mutation.
  const founderLocked = target.isFounder;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="h-8 w-8 p-0" />}
        >
          <>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {target.isSuperuser ? (
            !target.isFounder && (
              <UserActionButton
                userId={target.id}
                disabled={isSelf}
                disabledReason="You can't demote your own account."
                action="demote"
                icon={ShieldOff}
                label="Remove owner access"
                confirmMessage={`Remove owner access from ${target.email}? They'll keep their account but lose all owner permissions.`}
                onDone={mutateUsers}
              />
            )
          ) : (
            <UserActionButton
              userId={target.id}
              action="promote"
              icon={ShieldCheck}
              label="Make owner"
              confirmMessage={`Give ${target.email} full owner access? They'll be able to manage all users, billing, and settings.`}
              onDone={mutateUsers}
            />
          )}

          <DropdownMenuSeparator />

          {isDeleted ? (
            <UserActionButton
              userId={target.id}
              action="restore"
              icon={RotateCcw}
              label="Restore"
              confirmMessage={`Restore ${target.email}? This re-enables their account and login access.`}
              onDone={mutateUsers}
            />
          ) : (
            <UserActionButton
              userId={target.id}
              disabled={isSelf || founderLocked}
              disabledReason={
                founderLocked
                  ? "The founder's account can't be deactivated."
                  : "You can't do this to your own account."
              }
              action={target.isActive ? "deactivate" : "activate"}
              icon={target.isActive ? UserX : UserCheck}
              label={target.isActive ? "Deactivate" : "Activate"}
              confirmMessage={
                target.isActive
                  ? `Deactivate ${target.email}? They will lose access immediately.`
                  : `Reactivate ${target.email}?`
              }
              onDone={mutateUsers}
            />
          )}

          <UserActionButton
            userId={target.id}
            disabled={isSelf || founderLocked}
            disabledReason={
              founderLocked
                ? "The founder's account can't be locked."
                : "You can't lock your own account."
            }
            action={target.isLocked ? "unlock" : "lock"}
            icon={target.isLocked ? Unlock : Lock}
            label={target.isLocked ? "Unlock" : "Lock (15 min)"}
            confirmMessage={
              target.isLocked
                ? `Unlock ${target.email}?`
                : `Lock ${target.email} out for 15 minutes?`
            }
            onDone={mutateUsers}
          />

          <UserActionButton
            userId={target.id}
            action="forcePasswordReset"
            icon={KeyRound}
            label="Force password reset"
            confirmMessage={`Require ${target.email} to reset their password on next login?`}
            onDone={mutateUsers}
          />

          <DropdownMenuSeparator />

          {!isDeleted && (
            <UserActionButton
              userId={target.id}
              disabled={isSelf || target.isSuperuser}
              disabledReason={
                isSelf
                  ? "You can't delete your own account."
                  : "Owner accounts can't be deleted from here."
              }
              action="delete"
              icon={UserX}
              label="Delete"
              destructive
              confirmMessage={`Delete ${target.email}? This disables their account and login access.`}
              onDone={mutateUsers}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <EditUserSheet
          user={target}
          onSaved={() => {
            mutateUsers();
            setEditOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}
