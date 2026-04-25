import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  selectSchemaForFile,
  validateSourceFile,
  validateVersion,
} from "../../../scripts/lib/validate.js";
import {
  CoreVariableDocumentSchema,
  CoreFunctionDocumentSchema,
  CoreParameterDocumentSchema,
  OperatorDocumentSchema,
  StatementDocumentSchema,
  RouteDocumentSchema,
  TransformationDocumentSchema,
  AsyncDocumentSchema,
  MICommandDocumentSchema,
  EventDocumentSchema,
  StatisticDocumentSchema,
  FlagDocumentSchema,
  ModuleDocumentSchema,
  GuideDocumentSchema,
} from "../../../scripts/schemas/index.js";

const FIXTURE_ROOT = resolve(
  import.meta.dirname,
  "../../__fixtures__/source",
);
const FIXTURE_VARIABLES_VALID = join(FIXTURE_ROOT, "3.6/core/variables.json");
const FIXTURE_VARIABLES_INVALID = join(
  FIXTURE_ROOT,
  "3.6/core/variables-invalid.json",
);
const FIXTURE_MODULE_VALID = join(
  FIXTURE_ROOT,
  "3.6/modules/sample-module.json",
);
const FIXTURE_MODULE_MALFORMED = join(
  FIXTURE_ROOT,
  "3.6/modules/sample-module-malformed.json",
);

describe("selectSchemaForFile", () => {
  it("returns CoreVariableDocumentSchema for core/variables.json", () => {
    expect(selectSchemaForFile("core", "variables.json")).toBe(
      CoreVariableDocumentSchema,
    );
  });

  it("returns CoreFunctionDocumentSchema for core/functions.json", () => {
    expect(selectSchemaForFile("core", "functions.json")).toBe(
      CoreFunctionDocumentSchema,
    );
  });

  it("returns CoreParameterDocumentSchema for core/parameters.json", () => {
    expect(selectSchemaForFile("core", "parameters.json")).toBe(
      CoreParameterDocumentSchema,
    );
  });

  it("returns OperatorDocumentSchema for core/operators.json", () => {
    expect(selectSchemaForFile("core", "operators.json")).toBe(
      OperatorDocumentSchema,
    );
  });

  it("returns StatementDocumentSchema for core/statements.json", () => {
    expect(selectSchemaForFile("core", "statements.json")).toBe(
      StatementDocumentSchema,
    );
  });

  it("returns RouteDocumentSchema for core/routes.json", () => {
    expect(selectSchemaForFile("core", "routes.json")).toBe(
      RouteDocumentSchema,
    );
  });

  it("returns TransformationDocumentSchema for core/transformations.json", () => {
    expect(selectSchemaForFile("core", "transformations.json")).toBe(
      TransformationDocumentSchema,
    );
  });

  it("returns AsyncDocumentSchema for core/async.json", () => {
    expect(selectSchemaForFile("core", "async.json")).toBe(AsyncDocumentSchema);
  });

  it("returns MICommandDocumentSchema for core/mi-commands.json", () => {
    expect(selectSchemaForFile("core", "mi-commands.json")).toBe(
      MICommandDocumentSchema,
    );
  });

  it("returns EventDocumentSchema for core/events.json", () => {
    expect(selectSchemaForFile("core", "events.json")).toBe(EventDocumentSchema);
  });

  it("returns StatisticDocumentSchema for core/statistics.json", () => {
    expect(selectSchemaForFile("core", "statistics.json")).toBe(
      StatisticDocumentSchema,
    );
  });

  it("returns FlagDocumentSchema for core/flags.json", () => {
    expect(selectSchemaForFile("core", "flags.json")).toBe(FlagDocumentSchema);
  });

  it("returns ModuleDocumentSchema for any modules/*.json", () => {
    expect(selectSchemaForFile("modules", "tm.json")).toBe(ModuleDocumentSchema);
    expect(selectSchemaForFile("modules", "acc.json")).toBe(ModuleDocumentSchema);
    expect(selectSchemaForFile("modules", "anything-else.json")).toBe(
      ModuleDocumentSchema,
    );
  });

  it("returns GuideDocumentSchema for any guides/*.json", () => {
    expect(selectSchemaForFile("guides", "configuration.json")).toBe(
      GuideDocumentSchema,
    );
    expect(selectSchemaForFile("guides", "installation.json")).toBe(
      GuideDocumentSchema,
    );
    expect(selectSchemaForFile("guides", "syntax.json")).toBe(GuideDocumentSchema);
  });

  it("returns null for an unrecognized core filename", () => {
    expect(selectSchemaForFile("core", "unknown-name.json")).toBeNull();
  });
});

