// lib/use-phone-inspection.ts
"use client";

import { useEffect, useState } from "react";
import { gqlFetch } from "@/lib/graphql-client";
import type { PhoneRequirement } from "@/lib/phone";

export const INSPECT_PHONE_QUERY = `
  query InspectPhone($phone: String!, $requirement: PhoneRequirement) {
    inspectPhone(phone: $phone, requirement: $requirement) {
      ok
      issue
      message
      info {
        e164 international national
        countryCode regionCode numberType isValid
        location originalCarrier timeZones
      }
    }
  }
`;

export type PhoneInspection = {
  ok: boolean;
  issue: string | null;
  message: string | null;
  info: {
    e164: string;
    international: string;
    national: string;
    countryCode: number;
    regionCode: string | null;
    numberType: string;
    isValid: boolean;
    location: string;
    /** Original allocation of the number range - NOT a live lookup (see backend docs). */
    originalCarrier: string;
    timeZones: string[];
  } | null;
};

/**
 * What the server (the real libphonenumber) says about `e164`: carrier, location, time
 * zone, and whether our stricter backend rules accept it. Signed-in screens only.
 *
 * Debounced, and only meant to be fed numbers that already passed the offline check,
 * so typing never hammers the API. Failures (offline, rate-limited) just mean "no
 * extra info": the hint is a nicety, the save-time validation is the real gate.
 */
export function usePhoneInspection(
  e164: string | undefined,
  { enabled, requirement }: { enabled: boolean; requirement: PhoneRequirement },
): PhoneInspection | null {
  // Keep the answer together with the number it was for, so a stale answer can never
  // be shown next to a newer number (and no setState is needed to "clear" it).
  const [answer, setAnswer] = useState<{ phone: string; data: PhoneInspection } | null>(null);

  useEffect(() => {
    if (!enabled || !e164) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await gqlFetch<{ inspectPhone: PhoneInspection }>(INSPECT_PHONE_QUERY, {
          phone: e164,
          requirement,
        });
        if (!cancelled) setAnswer({ phone: e164, data: data.inspectPhone });
      } catch {
        /* optional hint - ignore */
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [e164, enabled, requirement]);

  return enabled && e164 && answer?.phone === e164 ? answer.data : null;
}
