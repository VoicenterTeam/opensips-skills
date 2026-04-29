# 16 — Taint Model

## Purpose

OpenSIPS Security Advisor's dataflow-aware rules (the `dataflow_taint` and some `semantic_contextual` phase rules) reason about untrusted data flowing from attacker-controlled sources into privileged sinks. This spec defines:

- The taint-source set — pseudo-variables and other inputs the engine treats as untrusted by default.
- The taint-propagation model — how the engine tracks taint across script-variable assignments, AVP stores, route boundaries.
- The sanitizer set — transformations that clear taint.
- The privileged-sink set — primitives whose use of tainted data fires findings.

Rules in the catalog reference this spec rather than redefining the taint model per-rule. When a rule's text says "the taint-source set defined in `16_TAINT_MODEL.md`," it means this document.

## Taint-source set

The following pseudo-variables are taint-marked from the moment they are read in any route:

### URI fields (attacker-controllable on initial requests)

- `$fU` / `$fu` / `$fd` — From URI user / full / domain
- `$tU` / `$tu` / `$td` — To URI user / full / domain
- `$rU` / `$ru` / `$rd` — Request URI user / full / domain
- `$ou` / `$oU` / `$od` — Original Request URI (some versions)

### Header values

- `$hdr(<name>)` — any explicit header lookup. The engine treats `$hdr(*)` as a taint-source family; specific named headers (`$hdr(Authorization)`, `$hdr(P-Asserted-Identity)`, `$hdr(Origin)`, etc.) are subsumed.
- `$ua` — User-Agent header
- `$ct` — Contact header (full)
- `$ci` — Call-ID
- `$cs` — CSeq header

### Body and message

- `$rb` / `$mb` — Request body / Message body
- `$rm` — Request method (less commonly attacker-leveraged but still untrusted)

### Source identity (less commonly tainted but included for completeness)

- `$si` — Source IP. Untrusted in the sense that it identifies the attacker's position; not a primary injection vector but used in some logging/cache-key sinks.
- `$sp` — Source port.

### Captured shell output

- AVPs populated by `exec_avp()` and the destination set populated by `exec_dset()`. See `OSIPS-SEC-INJECTION-004` for the rule that covers second-order injection from these sources.

### JWT claims (before signature verification)

- `$jwt(header.*)` — JWT header claims read before `jwt_script_authorize()` / `jwt_db_authorize()` returns success.
- `$jwt(payload.*)` — JWT payload claims read before signature verification.
- `$jwt(signature)` — never trusted as a value, only consumed by the verifier.

After successful signature verification, claims are no longer taint-marked on subsequent reads in the same execution path. The engine respects this transition — see "Verification clears taint" below.

## Taint propagation

Taint propagates through:

1. **Script-variable assignment.** `$var(x) = $fU;` → `$var(x)` is taint-marked. Subsequent reads of `$var(x)` carry taint.
2. **AVP stores.** `$avp(name) = $hdr(Origin);` → `$avp(name)` is taint-marked.
3. **String concatenation.** `$var(key) = "user:" + $fU;` → `$var(key)` is taint-marked because `$fU` is.
4. **Route boundaries.** A taint-marked variable read inside `route(<sub>)` carries taint into the sub-route. The engine flattens inline route calls for traversal.
5. **MI-injected variables (`$shv(...)`).** Shared variables populated via the MI interface are taint-marked because MI itself may be exposed (see `OSIPS-SEC-MI_EXPOSURE-001`). The advisor cannot determine if MI access is restricted; it conservatively treats `$shv(...)` as taint-marked.

Taint does NOT propagate through:

- **Logging primitives.** `xlog("L_INFO", "got $fU")` reads the taint source but does not propagate to a tracked variable. Log output is not a privileged sink for taint-rule purposes (log-injection via newlines is covered separately by `OSIPS-SEC-TRACING_AND_LOGGING-004`).
- **Comparison-only reads.** `if ($fU == "admin") { ... }` reads $fU but does not propagate to any sink. The rule does not fire on the comparison alone.

## Sanitizer set

The following transformations clear taint when applied between source and sink:

### OpenSIPS script transformations (canonical)

- `{s.escape.common}` — escapes single-quote, double-quote, backslash, NUL, CR, LF. The universal compatibility-mode defense for SQL, header construction, and most string contexts. Clears taint for SQL and header-construction sinks; for shell sinks see "Sanitizer non-equivalence" below.
- `{s.escape.user}` — URI-fragment escape (more aggressive than `s.escape.common` for URI-shaped values). Clears taint for header-construction sinks where the value is shaped as a URI fragment.
- `{s.md5}` — MD5 hash. Produces a fixed-shape 32-character hex digest from the input. Clears taint for cache-key sinks (collision-resistant) and any sink where the output's shape is the operative concern, not its content.

### Strict regex shape validation

A regex check that excludes the metacharacters relevant to the sink class clears taint:

- For SQL sinks: regex must exclude `'`, `"`, `;`, `--`. Length-bounded numeric (`^[0-9]{1,16}$`) is the canonical strong sanitizer.
- For header-construction sinks: regex must exclude `\r`, `\n`, `\0`. Pattern `^[^\r\n\0]+$` with bounded length is acceptable; tighter is better.
- For cache-key sinks: regex must produce a fixed-shape output. `^[a-zA-Z0-9_:.-]{1,128}$` is canonical.
- For shell sinks: see "Sanitizer non-equivalence" — no regex is sufficient on its own.

