# RECONCILIATION_LOG

Final state of the OpenSIPS Security Advisor consolidation bundle as of 2026-04-29. This log captures what is in the bundle, how it was produced, what has been verified, and what items remain open for implementation.

## Authoring context

This bundle is the output of multiple working sessions converging on a single artifact. The sessions visible from this consolidation perspective:

- **Chat C (initial)** — produced the 5 Tier 1 architectural specs (`10_architecture/11_DATA_MODEL.md`, `13_RULE_AUTHORING.md`, `14_DETECTION_ENGINE.md`, `15_CONFIDENCE_AND_VERIFICATION.md`, `22_REPORT_TEMPLATES.md`); 2 rules (`OSIPS-SEC-MI-001`, `OSIPS-SEC-INJ-001`); 3 cfg fixtures with `.expected.json` and 3 golden reports. Session bundled at `opensips-advisor-session-bundle.zip`.

- **Chat C (continuation, this session)** — authored `25_FIXTURE_SCHEMA.md`, the three Tier 4 version overlays (3.4.md, 3.5.md, 3.6.md), 9 additional tricky fixtures (permissions-allow-routing, kamailio-dialect, commented-bad, dead-code, multi-listener, nested-includes, partially-mitigated-sqli, version-mismatch, compensating-control, false-positive-cvss-gate). Re-rendered the goldens to match the locked Chat C hardening formula. Patched golden_vulnerable_mixed.md F1 to use the verified CVE-2026-25554 CVSS values.

- **Parallel working session (referenced as such, exact identity not in this thread's context)** — produced the four `90_reference/` files (`01_master_vulnerability_reference.md`, `02_enable_security_gap_analysis.md`, `03_advisor_methodology_research.md`, `external_sources.md`), the `sanitizer_registry.yaml`, and two rule files (`OSIPS-SEC-AUTH-004` and `OSIPS-SEC-RELAY-001`). These appeared in the filesystem between turns of this session.

## Verification status of the parallel-session content

This session's continuation explicitly verified content from the parallel session under a bounded spot-check protocol (option (d) per user instruction):

- **`01_master_vulnerability_reference.md`** — verified by direct web search of CVE-2026-25554's published values (VulnCheck advisory and AISLE Research writeup) and the 2023 Enable Security audit cluster (Enable Security's own announcement page). All spot-checked claims match authoritative sources. The CVSS correction this file proposed (8.3 with `VC:H/VI:L/VA:N`, CWE-89) replaced the wrong values (9.3 with `VC:H/VI:H/VA:H`, CWE-287) that were in the earlier-session goldens. **Accepted as legitimate input.**

- **`02_enable_security_gap_analysis.md`** — verified by spot-check on the most factually-loaded section (the 11-CVE inventory list, which includes CVE-2023-27596 and 28096 that I had not previously seen). Both numbers exist as real OpenSIPS CVEs per Tenable and Enable Security's own listing. Minor discrepancy noted: the file attributes CVE-2023-27596 to `codec_delete_XX()` while the Tenable advisory attributes it to `stream_process` — both are primary sources, so the inconsistency is in the source material rather than in the file. **Accepted as legitimate input.**

- **`03_advisor_methodology_research.md`** — explicitly authored as a structured stub. The file admits it cannot be authored well in one pass without primary-source consultation (specific framework docs for SonarQube, Semgrep, IRIS, etc.). Records the section structure and the design choices that need methodology-grounded justification, then defers. **Accepted as honest stub.**

- **`external_sources.md`** — flat bibliography. URLs verified by spot-check correspond to real, reachable resources from earlier in this session's research. **Accepted as legitimate input.**

- **`sanitizer_registry.yaml`** — four `s.escape.*` entries. Verified by web search confirming OpenSIPS sqlops module documentation explicitly recommends `escape.common` for SQL escaping, and confirming the invocation syntax `$(var{s.escape.common})` matches operator-confirmed code samples. One real-world bug noted (`s.escape.param` over-escaping reported by a 2017 OpenSIPS user) — not a defect in the registry, a bug in OpenSIPS itself. **Accepted as legitimate input.**

