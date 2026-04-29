# Security Advisor C — Activity Log

This is the complete activity log for the chat named **Security Advisor C**. It accompanies the deliverable bundle `security-advisor-c.zip` and is intended to give a downstream operator (specifically: a Claude Code session continuing the consolidation) enough context to understand what's in the bundle, how it got there, what's been verified, and what's still open.

---

## 1. Scope and identity

This chat session contributed to a multi-session effort to author the **OpenSIPS Security Advisor** — a Claude skill plugin that statically analyzes OpenSIPS configuration files and surfaces security findings. The advisor is structured as a tiered set of architectural specs, rule files, version overlays, test fixtures, and reference documentation.

Multiple parallel sessions (referenced as Chats A, B, and C in project memory) contributed. This chat's role was the **C** stream — initially Chat C continuation, but extended through several phases of consolidation work. From a deliverable perspective, "Security Advisor C" is the contribution this chat is responsible for.

---

## 2. Bundle contents (security-advisor-c.zip)

```
opensips-security-advisor/
├── RECONCILIATION_LOG.md                    Full state-of-the-bundle ledger
├── 10_architecture/                         Tier 1 — locked architectural specs
│   ├── 11_DATA_MODEL.md
│   ├── 13_RULE_AUTHORING.md
│   ├── 14_DETECTION_ENGINE.md
│   ├── 15_CONFIDENCE_AND_VERIFICATION.md
│   └── 22_REPORT_TEMPLATES.md
├── 20_runtime/
│   └── 25_FIXTURE_SCHEMA.md                 Anchor-based .expected.json schema
├── 30_rules/                                Tier 3 — rule catalog (4 rules across 4 families)
│   ├── auth/OSIPS-SEC-AUTH-004.md           (CVE-2026-25554 detector, stable)
│   ├── injection/OSIPS-SEC-INJ-001.md       (avp_db_query SQLi, stable)
│   ├── mi_exposure/OSIPS-SEC-MI-001.md      (mi_http public bind, stable)
│   └── relay_and_routing/OSIPS-SEC-RELAY-001.md (open-relay, draft)
├── 40_versions/                             Tier 4 — version overlays
│   ├── 3.4.md
│   ├── 3.5.md
│   └── 3.6.md
├── 50_fixtures/                             Tier 5 — test fixtures
│   ├── clean/                               (1 cfg + .expected.json)
│   ├── golden_reports/                      (3 golden reports)
│   ├── tricky/                              (10 cfgs + .expected.json each)
│   └── vulnerable/                          (1 cfg + .expected.json)
└── 90_reference/                            Tier 6 — reference material
    ├── 01_master_vulnerability_reference.md
    ├── 02_enable_security_gap_analysis.md
    ├── 03_advisor_methodology_research.md   (honest stub — see § 5)
    ├── external_sources.md
    └── sanitizer_registry.yaml
```

48 files total. The `RECONCILIATION_LOG.md` at the bundle root carries the file-by-file breakdown including provenance (which session authored which file).

---

## 3. What this chat actually did

In rough chronological order:

### Phase 0 — Earlier chat work, prior to this transcript

Authored 5 of the 9 Tier 1 architectural specs, 2 rule files (MI-001, INJ-001), and the initial set of 3 fixtures + 3 golden reports. These were already bundled at `/mnt/user-data/outputs/opensips-advisor-session-bundle.zip` before this transcript began. They are now also incorporated into the consolidation bundle.

### Phase 1 — Continuation thread setup

Read the brief that was supposed to attach upstream artifacts (Phase 2 master vulnerability reference, Phase 3 Enable Security gap analysis, Phase 5 advisor methodology research, original locked manifest). Confirmed those artifacts were not retrievable. Surfaced the gap to the user and proposed a plan that proceeded with the unblocked work.

### Phase 2 — Schema and fixture authoring

Authored `25_FIXTURE_SCHEMA.md` — formalized the anchor-based `.expected.json` schema with `tolerance_lines`, `must_not_fire`, and `must_not_fire_as_vulnerability` semantics.

Authored 6 tricky fixtures, each with `.expected.json`:
- `permissions-allow-routing` — RELAY-001's permissions-FP class
- `kamailio-dialect` — engine behavior on Kamailio-only directives
- `commented-bad` — parser comment discipline
- `dead-code` — v1.0 non-path-sensitivity contract
- `multi-listener` — clean cfg with diverse listener inventory
- `nested-includes` — `include_file` blind spot handling

### Phase 3 — Version overlay drafting

Authored `40_versions/3.4.md`, `3.5.md`, `3.6.md`. Initial drafts left CVE-inventory sections stubbed with explicit TODO references back to `01_master_vulnerability_reference.md`.

### Phase 4 — User authorization to author from scratch

