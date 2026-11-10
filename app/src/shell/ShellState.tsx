/**
 * Shell-wide state: the one institution / branch / session scope, and the development-only
 * inspector state (test fixtures). Screens read the scope from here instead of keeping their own filter.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DashboardScope } from "../dashboard-domain";
import { sessions } from "../dashboard-data";

export const institutionName = "হলি কুরআন স্কুল এন্ড মাদরাসা";

export const branchLabel: Record<DashboardScope["branch"], string> = {
  all: "সকল শাখা",
  boys: "বালক শাখা",
  girls: "বালিকা শাখা",
};

/** Fixture picked in the development inspector. "live" = whatever the data source returns. */
export type FixtureState = "live" | "loading" | "empty" | "error";

type ShellState = {
  branch: DashboardScope["branch"];
  session: string;
  setBranch: (branch: DashboardScope["branch"]) => void;
  setSession: (session: string) => void;
  sessions: string[];
  fixture: FixtureState;
  setFixture: (state: FixtureState) => void;
  forceOffline: boolean;
  setForceOffline: (value: boolean) => void;
};

const ShellStateContext = createContext<ShellState | null>(null);

export function ShellStateProvider({ children }: { children: ReactNode }) {
  const [branch, setBranch] = useState<DashboardScope["branch"]>("all");
  const [session, setSession] = useState(sessions[0]);
  const [fixture, setFixture] = useState<FixtureState>("live");
  const [forceOffline, setForceOffline] = useState(false);
  const value = useMemo(
    () => ({
      branch,
      session,
      setBranch,
      setSession,
      sessions,
      fixture,
      setFixture,
      forceOffline,
      setForceOffline,
    }),
    [branch, session, fixture, forceOffline],
  );
  return <ShellStateContext.Provider value={value}>{children}</ShellStateContext.Provider>;
}

export function useShellState(): ShellState {
  const value = useContext(ShellStateContext);
  if (!value) throw new Error("useShellState must be used inside ShellStateProvider");
  return value;
}

/** The scope a viewer actually gets: a branch they may not see falls back to their first allowed one. */
export function effectiveBranch(
  branch: DashboardScope["branch"],
  allowed: DashboardScope["branch"][],
): DashboardScope["branch"] {
  return allowed.includes(branch) ? branch : (allowed[0] ?? "boys");
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** Real connection state, or the inspector's forced-offline fixture. */
export function useOffline(): boolean {
  const { forceOffline } = useShellState();
  const [offline, setOffline] = useState(() =>
    typeof navigator === "undefined" ? false : !navigator.onLine,
  );
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return offline || forceOffline;
}
