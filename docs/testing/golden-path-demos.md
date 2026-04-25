# Golden-path demos

> **Audience:** maintainers running this checklist manually before each release.
> **Purpose:** verify that the two skills trigger correctly, read the right
> reference files, and produce useful responses on the canonical prompt set.
> **Cadence:** before every release tag. Also after any `SKILL.md` change.
> **How long:** approximately 30 to 45 minutes if responses are quick.

---

## Setup

1. Build the plugin so all generated artifacts are current: `npm install &&
   npm run build`. The `references/{version}/modules/*.md`,
   `references/{version}/core/*.md`, and `consolidated.json` files must be
   present under `plugins/opensips/skills/opensips-config/`. If any are
   missing, stop — runtime behavior cannot be verified against missing
   reference content.

2. Install the plugin in Claude Code via the local plugin directory:
   `claude --plugin-dir /absolute/path/to/opensips-skills/plugins/opensips`.
   Use the absolute path; relative paths resolve unpredictably.

3. Verify all two skills loaded by running `/skills`. Expected output: a
   listing showing `opensips-config` and `opensips-security-advisor`. Names
   matter, not truncation point.

4. Run each demo in a fresh Claude Code session (`/clear` between demos, or
   restart). Cross-demo context contamination is the most common cause of
   false passes — a previous demo's mention of "OpenSIPs 3.5" silently sets
   the version for the next demo's default-resolution test.

5. Keep the upstream extraction's source JSON available for spot-checks.
   `source/{version}/modules/*.json` and `source/{version}/core/*.json` are
   the ground truth response content is checked against. Without them, you
   can verify activation but not correctness.

---

## How to interpret results

Each demo records one of three outcomes.

**Pass** — the right skill (or skills) activated, the reference files named
under "Expected reads" appeared in the tool-use trail, and the response
satisfies every "Expected output properties" bullet. Only Pass releases the
build.

**Partial** — the response is correct but the skill did not trigger, or the
right skill triggered but did not read the expected reference files. Claude
is producing the right content from training-data priors rather than from
the version-correct reference set. A correct response from priors is
indistinguishable from a fabrication; partials must be investigated, not
released over.

**Fail** — wrong content, fabricated identifiers, the wrong skill triggered
with consequence, or the cross-project guardrail failed to engage when
sibling-lineage syntax appeared. Any single Fail blocks the release until
investigated and either fixed or explicitly accepted with rationale.

Responses from Claude are non-deterministic. Two runs of the same demo will
produce different prose. The acceptance criteria below describe properties,
not exact wordings.

Per ADR-008, the expected output properties below avoid naming specific
sibling SER-lineage projects. The Section C cross-project demo deliberately
contains a sibling-project identifier in its prompt so the guardrail has
something to engage on; that identifier is an input to the test, not an
assertion about Claude's output. Claude's output uses neutral framing
("not OpenSIPs syntax", "from a sibling SER-lineage project") and does not
name siblings either.

---

## Demos

The 16 demos are organized into five categories. Each demo is self-contained;
maintainers can run them out of order to retest a single behavior.

- **Section A: Should-trigger (positive cases)** — five demos.
- **Section B: Should-not-trigger (negative cases)** — four demos.
- **Section C: Reference-file loading verification** — four demos (includes loadmodule-scan demo).
- **Section D: Version-aware behavior** — three demos.
- **Section E: Multi-skill coordination** — one demo.

---

## Section A: Should-trigger (positive cases)

### Demo A.1 — Basic registrar authoring

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "Help me write an opensips.cfg with a basic registrar."

**Expected skills triggered:** `opensips-config` (primary).

**Expected reads:**
- `opensips-config/SKILL.md` body.
- `opensips-config/references/{version}/cfg-format.md`.
- `opensips-config/references/{version}/core/routes.md`.
- `opensips-config/references/{version}/ser-lineage-notes.md`.
- `opensips-config/references/{version}/modules/registrar.md` for
  `save`/`lookup`/`registered` signatures.
