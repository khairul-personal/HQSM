import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  defaultInstitutionSettings,
  recordSettingsChange,
  type InstitutionSettings,
  type SettingsAudit,
  type SettingsChange,
} from "./settings-domain";

type SettingsContextValue = {
  settings: InstitutionSettings;
  audit: SettingsAudit[];
  save: (next: InstitutionSettings, change: SettingsChange, reason?: string) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);
const SETTINGS_KEY = "hqs-institution-settings";
const AUDIT_KEY = "hqs-settings-audit";

export function InstitutionSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<InstitutionSettings>(() => {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "") as InstitutionSettings;
    } catch {
      return structuredClone(defaultInstitutionSettings);
    }
  });
  const [audit, setAudit] = useState<SettingsAudit[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]") as SettingsAudit[];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem(AUDIT_KEY, JSON.stringify(audit)), [audit]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      audit,
      save(next, change, reason) {
        const entry = recordSettingsChange(change, { actorId: "ADM-001", reason });
        setSettings(next);
        setAudit((current) => [entry, ...current]);
      },
    }),
    [audit, settings],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useInstitutionSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useInstitutionSettings must be used within its provider");
  return value;
}
