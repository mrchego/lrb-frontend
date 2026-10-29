export type ManagedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  isSuperuser: boolean;
  isFounder: boolean;
  isStaff: boolean;
  canLogin: boolean;
  isActive: boolean;
  isLocked: boolean;
  passwordResetRequired: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLogin: string | null;
  createdAt: string;
  company: { id: string; name: string } | null;
};

export type UserConnection = { items: ManagedUser[]; totalCount: number };

export type BulkActionFailure = { itemId: string; reason: string };

export type BulkUserActionResult = {
  success: boolean;
  succeededIds: string[];
  failed: BulkActionFailure[];
};
