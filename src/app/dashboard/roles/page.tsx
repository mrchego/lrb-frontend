"use client";
import { useEffect, useState } from "react";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";
import { PERMISSIONS_QUERY, ROLES_QUERY } from "./query";
import { Permission, Role } from "./type";
import { Button } from "@/components/ui/button";
import { RoleFormDialog } from "./role-form-dialog";
import { RoleRowActions } from "./role-row-actions";
import { toast } from "react-toastify";
import { Loading } from "@/components/loading";

export default function RolesPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

const load = async () => {
  try {
    const [p, r] = await Promise.all([
      gqlFetch<{ permissions: Permission[] }>(PERMISSIONS_QUERY),
      gqlFetch<{ roles: Role[] }>(ROLES_QUERY),
    ]);
    setPermissions(p.permissions);
    setRoles(r.roles);
  } catch (err) {
    toast.error(
      err instanceof GraphQLError ? err.message : "Could not load roles.",
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Roles</h1>
        <RoleFormDialog
          mode="create"
          permissions={permissions}
          onSaved={load}
          trigger={<Button>New Role</Button>}
        />
      </div>

      {loading ? (
        <Loading variant="inline" size="sm" className="py-12" />
      ) : (
        <div className="grid gap-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-md border p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{role.name}</p>
                  {role.isDefault && (
                    <span className="text-xs rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 dark:bg-blue-900 dark:text-blue-300">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {role.staffCount} staff · {role.permissions.length} permission
                  {role.permissions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <RoleRowActions role={role} permissions={permissions} onChanged={load} />
            </div>
          ))}
          {roles.length === 0 && (
            <p className="text-sm text-muted-foreground">No roles yet — create one to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}