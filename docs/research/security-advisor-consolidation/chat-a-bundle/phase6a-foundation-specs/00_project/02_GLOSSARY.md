# OpenSIPS Security Advisor — Glossary

**Status.** Living document. Update as new terms surface during rule
authoring. Definitions are *operational*: they lock how a term is used
inside this advisor. Encyclopedic detail belongs in the broader
OpenSIPS skill (components 1 and 2), not here.

This glossary exists because three vocabularies overlap in the
advisor's domain — SIP/OpenSIPS, security/SAST, and advisor-specific
runtime — and each overloads words the others use. "Severity" is
defined three different ways across CVSS, SARIF, and CIS. "Source" and
"sink" mean one thing in dataflow analysis and another in SIP. Without
this document, rules and reports drift in meaning. With it, they
don't.

---

## Section 1 — OpenSIPS and SIP terms

These terms appear in cfg files and in rule bodies. The advisor uses
them with their standard OpenSIPS meaning unless explicitly noted.

### Route blocks

OpenSIPS organizes script logic into named route blocks. The advisor
distinguishes them because security-relevant rules often apply only to
specific route types.

- **`request_route`** — top-level entry point for incoming SIP
  requests. Most security rules anchor here.
- **`failure_route`** — invoked when a forwarded transaction fails.
  Sensitive: error messages can leak topology.
- **`onreply_route`** — invoked on SIP responses. Header manipulation
  here can affect downstream trust decisions.
- **`branch_route`** — invoked per parallel branch during forking.
- **`local_route`** — invoked for OpenSIPS-originated requests.
- **`error_route`** — invoked when the parser rejects a message.
- **`startup_route`** — runs once at OpenSIPS startup; not
  request-scoped.
- **`timer_route`** — runs on a timer; not request-scoped.
- **`event_route[name]`** — runs on internal events (e.g.,
  `E_DLG_CREATED`); not request-scoped.

The advisor frequently uses the phrase "non-request-scoped routes" to
mean `startup_route`, `timer_route`, and `event_route` collectively;
rules involving SIP-derived input do not apply there.

### Pseudo-variables

OpenSIPS pseudo-variables are the advisor's primary taint sources and
sinks. The full list lives in the modules reference; the advisor cares
specifically about:

- **`$rU`** — Request-URI user part. Attacker-controllable on inbound.
- **`$ruri`** — full Request-URI.
- **`$fU`** / **`$fu`** — From-URI user / full URI.
- **`$tU`** / **`$tu`** — To-URI user / full URI.
- **`$ct`** — Contact header value.
- **`$ua`** — User-Agent header.
- **`$si`** — source IP. Spoofable on UDP unless rport/topoh enforced.
- **`$sp`** — source port.
- **`$hdr(Name)`** — arbitrary header by name. Always SIP-derived,
  always taint-source unless explicitly sanitized.
- **`$avp(name)`** — Attribute-Value Pair. May or may not be tainted
  depending on assignment history; the advisor traces.
- **`$var(name)`** — script-local variable.
- **`$param(N)`** — route parameter.

### Dialog, transaction, AoR

- **Dialog** — a SIP peer-to-peer relationship over time (one or more
  transactions sharing a Call-ID + tag pair). Tracked by the
  `dialog` module.
- **Transaction** — a single request and its responses. Tracked by
  the `tm` module.
- **AoR (Address of Record)** — the public-facing user identity
  (e.g., `sip:alice@example.com`). Stored in the registrar.

### Module names referenced often

- **`auth_db`**, **`auth`**, **`auth_jwt`** — authentication backends.
- **`registrar`**, **`usrloc`** — registration and user-location.
- **`tm`** — transaction management.
- **`uac`** — User Agent Client behaviors (sending requests on behalf
  of OpenSIPS).
- **`pike`** — per-IP request-rate detection.
- **`ratelimit`** — global and queue-based rate limiting.
- **`sipmsgops`** — message inspection and manipulation
  (`mf_process_maxfwd_header`, `sip_validate_hdrs`, etc.).
- **`tls_mgm`**, **`tls_openssl`**, **`tls_wolfssl`** — TLS lifecycle
  and handshakes (3.4+; replaces the older monolithic `tls` module).
- **`mi_*`** family — Management Interface transports (`mi_fifo`,
  `mi_datagram`, `mi_http`, `mi_xmlrpc`, `mi_jsonrpc`).
- **`rtpengine`**, **`rtpproxy`** — media relay control.
- **`stir_shaken`** — caller-ID attestation per SHAKEN framework.
- **`dispatcher`**, **`load_balancer`** — gateway selection.

### Listeners and transport

- **`listen`** — directive declaring a transport endpoint
  (`listen=udp:0.0.0.0:5060`, `listen=tls:eth0:5061`, etc.).
