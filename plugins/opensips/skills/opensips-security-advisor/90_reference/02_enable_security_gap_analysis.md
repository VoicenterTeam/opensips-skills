# 02 — Enable Security Gap Analysis

## Purpose

Maps the findings of Enable Security's 2022 OpenSIPS audit (publicly disclosed March 2023) and Enable Security's subsequent published research onto this advisor's rule catalog. For each finding category, this document records: what the audit found, whether the advisor has a rule for it, and what the gap is if not.

This is the **gap-analysis document** referenced in `90_reference/01_master_vulnerability_reference.md` § 12 and in the version overlays. Where § 12 records the verified CVE inventory, this document records the broader landscape of findings — including issues that did not produce CVEs but that the advisor should still consider — and where the advisor's coverage falls short of the audit's coverage.

## Provenance

This document was authored in this session from primary sources — Enable Security's own writeup of the audit (`https://www.enablesecurity.com/blog/opensips-security-audit-report/`, verified 2026-04-29) and the audit report PDF (`https://opensips.org/pub/audit-2022/opensips-audit-technical-report-full.pdf`, 80+ pages, also linked from the OpenSIPS audit page). Per project memory, an earlier session produced a Phase 3 gap analysis with 22 sections; that artifact was not located. This document supersedes any prior version; the section count below reflects the actual structure of the audit and the advisor's coverage, not the projected 22.

## Audit context

- **Auditor.** Sandro Gauci and Alfred Farrugia, Enable Security GmbH. Sandro Gauci is the lead author of SIPVicious OSS and Enable Security's CEO.
- **Subject.** OpenSIPS 3.2.2.
- **Engagement.** January 2021 (initial discussions) → September 2021 (start) → March 2022 (minimized report) → March 2023 (full disclosure).
- **Methodology.** Whitebox coverage-guided fuzzing (libFuzzer, AFL), blackbox network fuzzing (SIPVicious PRO), manual code review of security-critical functions, basic DDoS resilience tests. The auditors used `weggli` for static-analysis-style code review.
- **Scope.** OpenSIPS 3.2.2 core and a selection of modules. Specific modules listed in the report PDF.
- **Outcome.** 11 CVEs assigned (CVE-2023-27596, 27597, 27598, 27599, 27600, 27601, 28095, 28096, 28097, 28098, 28099) plus several additional findings tracked as informationals or as patches without CVE assignment.

## Structural observation about the audit

Per the auditors' own statement, "the vulnerabilities found should only result in Denial of Service rather than arbitrary code execution." This is consequential for advisor rule design: every CVE in the audit cluster is a parser-crash class, not an auth-bypass class. The advisor's rule catalog should reflect this — `dos_defense` and `config_hygiene` families absorb most of the audit's findings, not `auth` or `injection`.

The 2026 CVE-2026-25554 (auth_jwt SQL injection, CWE-89) discovered later by AISLE Research is a structurally different class: a SQL injection that enables authentication bypass. It is the first OpenSIPS-specific authentication-class CVE in the catalog and warrants separate treatment in the `auth` family. Documented in `01_master_vulnerability_reference.md` § 12 and in `40_versions/3.6.md`.

---

## Section index

The audit's findings fall into roughly six categories. Each is treated as a section here.

1. SIP message parser crashes
2. SDP parser crashes
3. Header construction and reply-building issues
4. URI rewriting and modification crashes
5. Memory leaks
6. Module-specific issues outside the parser surface
7. Findings outside the audit (subsequent research, including the CVE-2026-25554 SQL injection)
8. Coverage gaps in the current advisor

---

## 1. SIP message parser crashes {#sip-parser}

The largest cluster. SIPVicious PRO and libFuzzer together found multiple parser-crash vulnerabilities reachable from a malformed SIP request. All reachable on any deployment that accepts incoming SIP traffic on a listener.

