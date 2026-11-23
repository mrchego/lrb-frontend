// app/dashboard/settings/company/page.tsx
"use client";

import { useState, useEffect, useId, useMemo, useRef } from "react";
import { type SelectItem } from "@/components/searchable-select";
import { zoneLabel } from "@/lib/time";

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
import { toast } from "react-toastify";
import { TIMEZONE_CHOICES_QUERY, CURRENCY_SETUP_QUERY } from "./query";
import { formatMoney, type CurrencyInfo } from "@/lib/money";
import { PhoneInput } from "@/components/phone-input";
import { checkPhone } from "@/lib/phone";
import { SearchableSelect } from "@/components/searchable-select";
import { useConfirm } from "@/components/confirm-provider";
import { useSWRConfig } from "swr";
import { AppearanceEditor, type AppearanceValue } from "@/components/appearance-editor";
import { applyTheme, isDefaultAppearance } from "@/lib/theme-engine";

type CompanySettingsEditable = Omit<CompanySettings, "id">;

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const { company, settings, loading, setCompany, setSettings, refetch } =
    useCompany();

  if (!user?.hasFounderAccess) {
    return (
      <div className="mx-auto max-w-lg py-16 px-4">
        <p className="text-sm text-muted-foreground">
          Only the company founder or a co-founder can manage these settings.
        </p>
      </div>
    );
  }

  if (loading) return <Loading />;
  if (!company || !settings)
    return (
      <div className="p-8 text-sm text-red-600">Could not load company.</div>
    );

  return (
    <div className="mx-auto max-w-2xl py-12 px-4 space-y-12">
      <CompanyProfileForm company={company} onSaved={setCompany} />
      <CompanyPreferencesForm
        settings={settings}
        onSaved={(s) => {
          setSettings(s);
          void refetch(); // refresh the currency's decimals so every screen updates
        }}
      />
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
    const phoneCheck = checkPhone(form.phone);
    if (!phoneCheck.ok) {
      toast.error(phoneCheck.message);
      return;
    }
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
        toast.success("Company profile updated.");
        onSaved(data.updateCompany.company);
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
        toast.error(
          data.updateCompany.errors?.[0]?.message ??
            "Could not update company.",
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
          <PhoneInput
            value={form.phone}
            onChange={(phone) => setForm((f) => ({ ...f, phone }))}
            inspect
          />
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
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </section>
  );
}

function TimezoneSelect({
  value,
  zones,
  onChange,
}: {
  value: string;
  zones: string[];
  onChange: (v: string) => void;
}) {
  const id = useId();
  const items = useMemo<SelectItem[]>(
    () =>
      zones
        .map((z) => {
          // "Africa/Nairobi" -> group "Africa"; "UTC" has no slash -> group "Other"
          const region = z.includes("/") ? z.split("/")[0] : "Other";
          const offset = zoneLabel(z); // "GMT+3": searchable too, so "gmt+3" finds Nairobi
          const name = z.includes("/")
            ? z.slice(region.length + 1).replace(/_/g, " ")
            : z;
          return {
            value: z,
            label: name,
            hint: offset,
            group: region,
            keywords: `${z} ${region}`,
            triggerLabel: `${z.replace(/_/g, " ")} (${offset})`,
          };
        })
        // Headings need each region's rows to be adjacent (stable sort keeps city order).
        .sort((a, b) => a.group.localeCompare(b.group)),
    [zones],
  );
  return (
    <div>
      <Label htmlFor={id}>Timezone</Label>
      <SearchableSelect
        id={id}
        value={value}
        onChange={onChange}
        items={items}
        searchPlaceholder="Search city, region or GMT+3…"
      />
    </div>
  );
}

