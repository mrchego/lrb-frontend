"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { DELETE_ROLE_MUTATION } from "./mutation";
import { Permission, Role } from "./type";
import { MoreHorizontal, Edit, Copy, Trash2, Users } from "lucide-react";
import { RoleFormDialog } from "./role-form-dialog";
import { CloneRoleDialog } from "./clone-role-dialog";

export function RoleRowActions({
  role,
  permissions,
  onChanged,
}: {
  role: Role;
  permissions: Permission[];
  onChanged: () => void;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);

  const handleDelete = async () => {
    if (role.staffCount > 0) {
      alert(
        `Cannot delete "${role.name}" — reassign the ${role.staffCount} staff member(s) using it first.`,
      );
      return;
    }
    if (
      !window.confirm(`Delete the role "${role.name}"? This cannot be undone.`)
    )
      return;
    try {
      const data = await gqlFetch<{
        deleteRole: { success: boolean; errors: any[] };
      }>(DELETE_ROLE_MUTATION, { roleId: role.id });
      if (data.deleteRole.success) {
        onChanged();
      } else {
        alert(data.deleteRole.errors?.[0]?.message ?? "Failed to delete role.");
      }
    } catch (err) {
      alert(
        err instanceof GraphQLError ? err.message : "Something went wrong.",
      );
    }
  };

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
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/roles/${role.id}`)}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage staff
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCloneOpen(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Clone
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleFormDialog
        mode="edit"
        role={role}
        permissions={permissions}
        onSaved={onChanged}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <CloneRoleDialog
        roleId={role.id}
        roleName={role.name}
        open={cloneOpen}
        onOpenChange={setCloneOpen}
        onCloned={onChanged}
      />
    </>
  );
}
