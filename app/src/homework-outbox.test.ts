import { describe, expect, it } from "vitest";
import {
  discardQueued,
  findOutboxItem,
  flushOutbox,
  loadOutbox,
  queueSubmission,
  saveOutbox,
  type OutboxItem,
} from "./homework-outbox";

const recording = {
  studentId: "STU-10241",
  homeworkId: "HW-041",
  durationSeconds: 98,
  sizeBytes: 1_887_437,
  recordedAt: "2026-06-05T19:40:00+06:00",
};

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("homework offline outbox", () => {
  it("keeps an offline recording queued across a reload", () => {
    const storage = memoryStorage();
    saveOutbox(storage, queueSubmission([], recording));
    const afterReload = loadOutbox(storage);
    expect(findOutboxItem(afterReload, "STU-10241", "HW-041")?.status).toBe("queued");
  });

  it("re-recording replaces the queued item instead of adding a second one", () => {
    const once = queueSubmission([], recording);
    const twice = queueSubmission(once, { ...recording, durationSeconds: 120 });
    expect(twice).toHaveLength(1);
    expect(twice[0].durationSeconds).toBe(120);
  });

  it("sends on reconnect exactly once, even if flushed twice", async () => {
    const sent: string[] = [];
    const send = async (item: OutboxItem) => {
      sent.push(item.key);
      return true;
    };
    const first = await flushOutbox(queueSubmission([], recording), send, () => "t1");
    const second = await flushOutbox(first, send, () => "t2");
    expect(sent).toHaveLength(1);
    expect(second[0]).toMatchObject({ status: "sent", sentAt: "t1" });
  });

  it("keeps the item queued when sending fails, so nothing is lost", async () => {
    const result = await flushOutbox(
      queueSubmission([], recording),
      async () => {
        throw new Error("network");
      },
      () => "t1",
    );
    expect(result[0].status).toBe("queued");
  });

  it("never re-queues or discards an item that was already sent", async () => {
    const sent = await flushOutbox(
      queueSubmission([], recording),
      async () => true,
      () => "t1",
    );
    expect(queueSubmission(sent, recording)[0].status).toBe("sent");
    expect(discardQueued(sent, "STU-10241", "HW-041")).toHaveLength(1);
  });

  it("returns an empty outbox for corrupt storage", () => {
    const storage = memoryStorage();
    storage.setItem("madrasa.homework-outbox", "{not json");
    expect(loadOutbox(storage)).toEqual([]);
  });
});
