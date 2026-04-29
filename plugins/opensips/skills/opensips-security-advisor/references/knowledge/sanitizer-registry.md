# Sanitizer Registry

Recognized OpenSIPs script transformations that are accepted as effective sanitizers for the corresponding sink class. A taint-tracking rule that matches a tainted source flowing to a sink is suppressed if the value passes through one of these transformations on every reachable path.

The registry is intentionally conservative. A transformation appears here only when its escaping behavior is documented and consistent across the supported OpenSIPs version range (3.4, 3.5, 3.6, 4.0). Transformations whose security semantics are unclear are not added — taint-flow rules abstain rather than credit an unverified sanitizer.

Authoritative reference for the underlying primitives: the OpenSIPs Script Transformations documentation (`https://www.opensips.org/Documentation/Script-Tran-3-4` and the per-version equivalents). Sink classifications and source set are defined in `taint-model.md`.

---

## SQL sinks

Applies to: `avp_db_query`, `db_query`, and any function that takes a string assembled from script variables and forwards it to a SQL backend (`db_mysql`, `db_postgres`, `db_unixodbc`, etc.).

| Sanitizer | Coverage | Notes |
|---|---|---|
| `$(var{s.escape.common})` | Single quote, double quote, backslash, NUL, CR, LF | **Recommended.** Comprehensive SQL string escaping; the standard choice for value-position interpolation inside a quoted SQL literal. |
| `$(var{s.escape.common.back})` | `s.escape.common` set plus an explicit backslash escape pass | Use when the backend dialect doubles backslash interpretation (some MySQL configurations with `NO_BACKSLASH_ESCAPES` disabled). |
| `$(var{s.escape.user})` | `s.escape.common` set plus SIP URI user-part special characters (`@`, `:`, `;`, `,`, `?`, `=`, `&`, `+`, `$`) | Sufficient when the value is bound to a SIP URI user component being interpolated into SQL. Not a general SQL sanitizer — its inclusion here is restricted to URI-bound values. |
| `$(var{s.escape.param})` | URI parameter delimiters (`;`, `=`, `?`) plus `s.escape.common` set | Sufficient when the value is bound to a URI parameter being interpolated into SQL. As with `s.escape.user`, recognition is restricted to parameter-bound values. |
| Parameterized query construction via `db_url`-bound prepared placeholders | All SQL metacharacters | Accepted only when the placeholder is introduced via the `db_*` API (e.g., `db_query` with bound parameters), not when the script concatenates a `?` literal into a textually constructed SQL string. Caveat: most `db_*` interfaces in OpenSIPs ultimately emit text; the advisor recognizes parameterization only when the call site uses an explicitly parameter-binding API confirmed by the matched module's reference. |

A SQL-sink rule is suppressed if and only if every reachable path from the tainted source to the sink passes the value through one of the above. Conditional branches that bypass the sanitizer (a `skip` flag, an early-return guard keyed off attacker-influenced state) defeat suppression — see Recognition rules below.

---

## Shell sinks

Applies to: `exec_msg`, `exec_avp`, and any wrapper that forwards a constructed string to `/bin/sh -c` or equivalent.

