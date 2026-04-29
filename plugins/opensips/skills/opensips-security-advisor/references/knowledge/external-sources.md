# external_sources.md

Flat bibliography of external URLs cited from rules, reference docs, and version overlays in this bundle. Each entry lists the URL, a short title, the citing files, and the date most recently verified.

This bibliography exists so consolidators can update or replace links without scanning the full bundle, and so that link-rot can be spotted without re-reading every file. The convention from `13_RULE_AUTHORING.md` § "References" — "External link rot is a real concern; mirror critical references into `90_reference/external_sources.md`" — is the source of this file's purpose.

## OpenSIPS official documentation

- `https://opensips.org/docs/modules/3.5.x/auth_jwt.html`
  Title: OpenSIPS auth_jwt module documentation (3.5)
  Cited by: `30_rules/auth/OSIPS-SEC-AUTH-004.md` (indirect via reference to module behavior)
  Last verified: 2026-04-29 — confirmed module exists and `db_mode` parameter behaves as described.

- `https://opensips.org/docs/modules/3.5.x/avpops.html`
  Title: OpenSIPS avpops module documentation (3.5)
  Cited by: `30_rules/injection/OSIPS-SEC-INJ-001.md`
  Last verified: not directly verified this session; cited by INJ-001 from earlier authoring.

- `https://opensips.org/docs/modules/3.5.x/mi_http.html`
  Title: OpenSIPS mi_http module documentation (3.5)
  Cited by: `30_rules/mi_exposure/OSIPS-SEC-MI-001.md`
  Last verified: not directly verified this session.

- `https://opensips.org/docs/modules/3.5.x/permissions.html`
  Title: OpenSIPS permissions module documentation (3.5)
  Cited by: `30_rules/relay_and_routing/OSIPS-SEC-RELAY-001.md`
  Last verified: not directly verified this session.

- `https://opensips.org/docs/modules/3.5.x/tm.html`
  Title: OpenSIPS tm module documentation (3.5)
  Cited by: `30_rules/relay_and_routing/OSIPS-SEC-RELAY-001.md`
  Last verified: not directly verified this session.

- `https://opensips.org/docs/script-cookbooks/transformations.html`
  Title: OpenSIPS pseudovariable transformations cookbook
  Cited by: `30_rules/injection/OSIPS-SEC-INJ-001.md`, `90_reference/sanitizer_registry.yaml`
  Last verified: not directly verified this session; used as the basis for the sanitizer registry's four `s.escape.*` entries.

- `https://opensips.org/Community/Security-Audit`
  Title: OpenSIPS community security audit page
  Cited by: `90_reference/02_enable_security_gap_analysis.md`
  Last verified: not directly verified this session.

- `https://opensips.org/pub/audit-2022/opensips-audit-technical-report-full.pdf`
  Title: OpenSIPS Security Audit, Technical Report (full version, March 2023)
  Cited by: `90_reference/02_enable_security_gap_analysis.md`, `40_versions/3.4.md`
  Last verified: 2026-04-29 — URL referenced in the Enable Security blog post (verified). Direct PDF fetch not attempted this session; the PDF is 80+ pages and the writeup gives sufficient summary for our purposes.

## Enable Security

- `https://www.enablesecurity.com/blog/opensips-security-audit-report/`
  Title: OpenSIPS Security Audit Report is fully disclosed and out there (Sandro Gauci, March 17, 2023)
  Cited by: `90_reference/02_enable_security_gap_analysis.md`
  Last verified: 2026-04-29 (full content fetched and read this session).

## CVE records and advisories

- `https://nvd.nist.gov/vuln/detail/CVE-2026-25554`
  Title: NVD record for CVE-2026-25554 (OpenSIPS auth_jwt SQL injection)
  Cited by: `30_rules/auth/OSIPS-SEC-AUTH-004.md`, `90_reference/01_master_vulnerability_reference.md`
  Last verified: 2026-04-29 — search result confirms NVD has the record. Direct page fetch redirected; content corroborated via VulnCheck and AISLE.

- `https://www.vulncheck.com/advisories/opensips-auth-jwt-sql-injection-enables-jwt-authentication-bypass`
  Title: VulnCheck advisory for CVE-2026-25554
  Cited by: `30_rules/auth/OSIPS-SEC-AUTH-004.md`, `90_reference/01_master_vulnerability_reference.md`, `40_versions/3.6.md`
  Last verified: 2026-04-29 — full content fetched. Confirmed CVSS vector, CWE, affected versions, attribution.

- `https://aisle.com/blog/opensips-sql-injection-aisle-deep-dive-sql-injection-authentication-bypass`
  Title: AISLE Research deep dive on CVE-2026-25554
  Cited by: `30_rules/auth/OSIPS-SEC-AUTH-004.md`, `90_reference/01_master_vulnerability_reference.md`
  Last verified: 2026-04-29 — full content fetched. Confirmed discovery date (January 2026), fix date (February 2, 2026), and discoverer (Pavel Kohout).

- GitHub Security Advisories for the 2023 Enable Security cluster (CVE-2023-27596 through 28099):
  Each linked individually from `https://www.enablesecurity.com/blog/opensips-security-audit-report/`. Cited by: `40_versions/3.4.md`, `90_reference/02_enable_security_gap_analysis.md`. Last verified: 2026-04-29 via the Enable Security blog post.

## CWE / OWASP / MITRE ATT&CK references

- `https://cwe.mitre.org/data/definitions/89.html` — CWE-89 (SQL Injection). Cited by AUTH-004, INJ-001.
- `https://cwe.mitre.org/data/definitions/306.html` — CWE-306 (Missing Authentication for Critical Function). Cited by MI-001.
- `https://cwe.mitre.org/data/definitions/441.html` — CWE-441 (Unintended Proxy or Intermediary). Cited by RELAY-001.
- `https://owasp.org/Top10/A03_2021-Injection/` — OWASP Top 10 A03:2021 (Injection). Cited by INJ-001, AUTH-004.

These are stable canonical references unlikely to disappear. Last verified: not separately checked this session — these have been stable URLs for years.

---

## Notes for consolidators

- **Ad-hoc verification dates.** Where this bundle's authors directly fetched a URL during authoring, the date and the verification result are recorded. Where a URL was cited but not directly fetched this session, that's noted explicitly — those URLs need a verification pass before publication.

- **No mirroring yet.** The convention in `13_RULE_AUTHORING.md` § "References" suggests mirroring critical references when link rot is a concern. Nothing has been mirrored in this bundle. If a consolidation pass produces a published artifact (e.g., a Claude skill plugin distributed widely), critical URLs (the AISLE writeup, the Enable Security audit PDF, the OpenSIPS module docs) should be mirrored locally.

- **Citation sweep status.** A future citation sweep would replace any `[§TBD — ...]` placeholders in spec docs with section references into the methodology research document. That methodology document is currently a stub and the relevant spec docs are not in this bundle's scope, so the sweep is N/A here. Future consolidation passes that locate the spec docs should run the sweep separately.
