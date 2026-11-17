// lib/phone.ts
//
// Phone numbers on the client, powered by libphonenumber-js (the JavaScript port of
// Google's libphonenumber, using the same metadata).
//
// THE BACKEND IS THE SOURCE OF TRUTH. This file exists so people get instant feedback
// while typing; it mirrors the rules in lrb/core/phone/engine.py. What the JS port
// can't do (carrier name, location, time zones, short/emergency numbers) comes from
// the `inspectPhone` GraphQL query instead.
//
// Always import from "libphonenumber-js/max": the smaller metadata sets can't tell a
// mobile number from a landline, and we need that for getType().

import {
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  isSupportedCountry,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
  type NumberType,
} from "libphonenumber-js/max";
import examples from "libphonenumber-js/examples.mobile.json";

export type { CountryCode, NumberType };

/** CONTACT = any real number except premium-rate etc.  MOBILE = must receive SMS/WhatsApp. */
export type PhoneRequirement = "CONTACT" | "MOBILE";

const envCountry = process.env.NEXT_PUBLIC_PHONE_DEFAULT_COUNTRY?.toUpperCase();

/** Which country a number typed without "+" is read under. Mirror of PHONE_DEFAULT_REGION. */
export const DEFAULT_PHONE_COUNTRY: CountryCode =
  envCountry && isSupportedCountry(envCountry) ? envCountry : "KE";

const MAX_INPUT_LENGTH = 40;
// Same rule as the backend: digits, spaces, ( ) - . and one leading "+". No letters
// (vanity numbers), no "ext 5" (E.164 would silently drop the extension).
const ALLOWED_INPUT = /^[\s(]*\+?[\d\s().-]*$/u;

export type PhoneCheck =
  | {
      ok: true;
      /** What to store / send to the API, e.g. +254712345678 */
      e164: string;
      international: string;
      national: string;
      country: CountryCode | undefined;
      type: NumberType;
    }
  | { ok: false; message: string };

const TYPES_BLOCKED_FOR_CONTACT: NumberType[] = [
  "PREMIUM_RATE",
  "SHARED_COST",
  "PAGER",
  "VOICEMAIL",
];
// undefined = the metadata can't classify a valid number; allowed, as on the backend.
const TYPES_ALLOWED_FOR_MOBILE: NumberType[] = ["MOBILE", "FIXED_LINE_OR_MOBILE", undefined];

export function exampleNumber(country: CountryCode): string | undefined {
  return getExampleNumber(country, examples)?.formatInternational();
}

function withExample(message: string, country: CountryCode | undefined): string {
  const sample = country ? exampleNumber(country) : undefined;
  return sample ? `${message} For example: ${sample}.` : message;
}

/** Instant, offline check of what the person typed. Never throws. */
export function checkPhone(
  input: string,
  opts: { defaultCountry?: CountryCode; requirement?: PhoneRequirement } = {},
): PhoneCheck {
  const defaultCountry = opts.defaultCountry ?? DEFAULT_PHONE_COUNTRY;
  const requirement = opts.requirement ?? "CONTACT";
  const text = input.trim();

  if (!text) return { ok: false, message: "Enter a phone number." };
  if (text.length > MAX_INPUT_LENGTH || !ALLOWED_INPUT.test(text)) {
    return {
      ok: false,
      message: "Phone numbers can only contain digits, spaces and the characters + ( ) - .",
    };
  }

  // "(+254) 712 345 678": libphonenumber (Python) tolerates the bracket before "+", the JS
  // port does not, so drop it here to keep both sides agreeing.
  const parseText = text.replace(/^[\s(]+(?=\+)/u, "");
  const hint = text.includes("+") ? undefined : defaultCountry;
  const lengthIssue = validatePhoneNumberLength(parseText, defaultCountry);
  if (lengthIssue === "INVALID_COUNTRY") {
    return {
      ok: false,
      message: "The country code isn't recognised. Start with + and a valid country code.",
    };
  }
  if (lengthIssue === "NOT_A_NUMBER") {
    return { ok: false, message: "This doesn't look like a phone number." };
  }
  if (lengthIssue === "TOO_SHORT") {
    return { ok: false, message: withExample("This phone number is too short.", hint) };
  }
  if (lengthIssue === "TOO_LONG") {
    return { ok: false, message: withExample("This phone number is too long.", hint) };
  }
  if (lengthIssue === "INVALID_LENGTH") {
    return {
      ok: false,
      message: withExample("This phone number has the wrong number of digits.", hint),
    };
  }

  const parsed = parsePhoneNumberFromString(parseText, { defaultCountry, extract: false });
  if (!parsed || parsed.ext) {
    return { ok: false, message: "This doesn't look like a phone number." };
  }
  if (!parsed.isValid()) {
    return {
      ok: false,
      message: withExample("This isn't a valid phone number for its country.", parsed.country ?? hint),
    };
  }

  const type = parsed.getType();
  const allowed =
    requirement === "MOBILE"
      ? TYPES_ALLOWED_FOR_MOBILE.includes(type)
      : !TYPES_BLOCKED_FOR_CONTACT.includes(type);
  if (!allowed) {
    return {
      ok: false,
      message:
        requirement === "MOBILE"
          ? "Enter a mobile phone number."
          : "Premium-rate, shared-cost, pager and voicemail numbers can't be used here.",
    };
  }

  return {
    ok: true,
    e164: parsed.number,
    international: parsed.formatInternational(),
    national: parsed.formatNational(),
    country: parsed.country,
    type,
  };
}

/**
 * For showing a stored number: "+254 712 345678". Never throws; empty -> `fallback`,
 * unparsable legacy text is shown as-is rather than hidden.
 */
export function formatPhoneDisplay(
  value: string | null | undefined,
  fallback = "—",
): string {
  const text = value?.trim();
  if (!text) return fallback;
  const parsed = parsePhoneNumberFromString(text, {
    defaultCountry: DEFAULT_PHONE_COUNTRY,
    extract: false,
  });
  return parsed ? parsed.formatInternational() : text;
}

/**
 * Numbers saved before libphonenumber may be "0712345678". The input component wants
 * E.164, so convert when we can; the next save then stores the clean form.
 */
export function coerceToE164(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "";
  if (text.startsWith("+")) return text;
  const parsed = parsePhoneNumberFromString(text, {
    defaultCountry: DEFAULT_PHONE_COUNTRY,
    extract: false,
  });
  return parsed?.isValid() ? parsed.number : "";
}

const TYPE_LABELS: Record<string, string> = {
  MOBILE: "Mobile",
  FIXED_LINE: "Landline",
  FIXED_LINE_OR_MOBILE: "Mobile or landline",
  TOLL_FREE: "Toll-free",
  VOIP: "VoIP",
  PERSONAL_NUMBER: "Personal number",
  UAN: "Universal access number",
  PREMIUM_RATE: "Premium rate",
  SHARED_COST: "Shared cost",
  PAGER: "Pager",
  VOICEMAIL: "Voicemail",
};

/** Works for the type names from both libphonenumber-js and the backend's `numberType`. */
export function phoneTypeLabel(type: string | undefined | null): string {
  return (type && TYPE_LABELS[type]) || "";
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : undefined;

export function countryName(code: string | undefined | null): string {
  if (!code) return "";
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Every country libphonenumber knows, for building a custom picker if you ever need one. */
export function phoneCountries(): { code: CountryCode; name: string; callingCode: string }[] {
  return getCountries()
    .map((code) => ({
      code,
      name: countryName(code),
      callingCode: getCountryCallingCode(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
