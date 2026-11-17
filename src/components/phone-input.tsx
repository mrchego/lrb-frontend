// components/phone-input.tsx
"use client";

import { useMemo, useState } from "react";
import PhoneInputLib from "react-phone-number-input/max";
// Bundled flags. Without this prop the library loads every flag image from a third-party
// GitHub Pages site on each page view, which is a privacy and availability dependency.
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

import { Input } from "@/components/ui/input";
import {
  checkPhone,
  coerceToE164,
  countryName,
  DEFAULT_PHONE_COUNTRY,
  phoneTypeLabel,
  type PhoneRequirement,
} from "@/lib/phone";
import { usePhoneInspection } from "@/lib/use-phone-inspection";
import { PhoneCountrySelect } from "./phone-country-select";

type PhoneInputProps = {
  /** E.164 string ("+254712345678") or "" - exactly what the API stores and returns. */
  value: string;
  onChange: (e164: string) => void;
  requirement?: PhoneRequirement;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  /**
   * Ask the server for carrier / location / time zone and its stricter verdict.
   * Signed-in screens only: the query needs a session (the register page has none).
   */
  inspect?: boolean;
};

export function PhoneInput({
  value,
  onChange,
  requirement = "CONTACT",
  required,
  disabled,
  id,
  inspect = false,
}: PhoneInputProps) {
  const [touched, setTouched] = useState(false);

  // Numbers saved before libphonenumber may be "0712345678"; show them in E.164.
  const e164 = useMemo(() => coerceToE164(value), [value]);
  const check = useMemo(
    () => (e164 ? checkPhone(e164, { requirement }) : null),
    [e164, requirement],
  );
  const server = usePhoneInspection(check?.ok ? check.e164 : undefined, {
    enabled: inspect,
    requirement,
  });

  const error =
    check && !check.ok
      ? touched
        ? check.message
        : null
      : server && !server.ok
        ? server.message
        : null;

  let detail = "";
  if (check?.ok && !error) {
    const info = server?.info;
    detail = [
      phoneTypeLabel(info?.numberType ?? check.type),
      info?.originalCarrier,
      info?.location || countryName(info?.regionCode ?? check.country),
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return (
    <div className="space-y-1">
      <PhoneInputLib
        id={id}
        international
        countryCallingCodeEditable={false}
        defaultCountry={DEFAULT_PHONE_COUNTRY}
        flags={flags}
        countrySelectComponent={PhoneCountrySelect}
        addInternationalOption={false}
        countryOptionsOrder={[DEFAULT_PHONE_COUNTRY, "|", "..."]}
        value={e164 || undefined}
        onChange={(next) => onChange(next ?? "")}
        onBlur={() => setTouched(true)}
        inputComponent={Input}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className="flex items-center gap-2"
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : detail ? (
        <p className="text-sm text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}