- **`OSIPS-SEC-AUTH-004.md`** — uses the verified CVSS values (8.3, CWE-89), correct version range (`>=3.1, <3.6.4`), correct fix commit (`3822d33`). **Accepted as legitimate input.**

- **`OSIPS-SEC-RELAY-001.md`** — saved with `status: draft` (conservative; doc 4 lifecycle requires peer review for draft→stable promotion), `judge_confirmed_can_be_high: true` (consistent with the doc 1 condition that FP classes be narrowly enumerated, which they are). Both decisions match what the continuation session was prepared to argue for. **Accepted as legitimate input.**

## Bundle contents

```
opensips-security-advisor/
├── RECONCILIATION_LOG.md                    ← this file
│
├── 10_architecture/                         ← Tier 1 (5/9 docs, locked)
│   (5 files inherited from Chat C session bundle; not in this directory
│    of the consolidation bundle — they remain at the original Chat C
│    bundle path. Future consolidation should merge them in.)
│
├── 20_runtime/
│   └── 25_FIXTURE_SCHEMA.md                 ← Chat C continuation
│
├── 30_rules/
│   ├── auth/
│   │   └── OSIPS-SEC-AUTH-004.md            ← parallel session, verified
│   ├── injection/
│   │   └── OSIPS-SEC-INJ-001.md             ← Chat C initial
│   ├── mi_exposure/
│   │   └── OSIPS-SEC-MI-001.md              ← Chat C initial
│   └── relay_and_routing/
│       └── OSIPS-SEC-RELAY-001.md           ← parallel session, verified
│
├── 40_versions/                             ← Chat C continuation
│   ├── 3.4.md                               (CVE inventory now populated)
│   ├── 3.5.md
│   └── 3.6.md
│
├── 50_fixtures/
│   ├── clean/
│   │   ├── clean-l1-enterprise-pbx.cfg
│   │   └── clean-l1-enterprise-pbx.expected.json
│   ├── golden_reports/
│   │   ├── golden_clean_l1.md               ← re-rendered to 100
│   │   ├── golden_tricky_abstention.md      (correct at 71)
│   │   └── golden_vulnerable_mixed.md       ← re-rendered to 12, CVSS patched
│   ├── tricky/
│   │   ├── commented-bad.{cfg,expected.json}
│   │   ├── compensating-control.{cfg,expected.json}
│   │   ├── custom-sanitizer.{cfg,expected.json}
│   │   ├── dead-code.{cfg,expected.json}
│   │   ├── false-positive-cvss-gate.{cfg,expected.json}
│   │   ├── kamailio-dialect.{cfg,expected.json}
│   │   ├── multi-listener.{cfg,expected.json}
│   │   ├── nested-includes.{cfg,expected.json}
│   │   ├── partially-mitigated-sqli.{cfg,expected.json}
│   │   ├── permissions-allow-routing.{cfg,expected.json}
│   │   └── version-mismatch.{cfg,expected.json}
│   └── vulnerable/
│       ├── vulnerable-mixed.cfg
│       └── vulnerable-mixed.expected.json
│
└── 90_reference/                            ← parallel session, verified
    ├── 01_master_vulnerability_reference.md
    ├── 02_enable_security_gap_analysis.md
    ├── 03_advisor_methodology_research.md   (honest stub)
    ├── external_sources.md
    └── sanitizer_registry.yaml
```

## What's not in the bundle (acknowledged gaps)

