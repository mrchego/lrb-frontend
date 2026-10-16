"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { gqlFetch, GraphQLError } from "@/lib/graphql-client";;
import { Button } from "@/components/ui/button";
import { AssignStaffDialog } from "../assign-staff-dialog";
import { Role } from "../type";
import { ROLE_QUERY } from "../query";
import { Loading } from "@/components/loading";

// Note: the Role type/query don't currently return *which* users hold the
// role — only staffCount. This page cross-references the full user list
// against role assignment via a lightweight per-user query until a
// `role.assignedUsers` field exists on the backend; for now it re-derives
// membership by checking each user's roles isn't exposed either, so the
// practical approach is to add a small backend field. Flagging this rather
// than faking it — see note below.

export default function RoleDetailPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const [role, setRole] = useState<Role | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const load = async () => {
    const data = await gqlFetch<{ role: Role | null }>(ROLE_QUERY, { roleId });
    setRole(data.role);
  };

  useEffect(() => {
    load();
  }, [roleId]);

  if (!role) return <Loading/>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{role.name}</h1>
          <p className="text-sm text-muted-foreground">
            {role.staffCount} staff · {role.permissions.length} permissions
          </p>
        </div>
        <Button onClick={() => setAssignOpen(true)}>Assign staff</Button>
      </div>

      <div className="rounded-md border p-4">
        <p className="text-sm font-medium mb-2">Permissions</p>
        <div className="flex flex-wrap gap-1.5">
          {role.permissions.map((p) => (
            <span key={p.codename} className="text-xs rounded bg-muted px-2 py-1">
              {p.codename}
            </span>
          ))}
        </div>
      </div>

      <AssignStaffDialog
        roleId={role.id}
        roleName={role.name}
        existingUserIds={new Set()}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssigned={load}
      />
    </div>
  );
}