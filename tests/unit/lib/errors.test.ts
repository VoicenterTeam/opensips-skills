import { describe, it, expect } from "vitest";
import {
  EXIT_CODES,
  BuildError,
  ValidationError,
  IOError,
  SchemaDriftError,
  UsageError,
  formatError,
} from "../../../scripts/lib/errors.js";

describe("EXIT_CODES", () => {
  it("matches the data-pipeline.md §4 taxonomy", () => {
    expect(EXIT_CODES.SUCCESS).toBe(0);
    expect(EXIT_CODES.USAGE).toBe(2);
    expect(EXIT_CODES.VALIDATION).toBe(3);
    expect(EXIT_CODES.IO).toBe(4);
    expect(EXIT_CODES.SCHEMA_DRIFT).toBe(5);
  });
});

describe("ValidationError", () => {
  const make = (): ValidationError =>
    new ValidationError({
      message: "expected string, got number",
      file: "data/3.6/modules/tm.json",
      path: ["exported_parameters", 7, "type"],
      expected: "string",
      received: "number",
    });

  it("is an instance of BuildError and Error", () => {
    const err = make();
    expect(err).toBeInstanceOf(BuildError);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ValidationError);
  });

  it("has code 3, kind 'validation', and name 'ValidationError'", () => {
    const err = make();
    expect(err.code).toBe(EXIT_CODES.VALIDATION);
    expect(err.code).toBe(3);
    expect(err.kind).toBe("validation");
    expect(err.name).toBe("ValidationError");
  });

  it("can be caught and identified by name", () => {
    try {
      throw make();
    } catch (caught) {
      expect((caught as Error).name).toBe("ValidationError");
    }
  });

  it("exposes the structured fields supplied to the constructor", () => {
    const err = make();
    expect(err.file).toBe("data/3.6/modules/tm.json");
    expect(err.path).toEqual(["exported_parameters", 7, "type"]);
    expect(err.expected).toBe("string");
    expect(err.received).toBe("number");
    expect(err.message).toBe("expected string, got number");
  });

  it("toJSON() produces the documented structure including the message", () => {
    const err = make();
    expect(err.toJSON()).toEqual({
      kind: "validation",
      code: 3,
      file: "data/3.6/modules/tm.json",
      path: ["exported_parameters", 7, "type"],
      expected: "string",
      received: "number",
      message: "expected string, got number",
    });
  });

  it("toJSON() output is JSON-roundtrippable", () => {
    const err = make();
    const json = err.toJSON();
    const round = JSON.parse(JSON.stringify(json)) as unknown;
    expect(round).toEqual(json);
  });

  it("formatError() includes the file, message, path, expected, and received", () => {
    const err = make();
    expect(formatError(err)).toBe(
      "data/3.6/modules/tm.json: error: expected string, got number (at exported_parameters.7.type, expected string, received number)",
    );
  });

  it("formatError() with empty path omits the 'at <path>' clause", () => {
    const err = new ValidationError({
      message: "root validation failed",
      file: "data/3.6/modules/tm.json",
      path: [],
      expected: "object",
      received: "null",
    });
    expect(formatError(err)).toBe(
      "data/3.6/modules/tm.json: error: root validation failed (expected object, received null)",
    );
  });
});

describe("IOError", () => {
  const make = (): IOError =>
    new IOError({
      message: "ENOENT: no such file or directory",
      operation: "read",
      path: "/abs/data/3.6/modules/tm.json",
    });

  it("is an instance of BuildError and Error", () => {
    const err = make();
    expect(err).toBeInstanceOf(BuildError);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(IOError);
  });

  it("has code 4, kind 'io', and name 'IOError'", () => {
    const err = make();
    expect(err.code).toBe(EXIT_CODES.IO);
    expect(err.code).toBe(4);
    expect(err.kind).toBe("io");
    expect(err.name).toBe("IOError");
  });

  it("can be caught and identified by name", () => {
    try {
      throw make();
    } catch (caught) {
      expect((caught as Error).name).toBe("IOError");
    }
  });

  it("exposes operation and path fields", () => {
    const err = make();
    expect(err.operation).toBe("read");
    expect(err.path).toBe("/abs/data/3.6/modules/tm.json");
    expect(err.message).toBe("ENOENT: no such file or directory");
  });

  it("preserves an optional cause when provided", () => {
    const cause = new Error("underlying ENOENT");
    const err = new IOError({
      message: "wrapped",
      operation: "read",
      path: "/x",
      cause,
    });
    expect(err.cause).toBe(cause);
  });

  it("toJSON() produces the documented structure including the message", () => {
    const err = make();
    expect(err.toJSON()).toEqual({
      kind: "io",
      code: 4,
      operation: "read",
      path: "/abs/data/3.6/modules/tm.json",
      message: "ENOENT: no such file or directory",
    });
  });

  it("toJSON() output is JSON-roundtrippable", () => {
    const err = make();
    const json = err.toJSON();
    const round = JSON.parse(JSON.stringify(json)) as unknown;
    expect(round).toEqual(json);
  });

  it("formatError() produces 'path: error: <op> failed: <msg>'", () => {
    const err = make();
    expect(formatError(err)).toBe(
      "/abs/data/3.6/modules/tm.json: error: read failed: ENOENT: no such file or directory",
    );
  });
});