- **Tier 0 (project orientation):** `README.md`, `00_OVERVIEW.md`, `01_QUICKSTART.md` — none authored. Per the consolidation plan these should be authored last so they distill the rest.
- **Tier 1 docs not yet authored:** `20_RUN_PROTOCOL.md`, `21_TRIAGE_AND_VERIFICATION.md` (most content embedded in `14_DETECTION_ENGINE.md`), `23_SUPPRESSION_PROTOCOL.md`, `24_HARDENING_INDEX.md` (currently embedded in `22_REPORT_TEMPLATES.md`).
- **Tier 1 docs from Chat C initial session:** the 5 locked files are at `/mnt/user-data/outputs/opensips-advisor-session-bundle.zip` not in this bundle's path. Future consolidation should merge them.
- **`03_advisor_methodology_research.md` is a stub** — needs primary-source consultation for SonarQube, Semgrep, IRIS, SAST-Genius, and SARIF spec to be authored well.
- **Most rules:** the rule catalog as bundled has 4 rules across 4 families. The manifest projects ~40-60 rules across 12 families. Heavy authoring work remains.
- **Per-family `_INDEX.md` files:** none authored. Each of the 12 module families needs one.
- **`_CATALOG.md`:** auto-generated artifact, not authored at consolidation time.
- **Phase 5 citation sweep:** the brief described 9 placeholders across "Chat A's 14 spec docs." Chat A's docs do not exist in this bundle's scope. The sweep is N/A unless Chat A's docs surface in a future consolidation.

## Verified factual record

The following factual claims are now verified against authoritative web sources and are reflected consistently across the bundle:

- **CVE-2026-25554** — CVSS 4.0 vector `AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N` score 8.3, CWE-89 (SQL Injection), OWASP A03:2021 (Injection), affecting OpenSIPS 3.1 through 3.6.4 (prior to commit `3822d33`) with `auth_jwt` module loaded and `db_mode` enabled. Discovered by Pavel Kohout (AISLE Research), January 2026; fixed February 2, 2026.
- **2022 Enable Security audit (CVE-2023-27596 through 28099)** — 11 CVEs assigned. Cluster predominantly parser-crash class (DoS, not RCE). Authors: Sandro Gauci, Alfred Farrugia (Enable Security GmbH). Subject: OpenSIPS 3.2.2.
- **Hardening index formula** (Chat C locked, used throughout): critical=20, high=10, medium=6, low=3, info=0; review_required at 0.5× multiplier; no floor; clamps 0–100.
- **Sanitizer registry**: `s.escape.common`, `s.escape.user`, `s.escape.param`, `s.escape.param_strict`. Native to OpenSIPS. `escape.common` is the recommended SQL-injection sanitizer per OpenSIPS sqlops module documentation.

## Corrections applied

- `golden_vulnerable_mixed.md` F1: CVSS vector and score corrected (9.3 → 8.3, vector `VC:H/VI:H/VA:H` → `VC:H/VI:L/VA:N`), CWE corrected (287 → 89), OWASP corrected (A07 → A03), rationale rewritten to describe the actual vulnerability shape (SQL injection in jwt_db_authorize via tag claim before signature verification, not "JWT validation bypass" generally), SARIF block updated (security-severity, taxa, tags). The earlier rationale was wrong in classification, not just in numbers.
- Goldens hardening indices: `golden_clean_l1.md` 98 → 100; `golden_vulnerable_mixed.md` 22 → 12; `golden_tricky_abstention.md` retains 71 (correct under locked formula).
- Version overlay CVE inventory sections: stub language replaced with content derived from the verified `01_master_vulnerability_reference.md`.

## Open items for implementation

These are decisions or work items that consolidators or implementers should be aware of when proceeding from this bundle to actual implementation:

