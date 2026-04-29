<p align="center"><img src="../../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# ADR-014: opensips-security-advisor v1 — single skill, cross-version, semantic folders

**Status:** Accepted
**Date:** 2026-04-29
**Deciders:** Shlomi Gutman (Voicenter)
**Technical story:** Activates the second plugin skill for the v1.1.0 release. Supersedes the scaffold-disabled posture from ADR-013.

---

## Context

The `opensips-security-advisor` skill was scaffolded under ADR-013 with `SKILL.md.scaffold` (disabled). Three independent authoring agents (Chats A, B, C) produced overlapping research material; a Thread 0 consolidation pass produced a partial canonical tree but left the skill non-functional and the source bundles in place.

Putting the advisor in front of users requires committing to: (a) one canonical structure for the skill, (b) a v1 scope that is shippable without further research, (c) cleanup of the parallel research trees.

The bundles invented research-paper architecture (Tier 0/1/2 specs, "detection engine" framing, hardening-index numerical scores with two competing formulas, SARIF output, three deployment-profile tiers) for what is, in reality, "Claude reads rules and applies them to a config file." Shipping requires resolving the over-engineering, not preserving it.

## Decision

Ship the security advisor as **one skill, cross-version**, with a semantic folder layout under `references/`:

- `references/{workflow,output-format,taxonomy,taint-model}.md` — four reference docs collapsed from 13 bundle docs.
- `references/rules/<family>/` — 12 family folders, 58 rules total.
- `references/version-notes/<X.Y>.md` — per-version CVE inventory and module deltas for 3.4, 3.5, 3.6, 4.0.
- `references/knowledge/{vulnerability-reference,sanitizer-registry,ser-lineage-notes,external-sources}.md` — supporting reference material.

Version-specific concerns are expressed inline in rule frontmatter (`applies_if_opensips_version`) and in `version-notes/`. The skill itself is NOT partitioned per OpenSIPs version (unlike `opensips-config`).

Fixtures and golden reports move outside the skill tree to `docs/testing/security-advisor/`. The three chat bundles, Thread 0 state, and reconciliation logs move to `docs/research/security-advisor-consolidation/` — preserved on disk, do not ship via the plugin.

Skill tools: `Read, Glob, Grep` only (read-only). The skill never writes to any file, including its sibling `opensips-config`'s tree.

Rule IDs use short codes: `OSIPS-SEC-<DOMAIN>-NNN` where `<DOMAIN>` is one of AUTH, INJ, MI, TLS, DOS, RELAY, ID, STIR, MEDIA, LB, LOG, HYG.

## Out of v1 (deliberately, not as TODOs)

- **Hardening-index numerical score** — both Chat A and Chat C proposed formulas; neither was empirically validated. v1 ships severity-ranked findings without an aggregate score.
- **SARIF output** — Markdown only.
- **L3 deployment profile** — only L1 (enterprise PBX) and L2 (carrier edge) in v1.
- **Schema-versioning fields on output** — v1 IS the schema.
- **Automated fixture-replay test runner** — v1 validation is a manual smoke test against committed fixtures.

These items are not promised for v2 or any other release. If a future release wants any of them, it gets its own spec. Reference docs in this skill do not contain TODO/TBD/v2/deferred placeholders for them.

## Alternatives considered

- **Per-version isolation matching `opensips-config`** — rejected. The bulk of security knowledge does not vary by OpenSIPs version. A per-version partition would force 4× duplication for content that changes for ~10% of rules at most. Per-rule version gates plus a single `version-notes/` tree achieve the same result without the duplication tax.
- **Keep the numbered-prefix folder structure from the bundles** (`10_architecture/`, `20_runtime/`, etc.) — rejected as research-paper-flavored ceremony unhelpful in a Claude Code skill. Semantic names communicate purpose to anyone reading the tree for the first time.
- **Defer to v2** — rejected because the catalog is authored and only needs consolidation; no new research is required. Holding back ships the project's investment for no benefit.
- **Hybrid: per-version partition for rules, cross-version for specs** — rejected. Adds complexity without clearly addressing a real failure mode. Per-rule version gates are simpler.

## Consequences

**Positive:**

- The skill activates on broad security-review triggers across 12 families.
- Adding a new OpenSIPs version requires authoring one `version-notes/X.Y.md`, not duplicating the entire reference tree.
- The CVE-2026-25554 verification work from Chat C propagates into v1 via direct migration of `vulnerability-reference.md` and the AUTH-004 rule.
- A single canonical tree replaces four parallel ones (parent-level numbered dirs, three chat bundles, Thread 0 nested tree); maintainers have one place to look.

**Negative:**

- Per-version isolation in `opensips-config` and cross-version scope in `opensips-security-advisor` is an asymmetry. Maintainers working on both skills hold two mental models. The asymmetry is intentional (different content shapes warrant different structures), but it is a cost.
- Rules with version-specific behavior carry that information in frontmatter. A reader scanning the rule body alone may miss it; the workflow doc must remind Claude to check version frontmatter at every rule application.
- The 58-rule catalog was authored by a research agent and verified case-by-case only for CVE-2026-25554. Other CVE/CVSS values in rule frontmatter may have inaccuracies that surface in field use. The smoke test catches gross failures but is not a substitute for case-by-case rule validation.

**Neutral:**

- The skill folder shape is now `SKILL.md` + `README.md` + `references/`. That diverges from `opensips-config`'s shape (which is the same skeleton but populated by a build script from JSON). The two skills share an architectural shape but not a build pipeline — security-advisor's content is hand-authored, not generated.

## Implementation notes

- Migration of Chat B's 58 rules used a one-off bash script (`scripts/migrate-security-rules.sh`, deleted after run) that performed: family-folder rename to kebab-case, rule-ID prefix rewrite (e.g., `INJECTION-001` → `INJ-001`), and path-rewrite of internal references (`90_reference/...` → `knowledge/...`, `30_rules/...` → `rules/...`).
- The `_orphans/` directory under `docs/research/security-advisor-consolidation/chat-c-canonical-tree/` preserves alternates that Thread 0 quarantined; these are not consulted at runtime but are kept for provenance.
- The Thread 0 hardening-index conflict is now research-only: both Chat A's and Chat C's formulas exist in the bundles, neither is in the shipped skill.

## Related decisions

- **Supersedes (in part):** ADR-013 (the scaffold-disabled posture for `opensips-security-advisor`).
- **Depends on:** ADR-008 (SER-lineage neutral framing, enforced in security-advisor reports).
- **Depends on:** ADR-012 (merge of routing + modules into `opensips-config`, which provides the read-side identifier sanity-check data this skill consumes).

---

## Rule against feature creep

This ADR forbids adding speculative future features as TODOs in v1 content. If a feature is in v1 it is fully designed; if it is not, it is deleted, not deferred. Reviewers should reject any PR that introduces TBD/TODO/v2/deferred markers in the security-advisor reference tree. The shape of the design is the shape of the design; future work gets future ADRs.