**CVEs in this cluster.**
- CVE-2023-27597 — `parse_uri()` crash (CVSS 7.5).
- CVE-2023-27598 — `parse_via()` crash (CVSS 7.5).
- CVE-2023-27599 — `parse_to_param()` crash (CVSS 7.5).
- CVE-2023-28097 — Content-Length parser crash (CVSS 7.5). Triggered by a large Content-Length value plus a crafted Request-URI; practical exploitability requires shared memory tuning at very large `-m` values (~2 GB+).
- CVE-2023-28098 — Digest Authentication parser crash (CVSS 5.9). A specially crafted Authorization header causes a crash via a bug in `parse_param_name()` (called by `q_memchr()`). Affects configurations using `www_authorize()` or related digest-auth functions.

**Fixed in.** 3.1.7 / 3.2.4 for the URI/Via/to_param/Digest cluster. 3.1.9 / 3.2.6 for Content-Length.

**Advisor coverage.** No rule directly. The advisor's design is configuration analysis, not version-vulnerability detection. A version-gated rule in `dos_defense` or `config_hygiene` could fire on cfgs running pre-patch versions to recommend an upgrade, but currently no such rule is authored.

**Gap.** The advisor cannot detect "this OpenSIPS instance is on a vulnerable patchlevel" — it analyzes the cfg, not the binary. The version-overlay docs (`40_versions/`) are the closest the advisor gets to surfacing this kind of issue, and they are static reference material rather than per-cfg findings.

**Recommendation for future rule work.** A `version-gated CVE detector` family — rules whose `applies_if_opensips_version` constrains them to vulnerable ranges, with `severity: high` and a recommendation to upgrade. The synthetic rule_id `OSIPS-SEC-AUTH-004` for CVE-2026-25554 is the first concrete example of this pattern.

## 2. SDP parser crashes {#sdp-parser}

A separate cluster covering the `codec_delete_*` family of functions, which manipulate SDP codec lines.

**CVEs in this cluster.**
- CVE-2023-27596 — `codec_delete_XX()` crash, vulnerability 3 (CVSS 7.5). Memory leak in cJSON lib component.
- CVE-2023-27600 — `codec_delete_XX()` crash, vulnerability 2 (CVSS 7.5).
- CVE-2023-27601 — `codec_delete_XX()` crash, vulnerability 1 (CVSS 7.5).

