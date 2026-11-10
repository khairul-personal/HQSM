/**
 * Shared application shell (PRD 12.3): white 264px sidebar (72px collapsed), 64px top bar, one scope
 * control, Ctrl/Cmd+K page search, phone drawer + bottom navigation. Menu entries come from the shared
 * resolver (resolveNavigation); hiding an entry is never the authorization itself.
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  ChevronsUpDown,
  ClipboardList,
  FileText,
  HandCoins,
  IdCard,
  Languages,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldAlert,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { sectionPath, type AppSection } from "../app-routes";
import { bn } from "../bn-format";
import { resolveScopeBranches } from "../dashboard-domain";
import { useInstitutionSettings } from "../InstitutionSettingsContext";
import { isPhotoVisible } from "../settings-domain";
import {
  prototypeRoles,
  resolveBottomNavigation,
  resolveNavigation,
  type NavSection,
  type PrototypeRole,
} from "../student-permissions";
import { SubscriptionBanner, useSubscription } from "../SystemStates";
import { Popover } from "./Popover";
import {
  branchLabel,
  effectiveBranch,
  institutionName,
  useMediaQuery,
  useShellState,
} from "./ShellState";
import "./shell.css";

type NavItem = { label: string; short: string; icon: LucideIcon; pending?: number };

/** `pending` = actionable items waiting (demo counts); totals are never shown as badges. */
const navItems: Record<NavSection, NavItem> = {
  dashboard: { label: "ড্যাশবোর্ড", short: "ড্যাশবোর্ড", icon: LayoutDashboard },
  admissions: { label: "ভর্তি ব্যবস্থাপনা", short: "ভর্তি", icon: ClipboardList, pending: 14 },
  students: { label: "শিক্ষার্থী", short: "শিক্ষার্থী", icon: Users },
  attendance: { label: "আজ ও হাজিরা", short: "হাজিরা", icon: IdCard },
  homework: { label: "হোমওয়ার্ক", short: "হোমওয়ার্ক", icon: BookOpenCheck, pending: 6 },
  examPapers: { label: "প্রশ্নপত্র", short: "প্রশ্নপত্র", icon: FileText, pending: 3 },
  fees: { label: "ফি ও পেমেন্ট", short: "ফি", icon: WalletCards },
  sponsorships: { label: "স্পন্সরশিপ ও ফান্ড", short: "ফান্ড", icon: HandCoins, pending: 4 },
  staff: { label: "শিক্ষক ও কর্মচারী", short: "কর্মী", icon: BriefcaseBusiness },
  settings: { label: "সেটিংস", short: "সেটিংস", icon: Settings },
};

const navGroups: { caption: string; sections: NavSection[] }[] = [
  { caption: "ওভারভিউ", sections: ["dashboard"] },
  {
    caption: "একাডেমিক",
    sections: ["admissions", "students", "attendance", "homework", "examPapers"],
  },
  { caption: "অর্থ", sections: ["fees", "sponsorships"] },
  { caption: "প্রশাসন", sections: ["staff"] },
  { caption: "ব্যবস্থাপনা", sections: ["settings"] },
];

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const collapsedKey = "madrasa.sidebar-collapsed";