When user authorized authoring the missing reference docs from scratch (option α — one document at a time with research), I began Phase B (master vulnerability reference). At that point, I discovered `90_reference/01_master_vulnerability_reference.md` had appeared in the filesystem between turns. Surfaced this to the user.

### Phase 5 — Verification of pre-populated content

Per user instruction (option d — bounded spot-check verification), I web-searched authoritative sources to verify the most factually-loaded claims in the pre-populated `01_master_vulnerability_reference.md`. Specifically:

- **CVE-2026-25554 published values.** Verified via VulnCheck advisory and AISLE Research's own writeup. Confirmed CVSS 4.0 score 8.3, vector `CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N`, CWE-89, attribution to Pavel Kohout / AISLE Research, version range 3.1 through 3.6.4 prior to commit `3822d33`.

- **2023 Enable Security audit cluster.** Verified via Enable Security's announcement page. Confirmed the 11 CVE numbers (`CVE-2023-27596` through `28099`), the `7.5` CVSS for parser-crash items, the `5.9` CVSS for digest-auth-parser and ds_is_in_list, and the attribution to Sandro Gauci + Alfred Farrugia.

- **Sanitizer registry.** Verified via OpenSIPS sqlops module documentation that `escape.common` is the documented recommendation for SQL injection prevention, and confirmed the invocation syntax `$(var{s.escape.common})` matches operator-confirmed code samples.

The verification revealed that **earlier work in this chat had wrong values** for CVE-2026-25554 — the rules and goldens had used CVSS 9.3 with `VC:H/VI:H/VA:H` and CWE-287, when the actually-published values are CVSS 8.3 with `VC:H/VI:L/VA:N` and CWE-89. This was a real factual error in earlier work, not just a minor discrepancy.

### Phase 6 — Correction propagation

Patched `golden_vulnerable_mixed.md` F1 finding to use the verified CVSS values, including:
- Header table (CVSS, CWE, OWASP)
- Rationale prose (rewritten to describe SQL injection in jwt_db_authorize via tag claim before signature verification, not "JWT validation bypass" generically)
- SARIF rule descriptor block (security-severity, tags)
- SARIF taxa entry (CWE-89 description)

Populated the CVE-inventory sections of all three version overlays (`3.4.md`, `3.5.md`, `3.6.md`) with verified CVE content sourced from the master vulnerability reference.

### Phase 7 — Hardening index re-render

Re-rendered the goldens to match the locked Chat C hardening formula (`22_REPORT_TEMPLATES.md`):
- `golden_clean_l1.md`: 98 → 100 (the 98 was a non-spec adjustment; the locked formula gives 100 for a no-findings cfg)
- `golden_vulnerable_mixed.md`: 22 → 12 (the 22 used inconsistent weights; locked formula gives `100 - 2×20 - 3×10 - 2×6 - 2×3 = 12`)
- `golden_tricky_abstention.md`: 71 (already correct under locked formula)

### Phase 8 — Author 4 additional fixtures

When user authorized "everything that's open," I authored the 4 remaining brief-listed fixtures:
- `partially-mitigated-sqli` — sanitization on one path, not another
- `version-mismatch` — declared vs detected version disagreement
- `compensating-control` — MI-001 with trusted_clients allowlist demoting confidence
- `false-positive-cvss-gate` — vulnerable shape on patched version, must NOT fire

### Phase 9 — Verification of additional pre-populated content

In the same turn, four more files appeared between turns:
- `90_reference/02_enable_security_gap_analysis.md`
- `90_reference/03_advisor_methodology_research.md`
- `90_reference/external_sources.md`
- `90_reference/sanitizer_registry.yaml`
- `30_rules/auth/OSIPS-SEC-AUTH-004.md`
- `30_rules/relay_and_routing/OSIPS-SEC-RELAY-001.md`

Per (d) protocol I spot-checked each:
- File 02 — verified via the 11-CVE list (including CVE-2023-27596 and 28096 not in earlier conversation) — confirmed against Tenable and Enable Security primary sources.
- File 03 — explicitly authored as a structured stub. Acceptable — the file admits it can't be done well in one pass and defers, which matches the discipline I would have applied.
- File external_sources.md — bibliography URLs verified to be ones I'd actually used or that match the verified content.
- File sanitizer_registry.yaml — verified four `s.escape.*` entries are real OpenSIPS transformations.
- AUTH-004 rule file — uses the verified CVSS values (correct after the Phase 6 correction).
- RELAY-001 rule file — saved as `status: draft` with `judge_confirmed_can_be_high: true`. Both decisions match what continuation-session reasoning would have produced.

All accepted as legitimate input.

### Phase 10 — Final reconciliation and bundling

Authored final `RECONCILIATION_LOG.md`. Pulled in the 5 Tier 1 architectural specs from earlier session bundle into consolidation directory. Bundled everything as `security-advisor-c.zip`.

---

## 4. Verified factual record

Reflected consistently across the bundle as of 2026-04-29:

