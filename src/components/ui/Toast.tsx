"use client";

import { CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Short notifications in the corner: "Link copied", "Downloaded".
 *
 *   const toast = useToast();
 *   toast.show(t("common.copied"));              // success
 *   toast.show("Something to know", "info");
 *
 * ToastProvider is mounted once in the locale layout. Messages are announced
 * through a polite live region and dismiss themselves after four seconds.
 */

type Kind = "success" | "info";
type Message = { id: number; text: string; kind: Kind };
type ToastApi = { show: (text: string, kind?: Kind) => void };

const ToastContext = createContext<ToastApi>({ show: () => {} });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

export function ToastProvider({ children, closeLabel }: { children: ReactNode; closeLabel: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const next = useRef(0);

  const dismiss = useCallback((id: number) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const show = useCallback(
    (text: string, kind: Kind = "success") => {
      const id = ++next.current;
      // At most three at once; the oldest makes way.
      setMessages((current) => [...current.slice(-2), { id, text, kind }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {messages.map((message) => {
          const Icon = message.kind === "success" ? CheckCircle2 : Info;
          return (
            <div
              key={message.id}
              role="status"
              className="animate-toast pointer-events-auto flex min-w-[240px] max-w-sm items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-semibold text-heading shadow-lift"
            >
              <Icon aria-hidden className={`h-5 w-5 shrink-0 ${message.kind === "success" ? "text-[var(--tone-green-fg)]" : "text-primary"}`} />
              <span className="flex-1">{message.text}</span>
              <button
                type="button"
                onClick={() => dismiss(message.id)}
                aria-label={closeLabel}
                className="grid h-7 w-7 place-items-center rounded-sm text-muted transition-colors hover:bg-bg-soft hover:text-heading"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
