"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { useLocale } from "@/lib/locale-context";
import { integerDigits, numberError, normalizeNumericInput, toolRules, MAX_LIST_ITEMS, MAX_LIST_CHARACTERS } from "@/lib/validation";

type ValidationState = { invalid: boolean; report: (id: string, invalid: boolean) => void };
export const ToolValidationContext = createContext<ValidationState>({ invalid: false, report: () => {} });
export function ToolValidationProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const report = useCallback((id: string, invalid: boolean) => setErrors(current => current[id] === invalid ? current : { ...current, [id]: invalid }), []);
  const value = useMemo(() => ({ invalid: Object.values(errors).some(Boolean), report }), [errors, report]);
  return <ToolValidationContext.Provider value={value}>{children}</ToolValidationContext.Provider>;
}
export function NumberInput({ rule = "number", errorKey, value, onValueChange, min, max, ...props }: Omit<ComponentProps<"input">, "onChange"> & { rule?: string; errorKey?: string; onValueChange: (value: number) => void }) {
  const { t, fmt, countryCode } = useLocale();
  const { report } = useContext(ToolValidationContext);
  const key = useId();
  const [edit, setEdit] = useState({ raw: String(value ?? ""), accepted: value });
  if (edit.accepted !== value) setEdit({ raw: String(value ?? ""), accepted: value });
  const defaults = toolRules(rule, countryCode);
  const rules = { ...defaults, min: min === undefined ? defaults.min : Number(min), max: max === undefined ? defaults.max : Math.min(Number(max), defaults.max) };
  const error = numberError(normalizeNumericInput(edit.raw, fmt.locale), rules);
  const externalInvalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
  useEffect(() => { report(key, !!error || !!errorKey || externalInvalid); return () => report(key, false); }, [error, errorKey, externalInvalid, key, report]);
  const money = ["target", "currentSavings", "balance", "monthlyDeposit", "monthlyPayment", "monthlyIncome"].includes(rule);
  const show = (n: number) => money ? fmt.currency(n, { decimals: rules.decimals }) : fmt.number(n, { decimals: n % 1 ? rules.decimals : 0 });
  const params = { min: show(rules.min), max: show(rules.max), digits: integerDigits(rules), decimals: rules.decimals };
  return <div className="min-w-0 space-y-2">
    <input {...props} type="text" maxLength={32} inputMode={rules.integer ? "numeric" : "decimal"} value={edit.raw}
      aria-invalid={!!error || !!errorKey || externalInvalid} aria-describedby={[props["aria-describedby"], `${key}-bounds`, error || errorKey ? `${key}-error` : ""].filter(Boolean).join(" ")}
      onChange={event => {
        const raw = event.target.value;
        const normalized = normalizeNumericInput(raw, fmt.locale);
        const invalid = numberError(normalized, rules);
        report(key, !!invalid || !!errorKey || externalInvalid);
        setEdit({ raw, accepted: invalid ? value : Number(normalized) });
        if (!invalid) onValueChange(Number(normalized));
      }} />
    <p id={`${key}-bounds`} className="field-hint">{t("validation.bounds", params)}</p>
    {error || errorKey ? <p id={`${key}-error`} role="status" className="text-sm text-alert">{t(errorKey ?? `validation.${error}`, params)}</p> : null}
  </div>;
}
export function ToolButton(props: ComponentProps<"button">) {
  const { invalid } = useContext(ToolValidationContext);
  return <button {...props} disabled={props.disabled || invalid} />;
}
export function EntryInput({ multiline = false, error, value, onChange, ...props }: Omit<ComponentProps<"textarea">, "onChange"> & { multiline?: boolean; error?: string; onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }) {
  const { t } = useLocale();
  const { report } = useContext(ToolValidationContext);
  const key = useId(), raw = String(value ?? "");
  const count = raw.split(/[\n,]+/).filter(x => x.trim()).length;
  const invalid = !!error || !raw.trim() || raw.length > MAX_LIST_CHARACTERS || (multiline && count > MAX_LIST_ITEMS);
  useEffect(() => { report(key, invalid); return () => report(key, false); }, [invalid, key, report]);
  const common = { id: props.id, className: props.className, value, onChange, maxLength: MAX_LIST_CHARACTERS, "aria-invalid": invalid, "aria-describedby": [props["aria-describedby"], invalid ? `${key}-error` : ""].filter(Boolean).join(" ") };
  return <div className="space-y-2">{multiline ? <textarea {...common} rows={props.rows} /> : <input {...common} type="text" />}
    {invalid ? <p id={`${key}-error`} role="status" className="text-sm text-alert">{error ?? t(raw.trim() ? "validation.entries" : "validation.required", { count: MAX_LIST_ITEMS })}</p> : null}
  </div>;
}