A regex that does not exclude the relevant metacharacter class is **not** a sanitizer. Permissive regexes (`.*`, `^.{1,N}$` without character-class restriction) do not clear taint.

### Comparison against a constant set

`if ($var(x) == "admin" || $var(x) == "user") { ... }` constrains the value to a known set; the engine recognizes this as taint-clearing within the matched branch. Branches outside the matched set must terminate the request (no fall-through to a sink with the unconstrained value).

### Successful signature verification

For JWT claims specifically: a claim consumed *after* `jwt_script_authorize()` or `jwt_db_authorize()` returns success is no longer taint-marked. The verification establishes that the claim came from a key the operator trusts.

## Sanitizer non-equivalence

Some sink classes have no script-transformation sanitizer that suffices:

- **Shell command sinks (`exec_msg`, `exec_avp`, `exec_dset`).** No OpenSIPS script transformation produces shell-safe output. `s.escape.common` does not escape shell metacharacters (`;`, `|`, backticks, `$()`, `&&`, `||`, etc.). The canonical remediation is to eliminate the `exec_*` call (see `OSIPS-SEC-INJECTION-003`); when retention is unavoidable, allow-list regex validation is the only defense, and even then the rule is `suppressible: false` because the residual risk is structurally severe.

- **Backend-specific NoSQL/Lua/CQL queries.** No general-purpose sanitizer suffices for `cache_raw_query` against MongoDB, Redis Lua, Cassandra CQL, etc. Each backend has its own escape semantics. Remediation: switch to the structured primitive or allow-list per backend (see `OSIPS-SEC-INJECTION-005`).

The engine does not attempt to apply general-purpose sanitizers to these sink classes.

## Privileged-sink set

The following primitives fire dataflow-taint rules when they receive taint-marked inputs without a sanitizer:

### SQL sinks

- `avp_db_query()` (avpops module) — fires `OSIPS-SEC-INJECTION-001`.
- `sql_query()` raw form (sqlops module on 3.5+) — fires `OSIPS-SEC-INJECTION-002`.
- Custom DB primitives in third-party modules taking a SQL string — engine cannot detect these from cfg; rules emit `review_required` when an unrecognized DB primitive is reached with taint.

The structured primitives `sql_select`, `sql_insert`, `sql_update`, `sql_delete` do NOT fire taint rules — they are parameterized by construction.

### Shell sinks

- `exec_msg()`, `exec_avp()`, `exec_dset()` — fire `OSIPS-SEC-INJECTION-003` / `-004`.

### Cache sinks

- `cache_store()`, `cache_fetch()`, `cache_remove()`, `cache_counter_*()` key arguments — fire `OSIPS-SEC-INJECTION-005` for namespace concerns.
- `cache_raw_query()` — fires `OSIPS-SEC-INJECTION-005` for backend-specific injection.

### Header-construction sinks

- `append_hf()`, `append_to_reply()`, `insert_hf()` (textops) — fire `OSIPS-SEC-INJECTION-006`.
- `replace_hdrs()` (sipmsgops) when used to build header values — fires `-006`.
- Direct `$hdr(<name>) = ...` assignments — fire `-006`.

### Routing sinks

- Assignment to `$ru`, `$rU`, `$du`, `$fs`, `$ds` from taint-marked sources — fires under various `relay_and_routing` family rules depending on the specific sink.

### File and REST sinks

- `file_read`, `cache_load_file` paths — fires `OSIPS-SEC-AUTH-008` (jwt-kid-injection) when the source is a JWT claim; broader rules in `injection` family.
- `rest_get`, `rest_post`, `rest_put` URLs — fires `-008` and broader injection rules.

### Logging sinks (NOT privileged for general taint)

- `xlog`, `xdbg` — log output is not a privileged sink for general taint rules. Log-injection via CR/LF in tainted values is covered specifically by `OSIPS-SEC-TRACING_AND_LOGGING-004`.

## Verification clears taint

After `proxy_authorize()` or `www_authorize()` returns success, the From URI / authenticated identity is bound to the digest-authenticated user. Subsequent reads of `$au` (authenticated user) are not taint-marked. However, `$fU` (the From URI as transmitted) remains taint-marked even after auth — the From URI is attacker-controlled even when the auth header is valid (see `OSIPS-SEC-IDENTITY_SPOOFING-002`).

After `jwt_script_authorize()` or `jwt_db_authorize()` returns success on a specific token, claims from that token are no longer taint-marked on subsequent reads in the same execution path.

After `is_peer_verified()` returns success in a TLS context, the peer-identity material (cert subject DN, etc.) is not taint-marked.

## Confidence calibration

Rules using the taint model emit at confidence levels per the following:

- **`confidence: high`** — direct path from taint source to privileged sink with no sanitizer; structurally clear. Most `OSIPS-SEC-INJECTION-001` and `-006` cases.
- **`confidence: medium`** — path involves intermediate variables, route boundaries, or partially-applied sanitizers (regex shape-checks whose restrictiveness cannot be statically determined). Most `OSIPS-SEC-INJECTION-004` (exec captured-output) and `-005` (cache) cases.
- **`confidence: low`** — path traversal yields uncertain results (heavily-obfuscated control flow, dynamic route selection, MI-injected variables on a path). Engine emits `review_required` rather than firing definitively.

Rules document which calibration applies in their Audit section.

## Versioning

This spec is versioned alongside the rule catalog. Changes to the taint-source set, sanitizer set, or sink set require a catalog version bump per `12_RULE_CATALOG_SCHEMA.md`'s `version` field. Engine implementations declare their compatible spec version range via `engine_version_min` / `engine_version_max`.
