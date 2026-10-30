export type Invitation = {
  id: string;
  email: string;
  roleName: string;
  invitedByEmail: string;
  used: boolean;
  acceptedAt: string | null;
  expiresAt: string;
  isExpired: boolean;
  createdAt: string;
};

export type StaffMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  canLogin: boolean;
  isActive: boolean;
  isLocked: boolean;
  lastLogin: string | null;
  createdAt: string;
  company: { id: string; name: string } | null;
};

export type StaffMemberConnection = { items: StaffMember[]; totalCount: number };

export type InvitationConnection = { items: Invitation[]; totalCount: number };

export type BulkInvitationActionResult = {
  success: boolean;
  succeededIds: string[];
  failed: { itemId: string; reason: string }[];
};