export default function AppShell({
  children,
  role,
  activeSection = "students",
  onNavigate,
}: {
  children: ReactNode;
  role: PrototypeRole;
  /** Kept for existing call sites; the role switcher now lives in the development inspector. */
  setRole?: (role: PrototypeRole) => void;
  activeSection?: AppSection;
  onNavigate?: (section: AppSection) => void;
}) {
  const { settings } = useInstitutionSettings();
  const { mode } = useSubscription();
  const photosVisible = isPhotoVisible(settings, "main");
  const context = prototypeRoles[role].context;
  const allowed = useMemo(() => resolveNavigation(context), [context]);
  const bottom = useMemo(() => resolveBottomNavigation(context), [context]);

  const isPhone = useMediaQuery("(max-width: 767.98px)");
  const isRail = useMediaQuery("(min-width: 768px) and (max-width: 1279.98px)");
  const [userCollapsed, setUserCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(collapsedKey) === "1";
    } catch {
      return false;
    }
  });
  const collapsed = !isPhone && (isRail || userCollapsed);
  const toggleCollapsed = () => {
    setUserCollapsed((value) => {
      try {
        window.localStorage.setItem(collapsedKey, value ? "0" : "1");
      } catch {
        // storage blocked: the choice lasts for this visit only
      }
      return !value;
    });
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const side = useRef<HTMLElement>(null);
  const closeDrawer = (restoreFocus = true) => {
    setDrawerOpen(false);
    if (restoreFocus) moreButton.current?.focus();
  };
  useEffect(() => {
    if (!isPhone) setDrawerOpen(false);
  }, [isPhone]);
  useEffect(() => {
    if (!drawerOpen) return;
    side.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [tip, setTip] = useState<{ text: string; top: number } | null>(null);
  const showTip = (event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>, text: string) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTip({ text, top: rect.top + rect.height / 2 });
  };

  const go = (section: AppSection) => {
    setDrawerOpen(false);
    setTip(null);
    onNavigate?.(section);
  };
  const linkProps = (section: NavSection) => ({
    href: `#${sectionPath(section)}`,
    "aria-current": activeSection === section ? ("page" as const) : undefined,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      go(section);
    },
  });

  const limitedAccess = !context.girlsSectionAccess;
  const crest = `${import.meta.env.BASE_URL}crest.png`;

  return (
    <div
      className={`student-shell sh ds-page ${photosVisible ? "" : "photos-hidden"}`}
      data-collapsed={collapsed}
      data-drawer={drawerOpen}
    >
      <a className="sh-skip" href="#sh-main">
        মূল অংশে যান
      </a>
      {drawerOpen && (
        <button
          type="button"
          className="sh-backdrop"
          aria-label="মেনু বন্ধ করুন"
          tabIndex={-1}
          onClick={() => closeDrawer()}
        />
      )}
      <aside
        className="sh-side"
        ref={side}
        aria-label="সাইডবার"
        // On phones the sidebar is an off-canvas drawer: unreachable until it is opened.
        inert={isPhone && !drawerOpen}
      >
        <div className="sh-brand">
          <img src={crest} alt="" width={36} height={36} />
          <div className="sh-brand-name">
            <b>হলি কুরআন</b>
            <small>স্কুল এন্ড মাদরাসা</small>
          </div>
          {isPhone ? (
            <button
              type="button"
              className="sh-icon-button"
              aria-label="মেনু বন্ধ করুন"
              onClick={() => closeDrawer()}
            >
              <X size={20} />
            </button>
          ) : (
            !isRail && (
              <button
                type="button"
                className="sh-icon-button sh-collapse"
                aria-label={collapsed ? "সাইডবার বড় করুন" : "সাইডবার ছোট করুন"}
                aria-pressed={collapsed}
                onClick={toggleCollapsed}
                onMouseEnter={(event) => showTip(event, "সাইডবার বড় করুন")}
                onMouseLeave={() => setTip(null)}
                onFocus={(event) => showTip(event, "সাইডবার বড় করুন")}
                onBlur={() => setTip(null)}
              >
                {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
            )
          )}
        </div>
        <nav className="sh-nav" aria-label="প্রধান নেভিগেশন" onScroll={() => setTip(null)}>
          {navGroups.map((group) => {
            const sections = group.sections.filter((section) => allowed.includes(section));
            if (sections.length === 0) return null;
            return (
              <div key={group.caption} role="group" aria-label={group.caption}>
                <p className="sh-caption" aria-hidden="true">
                  {group.caption}
                </p>
                {sections.map((section) => {
                  const item = navItems[section];
                  const Icon = item.icon;
                  return (
                    <a
                      key={section}
                      className="sh-link"
                      {...linkProps(section)}
                      aria-label={
                        item.pending ? `${item.label}, ${bn(item.pending)}টি কাজ বাকি` : item.label
                      }
                      onMouseEnter={(event) => showTip(event, item.label)}
                      onMouseLeave={() => setTip(null)}
                      onFocus={(event) => showTip(event, item.label)}
                      onBlur={() => setTip(null)}
                    >
                      <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                      <span className="sh-link-label">{item.label}</span>
                      {item.pending ? (
                        <span className="sh-pending" aria-hidden="true">
                          {bn(item.pending)}
                        </span>
                      ) : null}
                    </a>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <ProfileMenu role={role} collapsed={collapsed} onSignOut={() => go("login")} />
      </aside>

      <div className="sh-work" inert={drawerOpen}>
        <header className="sh-top">
          <ScopeControl role={role} />
          <div className="sh-grow" />
          {limitedAccess && (
            <span className="sh-limited" title="ছাত্রী শাখার ছবি, ফোন, ঠিকানা ও স্বাস্থ্য তথ্য লুকানো">
              <ShieldAlert size={18} aria-hidden="true" />
              <span>
                সীমিত অ্যাক্সেস<span className="sh-limited-detail"> · ছাত্রী শাখার ব্যক্তিগত তথ্য লুকানো</span>
              </span>
            </span>
          )}
          <button
            type="button"
            className="sh-search"
            aria-label="পৃষ্ঠা খুঁজুন"
            aria-keyshortcuts="Control+K Meta+K"
            onClick={() => setPaletteOpen(true)}
          >
            <Search size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>খুঁজুন</span>
            <kbd>{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          <Popover
            label="নোটিফিকেশন"
            align="end"
            trigger={(props) => (
              <button {...props} className="sh-icon-button" aria-label="নোটিফিকেশন">
                <Bell size={20} strokeWidth={1.75} />
              </button>
            )}
          >
            {() => (
              <div className="sh-note">
                <b>নোটিফিকেশন</b>
                <p>
                  নোটিফিকেশন কেন্দ্র এই প্রোটোটাইপে এখনো যুক্ত হয়নি। অনুমোদন ও বাকি হাজিরা ড্যাশবোর্ডের “আজকের
                  কাজ” তালিকায় আছে।
                </p>
              </div>
            )}
          </Popover>
        </header>
        {mode !== "active" && <SubscriptionBanner mode={mode} />}
        <div id="sh-main" className="sh-main" key={activeSection} tabIndex={-1}>
          {children}
        </div>
      </div>

      {isPhone && (
        <nav className="sh-bottom" aria-label="দ্রুত নেভিগেশন">
          {bottom.map((section) => {
            const item = navItems[section];
            const Icon = item.icon;
            return (
              <a key={section} {...linkProps(section)}>
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                <span>{item.short}</span>
              </a>
            );
          })}
          <button
            type="button"
            ref={moreButton}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <MoreHorizontal size={22} strokeWidth={1.75} aria-hidden="true" />
            <span>আরও</span>
          </button>
        </nav>
      )}

      {tip && collapsed && (
        <span className="sh-tip" role="presentation" style={{ top: tip.top }}>
          {tip.text}
        </span>
      )}
      {paletteOpen && (
        <CommandPalette
          sections={allowed}
          onClose={() => setPaletteOpen(false)}
          onPick={(section) => {
            setPaletteOpen(false);
            go(section);
          }}
        />
      )}
    </div>
  );
}

function ScopeControl({ role }: { role: PrototypeRole }) {
  const { branch, session, setBranch, setSession, sessions } = useShellState();
  const branches = resolveScopeBranches(prototypeRoles[role].context);
  const current = effectiveBranch(branch, branches);
  return (
    <Popover
      label="প্রতিষ্ঠান, শাখা ও সেশন"
      className="sh-scope-pop"
      trigger={(props) => (
        <button
          {...props}
          className="sh-scope"
          aria-label={`স্কোপ: ${institutionName}, ${branchLabel[current]}, সেশন ${bn(session)}। বদলাতে চাপুন`}
        >
          <Building2 size={20} strokeWidth={1.75} aria-hidden="true" />
          <span className="sh-scope-text">
            <span className="sh-scope-inst">{institutionName}</span>
            <span className="sh-scope-now">
              {branchLabel[current]} · সেশন {bn(session)}
            </span>
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      )}
    >
      {(close) => (
        <div className="sh-scope-panel">
          <div className="sh-scope-group">
            <p>প্রতিষ্ঠান</p>
            <b>{institutionName}</b>
          </div>
          <div className="sh-scope-group" role="radiogroup" aria-label="শাখা">
            <p>শাখা</p>
            {branches.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={option === current}
                data-autofocus={option === current ? "" : undefined}
                className="sh-option"
                onClick={() => setBranch(option)}
              >
                <Check size={18} aria-hidden="true" />
                {branchLabel[option]}
              </button>
            ))}
          </div>
          <div className="sh-scope-group" role="radiogroup" aria-label="সেশন">
            <p>সেশন</p>
            {sessions.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={option === session}
                className="sh-option"
                onClick={() => setSession(option)}
              >
                <Check size={18} aria-hidden="true" />
                {bn(option)}
              </button>
            ))}
          </div>
          <p className="sh-scope-foot">
            এই নির্বাচন ড্যাশবোর্ডের সব সংখ্যা, তালিকা ও বিস্তারিত পাতায় একইভাবে প্রযোজ্য।
          </p>
          <button
            type="button"
            className="ds-button secondary sh-scope-done"
            onClick={() => close()}
          >
            ঠিক আছে
          </button>
        </div>
      )}
    </Popover>
  );
}

function ProfileMenu({
  role,
  collapsed,
  onSignOut,
}: {
  role: PrototypeRole;
  collapsed: boolean;
  onSignOut: () => void;
}) {
  const label = prototypeRoles[role].label.split(" · ")[0];
  const initials = label.replace(/[^\p{L}]/gu, "").slice(0, 1) || "ব";
  return (
    <Popover
      label="প্রোফাইল মেনু"
      role="menu"
      side={collapsed ? "right" : "top"}
      className="sh-profile-pop"
      trigger={(props) => (
        <button {...props} className="sh-profile" aria-label={`প্রোফাইল মেনু: ${label}`}>
          <span className="sh-avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="sh-profile-text">
            <b>{label}</b>
            <small>ডেমো অ্যাকাউন্ট</small>
          </span>
          <ChevronsUpDown size={18} aria-hidden="true" />
        </button>
      )}
    >
      {(close) => (
        <div className="sh-menu">
          <p className="sh-menu-caption">
            <Languages size={18} aria-hidden="true" /> ভাষা
          </p>
          <button type="button" role="menuitemradio" aria-checked="true" className="sh-option">
            <Check size={18} aria-hidden="true" />
            বাংলা
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked="false"
            aria-disabled="true"
            className="sh-option"
            title="English ইন্টারফেস এখনো তৈরি হয়নি"
          >
            <Check size={18} aria-hidden="true" />
            English <small>· এখনো তৈরি হয়নি</small>
          </button>
          <hr />
          <button
            type="button"
            role="menuitem"
            className="sh-option"
            onClick={() => {
              close(false);
              onSignOut();
            }}
          >
            <LogOut size={18} aria-hidden="true" />
            সাইন আউট
          </button>
        </div>
      )}
    </Popover>
  );
}

function CommandPalette({
  sections,
  onClose,
  onPick,
}: {
  sections: NavSection[];
  onClose: () => void;
  onPick: (section: NavSection) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);
  const results = sections.filter((section) => {
    const text = `${navItems[section].label} ${navItems[section].short} ${section}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });
  const current = Math.min(active, Math.max(0, results.length - 1));
  return (
    <dialog
      ref={dialog}
      className="sh-palette"
      aria-label="পৃষ্ঠা খুঁজুন"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current?.close();
      }}
    >
      <div className="sh-palette-box">
        <label className="sh-palette-input">
          <Search size={20} strokeWidth={1.75} aria-hidden="true" />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls="sh-palette-list"
            aria-activedescendant={results[current] ? `sh-palette-${results[current]}` : undefined}
            aria-label="পৃষ্ঠার নাম লিখুন"
            placeholder="পৃষ্ঠার নাম লিখুন…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((current + 1) % Math.max(1, results.length));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((current - 1 + results.length) % Math.max(1, results.length));
              } else if (event.key === "Enter" && results[current]) {
                event.preventDefault();
                onPick(results[current]);
              }
            }}
          />
          <kbd>Esc</kbd>
        </label>
        <ul id="sh-palette-list" role="listbox" aria-label="পৃষ্ঠা">
          {results.map((section, index) => {
            const Icon = navItems[section].icon;
            return (
              <li
                key={section}
                id={`sh-palette-${section}`}
                role="option"
                aria-selected={index === current}
                onMouseEnter={() => setActive(index)}
                onClick={() => onPick(section)}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                {navItems[section].label}
              </li>
            );
          })}
        </ul>
        {results.length === 0 && <p className="sh-palette-empty">এই নামে কোনো পৃষ্ঠা নেই।</p>}
        <p className="sh-palette-foot">
          এখানে শুধু আপনার অনুমোদিত পৃষ্ঠা খোঁজা যায়। শিক্ষার্থী, কর্মী ও রসিদ খুঁজতে সংশ্লিষ্ট পৃষ্ঠার সার্চ ব্যবহার করুন।
        </p>
      </div>
    </dialog>
  );
}