- `opensips-config/references/{version}/modules/auth_db.md` for
  `www_authorize` semantics.

The `{version}` placeholder resolves at read time; for an unspecified
version, 3.6 is the default per the version-resolution protocol.

**Expected output properties:**
- Loads the necessary modules with `loadmodule` directives, including an auth
  protocol module (`auth`), an auth backend (`auth_db`), `usrloc`, and
  `registrar`.
- Module load order respects dependencies (`auth` before `auth_db`, `usrloc`
  before `registrar`).
- Uses `modparam("auth_db", "db_url", ...)` (not invented modparam names).
- `request_route` block has a `REGISTER` branch that calls `www_authorize`
  (not `www_authenticate`) and on success calls `save("location")`.
- Reads pseudo-variables directly (`$authattr`, `$au`, `$ar`) rather than
  through accessor functions.
- No identifiers absent from the per-module references for the active version.

**Pass criteria:** Output bullets satisfied AND at least one of the
per-module reference files for `registrar` or `auth_db` appears in
the tool-use trail. If `opensips-config` activates but no per-module
reference files are read and the response is correct from priors, that is
Partial.

**Notes:** If Claude asks the user which version to target, that is
acceptable — the routing skill's body authorizes asking when the version
is ambiguous. Spot-check three identifiers (one function, one parameter,
one pseudo-variable) against the source JSON for the assumed version.

---

### Demo A.2 — Module function inspection

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "What functions does the dialog module export in OpenSIPs 3.6?"

**Expected skills triggered:** `opensips-config` (primary).

**Expected reads:**
- `opensips-config/SKILL.md` body.
- `opensips-config/references/3.6/modules/dialog.md` (per-module file is the
  authoritative source per the router-index pattern in ADR-001).

**Expected output properties:**
- Lists exported functions from the per-module file's "Exported functions"
  section, with each function's signature.
- Function signatures include parameter types and (where present in source)
  return-value information.
- The list covers at least 80% of the functions present in
  `source/3.6/modules/dialog.json`.
- Every function name in the response appears in the source JSON (no
  fabricated names).

**Pass criteria:** Pick three function names from Claude's response. Each
must appear in `source/3.6/modules/dialog.json` under `exported_functions`.
If any of the three is absent from source, the demo is Fail.

**Notes:** Do not check for specific function names by hand — what matters
is that whatever names Claude returns are real per the source. The source
JSON for the active version is the only authoritative reference.

---

### Demo A.3 — Security review request (scaffold)

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "Review my OpenSIPs config for INVITE flooding vulnerabilities."

**Expected skills triggered:** `opensips-security-advisor` (primary). May
co-activate `opensips-config` if Claude needs to discuss config structure.

**Expected reads:**
- `opensips-security-advisor/SKILL.md` body.
- `opensips-config/references/{version}/modules/pike.md` and/or
  `opensips-config/references/{version}/modules/ratelimit.md` if the
  scaffold's prose names rate-limiting modules. Reads beyond `SKILL.md` are
  not required for Pass — the scaffold's content is intentionally minimal per
  ADR-005.

**Expected output properties:**
- The advisor skill activates (visible in the tool-use trail).
- Claude acknowledges the skill's scaffold posture rather than fabricating a
  detailed audit. Acceptable framings include "the security advisor's
  substantive review patterns are in development" or pointers to relevant
  rate-limit and authentication module references.
- Any contrast between OpenSIPs and other projects uses neutral framing.
  No specific sibling project is named.

**Pass criteria:** The advisor skill activates AND Claude does not fabricate
a comprehensive audit. Major Fail if Claude produces a fake audit with CVE
numbers, severity tags, or remediation patterns the scaffold does not
contain. Pass if the response acknowledges the scaffold and provides
whatever guidance the scaffold's prose allows.

**Notes:** Substantive review content is owned by a separate security-
focused authoring agent (ADR-012) and arrives post-v1. This demo verifies
activation and contract compliance only.

---

