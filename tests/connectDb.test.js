import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  connect: vi.fn(),
  ping: vi.fn(),
  set: vi.fn()
}));

vi.mock("../server/config/env.js", () => ({
  env: {
    MONGODB_URI: "mongodb+srv://user:pass@cluster.mongodb.net/clienttrack"
  }
}));

vi.mock("mongoose", () => ({
  default: {
    set: mockState.set,
    connect: mockState.connect,
    connection: {
      db: {
        admin() {
          return {
            ping: mockState.ping
          };
        }
      }
    }
  }
}));

describe("connectDb", () => {
  beforeEach(() => {
    vi.resetModules();
    mockState.connect.mockReset();
    mockState.ping.mockReset();
    mockState.set.mockReset();
    delete globalThis.__clientTrackMongoose;
  });

  it("permite reintentar la conexion si el primer intento falla", async () => {
    const firstFailure = new Error("fallo inicial");

    mockState.connect.mockRejectedValueOnce(firstFailure).mockResolvedValueOnce("mongo-instance");

    const { connectDb } = await import("../server/db/connectDb.js");

    await expect(connectDb()).rejects.toThrow("fallo inicial");
    await expect(connectDb()).resolves.toBe("mongo-instance");
    expect(mockState.connect).toHaveBeenCalledTimes(2);
  });

  it("valida readiness con un ping real a Mongo", async () => {
    mockState.connect.mockResolvedValue("mongo-instance");
    mockState.ping.mockResolvedValue({ ok: 1 });

    const { ensureDbReady } = await import("../server/db/connectDb.js");

    await expect(ensureDbReady()).resolves.toBe(true);
    expect(mockState.ping).toHaveBeenCalledTimes(1);
  });
});
