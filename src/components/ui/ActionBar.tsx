"use client";

import { Check, Download, Link2, Printer, RotateCcw, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLocale } from "@/lib/locale-context";

/**
 * The button block under every calculator, tool and converter: Reset, Print,
 * Download CSV (when there is something tabular to export), Copy link and
 * Share. Every button is the same height and they sit on a 2-column grid, so
 * the edges line up; with CSV, Reset spans the full width above a 2 × 2 grid.
 * `layout="row"` (full-width cards such as the tools) puts every button in one
 * row of equal widths from tablet up, and 2 × 2 on phones.
 *
 * The share link is the current page unless `shareUrl` builds one carrying
 * the visitor's inputs - only when they ask, since those are their numbers.
 */
export function ActionBar({
  onReset,
  onDownloadCsv,
  shareUrl,
  shareTitle,
  shareNotice,
  layout = "grid",
  className = "",
}: {
  onReset: () => void;
  onDownloadCsv?: () => void;
  shareUrl?: () => string;
  shareTitle?: string;
  shareNotice?: string;
  layout?: "grid" | "row";
  className?: string;
}) {
  const { t } = useLocale();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const url = () => shareUrl?.() ?? window.location.href;

  const copyLink = async () => {
    const link = url();
    if (await copyText(link)) {
      setCopied(true);
      toast.show(t("toast.linkCopied"));
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    // The clipboard can be blocked (permissions, embedded browsers). Put the
    // link in the address bar instead and say so, rather than doing nothing.
    window.history.replaceState(null, "", link);
    toast.show(t("toast.copyFailed"), "info");
  };

  const share = async () => {
    if (!navigator.share) return copyLink();
    const data = { title: shareTitle ?? document.title, url: url() };
    try {
      if (navigator.canShare && !navigator.canShare(data)) return copyLink();
      await navigator.share(data);
    } catch (error) {
      // Closing the native sheet is intentional. Unsupported, blocked or
      // failed sharing still gives the visitor a usable link.
      if (error instanceof Error && error.name === "AbortError") return;
      await copyLink();
    }
  };

  const downloadCsv = onDownloadCsv
    ? () => {
        onDownloadCsv();
        toast.show(t("toast.downloaded"));
      }
    : undefined;

  // Fit the result column, which can be narrow even on a wide viewport.
  // Labels need their own shrinking flex item and room to grow vertically.
  const buttonClass =
    "btn btn-outline btn-md h-auto min-h-[2.75rem] w-full min-w-0 gap-1.5 px-2.5 py-2 whitespace-normal text-center leading-tight hyphens-auto";
  const iconClass = "h-4 w-4 shrink-0";
  const labelClass = "min-w-0 [overflow-wrap:anywhere]";

  return (
    <div
      className={`grid grid-cols-2 gap-3 border-t border-border pt-7 print:hidden ${
        layout === "row" ? "sm:grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))]" : ""
      } ${className}`}
    >
      <Button
        variant="outline"
        size="md"
        className={`h-auto min-h-[2.75rem] w-full min-w-0 px-2.5 py-2 whitespace-normal ${downloadCsv ? (layout === "row" ? "col-span-2 sm:col-span-1" : "col-span-2") : ""}`}
        onClick={onReset}
        icon={<RotateCcw className="transition-transform duration-500 group-hover:-rotate-180" />}
      >
        <span className={labelClass}>{t("common.reset")}</span>
      </Button>
      <button type="button" onClick={() => window.print()} className={buttonClass}>
        <Printer aria-hidden className={iconClass} />
        <span className={labelClass}>{t("actions.print")}</span>
      </button>
      {downloadCsv ? (
        <button type="button" onClick={downloadCsv} className={buttonClass}>
          <Download aria-hidden className={iconClass} />
          <span className={labelClass}>{t("actions.downloadCsv")}</span>
        </button>
      ) : null}
      <button type="button" onClick={copyLink} className={buttonClass}>
        {copied ? (
          <Check aria-hidden className="h-4 w-4 shrink-0 text-[var(--tone-green-fg)]" />
        ) : (
          <Link2 aria-hidden className={iconClass} />
        )}
        <span className={labelClass}>{copied ? t("common.copied") : t(shareUrl ? "common.copyLink" : "actions.copyToolLink")}</span>
      </button>
      <button type="button" onClick={share} className={buttonClass}>
        <Share2 aria-hidden className={iconClass} />
        <span className={labelClass}>{t(shareUrl ? "actions.share" : "actions.shareTool")}</span>
      </button>
      {shareNotice ? <p className="col-span-full text-xs leading-relaxed text-muted">{shareNotice}</p> : null}
    </div>
  );
}

/**
 * Copies text, falling back to the older selection-based copy where the async
 * Clipboard API is missing or refused. Resolves to whether it worked.
 */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fall through to the older method.
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(field);
  field.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  field.remove();
  return copied;
}
