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
  roles: { id: string; name: string }[];
};

export type BulkRoleActionResult = {
  success: boolean;
  succeededIds: string[];
  failed: { itemId: string; reason: string }[];
};