### Demo A.4 — Authentication route block

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "I'm on OpenSIPs 3.6 and need a route_block that authenticates incoming INVITEs."

**Expected skills triggered:** `opensips-config` (primary).

**Expected reads:**
- `opensips-config/SKILL.md` body.
- `opensips-config/references/3.6/cfg-format.md`.
- `opensips-config/references/3.6/core/routes.md`.
- `opensips-config/references/3.6/modules/auth.md` for `proxy_authorize`
  semantics — `proxy_authorize` is the appropriate function for non-REGISTER
  requests.
- `opensips-config/references/3.6/modules/auth_db.md` for `db_url` and
  related modparams.

**Expected output properties:**
- Loads `auth` and an auth backend (`auth_db` is most common).
- `modparam("auth_db", "db_url", "...")` directive present.
- `request_route` block dispatches on `is_method("INVITE")` (or equivalent).
- Calls `proxy_authorize(...)` on the INVITE branch — NOT `www_authorize`,
  which is for REGISTER. This distinction is documented in
  `references/3.6/modules/auth.md`.
- On authentication failure, calls `proxy_challenge(...)` with realm and qop
  arguments per the auth module's signature.
- Uses `$authattr` directly without accessor functions.

**Pass criteria:** Distinguishes `www_authorize` (REGISTER) from
`proxy_authorize` (INVITE) correctly. The version is explicitly 3.6, so
reads must use 3.6 paths — a 3.5 path read here is Fail.

**Notes:** If Claude produces `www_authorize` for an INVITE, that is Fail
— a common training-data-prior failure mode that mixes function names across
methods.

---

### Demo A.5 — Dispatcher parameters

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "Show me the parameters for the dispatcher module."

**Expected skills triggered:** `opensips-config` (primary).

**Expected reads:**
- `opensips-config/SKILL.md` body.
- `opensips-config/references/{version}/modules/dispatcher.md` (default
  3.6 unless the user specifies otherwise).

**Expected output properties:**
- Lists at least five exported parameters with name, type, and a brief
  description.
- Each parameter name appears in `source/{version}/modules/dispatcher.json`
  under `exported_parameters`.
- Each parameter's type matches the source. Default values, where stated,
  match the source.

**Pass criteria:** Pick three parameter names Claude returns. Each appears
in `source/{version}/modules/dispatcher.json`. If any is missing, Fail.
Bonus: Claude lists 8–10 parameters (the dispatcher module typically exports
many).

**Notes:** If Claude asks the user for the version, that is also Pass. The
test is whether the parameter content is grounded in source, not which
version was assumed.

---

## Section B: Should-not-trigger (negative cases)

These prompts should NOT activate any of the two skills. The descriptions
in YAML frontmatter contain exclusion clauses that should suppress
activation. If a skill activates, the description needs adjustment.

### Demo B.1 — Sibling-lineage SIP server config

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "Write me a config for digest authentication on a non-OpenSIPs SIP server."

**Expected skills triggered:** None.

**Expected reads:** None — none of the two OpenSIPs skills should activate.

**Expected output properties:**
- Claude responds from training-data knowledge (or asks the user which SIP
  server they mean) without engaging any of the two OpenSIPs skills.
- The tool-use trail shows no Read calls into
  `plugins/opensips/skills/*/references/`.