describe("SchemaDriftError", () => {
  const make = (): SchemaDriftError =>
    new SchemaDriftError({
      expected: "abc123",
      computed: "def456",
    });

  it("is an instance of BuildError and Error", () => {
    const err = make();
    expect(err).toBeInstanceOf(BuildError);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(SchemaDriftError);
  });

  it("has code 5, kind 'schema-drift', and name 'SchemaDriftError'", () => {
    const err = make();
    expect(err.code).toBe(EXIT_CODES.SCHEMA_DRIFT);
    expect(err.code).toBe(5);
    expect(err.kind).toBe("schema-drift");
    expect(err.name).toBe("SchemaDriftError");
  });

  it("can be caught and identified by name", () => {
    try {
      throw make();
    } catch (caught) {
      expect((caught as Error).name).toBe("SchemaDriftError");
    }
  });

  it("exposes expected and computed fields", () => {
    const err = make();
    expect(err.expected).toBe("abc123");
    expect(err.computed).toBe("def456");
  });

  it("supports a null expected hash (no committed baseline yet)", () => {
    const err = new SchemaDriftError({ expected: null, computed: "def456" });
    expect(err.expected).toBeNull();
    expect(err.computed).toBe("def456");
  });

  it("toJSON() produces the documented structure including the message", () => {
    const err = make();
    const json = err.toJSON();
    expect(json).toEqual({
      kind: "schema-drift",
      code: 5,
      expected: "abc123",
      computed: "def456",
      message: err.message,
    });
    expect(typeof json.message).toBe("string");
    expect(json.message.length).toBeGreaterThan(0);
  });

  it("toJSON() output is JSON-roundtrippable", () => {
    const err = make();
    const json = err.toJSON();
    const round = JSON.parse(JSON.stringify(json)) as unknown;
    expect(round).toEqual(json);
  });

  it("formatError() produces the schema hash drift message with both hashes", () => {
    const err = make();
    expect(formatError(err)).toBe(
      "error: schema hash drift (expected abc123, computed def456)",
    );
  });

  it("formatError() shows 'none' when expected hash is null", () => {
    const err = new SchemaDriftError({ expected: null, computed: "def456" });
    expect(formatError(err)).toBe(
      "error: schema hash drift (expected none, computed def456)",
    );
  });
});

describe("UsageError", () => {
  const make = (): UsageError =>
    new UsageError({
      message: "unknown flag",
      flag: "--bogus",
    });

  it("is an instance of BuildError and Error", () => {
    const err = make();
    expect(err).toBeInstanceOf(BuildError);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(UsageError);
  });

  it("has code 2, kind 'usage', and name 'UsageError'", () => {
    const err = make();
    expect(err.code).toBe(EXIT_CODES.USAGE);
    expect(err.code).toBe(2);
    expect(err.kind).toBe("usage");
    expect(err.name).toBe("UsageError");
  });

  it("can be caught and identified by name", () => {
    try {
      throw make();
    } catch (caught) {
      expect((caught as Error).name).toBe("UsageError");
    }
  });

  it("exposes flag and message fields", () => {
    const err = make();
    expect(err.flag).toBe("--bogus");
    expect(err.message).toBe("unknown flag");
  });

  it("flag is optional", () => {
    const err = new UsageError({ message: "no command supplied" });
    expect(err.flag).toBeUndefined();
    expect(err.message).toBe("no command supplied");
  });

  it("toJSON() produces the documented structure including the message", () => {
    const err = make();
    expect(err.toJSON()).toEqual({
      kind: "usage",
      code: 2,
      flag: "--bogus",
      message: "unknown flag",
    });
  });

  it("toJSON() omits the flag key when undefined", () => {
    const err = new UsageError({ message: "no command supplied" });
    const json = err.toJSON();
    expect(json).toEqual({
      kind: "usage",
      code: 2,
      message: "no command supplied",
    });
    expect("flag" in json).toBe(false);
  });

  it("toJSON() output is JSON-roundtrippable", () => {
    const err = make();
    const json = err.toJSON();
    const round = JSON.parse(JSON.stringify(json)) as unknown;
    expect(round).toEqual(json);
  });

  it("formatError() includes the flag in brackets when present", () => {
    const err = make();
    expect(formatError(err)).toBe("error: [--bogus] unknown flag");
  });

  it("formatError() omits the flag clause when undefined", () => {
    const err = new UsageError({ message: "no command supplied" });
    expect(formatError(err)).toBe("error: no command supplied");
  });
});
