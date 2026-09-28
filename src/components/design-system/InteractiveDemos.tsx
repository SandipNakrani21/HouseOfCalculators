"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, FactList, Input, ResultBox, SegmentedControl, Select, Slider, Switch } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { TabList } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";

/** The design-system page's live examples of the stateful components. */
export function FormDemo() {
  const [amount, setAmount] = useState(250000);
  const [rate, setRate] = useState(7.5);
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");
  const [extra, setExtra] = useState(true);
  const monthly = (amount * (rate / 1200)) / (1 - Math.pow(1 + rate / 1200, -240));

  return (
    <div className="card @container p-5 sm:p-8">
      <div className="grid gap-8 @2xl:grid-cols-2 @2xl:gap-10">
        <div className="space-y-5">
          <Field label="Loan amount" hint="Input: type an exact figure.">
            {(id) => (
              <Input id={id} type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value) || 0)} />
            )}
          </Field>
          <div className="space-y-2">
            <p className="field-label">Interest rate: {rate}%</p>
            <Slider aria-label="Interest rate" min={1} max={20} step={0.5} value={rate} onChange={(event) => setRate(Number(event.target.value))} />
          </div>
          <Field label="Term">{(id) => (
            <Select id={id} defaultValue="20">
              <option value="10">10 years</option>
              <option value="20">20 years</option>
              <option value="30">30 years</option>
            </Select>
          )}</Field>
          <SegmentedControl
            label="Frequency (radio group)"
            value={frequency}
            onChange={setFrequency}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <Switch label="Include fees" hint="Switch: an on/off choice." checked={extra} onChange={setExtra} />
        </div>
        <div className="space-y-4 @2xl:border-s @2xl:border-border @2xl:ps-10">
          <ResultBox
            label={frequency === "monthly" ? "Monthly payment" : "Yearly payment"}
            value={`$${Math.round(frequency === "monthly" ? monthly : monthly * 12).toLocaleString("en-US")}`}
          />
          <FactList
            items={[
              { label: "Principal", value: `$${amount.toLocaleString("en-US")}`, marker: "var(--tone-principal)" },
              { label: "Rate", value: `${rate}%`, marker: "var(--tone-returns)" },
              { label: "Fees", value: extra ? "Included" : "None", marker: "var(--tone-tax)" },
            ]}
          />
          <ResultBox tone="quiet" size="md" label="Quiet result box" value="For warnings and empty states" />
        </div>
      </div>
    </div>
  );
}

export function OverlayDemo() {
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState<"yearly" | "monthly" | "table">("yearly");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast.show("Link copied to your clipboard")}>Show a toast</Button>
        <Button variant="outline" onClick={() => toast.show("Something worth knowing", "info")}>Info toast</Button>
        <Button variant="outline" onClick={() => setModal(true)}>Open modal</Button>
        <Button variant="ghost" onClick={() => setDrawer(true)}>Open drawer</Button>
      </div>

      <div className="card p-5">
        <TabList
          label="Example tabs"
          idPrefix="demo"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "yearly", label: "Yearly" },
            { id: "monthly", label: "Monthly" },
            { id: "table", label: "Table" },
          ]}
        />
        <p role="tabpanel" aria-labelledby={`demo-${tab}`} className="mt-4 text-sm text-muted">
          The {tab} panel. Arrow keys, Home and End move between tabs.
        </p>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} label="Example" closeLabel="Close" title="A modal dialog">
        <p className="text-sm text-muted">Escape or a click outside closes it. Focus stays inside while it is open.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={() => setModal(false)}>Confirm</Button>
        </div>
      </Modal>
      <Modal open={drawer} onClose={() => setDrawer(false)} variant="drawer" label="Example drawer" closeLabel="Close" title="A drawer">
        <p className="text-sm text-muted">The mobile menu uses this variant. It slides in from the end edge.</p>
      </Modal>
    </div>
  );
}
