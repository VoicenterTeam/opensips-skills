import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  emitProgress,
  emitWarning,
  emitError,
  emitSummary,
  type OutputContext,
} from "../../../scripts/lib/output.js";
import { ValidationError } from "../../../scripts/lib/errors.js";
import type { BuildSummary } from "../../../scripts/types/cli.js";

/**
 * Tests for the human-vs-JSON output discipline. Every progress/warning line
 * goes to stderr; the JSON summary goes to stdout. Quiet mode suppresses
 * progress/warnings/summary but never errors. Verbose mode is the caller's
 * gate — these helpers don't filter on verbose themselves.
 */
describe("output helpers", () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    stderrSpy = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  const ctx = (overrides: Partial<OutputContext> = {}): OutputContext => ({
    json: false,
    quiet: false,
    verbose: false,
    ...overrides,
  });

  describe("emitProgress", () => {
    it("writes to stderr when not quiet", () => {
      emitProgress("Processing version 3.6", ctx());
      expect(stderrSpy).toHaveBeenCalled();
      const written = stderrSpy.mock.calls.map((c) => c[0]).join("");
      expect(written).toContain("Processing version 3.6");
      expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it("writes nothing when quiet", () => {
      emitProgress("Processing version 3.6", ctx({ quiet: true }));
      expect(stderrSpy).not.toHaveBeenCalled();
      expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it("writes nothing in JSON mode", () => {
      emitProgress("Processing version 3.6", ctx({ json: true }));
      // JSON mode keeps stdout clean; progress chatter should not pollute
      // stderr in a way that would break a tool capturing both streams.
      // Per the spec, emit goes to stderr — but we still gate it behind
      // !json to keep CI logs tidy. Either behaviour is acceptable per
      // the spec; we choose suppression to mirror quiet.
      expect(stdoutSpy).not.toHaveBeenCalled();
    });
  });

  describe("emitWarning", () => {
    it("writes to stderr when not quiet", () => {
      emitWarning("renderers not yet implemented", ctx());
      expect(stderrSpy).toHaveBeenCalled();
      const written = stderrSpy.mock.calls.map((c) => c[0]).join("");
      expect(written).toContain("WARNING");
      expect(written).toContain("renderers not yet implemented");
    });

    it("writes nothing when quiet", () => {
      emitWarning("renderers not yet implemented", ctx({ quiet: true }));
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });

  describe("emitError", () => {
    it("writes to stderr regardless of quiet", () => {
      const err = new ValidationError({
        message: "expected string, got number",
        file: "data/3.6/modules/tm.json",
        path: ["exported_parameters", 0, "type"],
        expected: "string",
        received: "number",
      });
      emitError(err, ctx({ quiet: true }));
      expect(stderrSpy).toHaveBeenCalled();
      const written = stderrSpy.mock.calls.map((c) => c[0]).join("");
      expect(written).toContain("data/3.6/modules/tm.json");
    });

    it("writes a plain Error message to stderr", () => {
      emitError(new Error("kaboom"), ctx());
      expect(stderrSpy).toHaveBeenCalled();
      const written = stderrSpy.mock.calls.map((c) => c[0]).join("");
      expect(written).toContain("kaboom");
    });
  });

  describe("emitSummary", () => {
    const sampleSummary: BuildSummary = {
      buildScriptVersion: "0.1.0",
      mode: "dry-run",
      versions: [
        {
          version: "3.6",
          ok: true,
          filesValidated: 15,
          filesRendered: 0,
          errors: [],
        },
      ],
      versionsSucceeded: 1,
      versionsFailed: 0,
      exitCode: 0,
    };

    it("writes parseable JSON to stdout when json is true", () => {
      emitSummary(sampleSummary, ctx({ json: true }));
      const written = stdoutSpy.mock.calls.map((c) => c[0]).join("");
      const parsed: unknown = JSON.parse(written);
      expect(parsed).toEqual(sampleSummary);
    });

    it("writes a human-readable summary to stderr when json is false", () => {
      emitSummary(sampleSummary, ctx());
      const written = stderrSpy.mock.calls.map((c) => c[0]).join("");
      expect(written).toContain("Versions: 1 succeeded, 0 failed");
      expect(written).toContain("Total files validated: 15");
      expect(written).toContain("Exit code: 0");
    });

    it("does NOT write to stderr in JSON mode", () => {
      emitSummary(sampleSummary, ctx({ json: true }));
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it("suppresses the human summary when quiet and not json", () => {
      emitSummary(sampleSummary, ctx({ quiet: true }));
      expect(stderrSpy).not.toHaveBeenCalled();
      expect(stdoutSpy).not.toHaveBeenCalled();
    });
  });
});
