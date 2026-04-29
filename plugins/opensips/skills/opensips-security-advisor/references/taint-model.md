# Taint Model

## Purpose

OpenSIPS Security Advisor's dataflow-aware rules (the `dataflow_taint` and some `semantic_contextual` phase rules) reason about untrusted data flowing from attacker-controlled sources into privileged sinks. This reference defines:

- The taint-source set — pseudo-variables and other inputs treated as untrusted by default.
- The taint-propagation model — how taint is tracked across script-variable assignments, AVP stores, and route boundaries.
- The sanitizer set — transformations that clear taint.
- The privileged-sink set — primitives whose use of tainted data fires findings.

Rules in the catalog reference this document rather than redefining the taint model per-rule. When a rule's text says "the taint-source set defined in `taint-model.md`," it means this document. The canonical sanitizer list lives in `knowledge/sanitizer-registry.md`; the canonical vulnerability catalog lives in `knowledge/vulnerability-reference.md`.

## Sources

The following pseudo-variables and constructs introduce attacker-controlled data and are taint-marked from the moment they are read in any route. Each entry notes what kind of attacker controls it.

### URI fields (attacker-controllable on initial requests)

- `$fU` / `$fu` / `$fd` — From URI user / full / domain. Set by any party that crafts the request; not authenticated until digest auth completes, and even then `$fU` is not bound to the authenticated identity.
- `$tU` / `$tu` / `$td` — To URI user / full / domain. Set by the request originator.
- `$rU` / `$ru` / `$rd` — Request URI user / full / domain. Initial request URI is attacker-set; later mutations during routing may or may not reduce attacker control.
- `$ou` / `$oU` / `$od` — Original Request URI (some versions). Carries the as-received attacker value.

### Header values

- `$hdr(<name>)` — any explicit header lookup. `$hdr(*)` is a taint-source family; specific named headers (`$hdr(Authorization)`, `$hdr(P-Asserted-Identity)`, `$hdr(Origin)`, etc.) are subsumed. Set by the request originator.
- `$ua` — User-Agent header. Set by the originator and freely spoofable.
- `$ct` — Contact header (full). Originator-supplied.
- `$ci` — Call-ID. Originator-supplied; predictable when generators are weak.
- `$cs` — CSeq header. Originator-supplied.

### Body and message

- `$rb` / `$mb` — Request body / Message body. Originator-supplied, attacker-controlled on first hop.
- `$rm` — Request method. Less commonly attacker-leveraged but still untrusted.

### Source identity (less commonly tainted but included for completeness)

- `$si` — Source IP. Identifies the attacker's position; not a primary injection vector but used in some logging and cache-key sinks.
- `$sp` — Source port. Same caveat as `$si`.

### Captured shell output

- AVPs populated by `exec_avp()` and the destination set populated by `exec_dset()`. Output of an external program reflects whatever the invoked command emitted, including content derived from earlier attacker input. See rule `OSIPS-SEC-INJ-004` (in `rules/injection/`) for the second-order injection pattern.

### JWT claims (before signature verification)

- `$jwt(header.*)` — JWT header claims read before `jwt_script_authorize()` / `jwt_db_authorize()` returns success.
- `$jwt(payload.*)` — JWT payload claims read before signature verification.
- `$jwt(signature)` — never trusted as a value, only consumed by the verifier.

After successful signature verification, claims are no longer taint-marked on subsequent reads in the same execution path. See "Verification clears taint" below.

## Propagation

Taint propagates through:

1. **Script-variable assignment.** `$var(x) = $fU;` → `$var(x)` is taint-marked. Subsequent reads of `$var(x)` carry taint.
2. **AVP stores.** `$avp(name) = $hdr(Origin);` → `$avp(name)` is taint-marked.
3. **String concatenation.** `$var(key) = "user:" + $fU;` → `$var(key)` is taint-marked because `$fU` is.
4. **Route boundaries.** A taint-marked variable read inside `route(<sub>)` carries taint into the sub-route. Inline route calls are flattened for traversal.
5. **MI-injected variables (`$shv(...)`).** Shared variables populated via the MI interface are taint-marked because MI itself may be exposed (see `OSIPS-SEC-MI-001` in `rules/mi-exposure/`). The advisor cannot determine whether MI access is restricted; it conservatively treats `$shv(...)` as taint-marked.

