import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  normalizeEnvironment,
  captureEnvironmentSnapshot,
  restoreEnvironmentSnapshot,
} from "../../../scripts/lib/environment.js";

/**
 * Tests for the environment-normalization helpers used by the build pipeline.
 *
 * The functions under test mutate `process.env`, which is global state shared
 * with the test runner itself. To keep tests hermetic we capture-then-restore
 * around every test using the very functions we're testing — see the
 * isolation-self-test below for explicit verification of that round-trip.
 */
describe("environment normalization", () => {
  let original: ReturnType<typeof captureEnvironmentSnapshot>;

  beforeEach(() => {
    // Snapshot whatever the test runner inherited so we can put it back.
    original = captureEnvironmentSnapshot();
  });

  afterEach(() => {
    restoreEnvironmentSnapshot(original);
  });

  describe("normalizeEnvironment", () => {
    it("sets LANG=C, LC_ALL=C, TZ=UTC", () => {
      // Force fixture values that are NOT the normalized ones.
      process.env.LANG = "ja_JP.UTF-8";
      process.env.LC_ALL = "ja_JP.UTF-8";
      process.env.TZ = "America/New_York";

      normalizeEnvironment();

      expect(process.env.LANG).toBe("C");
      expect(process.env.LC_ALL).toBe("C");
      expect(process.env.TZ).toBe("UTC");
    });

    it("is idempotent — calling twice produces the same final state with no error", () => {
      normalizeEnvironment();
      const after1: Record<string, string | undefined> = {
        LANG: process.env.LANG,
        LC_ALL: process.env.LC_ALL,
        TZ: process.env.TZ,
      };

      // Second call must not throw and must not change anything.
      expect(() => normalizeEnvironment()).not.toThrow();

      expect(process.env.LANG).toBe(after1.LANG);
      expect(process.env.LC_ALL).toBe(after1.LC_ALL);
      expect(process.env.TZ).toBe(after1.TZ);
      expect(process.env.LANG).toBe("C");
      expect(process.env.LC_ALL).toBe("C");
      expect(process.env.TZ).toBe("UTC");
    });

    it("sets the values even when the env vars were previously unset", () => {
      delete process.env.LANG;
      delete process.env.LC_ALL;
      delete process.env.TZ;

      normalizeEnvironment();

      expect(process.env.LANG).toBe("C");
      expect(process.env.LC_ALL).toBe("C");
      expect(process.env.TZ).toBe("UTC");
    });
  });

  describe("captureEnvironmentSnapshot", () => {
    it("records the current LANG, LC_ALL, and TZ values", () => {
      process.env.LANG = "en_US.UTF-8";
      process.env.LC_ALL = "fr_FR.UTF-8";
      process.env.TZ = "Europe/Paris";

      const snap = captureEnvironmentSnapshot();

      expect(snap.LANG).toBe("en_US.UTF-8");
      expect(snap.LC_ALL).toBe("fr_FR.UTF-8");
      expect(snap.TZ).toBe("Europe/Paris");
    });

    it("records `undefined` for env vars that are not set", () => {
      delete process.env.LANG;
      delete process.env.LC_ALL;
      delete process.env.TZ;

      const snap = captureEnvironmentSnapshot();

      expect(snap.LANG).toBeUndefined();
      expect(snap.LC_ALL).toBeUndefined();
      expect(snap.TZ).toBeUndefined();
    });

    it("returns an independent snapshot object — later mutations of process.env do not leak in", () => {
      process.env.LANG = "value-1";
      const snap = captureEnvironmentSnapshot();
      process.env.LANG = "value-2";

      expect(snap.LANG).toBe("value-1");
    });
  });

  describe("restoreEnvironmentSnapshot", () => {
    it("restores previously-set string values", () => {
      process.env.LANG = "de_DE.UTF-8";
      process.env.LC_ALL = "de_DE.UTF-8";
      process.env.TZ = "Europe/Berlin";

      const snap = captureEnvironmentSnapshot();

      // Mutate, then restore.
      normalizeEnvironment();
      expect(process.env.LANG).toBe("C");

      restoreEnvironmentSnapshot(snap);

      expect(process.env.LANG).toBe("de_DE.UTF-8");
      expect(process.env.LC_ALL).toBe("de_DE.UTF-8");
      expect(process.env.TZ).toBe("Europe/Berlin");
    });

    it("DELETES the env var (rather than setting it to the literal string 'undefined') when the snapshot value was undefined", () => {
      delete process.env.LANG;
      delete process.env.LC_ALL;
      delete process.env.TZ;

      const snap = captureEnvironmentSnapshot();
      // Sanity: snapshot recorded undefineds.
      expect(snap.LANG).toBeUndefined();
      expect(snap.LC_ALL).toBeUndefined();
      expect(snap.TZ).toBeUndefined();

      // Now set them to something — restore must remove them, not set "undefined".
      process.env.LANG = "C";
      process.env.LC_ALL = "C";
      process.env.TZ = "UTC";

      restoreEnvironmentSnapshot(snap);

      // The vars must be absent from process.env entirely.
      expect("LANG" in process.env).toBe(false);
      expect("LC_ALL" in process.env).toBe(false);
      expect("TZ" in process.env).toBe(false);

      // And specifically NOT the literal string "undefined".
      expect(process.env.LANG).not.toBe("undefined");
      expect(process.env.LC_ALL).not.toBe("undefined");
      expect(process.env.TZ).not.toBe("undefined");
    });

    it("handles a mixed snapshot where some vars are defined and others are not", () => {
      process.env.LANG = "en_US.UTF-8";
      delete process.env.LC_ALL;
      process.env.TZ = "Europe/London";

      const snap = captureEnvironmentSnapshot();

      // Disturb everything.
      process.env.LANG = "ja_JP.UTF-8";
      process.env.LC_ALL = "ja_JP.UTF-8";
      process.env.TZ = "America/New_York";

      restoreEnvironmentSnapshot(snap);

      expect(process.env.LANG).toBe("en_US.UTF-8");
      expect("LC_ALL" in process.env).toBe(false);
      expect(process.env.TZ).toBe("Europe/London");
    });
  });

  describe("capture/restore round-trip (test-isolation self-check)", () => {
    it("returns process.env to the snapshot's exact state, including absent vars", () => {
      // Set a known starting state with a mix of defined and undefined.
      process.env.LANG = "en_US.UTF-8";
      delete process.env.LC_ALL;
      process.env.TZ = "Europe/London";

      const snap = captureEnvironmentSnapshot();

      // Run the normalization under test plus extra perturbations.
      normalizeEnvironment();
      process.env.LANG = "perturbation";
      delete process.env.TZ;

      restoreEnvironmentSnapshot(snap);

      expect(process.env.LANG).toBe("en_US.UTF-8");
      expect("LC_ALL" in process.env).toBe(false);
      expect(process.env.TZ).toBe("Europe/London");
    });
  });
});
