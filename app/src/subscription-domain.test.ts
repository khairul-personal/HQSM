import { describe, expect, it } from "vitest";
import { subscriptionDecision, type SubscriptionAction } from "./subscription-domain";

describe("subscription enforcement", () => {
  it("blocks a new admission in limited mode", () => {
    expect(subscriptionDecision("limited", "new-admission").allowed).toBe(false);
    expect(subscriptionDecision("limited", "new-enquiry").allowed).toBe(false);
  });

  it("keeps fee collection and absence messages working in limited mode", () => {
    expect(subscriptionDecision("limited", "collect-existing-invoice").allowed).toBe(true);
    expect(subscriptionDecision("limited", "receipt").allowed).toBe(true);
    expect(subscriptionDecision("limited", "absence-message").allowed).toBe(true);
  });

  it("allows read and export only when suspended", () => {
    const actions: SubscriptionAction[] = [
      "view",
      "export",
      "attendance",
      "homework",
      "collect-existing-invoice",
      "receipt",
      "emergency-message",
      "new-admission",
    ];
    expect(actions.filter((action) => subscriptionDecision("suspended", action).allowed)).toEqual([
      "view",
      "export",
    ]);
  });
});
