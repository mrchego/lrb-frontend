// app/dashboard/settings/company/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  useCompany,
  Company,
  CompanySettings,
} from "@/components/company-provider";
import { gqlFetch, gqlUpload, GraphQLError } from "@/lib/graphql-client";
import {
  UPDATE_COMPANY_MUTATION,
  UPDATE_COMPANY_SETTINGS_MUTATION,
} from "./mutation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveMediaUrl } from "@/lib/media";
import { Loading } from "@/components/loading";

type CompanySettingsEditable = Omit<CompanySettings, "id">;

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const { company, settings, loading, setCompany, setSettings } = useCompany();

  if (!user?.isSuperuser) {
    return (
      <div className="mx-auto max-w-lg py-16 px-4">
        <p className="text-sm text-muted-foreground">
          Only the company owner can manage these settings.
        </p>
      </div>
    );
  }

  if (loading)
    return <Loading/>
  if (!company || !settings)
    return (
      <div className="p-8 text-sm text-red-600">Could not load company.</div>
    );

  return (
    <div className="mx-auto max-w-2xl py-12 px-4 space-y-12">
      <CompanyProfileForm company={company} onSaved={setCompany} />
      <CompanyPreferencesForm settings={settings} onSaved={setSettings} />
    </div>
  );
}

function CompanyProfileForm({
  company,
  onSaved,
}: {
  company: Company;
  onSaved: (c: Company) => void;
}) {
  const [form, setForm] = useState({
    name: company.name,
    email: company.email,
    phone: company.phone,
    country: company.country,
    city: company.city,
    address: company.address,
  });
  const [logoLight, setLogoLight] = useState<File | null>(null);
  const [logoDark, setLogoDark] = useState<File | null>(null);
  const [logoLightPreview, setLogoLightPreview] = useState<string | null>(null);
  const [logoDarkPreview, setLogoDarkPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // Local preview of a picked-but-not-yet-saved file, using an object URL.
  // Local preview of a picked-but-not-yet-saved file, using an object URL.
  const handleFileChange =
    (
      setFile: React.Dispatch<React.SetStateAction<File | null>>,
      setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setFile(file);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return file ? URL.createObjectURL(file) : null;
      });
    };

  // Clean up object URLs on unmount.
  useEffect(() => {
    return () => {
      if (logoLightPreview) URL.revokeObjectURL(logoLightPreview);
      if (logoDarkPreview) URL.revokeObjectURL(logoDarkPreview);
    };
  }, [logoLightPreview, logoDarkPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const variables: any = { input: { ...form } };
    const files: Record<string, File> = {};
    if (logoLight) {
      variables.input.logoLight = null;
      files["variables.input.logoLight"] = logoLight;
    }
    if (logoDark) {
      variables.input.logoDark = null;
      files["variables.input.logoDark"] = logoDark;
    }

    try {
      const data = Object.keys(files).length
        ? await gqlUpload<{
            updateCompany: {
              success: boolean;
              company: Company;
              errors: any[];
            };
          }>(UPDATE_COMPANY_MUTATION, variables, files)
        : await gqlFetch<{
            updateCompany: {
              success: boolean;
              company: Company;
              errors: any[];
            };
          }>(UPDATE_COMPANY_MUTATION, variables);

      if (data.updateCompany.success) {
        onSaved(data.updateCompany.company); // <-- updates shared context, navbar re-renders instantly
        setSuccess(true);
        setLogoLight(null);
        setLogoDark(null);
        if (logoLightPreview) {
          URL.revokeObjectURL(logoLightPreview);
          setLogoLightPreview(null);
        }
        if (logoDarkPreview) {
          URL.revokeObjectURL(logoDarkPreview);
          setLogoDarkPreview(null);
        }
      } else {
        setError(
          data.updateCompany.errors?.[0]?.message ??
            "Could not update company.",
        );
      }
    } catch (err) {
      setError(
        err instanceof GraphQLError ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Company profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Company name</Label>
          <Input value={form.name} onChange={update("name")} required />
        </div>
        <div>
          <Label>Company email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={update("email")}
            required
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={update("phone")} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Country</Label>
            <Input value={form.country} onChange={update("country")} required />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={update("city")} required />
          </div>
        </div>
        <div>
          <Label>Address</Label>
          <Input value={form.address} onChange={update("address")} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Logo (light)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange(setLogoLight, setLogoLightPreview)}
            />
            {/* preview of a newly picked file takes priority over the saved logo */}
            {(logoLightPreview || company.logoLight) && (
              <img
                src={
                  logoLightPreview ?? resolveMediaUrl(company.logoLight!.url)
                }
                alt="Light logo preview"
                className="h-10 mt-2 rounded border object-contain"
              />
            )}
          </div>
          <div>
            <Label>Logo (dark)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange(setLogoDark, setLogoDarkPreview)}
            />
            {(logoDarkPreview || company.logoDark) && (
              <img
                src={logoDarkPreview ?? resolveMediaUrl(company.logoDark!.url)}
                alt="Dark logo preview"
                className="h-10 mt-2 rounded border object-contain bg-neutral-800"
              />
            )}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Company profile updated.</p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </section>
  );
}