**Audit-level findings without separate CVEs.**
- Buffer over-read in `delete_sdp_line` (CVSS 8.6 per audit's overall scoring).
- Buffer over-read in `extract_rtpmap` (CVSS 8.6).
- Buffer over-read in `extract_fmtp` (CVSS 8.6).

**Fixed in.** 3.1.7 / 3.2.4 for the CVE-tracked items.

**Advisor coverage.** No rule. SDP parsing is below the cfg-script layer.

**Gap.** Same shape as § 1 — the advisor cannot detect vulnerable patchlevels from cfg analysis alone.

## 3. Header construction and reply-building {#header-construction}

Issues in code paths that emit SIP messages from cfg-controlled values.

**CVEs.**
- CVE-2023-28095 — Vulnerability in building the local negative replies (CVSS 7.5). Function: `build_res_buf_from_sip_req`.

**Audit-level findings.**
- Off-by-one error in `append_hf` leading to crash (CVSS 8.6).
- Segmentation fault in `calc_tag_suffix` (CVSS 8.6).
- Segmentation fault in `rewrite_ruri` (CVSS 8.6).
- Crash in `t_reply_matching` (informational).

**Fixed in.** Various 3.1.x and 3.2.x patchlevels.

**Advisor coverage.** Indirect. Rules in the `injection` family that target SIP-message construction (`uac_replace_from`, `uac_replace_to`, `append_hf` with interpolated values) overlap with this cluster's surface — see `01_master_vulnerability_reference.md` § 3 (CRLF injection). But the advisor's rules detect the *cfg pattern* that creates the surface, not the parser bug that crashes on it.

## 4. URI rewriting and modification crashes {#uri-rewriting}

Rewriting paths in the message-translator subsystem.

**Audit-level findings without separate CVEs.**
- Buffer over-read in `parse_param_name` (CVSS 8.6, separate from CVE-2023-28098 which is the Digest-Authentication-context manifestation).
- Buffer over-read in `extract_field` (CVSS 8.6).
- Heap-buffer-overflow in `parse_hname2` (informational, AddressSanitizer false positive per audit follow-up).

**Fixed in.** Various 3.1.x and 3.2.x patchlevels.

**Advisor coverage.** None directly.

## 5. Memory leaks {#memory-leaks}

Resource-exhaustion class.

**CVEs.**
- CVE-2023-28096 — Memory leak in cJSON lib (CVSS 4.5). Lower severity than the parser-crash cluster.
- Memory leak in `parse_mi_request` (CVSS 7.1, audit-tracked, separate). Triggered through MI requests; relevant to operators exposing MI interfaces broadly.

**Fixed in.** 3.1.7+ / 3.2.4+ for cJSON; 3.1.8 / 3.2.5 for `parse_mi_request`.

**Advisor coverage.** Partial. The `parse_mi_request` leak is reachable through MI exposure, which `OSIPS-SEC-MI-001` (mi-http-public-bind) addresses at the configuration level. The cfg-level mitigation (loopback bind, trusted-clients allowlist) substantially reduces the pre-patch leak's exploitability.

**Gap.** No rule directly targets memory-leak patterns at the cfg-script level. Memory leaks are typically not cfg-detectable.

## 6. ds_is_in_list and dispatcher-related {#dispatcher}

A separate finding around dispatcher-module input validation.

**CVE.** CVE-2023-28099 — `ds_is_in_list()` crash on invalid input (CVSS 5.9). Triggered when `ds_is_in_list()` is called with a NULL or invalid IP-address string as the first parameter. Affects callers whose first parameter is not the safe `$si` variable.

**Fixed in.** 3.1.9 / 3.2.6.

**Advisor coverage.** None currently. A rule in the `dispatcher_and_lb` family could detect cfgs invoking `ds_is_in_list()` with non-`$si` first arguments and either fire as a hardening recommendation (always use `$si`) or as a version-gated DoS-class finding (on pre-patch versions).

**Recommendation.** This is a small, high-value rule to author. The pattern is mechanical to detect and the fix is mechanical to apply.

## 7. Findings outside the audit {#post-audit-findings}

Issues disclosed after the 2022 audit window. Documented for completeness.

### CVE-2026-25554 — auth_jwt SQL injection

- **Discovery.** Pavel Kohout, AISLE Research. January 2026.
- **Class.** SQL injection (CWE-89) leading to JWT authentication bypass.
- **CVSS 4.0.** 8.3, vector `VC:H/VI:L/VA:N`.
- **Affected.** OpenSIPS 3.1 through 3.6.4 (prior to commit `3822d33`) with `auth_jwt` module loaded and `db_mode` enabled.
- **Fixed in.** 3.6.4 (Feb 2, 2026) and corresponding backports.
- **Advisor coverage.** Projected `OSIPS-SEC-AUTH-004` (jwt-db-mode-cve). Referenced in `vulnerable-mixed.cfg` fixture and `golden_vulnerable_mixed.md` golden, with the verified CVSS values reflected.

This is **structurally distinct** from the audit cluster: it is a logic vulnerability (extracting a JWT claim before signature verification, then using it in SQL), not a parser-crash. It demonstrates that the advisor's `auth` family — covering authentication placement and credential discipline — has an additional surface area beyond what the 2022 audit identified.

## 8. Coverage gaps in the current advisor {#coverage-gaps}

Distilled from the section-by-section mapping above. The advisor's rule catalog as of bundle authoring covers some but not all of the surface the audit illuminated.

### Strong coverage
- **MI exposure** (`OSIPS-SEC-MI-001` at minimum) — addresses both `mi_http` exposure proper and the `parse_mi_request` memory-leak's reachability.
- **SQL injection at the cfg layer** (`OSIPS-SEC-INJ-001`) — covers the in-cfg taint-source-to-sink pattern. Anchors the projected `OSIPS-SEC-AUTH-004` for the CVE-2026-25554 manifestation.
- **Open relay / routing discipline** (`OSIPS-SEC-RELAY-001`, drafted) — covers the cfg-script logic that the audit's reply-building findings overlap with at the surface.

### Partial coverage
- **TLS posture** — `OSIPS-SEC-TLS-001` (verify_cert disabled) is a high-priority rule but not authored in this bundle's `30_rules/` directory. Referenced widely in fixtures.
- **Auth placement** — `OSIPS-SEC-AUTH-002` (auth-after-routing) is referenced widely but not authored. Same authoring gap.
- **Cleartext credentials** — `OSIPS-SEC-CFG-001` referenced, not authored.

### Weak or absent coverage
- **Version-gated CVE detection.** No rule yet detects "this cfg runs on a vulnerable patchlevel and uses the function whose patch fixed the issue." This is the framework for surfacing the audit cluster as cfg-actionable findings.
- **Dispatcher input-validation hardening.** `ds_is_in_list()` with non-`$si` first arg should be a rule but isn't.
- **MI exposure beyond `mi_http`.** `mi_fifo`, `mi_datagram`, `mi_xmlrpc` (if available) — none are directly addressed by current rules. The MI family in the rule catalog is `mi_exposure`; rules for the non-HTTP variants should be authored.
- **STIR/SHAKEN.** The `stir_shaken` family is empty in this bundle. Operators using STIR/SHAKEN (increasingly common in North America) get no advisor coverage.
- **Tracing/logging info disclosure.** `OSIPS-SEC-LOG-001` referenced, not authored. Operators logging Authorization headers, full request bodies, or other PII via `xlog` get no warning.

### Top three priorities per memory entry

Project memory entry #8 records that the Enable Security gap analysis identified three top-priority gaps: **MI exposure, SIP Digest Leak oracle, and auth_jwt taxonomy.**

- **MI exposure** — addressed in this bundle via `OSIPS-SEC-MI-001` for `mi_http`. Coverage of the other MI variants is the natural extension.
- **SIP Digest Leak oracle** — not addressed. The "Digest Leak" pattern refers to using SIP responses as a side-channel oracle for password validation (e.g., a 401 vs 403 distinguishing valid-username-wrong-password from invalid-username). Documented in Enable Security's separate research. Detecting this in cfg requires identifying response-pattern logic that distinguishes between authentication failure modes. A rule in the `auth` family could detect cfgs that branch on `$rs == "401"` vs `$rs == "403"` in `failure_route` and recommend uniform "Forbidden" responses. Not currently authored.
- **auth_jwt taxonomy** — partially addressed by the projected `OSIPS-SEC-AUTH-004` (CVE-2026-25554). The broader taxonomy includes: file-loaded vs db-loaded JWT keys, key-rotation discipline, JWT algorithm constraints, claim-validation patterns, and the `tag` claim's role as the cross-table join key. A small family of rules could cover these. Not currently authored.

---

## References

- Enable Security audit announcement (verified 2026-04-29): `https://www.enablesecurity.com/blog/opensips-security-audit-report/`
- Full audit PDF (linked from the announcement): `https://opensips.org/pub/audit-2022/opensips-audit-technical-report-full.pdf`
- OpenSIPS Security Audit page: `https://opensips.org/Community/Security-Audit`
- Per-CVE GitHub Security Advisories: linked from the audit announcement; one per CVE in the cluster.
- For CVE-2026-25554 specifically: AISLE writeup at `https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass` and VulnCheck advisory at `https://www.vulncheck.com/advisories/opensips-auth-jwt-sql-injection-enables-jwt-authentication-bypass`.

---

## Cross-references

- CVE inventory in canonical form: `90_reference/01_master_vulnerability_reference.md` § 12.
- Version-line CVE applicability: `40_versions/3.4.md`, `40_versions/3.5.md`, `40_versions/3.6.md`.
- Rules that cite specific findings from this analysis: scan `30_rules/` for frontmatter `references[].path` entries pointing here. As of bundle authoring: `OSIPS-SEC-MI-001` cites § 8 (gaps); `OSIPS-SEC-INJ-001` indirectly via `01_master_vulnerability_reference.md` § 1.
