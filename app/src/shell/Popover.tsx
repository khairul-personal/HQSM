/**
 * Shared anchored popover / menu for the shell and S03 (no headless library is installed).
 * Contract: trigger carries aria-expanded; Escape closes and returns focus to the trigger; click or
 * focus outside closes; ↑ ↓ Home End move between items; the panel is nudged to stay in the viewport.
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";

export type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: Ref<HTMLButtonElement>;
};

const focusable =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]';

export function Popover({
  trigger,
  children,
  role = "dialog",
  label,
  align = "start",
  side = "bottom",
  className = "",
}: {
  trigger: (props: PopoverTriggerProps, open: boolean) => ReactNode;
  children: (close: (restoreFocus?: boolean) => void) => ReactNode;
  role?: "dialog" | "menu";
  label: string;
  align?: "start" | "end";
  side?: "bottom" | "top" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    el.style.setProperty("--pop-shift-x", "0px");
    el.style.setProperty("--pop-shift-y", "0px");
    const rect = el.getBoundingClientRect();
    const margin = 8;
    let dx = 0;
    let dy = 0;
    if (rect.right > window.innerWidth - margin) dx = window.innerWidth - margin - rect.right;
    if (rect.left + dx < margin) dx = margin - rect.left;
    if (rect.bottom > window.innerHeight - margin) dy = window.innerHeight - margin - rect.bottom;
    if (rect.top + dy < margin) dy = margin - rect.top;
    el.style.setProperty("--pop-shift-x", `${dx}px`);
    el.style.setProperty("--pop-shift-y", `${dy}px`);
    const first =
      el.querySelector<HTMLElement>("[data-autofocus]") ?? el.querySelector<HTMLElement>(focusable);
    (first ?? el).focus({ preventScroll: true });
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(panel.current?.querySelectorAll<HTMLElement>(focusable) ?? []);
    if (items.length === 0) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (index + 1) % items.length
            : (index - 1 + items.length) % items.length;
    items[next].focus();
  };

  return (
    <span
      className={`pop ${className}`}
      ref={wrap}
      onBlur={(event) => {
        if (open && event.relatedTarget && !wrap.current?.contains(event.relatedTarget as Node))
          setOpen(false);
      }}
    >
      {trigger(
        {
          ref: button,
          type: "button",
          "aria-haspopup": role,
          "aria-expanded": open,
          "aria-controls": open ? id : undefined,
          onClick: () => setOpen((value) => !value),
        },
        open,
      )}
      {open && (
        <div
          id={id}
          ref={panel}
          role={role}
          aria-label={label}
          tabIndex={-1}
          className={`pop-panel pop-${side} pop-${align}`}
          onKeyDown={onKeyDown}
        >
          {children(close)}
        </div>
      )}
    </span>
  );
}
