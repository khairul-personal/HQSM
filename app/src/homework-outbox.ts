/**
 * Offline outbox for guardian homework submissions.
 *
 * A submission recorded while offline is kept on the device with status "queued"
 * (UI label "এখনো পাঠানো হয়নি") and sent when the connection returns. The key is
 * studentId + homeworkId, so a retry or a second flush never creates a second submission.
 *
 * Prototype note: recording is simulated, so only metadata is stored. A real build stores
 * the audio Blob in IndexedDB under the same key.
 */

export type OutboxStatus = "queued" | "sent";

export type OutboxItem = {
  key: string;
  studentId: string;
  homeworkId: string;
  durationSeconds: number;
  sizeBytes: number;
  recordedAt: string;
  status: OutboxStatus;
  sentAt?: string;
};

export type OutboxStorage = Pick<Storage, "getItem" | "setItem">;

export const outboxStorageKey = "madrasa.homework-outbox";

export const outboxKey = (studentId: string, homeworkId: string) => `${studentId}::${homeworkId}`;

/** Adds or replaces the queued submission for this student + homework. Sent items are never re-queued. */
export function queueSubmission(
  items: OutboxItem[],
  entry: Omit<OutboxItem, "key" | "status" | "sentAt">,
): OutboxItem[] {
  const key = outboxKey(entry.studentId, entry.homeworkId);
  const existing = items.find((item) => item.key === key);
  if (existing?.status === "sent") return items;
  const next: OutboxItem = { ...entry, key, status: "queued" };
  return existing ? items.map((item) => (item.key === key ? next : item)) : [...items, next];
}

export function findOutboxItem(
  items: OutboxItem[],
  studentId: string,
  homeworkId: string,
): OutboxItem | undefined {
  const key = outboxKey(studentId, homeworkId);
  return items.find((item) => item.key === key);
}

/** Removes a queued (unsent) recording, e.g. when the guardian records again. */
export function discardQueued(items: OutboxItem[], studentId: string, homeworkId: string) {
  const key = outboxKey(studentId, homeworkId);
  return items.filter((item) => item.key !== key || item.status === "sent");
}

/**
 * Sends every queued item once. Items whose send fails stay queued; sent items are skipped,
 * so calling flush twice never submits anything twice.
 */
export async function flushOutbox(
  items: OutboxItem[],
  send: (item: OutboxItem) => Promise<boolean>,
  now: () => string,
): Promise<OutboxItem[]> {
  const result: OutboxItem[] = [];
  for (const item of items) {
    if (item.status !== "queued") {
      result.push(item);
      continue;
    }
    let ok = false;
    try {
      ok = await send(item);
    } catch {
      ok = false;
    }
    result.push(ok ? { ...item, status: "sent", sentAt: now() } : item);
  }
  return result;
}

export function loadOutbox(storage: OutboxStorage | undefined): OutboxItem[] {
  try {
    const raw = storage?.getItem(outboxStorageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as OutboxItem[]) : [];
  } catch {
    return [];
  }
}

export function saveOutbox(storage: OutboxStorage | undefined, items: OutboxItem[]): void {
  try {
    storage?.setItem(outboxStorageKey, JSON.stringify(items));
  } catch {
    // Storage full or blocked: the item stays in memory for this session.
  }
}
