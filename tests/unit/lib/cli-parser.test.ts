import { describe, it, expect } from "vitest";
import { parseCli } from "../../../scripts/lib/cli-parser.js";
import { UsageError } from "../../../scripts/lib/errors.js";

/**
 * Tests for the Commander-based CLI parser. Per
 * `docs/architecture/data-pipeline.md` §6.3, the parser is the only place
 * where flag names, short forms, and defaults are bound. Conflicting
 * combinations raise a structured `UsageError` (exit code 2) before any
 * pipeline stage executes.
 */
describe("parseCli", () => {
  it("returns the documented defaults when no args are passed", () => {
    const opts = parseCli([]);

    expect(opts.dryRun).toBe(false);
    expect(opts.failFast).toBe(false);
    expect(opts.verbose).toBe(false);
    expect(opts.quiet).toBe(false);
    expect(opts.json).toBe(false);
    expect(opts.validateOnly).toBe(false);
    expect(opts.sourceRoot).toBe("./data");
    expect(opts.outputRoot).toBe("./plugins/opensips/skills");
    expect(opts.only).toBeUndefined();
    expect(opts.onlyModule).toBeUndefined();
  });

  it("parses --only 3.6 --dry-run together", () => {
    const opts = parseCli(["--only", "3.6", "--dry-run"]);

    expect(opts.only).toBe("3.6");
    expect(opts.dryRun).toBe(true);
  });

  it("throws UsageError when --quiet and --verbose are combined", () => {
    expect(() => parseCli(["--quiet", "--verbose"])).toThrowError(UsageError);
  });

  it("throws UsageError when --only-module is supplied without --only", () => {
    expect(() => parseCli(["--only-module", "tm"])).toThrowError(UsageError);
  });

  it("accepts --only-module when --only is also supplied", () => {
    const opts = parseCli(["--only", "3.6", "--only-module", "tm"]);

    expect(opts.only).toBe("3.6");
    expect(opts.onlyModule).toBe("tm");
  });

  it("honours --source-root and --output-root overrides", () => {
    const opts = parseCli([
      "--source-root",
      "data",
      "--output-root",
      "/tmp/out",
    ]);

    expect(opts.sourceRoot).toBe("data");
    expect(opts.outputRoot).toBe("/tmp/out");
  });

  it("throws UsageError on an unknown flag", () => {
    expect(() => parseCli(["--bogus"])).toThrowError(UsageError);
  });

  it("parses --validate-only", () => {
    const opts = parseCli(["--validate-only"]);

    expect(opts.validateOnly).toBe(true);
  });

  it("parses --json and --fail-fast as booleans", () => {
    const opts = parseCli(["--json", "--fail-fast"]);

    expect(opts.json).toBe(true);
    expect(opts.failFast).toBe(true);
  });
});