Taint does NOT propagate through:

- **Logging primitives.** `xlog("L_INFO", "got $fU")` reads the taint source but does not propagate it to a tracked variable. Log output is not a privileged sink for taint-rule purposes (log-injection via newlines is covered separately by `OSIPS-SEC-LOG-004` in `rules/tracing-and-logging/`).
- **Comparison-only reads.** `if ($fU == "admin") { ... }` reads `$fU` but does not propagate to any sink. Rules do not fire on the comparison alone.

## Sanitizers

Sanitizers are transformations that clear taint between source and sink. This section explains the *concept*; the canonical list — name, applicability per sink class, residual-risk notes — lives in `knowledge/sanitizer-registry.md`.

A sanitizer is recognized only when its applicability covers the sink class on the path. A sanitizer that clears taint for SQL sinks does not necessarily clear taint for shell or header-construction sinks.

### OpenSIPS script transformations (canonical)

- `{s.escape.common}` — escapes single-quote, double-quote, backslash, NUL, CR, LF. The universal compatibility-mode defense for SQL, header construction, and most string contexts. Clears taint for SQL and header-construction sinks; for shell sinks see "Sanitizer non-equivalence" below.
- `{s.escape.user}` — URI-fragment escape (more aggressive than `s.escape.common` for URI-shaped values). Clears taint for header-construction sinks where the value is shaped as a URI fragment.
- `{s.md5}` — MD5 hash. Produces a fixed-shape 32-character hex digest from the input. Clears taint for cache-key sinks (collision-resistant) and any sink where output shape is the operative concern, not its content.

### Strict regex shape validation

A regex check that excludes the metacharacters relevant to the sink class clears taint:

- **SQL sinks**: regex must exclude `'`, `"`, `;`, `--`. Length-bounded numeric (`^[0-9]{1,16}$`) is the canonical strong sanitizer.
- **Header-construction sinks**: regex must exclude `\r`, `\n`, `\0`. Pattern `^[^\r\n\0]+$` with bounded length is acceptable; tighter is better.
- **Cache-key sinks**: regex must produce a fixed-shape output. `^[a-zA-Z0-9_:.-]{1,128}$` is canonical.
- **Shell sinks**: see "Sanitizer non-equivalence" — no regex is sufficient on its own.

A regex that does not exclude the relevant metacharacter class is **not** a sanitizer. Permissive regexes (`.*`, `^.{1,N}$` without character-class restriction) do not clear taint.

### Comparison against a constant set

`if ($var(x) == "admin" || $var(x) == "user") { ... }` constrains the value to a known set; this is recognized as taint-clearing within the matched branch. Branches outside the matched set must terminate the request (no fall-through to a sink with the unconstrained value).

### Successful signature verification

For JWT claims specifically: a claim consumed *after* `jwt_script_authorize()` or `jwt_db_authorize()` returns success is no longer taint-marked. The verification establishes that the claim came from a key the operator trusts.

## Sanitizer non-equivalence

Some sink classes have no script-transformation sanitizer that suffices:

- **Shell command sinks (`exec_msg`, `exec_avp`, `exec_dset`).** No OpenSIPS script transformation produces shell-safe output. `s.escape.common` does not escape shell metacharacters (`;`, `|`, backticks, `$()`, `&&`, `||`, etc.). The canonical remediation is to eliminate the `exec_*` call (see `OSIPS-SEC-INJ-003` in `rules/injection/`); when retention is unavoidable, allow-list regex validation is the only defense, and even then the rule is `suppressible: false` because residual risk is structurally severe.

- **Backend-specific NoSQL/Lua/CQL queries.** No general-purpose sanitizer suffices for `cache_raw_query` against MongoDB, Redis Lua, Cassandra CQL, etc. Each backend has its own escape semantics. Remediation: switch to the structured primitive or allow-list per backend (see `OSIPS-SEC-INJ-005` in `rules/injection/`).

The advisor does not attempt to apply general-purpose sanitizers to these sink classes.

## Sinks

The following primitives fire dataflow-taint rules when they receive taint-marked inputs without a sanitizer.

### SQL sinks

