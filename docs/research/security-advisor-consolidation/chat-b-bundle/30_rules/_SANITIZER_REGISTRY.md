# OpenSIPS Sanitizer Registry

This file enumerates the script transformations and patterns the rule engine
recognizes as effective sanitizers for taint-marked values flowing into
privileged sinks. See `10_overview/16_TAINT_MODEL.md` for the underlying
taint-source set and sink classification; see `30_rules/injection/_index.md`
for the rules that consume this registry.

---

## Status note (Chat B)

**This registry is incomplete.** The Chat B successor brief specifies seeding
this registry with "the four other s.escape.* transforms identified during
Chat C's session." Project memory entries 9-15 covering Chat C's saved work
do not enumerate those four transforms — only `s.escape.common` is referenced
explicitly in the locked architectural docs.

I am authoring this registry with three transforms I am confident about from
my own taint-model spec (`10_overview/16_TAINT_MODEL.md`) and noting that the
remaining Chat C transforms must be recovered from Chat C's actual fixtures
during the consolidation pass. I will not fabricate transform names or
behaviors. The brief's anti-fabrication guidance supports this approach.

**Action for consolidator:** before merging Chat B and Chat C output, inspect
Chat C's saved fixtures for any rule referencing transforms beyond what's
listed below. Add them here with verified semantic descriptions.

---

## Confirmed transforms

### `s.escape.common`

**Status:** confirmed, used by INJECTION-001, INJECTION-002, INJECTION-006,
TRACING_AND_LOGGING-004, AUTH-008, IDENTITY_SPOOFING-003, multiple example
GOOD blocks.

**Semantics:** escapes single-quote, double-quote, backslash, NUL, CR, LF.
Applied as `$(<pseudo-variable>{s.escape.common})`.

**Sanitizer for:** SQL string literals (single-quote escape), header values
(CR/LF stripping), shell-adjacent contexts (limited — see `s.escape.common`
caveats; not sufficient for full shell-command sanitization, see INJECTION-003
which is `suppressible: false`).

**NOT sufficient for:**
- Shell command construction (use module-native alternatives instead)
- Path-traversal in filesystem sinks (use whitelist regex on path component)
- NoSQL query construction (use parameterized primitive)
- HTML/JS contexts (irrelevant for OpenSIPS but noted)

**OpenSIPS canonical reference:** OpenSIPS Script Transformations doc;
`bogdan-iancu` Nov 2023 mailing list reply on opensips-users.

### `s.escape.user`

**Status:** confirmed, alternative to `s.escape.common` for URI-fragment
contexts.

**Semantics:** URI-fragment percent-escape applied to characters that would
break SIP URI parsing — the `@`, `:`, `;`, `?`, `,`, `<`, `>`, space, and
non-ASCII characters in the URI's user component.

**Sanitizer for:** SIP URI construction where the user component derives from
a taint source (`<sip:$(fU{s.escape.user})@...>`). Common pattern in PAI/
Contact construction post-auth where the URI shape must remain valid.

**NOT sufficient for:** SQL contexts. The character set escaped does not
include single-quote, so SQL injection still passes through.

### `s.md5`

**Status:** confirmed, used by INJECTION-005 for cache-key construction.

**Semantics:** computes MD5 hash of the input value, returns the 32-character
hex digest. Applied as `$(<pseudo-variable>{s.md5})`.

**Sanitizer for:** cache-key construction where attacker-controlled input
should be transformed to a fixed-shape, collision-resistant identifier in a
controlled namespace. The output character set is `[0-9a-f]{32}` regardless
of input.