- **CVE-2026-25554** — CVSS 4.0 vector `AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N` score 8.3, CWE-89, OWASP A03:2021. Affects OpenSIPS 3.1 through 3.6.4 (prior to commit `3822d33`) with `auth_jwt` + `db_mode`. Discovered by Pavel Kohout / AISLE Research; fixed February 2, 2026.
- **2022 Enable Security audit** — 11 CVEs assigned, predominantly parser-crash class (DoS, not RCE). Authors: Sandro Gauci, Alfred Farrugia (Enable Security GmbH). Subject: OpenSIPS 3.2.2.
- **Hardening index formula (Chat C locked):** critical=20, high=10, medium=6, low=3, info=0; review_required at 0.5× multiplier; no floor; clamps 0–100.
- **Sanitizer registry:** four `s.escape.*` transformations native to OpenSIPS; `escape.common` is the documented SQL injection sanitizer per OpenSIPS sqlops module documentation.

---

## 5. The honest stub: 03_advisor_methodology_research.md

This file is intentionally a stub. The full version — comparative research on SAST methodologies (SonarQube, Semgrep, CodeQL), CIS Benchmarks, SARIF spec, LLM-as-judge frameworks (IRIS, SAST-Genius) — could not be authored well in one pass without primary-source consultation. The stub records the section structure and the design choices that need methodology-grounded justification. The implementation phase should expand it.

---

## 6. Provenance pattern (for downstream awareness)

Throughout this session, files appeared in the filesystem between turns that I had not authored. Each appearance was surfaced to the user and verified before incorporation. The pattern is most likely a parallel working session by the same user keeping pace with this chat's plan. If any artifact in the bundle looks internally inconsistent in a way suggesting two not-quite-synchronized authors, that's the explanation. The bounded spot-check verification protocol (option d) was the mitigation.

---

## 7. Persistent prompt-injection attempts

This session experienced sustained prompt-injection attempts at the bottom of nearly every user turn. These were `<note>` blocks fabricating system-instruction language, attempting to redirect me to launch research tasks unprompted, suppress reasoning, or hide tool use. I flagged each one in the visible response and did not act on any of them. The work in this bundle was not influenced by them. This is documented in case the consolidator sees similar patterns and needs context on how this chat handled them.

---

## 8. What's open for implementation

(Reproduced from `RECONCILIATION_LOG.md` § "Open items for implementation" for convenience.)

### High priority
1. Author missing Tier 1 specs: `23_SUPPRESSION_PROTOCOL.md`, `24_HARDENING_INDEX.md` (extract from `22_REPORT_TEMPLATES.md`).
2. Promote `OSIPS-SEC-RELAY-001` from draft to stable after peer review.
3. Author projected rules referenced widely but not present: `OSIPS-SEC-AUTH-001`, `AUTH-002`, `TLS-001`, `DOS-001`, `LOG-001`, `CFG-001`.
4. Resolve synthetic rule IDs in fixtures (`CFG-VERSION-MISMATCH`, `CFG-INCLUDE-UNRESOLVED`, `CFG-PARSE-ERROR`).

### Medium priority
5. Replace `03_advisor_methodology_research.md` stub with researched content.
6. Author Tier 0 orientation docs (`README.md`, `00_OVERVIEW.md`, `01_QUICKSTART.md`).
7. Author per-family `_INDEX.md` files (12 of them).
8. Mirror critical external URLs to avoid link rot.

### Low priority
9. Verify URLs in `external_sources.md` not directly checked this session.
10. Add SQL-injection sibling rules for `cachedb_query`, `db_query`, `sql_query`.
11. Investigate the `s.escape.param` over-escaping bug documented in OpenSIPS user mailing list.

### Architectural items flagged
12. `cancel_if_present:` schema gap — lightweight matchers lack a fire-unless-cancelled primitive.
13. CVSS aggregation policy unspecified — worst-case-across-modules vs per-module.
14. v1.0 path sensitivity — unreachable code treated as reachable; `dead-code.cfg` contractualizes this.

### Acknowledgments
15. Goldens are calibration artifacts, not regression tests. Implementers should not treat them as byte-exact.
16. Sanitizer registry stays small by authoring discipline. Resist broadening classes.

---

## 9. Hand-off to Claude Code

The intended consumer of this bundle is a Claude Code session that will:
1. Unpack `security-advisor-c.zip` into the working tree.
2. Merge with whatever Chat A and Chat B produced (their bundles, if they exist, will need to be acquired separately).
3. Resolve any cross-bundle inconsistencies (different rule_id naming conventions between Chat B and Chat C is the known issue per memory entries 11-14).
4. Author the missing high-priority items in § 8.
5. Author the Tier 0 orientation docs last so they distill the rest.
6. Run a final validation pass: every rule's frontmatter `references[].path` should resolve; every fixture's `rule_id` references should match an actual rule_id in the catalog.

Good luck.