- `avp_db_query()` (avpops module) — fires `OSIPS-SEC-INJ-001`.
- `sql_query()` raw form (sqlops module on 3.5+) — fires `OSIPS-SEC-INJ-002`.
- `db_query()` and custom DB primitives in third-party modules taking a SQL string — the engine cannot detect these from cfg in general; rules emit `review_required` when an unrecognized DB primitive is reached with taint.

The structured primitives `sql_select`, `sql_insert`, `sql_update`, `sql_delete` do NOT fire taint rules — they are parameterized by construction.

### Shell sinks

- `exec_msg()`, `exec_avp()`, `exec_dset()` — fire `OSIPS-SEC-INJ-003` / `OSIPS-SEC-INJ-004`.

### Cache sinks

- `cache_store()`, `cache_fetch()`, `cache_remove()`, `cache_counter_*()` key arguments — fire `OSIPS-SEC-INJ-005` for namespace concerns.
- `cache_raw_query()` — fires `OSIPS-SEC-INJ-005` for backend-specific injection.

### Header-construction sinks

- `append_hf()`, `append_to_reply()`, `insert_hf()` (textops) — fire `OSIPS-SEC-INJ-006`.
- `replace_hdrs()` (sipmsgops) when used to build header values — fires `OSIPS-SEC-INJ-006`.
- `subst_uri()` and direct `$hdr(<name>) = ...` assignments with attacker data — fire `OSIPS-SEC-INJ-006`.

### Routing sinks

- Assignment to `$ru`, `$rU`, `$du`, `$fs`, `$ds` from taint-marked sources — fire under various rules in `rules/relay-and-routing/` depending on the specific sink.

### File and REST sinks

- `file_read`, `cache_load_file` paths — fire `OSIPS-SEC-AUTH-008` (jwt-kid-injection) when the source is a JWT claim; broader rules in `rules/injection/`.
- `rest_get`, `rest_post`, `rest_put` URLs — fire `OSIPS-SEC-AUTH-008` and broader injection rules.

### Logging sinks (NOT privileged for general taint)

- `xlog`, `xdbg` — log output is not a privileged sink for general taint rules. `xlog` with attacker-controlled format strings, and log-injection via CR/LF in tainted values, are covered specifically by `OSIPS-SEC-LOG-004` in `rules/tracing-and-logging/`.

## Path Sensitivity

v1 of the taint model is **not path-sensitive**. The advisor evaluates taint per variable, not per program path:

- A sanitization branch followed by a sink in another branch does not clear the taint of the sink-branch usage.
- If a variable is sanitized on one branch and reaches a sink on a different branch without sanitization, the sink fires with taint.
- The engine does not track per-branch state: once a sink reads a variable that has any reachable definition carrying taint, the rule fires.

This is conservative by design. Adding path sensitivity is a v2 consideration; for v1, authors who need branch-specific clearance must structure their cfg so the sanitizer is on the same path as the sink, or use the suppression mechanism with a justification.

## Verification clears taint

After `proxy_authorize()` or `www_authorize()` returns success, the From URI / authenticated identity is bound to the digest-authenticated user. Subsequent reads of `$au` (authenticated user) are not taint-marked. However, `$fU` (the From URI as transmitted) remains taint-marked even after auth — the From URI is attacker-controlled even when the auth header is valid (see `OSIPS-SEC-ID-002` in `rules/identity-spoofing/`).

After `jwt_script_authorize()` or `jwt_db_authorize()` returns success on a specific token, claims from that token are no longer taint-marked on subsequent reads in the same execution path.

After `is_peer_verified()` returns success in a TLS context, the peer-identity material (cert subject DN, etc.) is not taint-marked.

## Confidence calibration

Rules using the taint model emit at confidence levels per the following:

- **`confidence: high`** — direct path from taint source to privileged sink with no sanitizer; structurally clear. Most `OSIPS-SEC-INJ-001` and `OSIPS-SEC-INJ-006` cases.
- **`confidence: medium`** — path involves intermediate variables, route boundaries, or partially-applied sanitizers (regex shape-checks whose restrictiveness cannot be statically determined). Most `OSIPS-SEC-INJ-004` (exec captured-output) and `OSIPS-SEC-INJ-005` (cache) cases.
- **`confidence: low`** — path traversal yields uncertain results (heavily-obfuscated control flow, dynamic route selection, MI-injected variables on a path). The advisor emits `review_required` rather than firing definitively.

Rules document which calibration applies in their Audit section.