function CurrencySelect({
  value,
  currencies,
  language,
  onChange,
}: {
  value: string;
  currencies: CurrencyInfo[];
  language: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const items = useMemo<SelectItem[]>(
    () =>
      (currencies.length
        ? currencies
        : [{ code: value, name: "", decimals: 2 }]
      ).map((c) => ({
        value: c.code,
        label: c.name || c.code,
        hint: c.name ? c.code : undefined, // "Kenyan Shilling ........ KES"
        triggerLabel: c.name ? `${c.code} — ${c.name}` : c.code,
      })),
    [currencies, value],
  );
  const chosen = currencies.find((c) => c.code === value);
  return (
    <div>
      <Label htmlFor={id}>Currency</Label>
      <SearchableSelect
        id={id}
        value={value}
        onChange={onChange}
        items={items}
        searchPlaceholder="Search currency or code…"
      />
      {chosen && (
        <p className="mt-1 text-xs text-muted-foreground">
          Example:{" "}
          <span className="tabular-nums text-foreground">
            {formatMoney(1234567.891, {
              currency: chosen.code,
              decimals: chosen.decimals,
              locale: language,
            })}
          </span>
        </p>
      )}
    </div>
  );
}

function ExchangeRateField({
  from,
  to,
  rate,
  language,
  onChange,
}: {
  from?: CurrencyInfo;
  to?: CurrencyInfo;
  rate: string;
  language: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const n = Number(rate);
  return (
    <div className="space-y-2 rounded-md border p-3">
      <Label htmlFor={id}>Exchange rate</Label>
      <div className="flex items-center gap-2 text-sm">
        <span className="whitespace-nowrap">1 {from?.code} =</span>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={rate}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 0.0077"
        />
        <span>{to?.code}</span>
      </div>
      {n > 0 && from && to && (
        <p className="text-xs tabular-nums text-foreground">
          {formatMoney(1000, {
            currency: from.code,
            decimals: from.decimals,
            locale: language,
          })}
          {" → "}
          {formatMoney(1000 * n, {
            currency: to.code,
            decimals: to.decimals,
            locale: language,
          })}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Every amount already recorded is converted with this rate when you save.
      </p>
    </div>
  );
}

const LANGUAGES = [{ value: "en", label: "English" }];
const DATE_FORMATS = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"];
const THEMES = ["system", "light", "dark"];
const THEME_LABELS: Record<string, string> = {
  system: "System (follow device)",
  light: "Light",
  dark: "Dark",
};

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
  const { theme, setTheme } = useTheme();
  const [zones, setZones] = useState<string[]>([form.timezone]);
  useEffect(() => {
    gqlFetch<{ timezoneChoices: string[] }>(TIMEZONE_CHOICES_QUERY)
      .then((d) => setZones(d.timezoneChoices))
      .catch((err) => {
        console.error("Could not load timezones:", err);
        toast.error(
          err instanceof GraphQLError
            ? err.message
            : "Could not load timezones.",
        );
      });
  }, []);

  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([]);

  const confirm = useConfirm();
  const { mutate: swrMutate } = useSWRConfig();

  const [hasMoneyData, setHasMoneyData] = useState(false);
  const [rate, setRate] = useState("");

  const currencyChanged = form.currency !== settings.currency;
  const needsRate = currencyChanged && hasMoneyData;
  useEffect(() => {
    gqlFetch<{
      currencyChoices: CurrencyInfo[];
      currencyHasMoneyData: boolean;
    }>(CURRENCY_SETUP_QUERY)
      .then((d) => {
        setCurrencies(d.currencyChoices);
        setHasMoneyData(d.currencyHasMoneyData);
      })
      .catch((err) => {
        console.error("Could not load currencies:", err);
        toast.error(
          err instanceof GraphQLError
            ? err.message
            : "Could not load currencies.",
        );
      });
  }, []);

  const handleThemeChange = (v: string) => {
    setForm((f) => ({ ...f, theme: v }));
    setTheme(v); // applies immediately
  };

const savedTheme = useRef({ brandColor: settings.brandColor, appearance: settings.appearance });
useEffect(() => {
  savedTheme.current = { brandColor: settings.brandColor, appearance: settings.appearance };
}, [settings.brandColor, settings.appearance]);
useEffect(() => () => applyTheme(savedTheme.current.brandColor, savedTheme.current.appearance), []);

const handleAppearanceChange = ({ brandColor, appearance }: AppearanceValue) => {
  setForm((f) => ({ ...f, brandColor, appearance: isDefaultAppearance(appearance) ? {} : appearance }));
  applyTheme(brandColor, appearance, { persist: false }); // live preview of the whole app
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // A currency change with existing financial data requires an exchange rate.
    if (needsRate) {
      if (!(Number(rate) > 0)) {
        toast.error(
          "Enter the exchange rate to convert your existing amounts.",
        );
        return;
      }

      // Ask the user to confirm before converting existing financial records.
      const ok = await confirm({
        title: `Convert all amounts to ${form.currency}?`,
        description: `Every recorded amount will be multiplied by ${rate} and rounded to ${form.currency}'s decimals, immediately. Converting back later will not restore the exact original numbers.`,
        confirmLabel: "Convert",
        destructive: true,
      });

      if (!ok) return;
    }

    setSubmitting(true);

    try {
      const data = await gqlFetch<{
        updateCompanySettings: {
          success: boolean;
          settings: CompanySettings;
          errors: any[];
        };
      }>(UPDATE_COMPANY_SETTINGS_MUTATION, {
        input: {
          ...form,
          theme: theme ?? form.theme,
          exchangeRate: needsRate ? rate.trim() : null,
        },
      });

      if (data.updateCompanySettings.success) {
        toast.success("Preferences updated.");

        onSaved(data.updateCompanySettings.settings);

        const { id: _id, ...freshEditable } =
          data.updateCompanySettings.settings;

        setForm(freshEditable);

        // Clear the exchange rate after a successful conversion.
        if (needsRate) {
          setRate("");

          // Revalidate all SWR cache entries so converted amounts refresh.
          await swrMutate(() => true);
        }
      } else {
        toast.error(
          data.updateCompanySettings.errors?.[0]?.message ??
            "Could not update settings.",
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
      <h2 className="text-lg font-semibold mb-4">Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TimezoneSelect
            value={form.timezone}
            zones={zones}
            onChange={(v) => setForm((f) => ({ ...f, timezone: v }))}
          />

          <CurrencySelect
            value={form.currency}
            currencies={currencies}
            language={form.language}
            onChange={(v) => setForm((f) => ({ ...f, currency: v }))}
          />
        </div>
        <div>
          {needsRate && (
            <ExchangeRateField
              from={currencies.find((c) => c.code === settings.currency)}
              to={currencies.find((c) => c.code === form.currency)}
              rate={rate}
              language={form.language}
              onChange={setRate}
            />
          )}
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
          value={theme ?? form.theme}
          options={THEMES}
          labels={THEME_LABELS}
          onChange={handleThemeChange}
        />
        <AppearanceEditor brandColor={form.brandColor} appearance={form.appearance} onChange={handleAppearanceChange} />
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
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const items = useMemo<SelectItem[]>(
    () => options.map((o) => ({ value: o, label: labels?.[o] ?? o })),
    [options, labels],
  );
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <SearchableSelect
        id={id}
        value={value}
        onChange={onChange}
        items={items}
      />
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