- **`socket`** — runtime concept of an active listener.
- **MI socket** — listener for the Management Interface; commonly
  `mi_fifo` (file-based), `mi_datagram` (UNIX socket), or `mi_http`
  (HTTP). When `mi_http` listens on a non-loopback address it is
  almost always a finding.

---

## Section 2 — Security and SAST terms (as used in this advisor)

Where definitions diverge from common usage, the advisor's usage is
the one in force.

### Finding

A single instance of a rule firing. Has a unique `finding_id`, points
at one or more locations in the cfg, carries severity and confidence,
and includes recommendation text. Defined precisely in
`11_FINDING_SCHEMA.md`.

### Rule

A reusable detection-pattern + remediation pair, authored as a single
file in `30_rules/<family>/`. Carries an `OSIPS-SEC-<FAMILY>-<NNN>`
ID. Defined in `12_RULE_CATALOG_SCHEMA.md`.

A *rule* is the static artifact; a *finding* is the runtime instance
when that rule matches. One rule can produce zero or many findings
per analysis run.

### Pattern

A specific match expression inside a rule. A rule may have multiple
patterns if the remediation is identical across them; if remediation
differs, they are separate rules.

### Source, sink, dataflow, taint

Standard SAST terminology, applied here to OpenSIPS cfg:

- **Source** — a script location where SIP-derived (attacker-influenced)
  data enters. Examples: `$rU`, `$fU`, `$hdr(*)`, `$si`, anything from
  the request line or headers before sanitization.
- **Sink** — a script location where data is consumed in a dangerous
  way. Examples: `avp_db_query()` arguments, `exec_msg()` arguments,
  `xlog()` format strings, `subst_uri()` patterns, MI dispatch.
- **Sanitizer** — a function or pattern that, when applied to data on
  the path from source to sink, neutralizes the danger. Examples:
  `s.escape.common`, regex validation against an allow-list.
- **Dataflow** — the path between source and sink through script
  variables, AVPs, transformations.
- **Taint** — the property that data is SIP-derived and unsanitized.
  Tracked transitively through assignments.

### Suppression, baseline, hardening index

- **Suppression** — a user-declared instruction to omit a finding
  from primary report sections. Mechanism and behavior in
  `23_SUPPRESSION_PROTOCOL.md`. Suppressed findings still appear in
  the audit appendix.
- **Baseline** — the snapshot of accepted findings at a point in time
  against which future runs are compared. Used to surface only *new*
  findings on subsequent runs (CI gating use case).
- **Hardening index** — a 0–100 score derived from finding counts
  weighted by severity. Formula in `22_REPORT_TEMPLATES.md`.

### Profile

CIS-style classification for *which set of rules apply to this
deployment*. Defined in `13_PROFILE_MODEL.md`. Two values:
- **L1** — broadly applicable, low operational risk to enable. Most
  enterprise PBX and mid-size deployments should pass all L1 rules.
- **L2** — strict, carrier-grade, may impact functionality or require
  coordinated rollout. Carrier SBCs, regulated telcos.

### Rule families

Twelve top-level groupings under which rules are organized. Listed in
`12_RULE_CATALOG_SCHEMA.md`; named here for reference:
`auth`, `tls`, `injection`, `relay_and_routing`, `dos_defense`,
`mi_exposure`, `media`, `stir_shaken`, `tracing_and_logging`,
`identity_spoofing`, `config_hygiene`, `dispatcher_and_lb`.

---

## Section 3 — Advisor-specific terms

These terms have a specific meaning *inside this advisor* that may
differ from external usage. The definitions here are normative.

### Severity

The advisor's severity scale is 5-valued and orthogonal to confidence.
A severity value answers the question: *if this finding is real, how
bad is it?*

- **`critical`** — active exploit available, RCE, complete auth
  bypass, data exfiltration with no preconditions.
- **`high`** — exploitable with practical preconditions; significant
  impact on confidentiality, integrity, or availability.
- **`medium`** — material risk, limited blast radius, or requires
  notable preconditions.
- **`low`** — defense-in-depth lapse, hygiene issue with low direct
  impact.
- **`info`** — informational only; not a defect, but worth surfacing
  (e.g., a directive present but with a non-default value the user
  may not realize).

The advisor does *not* use the SARIF native `level` enum
(`error`/`warning`/`note`/`none`) as its primary severity. SARIF
`level` is derived from advisor `severity` at emission time per the
mapping in `11_FINDING_SCHEMA.md`.

### Confidence

The advisor's confidence scale is 3-valued and orthogonal to severity.
A confidence value answers the question: *how sure are we this
finding is real?*

- **`high`** — deterministic match (the directive is literally there
  with the offending value); CVE-gated rule with confirmed vulnerable
  version detected; pattern-exact match.