**Pass criteria:** No skill activated. The exclusion clauses in the two
descriptions ("Do NOT use for sibling SIP Express Router (SER)-lineage
projects") suppressed activation despite the prompt mentioning SIP and
digest authentication.

**Notes:** The phrasing "non-OpenSIPs SIP server" deliberately avoids naming
specific sibling projects per ADR-008. Do not edit it to name a sibling.

---

### Demo B.2 — Generic SIP question

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "What's the difference between TCP and UDP for SIP?"

**Expected skills triggered:** None.

**Expected reads:** None.

**Expected output properties:**
- Claude responds from general SIP knowledge.
- No reference files in the OpenSIPs plugin are read.
- The response does not mention OpenSIPs unless the user follows up with
  OpenSIPs context.

**Pass criteria:** No OpenSIPs skill activated. The question is generic SIP,
not specific to any SIP server.

**Notes:** A discriminator test — the prompt mentions SIP (which appears in
all three descriptions) but does not name OpenSIPs. If a skill activates,
the trigger keywords are too loose.

---

### Demo B.3 — Different SIP server entirely

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "How do I install Asterisk?"

**Expected skills triggered:** None.

**Expected reads:** None.

**Expected output properties:**
- Claude answers from general knowledge or directs the user to Asterisk
  documentation.
- No OpenSIPs skill activates.

**Pass criteria:** No skill activated. Asterisk is a different project
from OpenSIPs and from the SER lineage entirely; the descriptions should
not match.

**Notes:** Asterisk is a SIP project but not in the SER lineage. It is the
maximally-distant comparator — if any skill activates, the description is
matching on "SIP" alone, which is too broad.

---

### Demo B.4 — Protocol-level SIP question

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "Explain SIP RFC 3261."

**Expected skills triggered:** None.

**Expected reads:** None.

**Expected output properties:**
- Claude answers from general protocol knowledge.
- No OpenSIPs skill activates.

**Pass criteria:** No skill activated. The prompt is about the SIP
specification itself, not any implementation.

**Notes:** RFC 3261 is the foundational SIP standard, mentioned in many
OpenSIPs reference files. The prompt is about the spec, not OpenSIPs.

---

## Section C: Reference-file loading verification

Trigger reliability is necessary but not sufficient. The skill must also
actually consult the reference files. These three demos verify that the
right files are read, not just that the right skill activates.

### Demo C.1 — Function signature and return codes

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "What does the `t_relay` function do in OpenSIPs 3.6, and what return codes does it produce?"

**Expected skills triggered:** `opensips-config` (primary).

**Expected reads:**
- `opensips-config/SKILL.md` body.
- `opensips-config/references/3.6/consolidated.json` if Claude does the
  function-to-module lookup before reading the per-module file.
- `opensips-config/references/3.6/modules/tm.md` — `t_relay` is exported by
  the `tm` (transaction manager) module.

**Expected output properties:**
- Identifies `t_relay` as belonging to the `tm` module.
- Describes the function's purpose (stateful relay of a SIP request through
  the transaction layer).
- Lists the documented return codes from source. Spot-check the codes
  against `source/3.6/modules/tm.json` under `exported_functions` — every
  code in the response must appear in source.
- Names the route blocks in which `t_relay` is valid.

**Pass criteria:** The tool-use trail shows a Read of
`opensips-config/references/3.6/modules/tm.md`. The return codes match the
codes documented in `source/3.6/modules/tm.json`.

If `tm.md` is not read but the response is otherwise correct, that is
Partial — return codes are exactly the kind of identifier-level detail that
drifts across the SER lineage and across versions.

**Notes:** Most common Partial: Claude reads `opensips-config/SKILL.md`
(because the prompt mentions "OpenSIPs") but does not follow through to the
per-module file. Verify `tm.md` was read.

---

### Demo C.2 — Pseudo-variable description

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "What does `$T_branch_idx` represent in OpenSIPs 3.6, and where can it be used?"

**Expected skills triggered:** `opensips-config` (the prompt is about a
pseudo-variable exported by `tm`).

**Expected reads:**
- One of:
  - `opensips-config/references/3.6/modules/tm.md` — variable as
    module-exported.
  - `opensips-config/references/3.6/core/variables.md` — variable in the
    core file.
- Possibly `opensips-config/references/3.6/consolidated.json` for the
  variable-to-module lookup via `indexes.variablesByName`.

**Expected output properties:**
- Identifies the variable as related to the `tm` module's branch handling
  (the index into parallel branches of a forked transaction).
- States the variable's type, R/W status, and the route blocks in which it
  is populated and accessible.
- All four metadata items (meaning, type, R/W, available-in) match the
  source JSON for `tm`.

