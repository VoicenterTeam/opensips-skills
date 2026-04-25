# Test Fixtures

Fixture files used to drive the validation unit tests in M1.D and beyond.

## What lives here

A small, deliberately minimal set of source documents that mirrors the real
project layout under `data/{version}/...`. Each pair (core + modules) has a
*valid* and an *invalid* variant so the validator can be exercised on both
happy-path and error paths.

```
source/3.6/
  core/
    variables.json              VALID   - small subset of real variables
    variables-invalid.json      INVALID - one field violates the Zod schema
                                          (variables[1].readable = "yes",
                                          must be a boolean)
  modules/
    sample-module.json          VALID   - minimal but complete module
                                          (derived from data/3.6/modules/sl.json)
    sample-module-malformed.json INVALID - truncated mid-string;
                                          JSON.parse throws SyntaxError
```

## The four-fixture pattern

For each domain (core, modules) the suite needs two shapes:

- A **valid** fixture confirms the validator accepts well-formed data.
- An **invalid** fixture confirms the validator rejects bad data and
  distinguishes the failure mode. The `*-invalid.json` file fails at the
  Zod schema layer (parses as JSON, fails type check); the `*-malformed.json`
  file fails earlier at `JSON.parse`. Tests should assert each path produces
  the right error class.

## Why a separate `source/` tree under `tests/__fixtures__/`

Per ADR-009, the project's real source layout is `data/{version}/...`.
Fixtures live under `tests/__fixtures__/source/...` to keep the test
directory self-contained and to allow the discover stage to be exercised
against an isolated fixture root without touching production data.

## Pointer

See `docs/plan/01-schema-mirroring-and-validation.md` Task 1.7 for the
spec these fixtures satisfy.
