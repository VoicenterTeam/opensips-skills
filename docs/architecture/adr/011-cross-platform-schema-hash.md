<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-011: CRLF-tolerant schema hash for cross-platform stability

**Status:** Accepted
**Date:** 2026-04-25
**Deciders:** Project owner (Shlomi)
**Technical story:** 31 orchestrator/e2e tests failed with exit code 5 (`SchemaDriftError`) on Windows checkouts. Investigation showed the committed `scripts/schemas/.schema-hash` baseline (`006ad281…`, set at M1) didn't match the canonical content of the committed schema files on either Linux LF (`35ed9745…`) or Windows CRLF (`1101a9b…`) — a stale baseline plus a cross-platform stability bug compounding each other.

---

## Context

The schema-hash gate in [scripts/build-references.ts](../../../scripts/build-references.ts) `main()` runs `verifySchemaHash()` at stage 0 and aborts with exit 5 on any mismatch. Its purpose, per ADR-004 and the M1 plan, is to detect drift between the committed Zod schemas and the upstream `opensips-docs-collector` schema set without re-validating every source file from scratch.

[scripts/schemas/hash.ts](../../../scripts/schemas/hash.ts)'s docstring says the digest is "stable across operating systems," but the implementation hashed `readFileSync(abs)` raw bytes:

```ts
hash.update(readFileSync(abs));
```

On Git-for-Windows checkouts with the default `core.autocrlf=true`, tracked text files arrive in the working tree with CRLF terminators. On Linux/macOS they arrive as LF. The same canonical schema content thus produced two different hashes by platform, contradicting the stated guarantee. Independently, the committed M1 baseline (`006ad281…`) didn't match either platform's computed hash on any later commit — likely a stale value committed without re-running `npm run schemas:hash`.

The two defects compounded: even if the baseline had been correct for one platform, it would have been wrong for the other. Two distinct fixes were needed (correct hash function + correct baseline) but they share a single root cause: the hash function never tolerated cross-platform line endings.

## Decision

Normalise CRLF → LF inside `computeSchemaHash` before hashing each file, then regenerate the committed baseline:

```ts
const text = readFileSync(abs, "utf8").replace(/\r\n/g, "\n");
hash.update(Buffer.from(text, "utf8"));
```

The function now:

- Reads each schema file as UTF-8 text.
- Replaces every `\r\n` with `\n`.
- Hashes the LF-canonical bytes.

This makes the digest depend only on the canonical content, not the working-tree line endings. The baseline regenerates to `35ed9745…` (the LF-canonical hash matched by `git cat-file blob HEAD:…` content), which is what Linux CI naturally produces and what Windows now produces too.

A new unit test in [tests/unit/schemas/hash.test.ts](../../../tests/unit/schemas/hash.test.ts) writes the same content as both LF and CRLF into two temp directories and asserts the hashes match — guarding the cross-platform invariant going forward.

## Alternatives considered

- **Add `.gitattributes` with `*.ts text eol=lf`** to force LF on every checkout regardless of `core.autocrlf`. Tempting because it's the canonical Git solution to line-ending portability. Rejected as the primary fix because (a) it requires every existing Windows clone to run `git rm --cached -r .` + `git reset --hard` to renormalise — a destructive workflow we don't want to require — and (b) the CRLF tolerance inside the hash function is a single-file fix that achieves the same outcome without touching working-tree contents. We may still add `.gitattributes` later for unrelated tooling consistency, but it's no longer load-bearing for this gate.

- **Document the issue and tell Windows users to set `core.autocrlf=false` per-clone.** Tempting because it preserves the original `readFileSync(abs)` byte-level semantics. Rejected because it makes the project hostile to a default Windows installation and shifts the burden onto every contributor. The hash function's job is to be stable; if it isn't, fix the function.

- **Hash file contents via `git cat-file blob` directly** so the digest is always taken from the canonical Git-stored bytes. Tempting because it sidesteps line-ending translation entirely. Rejected because it introduces a `git` subprocess dependency into a build-tool function that currently has zero shell calls, and because `cat-file` semantics on uncommitted local edits would silently mask in-flight schema changes the gate is supposed to detect.

- **Accept the broken baseline and skip the gate in tests via an env flag** (`SKIP_SCHEMA_HASH=1`). Tempting because it requires zero baseline regeneration. Rejected because a production gate that's routinely bypassed is worse than no gate at all — the next real schema drift would be undetected.

## Consequences

**Positive:**
- Tests pass on Windows checkouts with default `core.autocrlf=true` (the Git-for-Windows default that 99% of contributors will have). 31 previously-failing orchestrator/e2e tests now pass.
- The hash function honours its own docstring's stability guarantee.
- The cross-platform invariant is now codified as a unit test — future edits to `hash.ts` can't silently regress it.
- Linux CI behaviour is unchanged: the LF-normalised hash is identical to what raw-byte hashing produced on LF-only checkouts.

**Negative:**
- The committed `.schema-hash` had to be regenerated, producing a one-line diff that looks like an unrelated incidental change unless reviewed alongside the `hash.ts` edit. Mitigation: this ADR + the commit message explain the linkage.
- The hash now reads files as UTF-8 text and re-encodes to bytes, costing one more allocation per file. Cost is trivial (20 small files, run once per build); recorded for completeness only.
- If a future contributor adds a schema file with intentionally mixed line endings (genuine `\r\n` literals inside string content the hash must distinguish), the normalisation will collapse the distinction. Vanishingly unlikely for a Zod schema file, but documented here.

**Neutral:**
- The function now reads files as UTF-8 explicitly. A non-UTF-8 schema file (BOM, latin-1) would now be subject to encoding interpretation rather than raw byte hashing. Schemas are pure ASCII TypeScript today; a future violation would surface as a parse error long before the hash mismatch.

## Implementation notes

- The fix is two characters of regex (`\r\n` → `\n`), three lines including encoding round-trip, and a 25-line unit test. The compounding stale-baseline defect is fixed by `npm run schemas:hash` (already a documented maintainer workflow per package.json).
- The CI's `npm run validate` job now exercises the corrected gate end-to-end without bypass flags.
- Optional follow-up: add `.gitattributes` enforcing LF on `*.ts` (not load-bearing for the hash, but cleaner for editor diffs and merge conflicts). Tracked separately if/when adopted.

## Related decisions

- **Depends on:** ADR-004 (Node + TypeScript stack and the Zod schema mirroring contract; this ADR fixes a cross-platform bug in that contract's enforcement gate).
- **Independent of:** ADR-010 (rendering-time output sanitization). Both ADRs landed in the same release window but address unrelated defects: ADR-010 cleans extraction artifacts from rendered output; this ADR fixes the build's startup gate.