**No safe sanitizer for shell metacharacters via OpenSIPs script transformations alone.** `s.escape.common` covers SQL/SIP-quoting characters but does not address the full shell metacharacter set (`$`, `` ` ``, `(`, `)`, `|`, `&`, `;`, `<`, `>`, `*`, `?`, `[`, `]`, `~`, `#`, whitespace, glob expansion, history expansion). A taint-tracking rule that matches a tainted value flowing to a shell sink **always abstains from suppression** — the rule fires regardless of upstream transformations.

Recommended remediation: rewrite the call site to invoke a wrapper script with an explicit argument array, where the wrapper is operator-controlled and the OpenSIPs-side construction performs no shell interpolation. The shell-injection surface is then bounded by the wrapper's contract rather than by string escaping.

---

## Header injection sinks

Applies to: `append_hf`, `subst_uri`, `replace_hdrs`, `append_to_reply`, and any function that emits a constructed string into the SIP message header section.

| Sanitizer | Coverage | Notes |
|---|---|---|
| `$(var{s.escape.crlf})` | Strips CR (`\r`) and LF (`\n`) | The minimum required defense against header injection. Required on any value derived from a request header before re-emission into a constructed header. |
| `$(var{s.encode.uri})` | RFC 3986 percent-encoding | **Correct only for URI components** (e.g., a value placed inside a URI parameter). Wrong for general header-value text — percent-encoded characters are not interpreted as escape sequences by header parsers, so the encoding becomes literal noise that survives intact downstream. |
| Length bounds enforced via `if (strlen(...) < N)` guards | Bounds attack surface | Accepted as a complementary defense in conjunction with CR/LF stripping. Not accepted standalone — a header injection payload can fit in fewer than 32 bytes. |

A header-sink rule is suppressed when CR/LF stripping is present on every reachable path and any URI-context use additionally percent-encodes per RFC 3986. Length bounding alone does not suffice.

---

## URI sinks

Applies to: `rewriteuri`, `setruri`, `seturi`, `setdsturi`, `uac_replace_from`, `uac_replace_to`, and other functions that mutate the request URI or a From/To URI from script-controlled values.

| Sanitizer | Coverage | Notes |
|---|---|---|
| `$(var{s.encode.uri})` | RFC 3986 percent-encoding for URI userinfo components | The correct sanitizer for values being interpolated into the userinfo, host, or parameter portion of a SIP URI. |
| `$(var{s.escape.user})` | `s.escape.common` set plus SIP URI user-part special characters | Equivalent for the URI user-part specifically. |
| `$(var{s.escape.param})` | URI parameter delimiters plus `s.escape.common` set | Equivalent for URI parameter values specifically. |

A URI-sink rule is suppressed when one of the above transformations is applied at the value site on every reachable path, and the value is interpolated into the matching URI position (userinfo for `s.escape.user`, parameter for `s.escape.param`, general for `s.encode.uri`).

---

## Recognition rules

When the advisor evaluates a rule with taint-tracking semantics, it accepts a transformation as a sanitizer if and only if **all three** of the following hold:

1. **Listed.** The transformation is named in this registry for the sink class matched by the rule. A transformation listed for SQL is not credited for shell; a transformation listed for header is not credited for SQL.

2. **Unconditional on every reachable path.** The transformation is applied on every control-flow path from the tainted source to the sink. The taint-tracking model is path-insensitive (see `taint-model.md`); a sanitizer guarded by a conditional that depends on attacker-controlled state (a header value, a URI component, a User-Agent string) is treated as bypassable and does not suppress the finding. A sanitizer guarded by a conditional that depends on operator-controlled state (a static cfg constant, a `db_url`-bound lookup against an operator-managed table) is accepted.

3. **No post-sanitizer mutation.** No further string operation occurs between the sanitizer and the sink that could reintroduce attacker-controlled syntax. A `$var = $var + ";"` after `s.escape.common` invalidates the sanitizer because the appended literal recreates a SQL/URI metacharacter that the sanitizer previously escaped.

When all three conditions are satisfied the rule is suppressed. When any condition fails the rule fires. When the advisor cannot determine a condition statically (typically because of an opaque function call between the sanitizer and the sink) the rule fires as `review_required` rather than as a confirmed finding.

---

## Custom sanitizers

Operators may define their own sanitization patterns in script — a regex match against `subst_avp`, a custom shape-check via `if ($var =~ "^[a-zA-Z0-9_-]{1,32}$") { ... }`, a wrapper function loaded from a sibling cfg file via `include_file`. **These are not in this registry, and the advisor does not statically prove their safety.**

In v1, the advisor cannot inspect a custom sanitizer's regex or function body to verify its character-set coverage. When a rule fires `review_required` because the value passes through a transformation not enumerated above, the report names the unrecognized construct and asks the operator to confirm whether it is intended as a sanitizer for the matched sink class. The advisor does not credit the suppression on its own authority.

For shape-check patterns the advisor can recognize a narrow set without operator confirmation:

- `^[0-9]{1,N}$` for finite `N` — accepted as a sanitizer for SQL value position, header value, and cache key.
- `^[a-zA-Z0-9_-]{1,N}$` for finite `N` — accepted for SQL, header, URI; not accepted for shell.
- `^[a-zA-Z0-9._-]{1,N}$` for finite `N` — accepted as above plus hostname-shaped values.

Patterns whose character class includes a single-quote, double-quote, backslash, semicolon, ampersand, pipe, backtick, dollar-sign, parenthesis, angle bracket, or any whitespace are not accepted as sanitizers regardless of length bound.

When the advisor encounters a custom sanitizer it does not recognize, the report should suggest documenting it in operator-internal notes; the advisor's inability to verify the regex is a present-tense limitation, not a defect to remediate by editing the cfg.
