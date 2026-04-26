/**
 * Structured error infrastructure for the build pipeline.
 *
 * Defines the exit-code taxonomy from `docs/architecture/data-pipeline.md` §4
 * and a small hierarchy of `BuildError` subclasses that carry both a
 * deterministic exit code and a JSON-serialisable detail object. All errors
 * extend the standard `Error` so they propagate through normal `try/catch`
 * flow, and they implement `toJSON()` so the orchestrator's `--json` mode
 * can emit machine-readable summaries without bespoke serialisation.
 *
 * Error formatting (`formatError`) produces a single-line
 * `path:line:col: error: msg` style string compatible with GitHub Actions'
 * built-in problem matchers, so failed builds annotate pull requests
 * automatically.
 *
 * This module is the only place exit-code constants are defined; every
 * other module references {@link EXIT_CODES} rather than re-declaring
 * numeric literals.
 */

/** Exit-code taxonomy from `docs/architecture/data-pipeline.md` §4. */
export const EXIT_CODES = {
  SUCCESS: 0,
  USAGE: 2,
  VALIDATION: 3,
  IO: 4,
  SCHEMA_DRIFT: 5,
} as const;

/** A value from {@link EXIT_CODES}. */
export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

/**
 * Base class for every structured build error.
 *
 * Subclasses bind the appropriate {@link ExitCode} to the `code` field and
 * a stable `kind` discriminator string so callers can route on either.
 * The class is abstract: instantiate one of the concrete subclasses
 * (`ValidationError`, `IOError`, `SchemaDriftError`, `UsageError`).
 *
 * Instances are JSON-serialisable through `toJSON()`. The Error's stack
 * trace is intentionally excluded from the JSON output so machine-readable
 * summaries stay reproducible across runs.
 */
export abstract class BuildError extends Error {
  /** Process exit code mapped to this error class. */
  abstract readonly code: ExitCode;
  /** Stable discriminator string for switch/route purposes. */
  abstract readonly kind: string;

  /**
   * Produce a JSON-safe object describing this error.
   *
   * The returned object includes `kind`, `code`, the subclass-specific
   * fields, and `message`. It does not include the stack trace.
   * @returns Plain object suitable for `JSON.stringify` and pipeline
   *   `--json` output.
   */
  abstract toJSON(): Record<string, unknown>;
}

/**
 * Schema-validation failure (Zod or `JSON.parse`). One instance corresponds
 * to a single offending field or document. Aggregating multiple validation
 * issues across files is the orchestrator's job, not this class's.
 */
export class ValidationError extends BuildError {
  override readonly name = "ValidationError";
  override readonly code = EXIT_CODES.VALIDATION;
  override readonly kind = "validation";
  /** Source file path the failure was discovered in. */
  readonly file: string;
  /** Structured JSON path to the offending field (Zod-style). */
  readonly path: (string | number)[];
  /** Human-readable name of the expected type or shape. */
  readonly expected: string;
  /** Human-readable name of the value actually received. */
  readonly received: string;

  /**
   * @param opts - Constructor arguments.
   * @param opts.message - Single-line human description of the failure.
   * @param opts.file - Source file path the failure was discovered in.
   * @param opts.path - JSON path components (Zod-style) to the offending field.
   * @param opts.expected - Human-readable expected type/shape name.
   * @param opts.received - Human-readable received type/value name.
   */
  constructor(opts: {
    message: string;
    file: string;
    path: (string | number)[];
    expected: string;
    received: string;
  }) {
    super(opts.message);
    this.file = opts.file;
    this.path = opts.path;
    this.expected = opts.expected;
    this.received = opts.received;
  }

  /**
   * Serialise this error to a plain object for `--json` mode.
   * @returns JSON-safe record with `kind`, `code`, `file`, `path`, `expected`,
   *   `received`, and `message`.
   */
  override toJSON(): {
    kind: "validation";
    code: 3;
    file: string;
    path: (string | number)[];
    expected: string;
    received: string;
    message: string;
  } {
    return {
      kind: "validation",
      code: 3,
      file: this.file,
      path: [...this.path],
      expected: this.expected,
      received: this.received,
      message: this.message,
    };
  }
}

/**
 * Filesystem operation failure — read, write, mkdir, rename, etc.
 *
 * The `operation` field names the conceptual action ("read", "write",
 * "mkdir", "atomicWrite") rather than the underlying syscall, so error
 * output stays stable when implementations switch helpers.
 */
export class IOError extends BuildError {
  override readonly name = "IOError";
  override readonly code = EXIT_CODES.IO;
  override readonly kind = "io";
  /** High-level operation that failed (e.g. `"read"`, `"atomicWrite"`). */
  readonly operation: string;
  /** Filesystem path the operation was attempted on. */
  readonly path: string;

  /**
   * @param opts - Constructor arguments.
   * @param opts.message - Single-line human description of the failure.
   * @param opts.operation - High-level operation name (e.g. `"read"`,
   *   `"write"`, `"mkdir"`, `"atomicWrite"`).
   * @param opts.path - Filesystem path the operation was attempted on.
   * @param opts.cause - Optional underlying error. Stored on
   *   `Error.cause` (ES2022; available in Node 20).
   */
  constructor(opts: { message: string; operation: string; path: string; cause?: unknown }) {
    super(opts.message, opts.cause !== undefined ? { cause: opts.cause } : undefined);
    this.operation = opts.operation;
    this.path = opts.path;
  }