- **`medium`** — LLM semantic match supported by multiple corroborating
  signals; pattern match with bounded ambiguity; CVE-gated rule with
  probable but not confirmed version.
- **`low`** — LLM judgment call with limited evidence; cross-cutting
  inference; ambiguous context. Findings at low confidence are
  candidates for `review_required` per
  `15_CONFIDENCE_AND_VERIFICATION.md`.

Confidence and severity are emitted as separate fields on every
finding. A high-severity / low-confidence finding is *not* the same
artifact as a high-severity / high-confidence one and the advisor must
not collapse them.

### Verification status

How the finding was confirmed before emission. Enum:

- **`deterministic_confirmed`** — a deterministic re-check (regex,
  parser query, structural assertion) confirmed the LLM's match.
- **`judge_confirmed`** — a second-pass LLM critique agreed the
  finding is real.
- **`judge_dissented`** — a second-pass LLM critique disagreed; the
  advisor downgrades confidence and may convert to
  `review_required`.
- **`unchecked`** — no verification pass was run (e.g., structural
  rule with self-evident match). Allowed only for rules whose phase
  is `structural` or `value_pattern`.

### Kind

Distinguishes a substantive finding from a triage hand-off:

- **`vulnerability`** — the advisor asserts a real issue.
- **`review_required`** — the advisor cannot decide and is asking a
  human to. Carries a non-empty `review_reason` field. Counts toward
  hardening-index calculation as a partial penalty.

### Grounding

The set of evidence the LLM used to reach its decision. Captured as
structured fields on the finding (parser nodes consulted, reference
sections cited, prior findings considered). Required when confidence
is `medium` or `low`. Surfaced in reports when the user asks "why did
you flag this?"

### Rationale trace

A short, human-readable explanation of the LLM's reasoning chain for
this specific finding. Distinct from grounding (which is the
*evidence*) — rationale trace is the *narrative*. Required when
confidence is `medium` or `low`; recommended for `high` to support
audit defensibility.

---

## Section 4 — Kamailio-vs-OpenSIPS disambiguation

OpenSIPS, Kamailio, and OpenSER share the SER lineage. LLM training
data conflates their syntax routinely. The advisor must not. This
table lists Kamailio idioms the advisor must *never* use as if they
were OpenSIPS, with the OpenSIPS equivalent (or the explicit note
that no equivalent exists).

| Kamailio idiom | Status in OpenSIPS | OpenSIPS equivalent |
|---|---|---|
| `sanity_check()` | exists in both, parameter semantics differ | `sanity` module's `sanity_check()` exists in OpenSIPS too but with different parameters; verify per-version. Use `sip_validate_hdrs()` from `sipmsgops` for header structural checks. |
| `secfilter` module | does not exist | No direct equivalent. Use `permissions`, IP/network ACL via `allow_address`-pattern alternatives, and module-specific filters. |
| `allow_address(group, ip, port)` (Kamailio `permissions`) | similar but parameter shape differs | OpenSIPS `permissions` module: `check_address(group, ip, port, ...)` with a different argument order. Verify against the OpenSIPS `permissions` module reference, not Kamailio's. |
| `htable` shared dictionaries | does not exist by that name | OpenSIPS uses `cachedb_*` family or `dialog_vars` for similar use cases; the script-API differs. |
| `xhttp` for embedded HTTP | does not exist | OpenSIPS uses `httpd` module (`httpd` listens, route `httpd:/path` handles). Different API. |
| `app_lua`, `app_python` (Kamailio) | naming differs | OpenSIPS has `python` and others; the embedding contracts differ. |
| `ctl` MI transport | does not exist | OpenSIPS MI is exposed via `mi_fifo`, `mi_datagram`, `mi_http`, `mi_xmlrpc`, `mi_jsonrpc`. |
| `cfgutils` group | does not exist by that name | OpenSIPS distributes equivalent helpers across `sipmsgops`, `cfgutils` (different content), and core. |

**Behavioral rule.** When a cfg under analysis uses a Kamailio-only
directive name, the advisor stops and confirms the engine before
proceeding. Misidentifying the engine produces hallucinated rule
firings and undermines trust in every other finding in the report.
This is enforced at intake (`20_INTAKE_PROTOCOL.md`) and again at
parse time if the cfg syntax contradicts the declared engine.

---

## Maintenance notes

- New terms surfacing during rule authoring should be added in the
  appropriate section. If a term spans sections, prefer the most
  operationally precise placement.
- Disagreements about a term's meaning are resolved here, not in
  individual rules. A rule that needs a different sense of a defined
  term must instead introduce a qualified term (e.g., "structural
  severity" rather than redefining "severity").
- The Kamailio disambiguation table is consulted whenever a new rule
  is drafted that references a directive name. If the directive's
  Kamailio cousin behaves differently, that goes here too.
