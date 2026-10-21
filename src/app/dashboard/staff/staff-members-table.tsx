"use client";

import { Badge } from "@/components/ui/badge";
import type { StaffMember } from "./type";
import { StaffMemberRowActions } from "./staff-member-row-actions";
import { Loading } from "@/components/loading";

export function StaffMembersTable({
  members,
  isLoading,
  currentUserId,
  onRefresh,
}: {
  members: StaffMember[];
  isLoading: boolean;
  currentUserId: string;
  onRefresh: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/20">
            <tr>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="hidden sm:table-cell text-left p-3 font-medium">Name</th>
              <th className="hidden lg:table-cell text-left p-3 font-medium">Phone</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="hidden md:table-cell text-left p-3 font-medium">Last login</th>
              <th className="w-10 p-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>
                  <Loading/>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No staff members yet.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const isDeleted = !m.isActive && !m.canLogin;
                return (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="p-3">
                      <div>{m.email}</div>
                      {/* Name/Phone/Last login fold in here below sm/lg/md
                          rather than vanishing */}
                      <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                        {m.fullName || "—"}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell p-3">{m.fullName || "—"}</td>
                    <td className="hidden lg:table-cell p-3">{m.phone || "—"}</td>
                    <td className="p-3">
                      {isDeleted ? (
                        <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          Deleted
                        </Badge>
                      ) : m.isLocked ? (
                        <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                          Locked
                        </Badge>
                      ) : (
                        <Badge
                          className={
                            m.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }
                        >
                          {m.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </td>
                    <td className="hidden md:table-cell p-3 text-muted-foreground">
                      {m.lastLogin ? new Date(m.lastLogin).toLocaleDateString() : "Never"}
                    </td>
                    <td className="p-3">
                      <StaffMemberRowActions
                        target={m}
                        currentUserId={currentUserId}
                        onDone={onRefresh}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}