describe("validateSourceFile", () => {
  it("returns ok=true with the parsed document for a valid file", () => {
    const result = validateSourceFile(
      FIXTURE_VARIABLES_VALID,
      CoreVariableDocumentSchema,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.file).toBe(FIXTURE_VARIABLES_VALID);
      expect(result.document.document_type).toBe("core_variable");
      expect(Array.isArray(result.document.variables)).toBe(true);
    }
  });

  it("returns ok=false with at least one schema issue when fields are wrong type", () => {
    const result = validateSourceFile(
      FIXTURE_VARIABLES_INVALID,
      CoreVariableDocumentSchema,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.file).toBe(FIXTURE_VARIABLES_INVALID);
      expect(result.issues.length).toBeGreaterThan(0);
      const schemaIssue = result.issues.find((i) => i.kind === "schema");
      expect(schemaIssue).toBeDefined();
      // The message should reference the field path (variables.1.readable).
      expect(schemaIssue!.message).toMatch(/readable/);
      // The structured path should be present and include the offending key.
      expect(schemaIssue!.path).toBeDefined();
      expect(schemaIssue!.path!.join(".")).toMatch(/variables\.1\.readable/);
    }
  });

  it("returns ok=false with kind=parse for a malformed JSON file", () => {
    const result = validateSourceFile(
      FIXTURE_MODULE_MALFORMED,
      ModuleDocumentSchema,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.file).toBe(FIXTURE_MODULE_MALFORMED);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]!.kind).toBe("parse");
    }
  });

  it("returns ok=false with kind=io for a non-existent file", () => {
    const missing = join(FIXTURE_ROOT, "3.6/core/does-not-exist.json");
    const result = validateSourceFile(missing, CoreVariableDocumentSchema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.file).toBe(missing);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]!.kind).toBe("io");
    }
  });

  it("validates a valid module fixture against ModuleDocumentSchema", () => {
    const result = validateSourceFile(
      FIXTURE_MODULE_VALID,
      ModuleDocumentSchema,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.document_type).toBe("module");
      expect(typeof result.document.module_name).toBe("string");
    }
  });
});

describe("validateVersion", () => {
  it("aggregates issues across the version when some files are bad (fixture root)", () => {
    const result = validateVersion(FIXTURE_ROOT, "3.6");
    // Fixture set has variables-invalid.json and sample-module-malformed.json,
    // so the overall validation must fail.
    expect(result.ok).toBe(false);
    expect(result.version).toBe("3.6");
    // There must be at least two issues — one for the schema-invalid file and
    // one for the malformed-JSON file.
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
    // Both file paths should appear in the issue list.
    const issueFiles = new Set(result.issues.map((i) => i.file));
    const hasInvalid = [...issueFiles].some((f) =>
      f.endsWith("variables-invalid.json"),
    );
    const hasMalformed = [...issueFiles].some((f) =>
      f.endsWith("sample-module-malformed.json"),
    );
    expect(hasInvalid).toBe(true);
    expect(hasMalformed).toBe(true);

    // Valid documents should still be retained in `documents`.
    expect(result.documents.core.length).toBeGreaterThanOrEqual(1);
    expect(result.documents.modules.length).toBeGreaterThanOrEqual(1);

    // fileCount counts every file the validator attempted to process.
    expect(result.fileCount).toBe(4);
  });

  it("returns ok=true with populated documents when all files validate (synthetic clean version)", () => {
    const tmp = mkdtempSync(join(tmpdir(), "validate-clean-"));
    try {
      const versionDir = join(tmp, "3.6");
      mkdirSync(versionDir, { recursive: true });
      mkdirSync(join(versionDir, "core"));
      mkdirSync(join(versionDir, "modules"));

      // Copy the valid fixtures across.
      const validVariables = require("node:fs").readFileSync(
        FIXTURE_VARIABLES_VALID,
        "utf8",
      );
      const validModule = require("node:fs").readFileSync(
        FIXTURE_MODULE_VALID,
        "utf8",
      );
      writeFileSync(join(versionDir, "core", "variables.json"), validVariables);
      writeFileSync(join(versionDir, "modules", "sl.json"), validModule);

      const result = validateVersion(tmp, "3.6");
      expect(result.ok).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.documents.core.length).toBe(1);
      expect(result.documents.modules.length).toBe(1);
      expect(result.fileCount).toBe(2);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("records a schema-lookup issue when a core file's name has no schema mapping", () => {
    const tmp = mkdtempSync(join(tmpdir(), "validate-lookup-"));
    try {
      const versionDir = join(tmp, "3.6");
      mkdirSync(versionDir, { recursive: true });
      mkdirSync(join(versionDir, "core"));
      // A core file whose name does not map to any schema.
      writeFileSync(join(versionDir, "core", "unknown-name.json"), "{}");

      const result = validateVersion(tmp, "3.6");
      expect(result.ok).toBe(false);
      const lookupIssue = result.issues.find(
        (i) => i.kind === "schema-lookup",
      );
      expect(lookupIssue).toBeDefined();
      expect(lookupIssue!.file.endsWith("unknown-name.json")).toBe(true);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("surfaces an IO failure when the version directory does not exist", () => {
    const tmp = mkdtempSync(join(tmpdir(), "validate-missing-"));
    try {
      // Note: tmp exists but the version subdir does not.
      const result = validateVersion(tmp, "9.9");
      expect(result.ok).toBe(false);
      expect(result.issues.length).toBeGreaterThanOrEqual(1);
      expect(result.issues[0]!.kind).toBe("io");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("validateVersion (fail-slow continuation)", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "validate-failslow-"));
  });

  afterEach(() => {
    if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
  });

  it("continues processing remaining files after one fails", () => {
    const versionDir = join(tmp, "3.6");
    mkdirSync(versionDir, { recursive: true });
    mkdirSync(join(versionDir, "core"));

    // Two malformed files — both must show up as parse issues.
    writeFileSync(join(versionDir, "core", "variables.json"), "{not-json");
    writeFileSync(join(versionDir, "core", "operators.json"), "[oops");

    const result = validateVersion(tmp, "3.6");
    expect(result.ok).toBe(false);
    const parseIssues = result.issues.filter((i) => i.kind === "parse");
    expect(parseIssues.length).toBe(2);
  });
});