**Pass criteria:** The tool-use trail shows a Read of either
`opensips-config/references/3.6/modules/tm.md` or
`opensips-config/references/3.6/core/variables.md` (or both). Type, R/W
status, and "available in" route blocks match the source.

**Notes:** Tests two-hop lookup (consolidated index, then per-module file).
If Claude answers from priors with the wrong type or wrong scope, Fail.

---

### Demo C.3 — Cross-project guardrail engagement

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "Use `pv_get_authattr` to extract the auth attribute in OpenSIPs."

**Expected skills triggered:** `opensips-config`.

**Expected reads:**
- `opensips-config/SKILL.md` body — the cross-project guardrail section is
  here.
- `opensips-config/references/{version}/ser-lineage-notes.md` — the
  anti-hallucination notes.
- `opensips-config/references/{version}/core/variables.md` — to find the
  OpenSIPs equivalent (`$authattr` per the SKILL.md body's Bad/Good examples).

**Expected output properties:**
- Recognizes `pv_get_authattr` as not OpenSIPs syntax. Acceptable wordings
  include "this looks like syntax from a sibling SER-lineage project," "this
  identifier is not in the OpenSIPs reference set," or "OpenSIPs uses
  pseudo-variable syntax directly rather than accessor functions."
- Suggests the OpenSIPs equivalent (`$authattr`), or asks the user to
  clarify.
- Does NOT silently produce a config that calls `pv_get_authattr`.
- Uses neutral framing in any contrast with sibling projects. Acceptable:
  "sibling SER-lineage project", "non-OpenSIPs project". Not acceptable:
  naming a specific sibling. (ADR-008.)

**Pass criteria:** All of:
1. `pv_get_authattr` is identified as not valid OpenSIPs syntax.
2. The OpenSIPs alternative (`$authattr`) is suggested, OR Claude asks the
   user to clarify.
3. Any contrast with sibling projects uses neutral framing — no specific
   sibling is named.

If Claude silently produces a config containing `pv_get_authattr(...)`,
that is the most consequential failure mode in the project — hard Fail.

**Notes:** The most diagnostic demo in the suite. The cross-project
guardrail is the project's reason for existing (CLAUDE.md Rule 7). A Fail
here blocks release until the SKILL.md body's guardrail prose is tightened.

---

### Demo C.4 — Loadmodule-scan workflow

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt** (provide this cfg fragment along with the question):

```
loadmodule "tm.so"
loadmodule "registrar.so"
loadmodule "auth.so"
loadmodule "auth_db.so"
modparam("auth_db", "db_url", "mysql://opensips:pw@localhost/opensips")
route {
    if (is_method("REGISTER")) {
        www_authorize("", "subscriber");
        save("location");
    }
}
```

> "Is this config correct for OpenSIPs 3.6?"

**Expected skills triggered:** `opensips-config` (primary).

**Expected reads (in order):**
1. `opensips-config/references/3.6/cfg-format.md` — to understand the cfg
   file structure and ordering rules.
2. `opensips-config/references/3.6/consolidated.json` — for upfront
   orientation and module existence check.
3. `opensips-config/references/3.6/modules/tm.md` — because the config loads
   `tm.so` and `t_relay` / transaction semantics are relevant.
4. `opensips-config/references/3.6/modules/auth.md` or
   `opensips-config/references/3.6/modules/auth_db.md` — because `www_authorize`
   is exported by `auth` / configured by `auth_db`.

**Expected output properties:**
- Claude notes that `www_authorize` needs a corresponding `www_challenge` on
  failure; the config as written falls through without challenge.
- Claude notes that `save("location")` is called without first checking
  `www_authorize`'s return value — the REGISTER can succeed even when auth
  fails.
- Any suggested fix uses function signatures and modparam names from the 3.6
  per-module reference files, not from training-data priors.
- Claude does not invent modules or functions not present in the 3.6 reference
  set.

**Pass criteria:** The tool-use trail shows:
1. A Read of `cfg-format.md` (the loadmodule-scan workflow starts here).
2. A Read of `consolidated.json`.
3. At least one Read of a per-module file for a module named by the config's
   `loadmodule` lines.

This is the canonical loadmodule-scan workflow from ADR-012. A response that
is correct but did not read `cfg-format.md` and `consolidated.json` is
Partial — Claude answered from priors rather than following the documented
workflow.

**Notes:** This demo specifically verifies the ADR-012 loadmodule-scan
procedure: read cfg-format.md → read consolidated.json → read per-module
files for each loadmodule referenced by the question. A Partial here is a
signal that the SKILL.md body's workflow prose needs strengthening.

---

## Section D: Version-aware behavior

### Demo D.1 — Explicit version 3.5

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "I'm using OpenSIPs 3.5. Show me the parameters for the dispatcher module."

**Expected skills triggered:** `opensips-config`.

**Expected reads:**
- `opensips-config/references/3.5/modules/dispatcher.md` — explicitly the
  3.5 path, NOT 3.6.

**Expected output properties:**
- Lists parameters from `source/3.5/modules/dispatcher.json` under
  `exported_parameters`.
- Each parameter's type, default, and description matches the 3.5 source.
- No parameters that exist only in 3.6 (and not in 3.5) appear. To check,
  identify any parameter in `source/3.6/modules/dispatcher.json` absent
  from `source/3.5/modules/dispatcher.json`; verify it is not in Claude's
  response.

**Pass criteria:** The tool-use trail shows a Read of the 3.5 path
specifically. A Read of the 3.6 path is Fail — the version was explicit
and must not be ignored.

**Notes:** Strict version-isolation test. If the response mixes 3.5 and 3.6
parameter sets, the version-resolution protocol is broken or the
`{version}` placeholder is not substituting at read time.

---

### Demo D.2 — Default version resolution

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "Show me the parameters for the dispatcher module."

**Expected skills triggered:** `opensips-config`.

**Expected reads:**
- `opensips-config/references/3.6/modules/dispatcher.md` — 3.6 is the
  default version per the version-resolution protocol.

**Expected output properties:**
- Response is grounded in 3.6 content.
- No 3.5-only parameters appear (find a parameter present in `source/3.5`
  but absent from `source/3.6`; verify it is not in the response).

**Pass criteria:** Either:
- Tool-use trail shows a Read of the 3.6 path, AND the response is
  consistent with 3.6's source.
- Claude asks the user to clarify which version (defensive Pass).

A Read of the 3.5 path is Fail — Claude defaulted alphabetically to the
first version found, the wrong-default failure mode in the milestone-8 risks.

**Notes:** Run immediately after a fresh `/clear`. Prior context mentioning
"3.5" or "3.6" can silently set the version and this demo would "pass" for
the wrong reason.

---

### Demo D.3 — Cross-version multi-turn

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt** (two turns in the same session):

Turn 1:
> "I'm on OpenSIPs 3.5. What's the t_relay signature?"

Turn 2 (after the first response):
> "Now show me how it works in 3.6."

**Expected skills triggered:** `opensips-config` on each turn.

**Expected reads:**
- Turn 1: `opensips-config/references/3.5/modules/tm.md`.
- Turn 2: `opensips-config/references/3.6/modules/tm.md`.

**Expected output properties:**
- Turn 1's response describes `t_relay`'s 3.5 signature.
- Turn 2's response describes the 3.6 signature.
- If signatures differ between versions, the responses cite the differences
  rather than reusing identical text. If they are identical, the responses
  may be similar but the reads must be version-specific.
- No 3.6-only argument or return code appears in the Turn 1 response, and
  vice versa.

**Pass criteria:** Two reads, one to each version's `tm.md`. Each turn's
response is consistent with the corresponding version's source. The version
context shifts cleanly at Turn 2.

**Notes:** Common failure: Turn 2 reuses the Turn 1 read of `3.5/modules/tm.md`,
treating the prior read as sufficient — the "Lookup discipline" failure
flagged in `opensips-config/SKILL.md`. That is Fail.

---

## Section E: Multi-skill coordination

### Demo E.1 — Author plus audit (both skills)

**Last verified:** Pending — target `claude-opus-4-7`, `2026-04-25`.

**Prompt:**
> "Write me a stateful proxy config using the tm and registrar modules, and audit it for missing rate limits."

**Expected skills triggered:** Both:
- `opensips-config` for authoring the config and consulting `tm` and
  `registrar` module reference data, plus rate-limit module references.
- `opensips-security-advisor` for the audit portion.

**Expected reads:**
- `opensips-config/SKILL.md` body and core references for routes.
- `opensips-config/references/{version}/cfg-format.md`.
- `opensips-config/references/{version}/modules/tm.md`.
- `opensips-config/references/{version}/modules/registrar.md`.
- Possibly `opensips-config/references/{version}/modules/pike.md` or
  `opensips-config/references/{version}/modules/ratelimit.md` if the audit
  pulls them in.
- `opensips-security-advisor/SKILL.md` body.

**Expected output properties:**
- A coherent `opensips.cfg` — `loadmodule` directives, `request_route`,
  `t_relay`, registrar handling, all identifier-correct per the per-module
  references.
- Module specifics consistent with the per-module references (signatures,
  modparam names, dependencies).
- A security commentary section produced by the advisor skill, acknowledging
  scaffold status (per Demo A.3 expectations).
- The two skill outputs read as one coherent response, not two disconnected
  sections.
- No identifier in the response is absent from the active version's
  reference set.

**Pass criteria:** Both skills activate (visible in the tool-use trail). The
config produced is identifier-correct against the source. The audit
acknowledges the scaffold rather than fabricating a comprehensive review.
The response reads as unified prose.

**Notes:** Integration test for the two-skill coordination pattern in
skill-authoring-guide.md §3.1. If the security advisor fails to activate,
the `opensips-config` skill's prose pointing at it cannot recover — Fail.
Most common Partial: the security advisor does not activate because "missing
rate limits" is too oblique a security trigger.

---

## Reporting outcomes

After running all 17 demos, record each as Pass, Partial, or Fail. Release
decision tree:

- **All 17 Pass** — release-approved.
- **Any Fail in Section C (especially Demo C.3 or C.4)** — release-blocked.
  The cross-project guardrail and the loadmodule-scan workflow are
  load-bearing; failures here cannot be released past with rationale.
- **Any Fail in Section A or D** — release-blocked unless reproducible and
  documented as a known issue with mitigation. Investigate the SKILL.md
  description (for trigger failures) or the body's version-resolution prose
  (for version failures).
- **Any Fail in Section B** — release-blocked unless the false-fire is
  benign. The exclusion clauses need tightening.
- **Any Fail in Section E** — release-blocked unless the failure is on the
  security advisor's scaffold posture (acceptable per ADR-012) and the
  `opensips-config` skill handled its portion correctly.
- **Partials** — never release without investigating. A Partial means
  Claude is producing the right answer for the wrong reason (priors instead
  of references), which is structurally fragile.

After the decision, update each demo's "Last verified" line with the run
date and model version used (e.g.,
`Last verified: 2026-04-25 with claude-opus-4-7`). The verification record
tells the next maintainer whether the checklist's results reflect the
current build or a stale run.

---

## Adding new demos

When the project ships content not covered by an existing demo, add one
using the template above. Each demo must be self-contained — a maintainer
running it out of order needs no context from prior demos. Pass criteria
must be specific enough to record Pass or Fail without judgment calls
about response quality.

The acceptance bar describes observable properties, not subjective judgment.
"The response demonstrates good understanding" is not usable. "The response
cites the documented return codes from `tm.md`, each verifiable against
`source/{version}/modules/tm.json`" is.

---

*End of golden-path demos. Run before every release. Update the "Last
verified" line on each demo as the run completes.*
