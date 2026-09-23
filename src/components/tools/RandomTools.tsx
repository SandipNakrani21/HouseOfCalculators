"use client";

import { useState } from "react";

import {
  Field,
  ToolCard,
  ToolFacts,
  ToolFields,
  ToolResult,
  inputClass,
} from "@/components/tools/ToolShell";
import { useLocale } from "@/lib/locale-context";
import {
  flipCoins,
  parseEntries,
  rollDice,
  shuffle,
  splitTeams,
} from "@/lib/tools/random";

/**
 * The draw tools.
 *
 * All of them go through the shared CSPRNG helpers rather than Math.random.
 * People use these to settle things, and a visible bias would make them
 * useless for exactly the purpose they are reached for.
 */

const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

export function DiceRollerTool() {
  const { t, fmt } = useLocale();
  const [count, setCount] = useState(2);
  const [sides, setSides] = useState(6);
  const [rolls, setRolls] = useState<number[]>([]);

  const total = rolls.reduce((sum, roll) => sum + roll, 0);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.diceCount")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(event) =>
                setCount(Math.min(Math.max(Math.floor(Number(event.target.value)) || 1, 1), 100))
              }
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
        <Field label={t("tool.field.diceSides")}>
          {(id) => (
            <select
              id={id}
              value={sides}
              onChange={(event) => setSides(Number(event.target.value))}
              className={inputClass}
            >
              {DICE_SIDES.map((option) => (
                <option key={option} value={option}>
                  d{option}
                </option>
              ))}
            </select>
          )}
        </Field>
      </ToolFields>

      <button
        type="button"
        onClick={() => setRolls(rollDice(count, sides))}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-contrast sm:w-auto"
      >
        {t("tool.action.roll")}
      </button>

      {rolls.length ? (
        <>
          <ToolResult label={t("tool.result.total")} value={fmt.number(total)} tone="primary" />
          <ToolFacts
            items={[
              { label: t("tool.result.rolls"), value: rolls.join(", ") },
              { label: t("tool.result.highest"), value: fmt.number(Math.max(...rolls)) },
              { label: t("tool.result.lowest"), value: fmt.number(Math.min(...rolls)) },
              {
                label: t("tool.result.average"),
                value: fmt.number(Math.round((total / rolls.length) * 100) / 100, {
                  decimals: 2,
                }),
              },
            ]}
          />
        </>
      ) : null}
    </ToolCard>
  );
}

export function CoinFlipTool() {
  const { t, fmt } = useLocale();
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<ReturnType<typeof flipCoins> | null>(null);

  return (
    <ToolCard>
      <ToolFields>
        <Field label={t("tool.field.flipCount")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(event) =>
                setCount(Math.min(Math.max(Math.floor(Number(event.target.value)) || 1, 1), 1000))
              }
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </ToolFields>

      <button
        type="button"
        onClick={() => setResult(flipCoins(count))}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-contrast sm:w-auto"
      >
        {t("tool.action.flip")}
      </button>

      {result ? (
        <>
          <ToolResult
            label={t("tool.result.flip")}
            value={
              result.flips.length === 1
                ? t(`tool.result.${result.flips[0]}`)
                : `${fmt.number(result.heads)} / ${fmt.number(result.tails)}`
            }
            tone="primary"
            detail={
              result.flips.length === 1
                ? undefined
                : t("tool.result.flipDetail", {
                    heads: fmt.number(result.heads),
                    tails: fmt.number(result.tails),
                  })
            }
          />
          {result.flips.length > 1 ? (
            <ToolFacts
              items={[
                { label: t("tool.result.heads"), value: fmt.number(result.heads) },
                { label: t("tool.result.tails"), value: fmt.number(result.tails) },
                {
                  label: t("tool.result.headsShare"),
                  value: `${fmt.number((result.heads / result.flips.length) * 100, { decimals: 1 })}%`,
                },
              ]}
            />
          ) : null}
        </>
      ) : null}
    </ToolCard>
  );
}

const SAMPLE_NAMES = "Ana\nBen\nChloe\nDiego\nEve\nFarid\nGrace\nHugo";

export function RandomPickerTool() {
  const { t, fmt } = useLocale();
  const [names, setNames] = useState(SAMPLE_NAMES);
  const [teams, setTeams] = useState(2);
  const [picked, setPicked] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[][]>([]);

  const entries = parseEntries(names);

  return (
    <ToolCard>
      <div className="space-y-1.5">
        <label htmlFor="picker-names" className="block text-sm font-medium">
          {t("tool.field.names")}
        </label>
        <textarea
          id="picker-names"
          rows={6}
          value={names}
          onChange={(event) => setNames(event.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-muted">{t("tool.hint.names")}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={entries.length === 0}
          onClick={() => {
            setPicked(shuffle(entries)[0] ?? null);
            setOrder([]);
            setGroups([]);
          }}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-contrast disabled:opacity-50"
        >
          {t("tool.action.pickOne")}
        </button>
        <button
          type="button"
          disabled={entries.length === 0}
          onClick={() => {
            setOrder(shuffle(entries));
            setPicked(null);
            setGroups([]);
          }}
          className="rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {t("tool.action.shuffle")}
        </button>
        <button
          type="button"
          disabled={entries.length === 0}
          onClick={() => {
            setGroups(splitTeams(entries, teams));
            setPicked(null);
            setOrder([]);
          }}
          className="rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {t("tool.action.makeTeams")}
        </button>
      </div>

      <div className="mt-4 max-w-40">
        <Field label={t("tool.field.teamCount")}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={2}
              max={20}
              value={teams}
              onChange={(event) =>
                setTeams(Math.min(Math.max(Math.floor(Number(event.target.value)) || 2, 2), 20))
              }
              className={`tabular ${inputClass}`}
            />
          )}
        </Field>
      </div>

      {picked ? (
        <ToolResult label={t("tool.result.picked")} value={picked} tone="primary" />
      ) : null}

      {order.length ? (
        <ToolFacts
          items={order.map((name, index) => ({
            label: `${fmt.number(index + 1)}.`,
            value: name,
          }))}
        />
      ) : null}

      {groups.length ? (
        <ToolFacts
          items={groups.map((group, index) => ({
            label: t("tool.result.team", { number: fmt.number(index + 1) }),
            value: group.join(", ") || "—",
          }))}
        />
      ) : null}

      <p className="mt-4 text-xs text-muted">
        {t("tool.hint.entryCount", { count: fmt.number(entries.length) })}
      </p>
    </ToolCard>
  );
}
