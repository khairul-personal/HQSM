import { describe, expect, it } from "vitest";
import {
  loadStoredRole,
  parseStoredRole,
  prototypeRoleStorageKey,
  storeRole,
} from "./prototype-role";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("prototype role on refresh", () => {
  it("restores the same role after a reload", () => {
    const storage = memoryStorage();
    storeRole(storage, "hr-officer");
    expect(loadStoredRole(storage)).toBe("hr-officer");
  });

  it("ignores unknown or tampered values", () => {
    const storage = memoryStorage();
    storage.setItem(prototypeRoleStorageKey, "super-admin");
    expect(loadStoredRole(storage)).toBeNull();
    expect(parseStoredRole("toString")).toBeNull();
    expect(parseStoredRole(null)).toBeNull();
  });

  it("does not crash when storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadStoredRole(blocked)).toBeNull();
    expect(() => storeRole(blocked, "admin")).not.toThrow();
  });
});
