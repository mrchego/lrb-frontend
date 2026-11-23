import { Badge } from "@/components/ui/badge";

type RoleCellUser = {
  isFounder: boolean;
  isCofounder: boolean;
  roles: { id: string; name: string }[];
  hasCustomPermissions: boolean;
};

// Shows the REAL role name(s) instead of the generic "Staff" badge.
export function RoleCell({ user }: { user: RoleCellUser }) {
  if (user.isFounder)
    return (
      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
        Founder
      </Badge>
    );
  if (user.isCofounder)
    return (
      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        Co-founder
      </Badge>
    );
  if (user.roles.length === 0)
    return <span className="text-xs text-muted-foreground">No role</span>;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {user.roles.map((r) => (
        <Badge key={r.id} variant="outline">
          {r.name}
        </Badge>
      ))}
      {user.hasCustomPermissions && (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
          Customised
        </Badge>
      )}
    </div>
  );
}
