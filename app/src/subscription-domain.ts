export type SubscriptionMode = "active" | "grace" | "limited" | "suspended";

export type SubscriptionAction =
  | "view"
  | "export"
  | "attendance"
  | "sabak"
  | "homework"
  | "monthly-invoice-existing"
  | "collect-existing-invoice"
  | "receipt"
  | "transactional-message"
  | "absence-message"
  | "emergency-message"
  | "new-enquiry"
  | "new-admission"
  | "new-user"
  | "new-branch"
  | "bulk-promotional-message";

export type SubscriptionDecision = {
  allowed: boolean;
  reason?: string;
  contact?: string;
};

const limitedAllowed = new Set<SubscriptionAction>([
  "view",
  "export",
  "attendance",
  "sabak",
  "homework",
  "monthly-invoice-existing",
  "collect-existing-invoice",
  "receipt",
  "transactional-message",
  "absence-message",
  "emergency-message",
]);

export function subscriptionDecision(
  mode: SubscriptionMode,
  action: SubscriptionAction,
): SubscriptionDecision {
  if (mode === "active" || mode === "grace") return { allowed: true };
  if (mode === "suspended") {
    return action === "view" || action === "export"
      ? { allowed: true }
      : {
          allowed: false,
          reason: "সাবস্ক্রিপশন স্থগিত থাকায় শুধু তথ্য দেখা ও Export করা যাবে।",
          contact: "প্রতিষ্ঠানের Admin বা Figma Make সহায়তায় যোগাযোগ করুন।",
        };
  }
  if (limitedAllowed.has(action)) return { allowed: true };
  return {
    allowed: false,
    reason: "Limited mode-এ এই নতুন কাজটি করা যাবে না। চলমান শিক্ষা ও আর্থিক কাজ চালু আছে।",
    contact: "সাবস্ক্রিপশন নবায়নের জন্য প্রতিষ্ঠানের Admin-এর সঙ্গে যোগাযোগ করুন।",
  };
}