  /**
   * Serialise this error to a plain object for `--json` mode.
   * @returns JSON-safe record with `kind`, `code`, `operation`, `path`,
   *   and `message`. The `cause` is intentionally omitted because it
   *   typically references a non-serialisable Node `ErrnoException`.
   */
  override toJSON(): {
    kind: "io";
    code: 4;
    operation: string;
    path: string;
    message: string;
  } {
    return {
      kind: "io",
      code: 4,
      operation: this.operation,
      path: this.path,
      message: this.message,
    };
  }
}

/**
 * Schema-hash drift between the committed `.schema-hash` baseline and the
 * hash recomputed from the current schema files. Halts the build before
 * any source file is validated — a hash mismatch invalidates all
 * downstream output (per data-pipeline §2.2).
 */
export class SchemaDriftError extends BuildError {
  override readonly name = "SchemaDriftError";
  override readonly code = EXIT_CODES.SCHEMA_DRIFT;
  override readonly kind = "schema-drift";
  /** Hash recorded in the committed `.schema-hash` file, or null when absent. */
  readonly expected: string | null;
  /** Hash freshly computed from the current schema files. */
  readonly computed: string;

  /**
   * @param opts - Constructor arguments.
   * @param opts.expected - Hash from the committed baseline, or null when
   *   no baseline exists yet.
   * @param opts.computed - Hash freshly computed from the current schema files.
   */
  constructor(opts: { expected: string | null; computed: string }) {
    super(`schema hash drift: expected ${opts.expected ?? "none"}, computed ${opts.computed}`);
    this.expected = opts.expected;
    this.computed = opts.computed;
  }

  /**
   * Serialise this error to a plain object for `--json` mode.
   * @returns JSON-safe record with `kind`, `code`, `expected`, `computed`,
   *   and `message`.
   */
  override toJSON(): {
    kind: "schema-drift";
    code: 5;
    expected: string | null;
    computed: string;
    message: string;
  } {
    return {
      kind: "schema-drift",
      code: 5,
      expected: this.expected,
      computed: this.computed,
      message: this.message,
    };
  }
}

/**
 * CLI usage error — unknown flag, missing required argument, or a
 * mutually-exclusive combination (e.g. `--quiet --verbose`). Raised
 * before any pipeline stage executes.
 */
export class UsageError extends BuildError {
  override readonly name = "UsageError";
  override readonly code = EXIT_CODES.USAGE;
  override readonly kind = "usage";
  /** The offending flag, when the error is attributable to a single one. */
  readonly flag?: string;

  /**
   * @param opts - Constructor arguments.
   * @param opts.message - Single-line human description of the usage error.
   * @param opts.flag - Optional offending flag (e.g. `"--bogus"`).
   */
  constructor(opts: { message: string; flag?: string }) {
    super(opts.message);
    if (opts.flag !== undefined) {
      this.flag = opts.flag;
    }
  }

  /**
   * Serialise this error to a plain object for `--json` mode.
   *
   * The `flag` key is omitted entirely when it was not supplied to the
   * constructor, so consumers can distinguish "no flag" from "flag is
   * the empty string".
   * @returns JSON-safe record with `kind`, `code`, optionally `flag`,
   *   and `message`.
   */
  override toJSON(): {
    kind: "usage";
    code: 2;
    flag?: string;
    message: string;
  } {
    const out: { kind: "usage"; code: 2; flag?: string; message: string } = {
      kind: "usage",
      code: 2,
      message: this.message,
    };
    if (this.flag !== undefined) {
      out.flag = this.flag;
    }
    return out;
  }
}

/**
 * Format any {@link BuildError} as a single-line
 * `path:line:col: error: msg` string compatible with GitHub Actions'
 * built-in problem matchers. Line and column information is omitted
 * gracefully when not available — the surrounding `error:` token is the
 * load-bearing element matchers key on.
 *
 * The function uses an exhaustiveness check on the discriminator so a new
 * `BuildError` subclass added without updating this switch will produce
 * a TypeScript compilation error.
 * @param error - Structured `BuildError` instance to format.
 * @returns One-line error string suitable for stderr output.
 */
export function formatError(error: BuildError): string {
  switch (error.kind) {
    case "validation": {
      const ve = error as ValidationError;
      const tail = `expected ${ve.expected}, received ${ve.received}`;
      const detail = ve.path.length > 0 ? `(at ${ve.path.join(".")}, ${tail})` : `(${tail})`;
      return `${ve.file}: error: ${ve.message} ${detail}`;
    }
    case "io": {
      const ie = error as IOError;
      return `${ie.path}: error: ${ie.operation} failed: ${ie.message}`;
    }
    case "schema-drift": {
      const sd = error as SchemaDriftError;
      const expected = sd.expected ?? "none";
      return `error: schema hash drift (expected ${expected}, computed ${sd.computed})`;
    }
    case "usage": {
      const ue = error as UsageError;
      const flagPart = ue.flag !== undefined ? `[${ue.flag}] ` : "";
      return `error: ${flagPart}${ue.message}`;
    }
    default: {
      // Exhaustiveness guard: if a new subclass is added without updating
      // this switch, TypeScript will reject the assignment to `never`.
      const _exhaustive: never = error as never;
      void _exhaustive;
      return `error: ${error.message}`;
    }
  }
}
