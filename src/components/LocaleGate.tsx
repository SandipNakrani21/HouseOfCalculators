"use client";

import { useState, useSyncExternalStore } from "react";

import { LocaleDialog } from "@/components/LocaleDialog";
import { hasStoredLocale } from "@/lib/locale-cookie";

/** The cookie never changes without a full navigation, so there is nothing to subscribe to. */
const subscribe = () => () => {};

/**
 * Opens the country and language picker on a first visit, before a choice has
 * been stored. The cookie is read as an external store so pages stay
 * statically rendered - reading it on the server would make every page
 * dynamic - and the server snapshot assumes a choice exists so the dialog
 * never flashes for returning visitors.
 */
export function LocaleGate() {
  const stored = useSyncExternalStore(
    subscribe,
    hasStoredLocale,
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);

  return (
    <LocaleDialog
      open={!stored && !dismissed}
      mode="gate"
      onClose={() => setDismissed(true)}
    />
  );
}
