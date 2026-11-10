/**
 * Development-only inspector: every test control (role, subscription mode, data fixtures, offline)
 * lives here, apart from product UI. Shown in `vite dev`; in a built copy it appears only after
 * `localStorage.setItem("madrasa.dev-inspector", "1")`.
 */
import { useEffect, useRef, useState } from "react";
import { Wrench, X } from "lucide-react";
import { appRoutes, type AppSection } from "../app-routes";
import type { SubscriptionMode } from "../subscription-domain";
import { prototypeRoles, staffRoleKeys, type PrototypeRole } from "../student-permissions";
import { useSubscription } from "../SystemStates";
import { useShellState, type FixtureState } from "./ShellState";

export function devInspectorEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return window.localStorage.getItem("madrasa.dev-inspector") === "1";
  } catch {
    return false;
  }
}

const fixtures: [FixtureState, string][] = [
  ["live", "Data"],
  ["loading", "Loading"],
  ["empty", "Empty (zeros)"],
  ["error", "Unavailable"],
];

export default function DevInspector({
  role,
  setRole,
  activeSection,
}: {
  role: PrototypeRole;
  setRole: (role: PrototypeRole) => void;
  activeSection?: AppSection;
}) {
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useSubscription();
  const { fixture, setFixture, forceOffline, setForceOffline } = useShellState();
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("select")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!devInspectorEnabled()) return null;

  // Same narrowing as before: some screens only make sense for a subset of roles.
  const roleKeys: PrototypeRole[] =
    activeSection === "staff"
      ? staffRoleKeys
      : activeSection === "admissions"
        ? ["admin", "admission-officer"]
        : (Object.keys(prototypeRoles) as PrototypeRole[]);
  const changed = fixture !== "live" || forceOffline || mode !== "active";

  return (
    <div className="dev" lang="en">
      <button
        type="button"
        ref={toggle}
        className="dev-toggle"
        aria-expanded={open}
        aria-controls="dev-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <Wrench size={16} aria-hidden="true" />
        DEV
        {changed && <i aria-label="test state active" />}
      </button>
      {open && (
        <div
          id="dev-panel"
          className="dev-panel"
          role="region"
          aria-label="Development inspector"
          ref={panel}
        >
          <header>
            <b>Development inspector</b>
            <button type="button" aria-label="Close inspector" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </header>
          <p>Test controls only. Not part of the product.</p>
          <label>
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as PrototypeRole)}>
              {!roleKeys.includes(role) && (
                <option value={role}>{prototypeRoles[role].label}</option>
              )}
              {roleKeys.map((key) => (
                <option key={key} value={key}>
                  {prototypeRoles[key].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Subscription</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as SubscriptionMode)}
            >
              <option value="active">Active</option>
              <option value="grace">Grace · 14 days</option>
              <option value="limited">Limited · 30 days</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
          <fieldset>
            <legend>Dashboard data fixture</legend>
            {fixtures.map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="dev-fixture"
                  checked={fixture === value}
                  onChange={() => setFixture(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="dev-check">
            <input
              type="checkbox"
              checked={forceOffline}
              onChange={(event) => setForceOffline(event.target.checked)}
            />
            Force offline
          </label>
          <nav aria-label="Prototype pages">
            <a href={`#${appRoutes.designSystem}`}>Design system</a>
            <a href={`#${appRoutes.systemStates}`}>System states</a>
            <a href={`#${appRoutes.guardian}`} onClick={() => setRole("guardian")}>
              Guardian home
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