const TIMEZONES = [
  "UTC",
  "Africa/Nairobi",
  "Europe/London",
  "America/New_York",
];
const CURRENCIES = ["USD", "EUR", "GBP", "KES"];
const LANGUAGES = [{ value: "en", label: "English" }];
const DATE_FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"];
const THEMES = ["light", "dark"];

function CompanyPreferencesForm({
  settings,
  onSaved,
}: {
  settings: CompanySettings;
  onSaved: (s: CompanySettings) => void;
}) {
  const { id, ...editable } = settings;
  const [form, setForm] = useState<CompanySettingsEditable>(editable);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { setTheme } = useTheme();

  const handleThemeChange = (v: string) => {
    setForm((f) => ({ ...f, theme: v }));
    setTheme(v); // live-preview immediately, see Bug B below
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const data = await gqlFetch<{
        updateCompanySettings: {
          success: boolean;
          settings: CompanySettings;
          errors: any[];
        };
      }>(UPDATE_COMPANY_SETTINGS_MUTATION, { input: form });

      if (data.updateCompanySettings.success) {
        onSaved(data.updateCompanySettings.settings);
        const { id: _id, ...freshEditable } =
          data.updateCompanySettings.settings;
        setForm(freshEditable);
        setSuccess(true);
      } else {
        setError(
          data.updateCompanySettings.errors?.[0]?.message ??
            "Could not update settings.",
        );
      }
    } catch (err) {
      setError(
        err instanceof GraphQLError ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Timezone"
            value={form.timezone}
            options={TIMEZONES}
            onChange={(v) => setForm((f) => ({ ...f, timezone: v }))}
          />
          <Select
            label="Currency"
            value={form.currency}
            options={CURRENCIES}
            onChange={(v) => setForm((f) => ({ ...f, currency: v }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Language"
            value={form.language}
            options={LANGUAGES.map((l) => l.value)}
            onChange={(v) => setForm((f) => ({ ...f, language: v }))}
          />
          <Select
            label="Date format"
            value={form.dateFormat}
            options={DATE_FORMATS}
            onChange={(v) => setForm((f) => ({ ...f, dateFormat: v }))}
          />
        </div>
        <Select
          label="Theme"
          value={form.theme}
          options={THEMES}
          onChange={handleThemeChange}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">Preferences updated.</p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save preferences"}
        </Button>
      </form>
    </section>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        className="w-full h-9 rounded-md border bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}



// React.Dispatch
// React.Dispatch<...>


// React.Dispatch is a TypeScript type provided by React.

// It describes a function that receives an argument of a specified type.

// For example, imagine a simple function:
// const printMessage = (message: string) => {
//   console.log(message);
// };


// This function accepts a string.

// Similarly, a React state setter accepts an argument describing the next state or how to calculate it.

// For your code, React.Dispatch describes the setter function's overall shape.
// Part 3: React.SetStateAction
// React.SetStateAction<File | null>


// This is another React type.

// It describes the two kinds of values you can pass to a React state setter:
// 1. A new state value directly.
// 2. A callback function that receives the previous state and returns the next state.
// Conceptually, the type is equivalent to:
// type SetStateAction<S> = S | ((prevState: S) => S);


// Here, S represents the state type.

// Let's use your File | null example.

// Option A — Pass a new file directly
// setFile(selectedFile);


// Option B — Pass a function that calculates the next state
// setFile((previousFile) => selectedFile);


// Both are valid ways to update React state, although the callback is most useful when the new value depends on the previous value.