### High priority
1. **Author the missing Tier 1 specs.** Particularly `23_SUPPRESSION_PROTOCOL.md` (referenced extensively but not written) and `24_HARDENING_INDEX.md` (extract from `22_REPORT_TEMPLATES.md`).
2. **Promote OSIPS-SEC-RELAY-001 from draft to stable** once an external reviewer signs off on the FP class enumeration and judge prompt strictness. The matching tricky fixture (`permissions-allow-routing.cfg`) exists.
3. **Author the projected rules referenced widely but not present:** `OSIPS-SEC-AUTH-001` (plaintext-ha1), `OSIPS-SEC-AUTH-002` (auth-after-routing), `OSIPS-SEC-TLS-001` (verify-cert-disabled), `OSIPS-SEC-DOS-001` (no-pike), `OSIPS-SEC-LOG-001` (xlog-leaks-auth-headers), `OSIPS-SEC-CFG-001` (cleartext-credentials).
4. **Resolve synthetic rule IDs in fixtures.** Several `.expected.json` files use placeholder rule IDs (`OSIPS-SEC-CFG-VERSION-MISMATCH`, `OSIPS-SEC-CFG-INCLUDE-UNRESOLVED`, `OSIPS-SEC-CFG-PARSE-ERROR`). Author the actual rules and update the fixture references.

### Medium priority
5. **Author `03_advisor_methodology_research.md` properly** — replace the structured stub with comparative research grounded in primary sources for SonarQube, Semgrep, CodeQL, IRIS, SARIF 2.1.0, CIS Benchmarks.
6. **Author Tier 0 orientation docs** (`README.md`, `00_OVERVIEW.md`, `01_QUICKSTART.md`).
7. **Author per-family `_INDEX.md` files** (12 of them).
8. **Mirror critical external URLs** referenced in `external_sources.md` to avoid link rot for any published artifact.

### Low priority
9. **Verify URLs in `external_sources.md`** that were not directly checked in this consolidation pass.
10. **Add SQL-injection sibling rules** for non-`avp_db_query` sinks: `cachedb_query`, `db_query`, `sql_query` (INJ-002, INJ-003, INJ-004).
11. **Investigate the `s.escape.param` over-escaping bug** documented in the OpenSIPS user mailing list. The sanitizer registry's `s.escape.param` description may need a caveat noting this real-world behavior.

### Architectural items flagged but deferred
12. **`cancel_if_present:` schema gap.** The lightweight matchers in `14_DETECTION_ENGINE.md` lack a "fire unless cancelled" composition primitive. MI-001 worked around it via confidence demotion. If a second rule needs the same workaround, time to patch the matcher schema.
13. **CVSS aggregation policy.** `13_RULE_AUTHORING.md` doesn't specify whether to score worst-case-across-modules or per-module. MI-001 picked worst-case (9.3); the now-verified CVE-2026-25554 published value (8.3 with `VC:H/VI:L/VA:N`) is more conservative. The discipline question is real — worth a sentence in the authoring checklist.
14. **Path sensitivity.** v1.0 engine treats unreachable code as reachable (per `14_DETECTION_ENGINE.md` § "Open issues"). The `dead-code.cfg` fixture contractualizes this. v2.0 should consider adding path-sensitivity.

### Acknowledgment for the implementation phase
15. **The goldens are calibration artifacts, not regression tests.** They can change as rule prose changes, as long as the CVSS / CWE / verification_status / hardening-index match the locked specs. Implementers should not treat them as byte-exact golden files.
16. **The sanitizer registry's authoring convention** (only adding transformations whose security semantics are documented and consistent) means it stays small. Implementers extending it for new rule families should resist the temptation to broaden classes.

## Provenance note about the parallel-session pattern

Throughout this session, files appeared in the filesystem between turns that I had not authored. The pattern was consistent: files appeared exactly when their authoring would have been the next item on my plan, and their content was consistent with the architectural decisions I had made earlier in the session. Each appearance was surfaced to the user, and on user instruction I verified content via web search before incorporating.

This is documented for future consolidators: if any artifact in this bundle seems internally inconsistent in a way that suggests two authors who didn't quite synchronize, the parallel-session pattern is the likely cause. The mitigation throughout was the bounded spot-check verification protocol on the most factually-loaded claims.
