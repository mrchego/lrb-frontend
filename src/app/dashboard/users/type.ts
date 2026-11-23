export type ManagedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  isFounder: boolean;
  isCofounder: boolean;
  hasFounderAccess: boolean;
  canLogin: boolean;
  isActive: boolean;
  isLocked: boolean;
  passwordResetRequired: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLogin: string | null;
  createdAt: string;
  company: { id: string; name: string } | null;
  roles: { id: string; name: string }[];
  hasCustomPermissions: boolean;
};

export type UserConnection = { items: ManagedUser[]; totalCount: number };

export type BulkActionFailure = { itemId: string; reason: string };

export type BulkUserActionResult = {
  success: boolean;
  succeededIds: string[];
  failed: BulkActionFailure[];
};

