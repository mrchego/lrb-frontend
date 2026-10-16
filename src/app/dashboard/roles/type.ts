export type Permission = { codename: string; label: string; category: string };

export type Role = {
  id: string;
  name: string;
  isDefault: boolean;
  staffCount: number;
  permissions: { codename: string }[];
};

export type AssignableUser = {
  id: string;
  email: string;
  fullName: string;
  isSuperuser: boolean;
};

export type BulkRoleActionResult = {
  success: boolean;
  succeededIds: string[];
  failed: { userId: string; reason: string }[];
};

