import { BulkProductActionResult } from "./type";

export function summarizeBulkProductResult(result: BulkProductActionResult, verb: string): string {
  const okCount = result.succeededIds.length;
  const failCount = result.failed.length;

  if (failCount === 0) {
    return `${verb}: ${okCount} product${okCount === 1 ? "" : "s"} updated.`;
  }

  const reasons = result.failed
    .map((f) => `• ${f.reason}`)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return [`${verb}: ${okCount} succeeded, ${failCount} skipped.`, "", ...reasons].join("\n");
}