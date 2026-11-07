import { prototypeRoles, type PrototypeRole } from "./student-permissions";

/** Prototype-only: the role picked in the role switcher survives a refresh of the same tab. */
export const prototypeRoleStorageKey = "madrasa.prototype-role";

type RoleStorage = Pick<Storage, "getItem" | "setItem">;

export function parseStoredRole(value: string | null | undefined): PrototypeRole | null {
  if (!value || !Object.prototype.hasOwnProperty.call(prototypeRoles, value)) return null;
  return value as PrototypeRole;
}

export function loadStoredRole(storage: RoleStorage | undefined): PrototypeRole | null {
  try {
    return parseStoredRole(storage?.getItem(prototypeRoleStorageKey));
  } catch {
    return null;
  }
}

export function storeRole(storage: RoleStorage | undefined, role: PrototypeRole): void {
  try {
    storage?.setItem(prototypeRoleStorageKey, role);
  } catch {
    // Private mode or blocked storage: the role simply resets on refresh.
  }
}

export function browserSessionStorage(): RoleStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.sessionStorage;
  } catch {
    return undefined;
  }
}