**NOT sufficient for:**
- SQL value contexts (the hex digest is "safe" but the operation is
  irreversible — can't compare against a stored plaintext value)
- Authentication-related hashing (MD5 is cryptographically broken; use only
  for namespace-isolation purposes)

**Note:** the rule engine does not recognize `s.md5` as a sanitizer for
auth-related sinks. It is recognized exclusively for cache-key sinks where
collision-resistance and fixed shape are the relevant properties.

---

## Patterns recognized as sanitizers in script logic

These are not transformations applied at the value site; they are upstream
patterns the engine treats as taint-clearing when detected on the path
between a taint source and a sink.

### Strict shape regex with bounded length

**Pattern:** `if (!($var =~ "^[<safe-charset>]{1,N}$")) { send_reply(403, ...); exit; }`

**Recognized when:** the regex character class excludes every character in
the sink's metacharacter set, AND the length bound is finite.

**Examples accepted:**
- `^[0-9]{1,16}$` — numeric extension; safe for SQL value position, header
  value, cache key.
- `^[a-zA-Z0-9_-]{1,32}$` — alphanumeric+limited-punctuation identifier;
  safe for most contexts excluding shell.
- `^[a-zA-Z0-9._-]{1,64}$` — same with dot allowed; safe for hostname-shaped
  values.

**Examples NOT accepted:**
- `^.{1,255}$` — matches any character; not a sanitizer.
- `^[^\\r\\n]+$` without length bound — CR/LF excluded but length unbounded;
  the engine accepts this only for header-value sinks, not SQL or shell.

### Constant-set comparison

**Pattern:** `if ($var == "value1" || $var == "value2" || ... ) { ... } else { exit; }`

**Recognized when:** the captured value is compared against a finite set of
operator-supplied constants, and any non-matching path terminates the
request before reaching the sink.

### `consume_credentials()` for digest contexts

**Pattern:** `consume_credentials()` after `proxy_authorize()` and
`db_check_from()` succeed.

**Effect on taint:** strips the Authorization header from the forwarded
request; downstream copies of the request no longer contain the credential.
Does not clear other taint markings — the request URI's user component is
still attacker-influenced.

### Verified-source extraction

**Pattern:** sourcing values from `$au` (digest-authenticated username),
operator-controlled DB lookups (`sql_select` against operator-managed
tables with constant WHERE clauses), or static cfg constants.

**Effect on taint:** the resulting value is treated as non-taint-marked.
This is the recommended construction pattern for PAI, Contact, and other
operator-trusted headers (see IDENTITY_SPOOFING-003).

---

## Patterns NOT recognized as sanitizers

These appear in cfgs as attempted defenses but the engine does not credit
them as effective sanitizers. Rules fire as if the value is unsanitized.

### Length-only bounding

`if (strlen($var) < 32)` — bounds length but does not exclude metacharacters.
SQL injection payloads can be very short (`'; --` is 5 characters).

### Permissive character classes

`if ($var =~ "^[a-zA-Z0-9 _.,'\"!?-]{1,255}$")` — includes single-quote and
double-quote; SQL injection passes through.

### Conditional branching on attacker-controlled values

`if ($ua =~ "internal-softphone") { skip-sanitization }` — User-Agent is
attacker-controlled; the bypass is the rule, not the exception. See
MEDIA-002 for the explicit failure-mode treatment.

### Custom sanitizer functions (without verification)

`my_sanitize_function($var)` — the engine cannot inspect the function's
body to verify its behavior. Rules fire as `review_required` rather than
firing definitively, prompting operator confirmation.

---

## Adding a sanitizer to this registry

The advisor's per-rule `evidence.trace` references this registry by transform
name. To add a new sanitizer:

1. Verify the transform exists in the loaded OpenSIPS version.
2. Verify its character-set semantics by reading the module source or
   documentation.
3. Determine which sink classes it sanitizes and which it does not.
4. Add an entry under "Confirmed transforms" with status, semantics,
   sanitizer-for set, and not-sufficient-for set.
5. Update referencing rules' "Audit" or "False-Positive Considerations"
   sections to note the new sanitizer's recognition.

Sanitizer entries with incomplete semantic descriptions are worse than
absence — they create false-confidence in operator suppression decisions.
Do not add a transform whose escape character set is unverified.

---

## See also

- `10_overview/16_TAINT_MODEL.md` — taint-source set and sink classification
- `30_rules/injection/_index.md` — rules consuming this registry
- `30_rules/injection/OSIPS-SEC-INJECTION-001.md` — canonical SQL sanitization
- `30_rules/injection/OSIPS-SEC-INJECTION-006.md` — canonical CRLF sanitization
- OpenSIPS Script Transformations documentation:
  https://www.opensips.org/Documentation/Script-Tran-3-4
