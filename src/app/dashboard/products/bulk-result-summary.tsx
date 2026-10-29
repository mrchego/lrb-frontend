import { toast, type ToastOptions } from "react-toastify";
import { BulkProductActionResult } from "./type";

export function notifyBulkProductResult(
  result: BulkProductActionResult,
  verb: string,
): void {
  const okCount = result.succeededIds.length;
  const failCount = result.failed.length;

  if (failCount === 0) {
    toast.success(
      `${verb}: ${okCount} product${okCount === 1 ? "" : "s"} updated.`,
    );
    return;
  }

  const reasons = Array.from(new Set(result.failed.map((f) => f.reason)));
  const reasonLines = reasons.map((r) => `• ${r}`).join("\n");

  const options: ToastOptions = {
    style: { whiteSpace: "pre-line" },
    autoClose: 8000,
  };

  if (okCount === 0) {
    toast.error(`${verb}: no products were updated.\n${reasonLines}`, options);
  } else {
    toast.warning(
      `${verb}: ${okCount} succeeded, ${failCount} skipped.\n${reasonLines}`,
      options,
    );
  }
}