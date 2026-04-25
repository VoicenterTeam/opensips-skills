import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { main } from "../../scripts/build-references.js";

/**
 * Integration-flavoured tests for the orchestrator's `main()` entry point.
 *
 * These tests run the orchestrator end-to-end against the committed `data/`
 * tree (the source slice baked in during M1). They assert exit codes and
 * — for the JSON-mode case — the exact shape of the summary written to
 * stdout.
 *
 * Schema-drift simulation is intentionally NOT covered here: it would
 * require either filesystem mutation (fragile) or `vi.mock` of the schema
 * hash module (would prevent integration coverage). The acceptance script
 * covers it manually per Task 2.8.
 */
describe("main() orchestrator", () => {
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

  it("returns 0 for --only 3.6 --dry-run --verbose", async () => {
    const code = await main(["--only", "3.6", "--dry-run", "--verbose"]);
    expect(code).toBe(0);
    const stderrText = stderrSpy.mock.calls.map((c) => String(c[0])).join("");
    // Verbose dry-run emits the would-render lines.
    expect(stderrText).toContain("Would render");
  });

  it("returns 0 for --only 3.5", async () => {
    const code = await main(["--only", "3.5"]);
    expect(code).toBe(0);
  });

  it("returns 3 for --only 3.4 (the upstream-bug version)", async () => {
    const code = await main(["--only", "3.4"]);
    expect(code).toBe(3);
  });

  it("returns 2 for an unknown flag", async () => {
    const code = await main(["--bogus-flag"]);
    expect(code).toBe(2);
  });

  it("returns 2 when --quiet and --verbose are combined", async () => {
    const code = await main(["--quiet", "--verbose"]);
    expect(code).toBe(2);
  });

  it("writes a parseable JSON summary on stdout in --json mode", async () => {
    const code = await main(["--only", "3.6", "--json", "--dry-run"]);
    expect(code).toBe(0);

    const stdoutText = stdoutSpy.mock.calls.map((c) => String(c[0])).join("");
    const parsed = JSON.parse(stdoutText) as {
      mode: string;
      versions: Array<{ version: string; ok: boolean }>;
      summary?: { exitCode: number };
      exitCode: number;
      buildScriptVersion: string;
    };

    expect(parsed.mode).toBe("dry-run");
    expect(parsed.versions).toHaveLength(1);
    expect(parsed.versions[0]?.version).toBe("3.6");
    expect(parsed.versions[0]?.ok).toBe(true);
    expect(parsed.exitCode).toBe(0);
    expect(parsed.buildScriptVersion).toBe("0.1.0");
  });

  it("writes nothing to stderr in --json --quiet mode on success", async () => {
    stderrSpy.mockClear();
    const code = await main([
      "--only",
      "3.6",
      "--json",
      "--quiet",
      "--dry-run",
    ]);
    expect(code).toBe(0);
    // JSON mode owns stdout exclusively; nothing should hit stderr on success.
    expect(stderrSpy).not.toHaveBeenCalled();
  });
});
