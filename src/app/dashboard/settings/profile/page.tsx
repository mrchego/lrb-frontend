// app/dashboard/settings/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { gqlFetch, gqlUpload, GraphQLError } from "@/lib/graphql-client";
import { UPDATE_PROFILE_MUTATION } from "./mutation";
import { resolveMediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loading } from "@/components/loading";
import { toast } from "react-toastify";

export default function ProfileSettingsPage() {
  const { user, loading, setUser } = useAuth();

  if (loading) return <Loading/>
  if (!user) return <div className="p-8 text-sm text-red-600">Could not load your profile.</div>;

  return (
    <div className="mx-auto max-w-lg py-12 px-4">
      <ProfileForm user={user} onSaved={setUser} />
    </div>
  );
}

function ProfileForm({
  user,
  onSaved,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onSaved: (u: any) => void;
}) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatar(file);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  // UpdateProfileInput fields are camelCase on the wire: firstName, lastName, phone, avatar.
  const variables: any = { input: { ...form } };
  const files: Record<string, File> = {};
  if (avatar) {
    variables.input.avatar = null;
    files["variables.input.avatar"] = avatar;
  }

  try {
    const data = Object.keys(files).length
      ? await gqlUpload<{
          updateProfile: { success: boolean; user: any; errors: any[] };
        }>(UPDATE_PROFILE_MUTATION, variables, files)
      : await gqlFetch<{
          updateProfile: { success: boolean; user: any; errors: any[] };
        }>(UPDATE_PROFILE_MUTATION, variables);

    if (data.updateProfile.success) {
      toast.success("Profile updated.");
      onSaved(data.updateProfile.user); // updates shared auth context
      setAvatar(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
    } else {
      toast.error(
        data.updateProfile.errors?.[0]?.message ?? "Could not update profile.",
      );
    }
  } catch (err) {
    toast.error(
      err instanceof GraphQLError ? err.message : "Something went wrong.",
    );
  } finally {
    setSubmitting(false);
  }
};
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-1">Your profile</h1>
      <p className="text-sm text-muted-foreground mb-6">{user.email}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={avatarPreview ?? resolveMediaUrl(user.avatar?.url)}
              alt={user.fullName || user.email}
            />
            <AvatarFallback>
              {(user.firstName || user.email).slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label>Avatar</Label>
            <Input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First name</Label>
            <Input value={form.firstName} onChange={update("firstName")} required />
          </div>
          <div>
            <Label>Last name</Label>
            <Input value={form.lastName} onChange={update("lastName")} required />
          </div>
        </div>

        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={update("phone")} />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </section>
  );
}