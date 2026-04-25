# Golden-Path Demos

> **Purpose:** Canonical prompt-and-expected-outcome pairs that demonstrate the plugin works as designed. Run manually before each release as the runtime regression suite. Also serves as a tutorial for new users — every demo is a working example of the plugin's intended use.
>
> **Audience:** The maintainer running release verification. Also useful for new users learning what to try first.
>
> **Status:** Authoritative for runtime behavior. Updates require an iteration round (run the demos, observe the actual behavior, document the outcome).

---

## How to use this document

This document is a runnable script, not just a reference. To verify a release:

1. Install the development build into Claude Code via `--plugin-dir`.
2. Run `/skills` to confirm all three skills loaded.
3. For each demo below, open a fresh Claude Code session (or clear context with `/clear`) and submit the demo prompt.
4. Observe the response, the tool-use trail, and which skills activated.
5. Compare against the "Expected" section.
6. Record pass/fail/partial.

The demos are organized by user journey — what a real engineer would actually want to do — not by skill. A single demo may legitimately exercise two or three skills.

Each demo includes:

- **Prompt** — the user input verbatim. Don't paraphrase when running.
- **Expected skills triggered** — which of the three should activate.
- **Expected reads** — which reference files should appear in the tool-use trail.
- **Expected output properties** — observable characteristics of the response.
- **Acceptance** — the bar for calling the demo "passed."

Responses from Claude are non-deterministic. Two runs of the same demo will produce different prose. The acceptance criteria are written to tolerate this — they describe properties, not exact wordings.

---

## Section A: Authoring journeys

### Demo A.1: Basic registrar

**Prompt:**

> I'm using OpenSIPs 3.6. Write me a minimal opensips.cfg that handles SIP REGISTER messages with digest authentication against a MySQL subscriber table.

**Expected skills triggered:** `opensips-routing` (primary). May also trigger `opensips-modules` for auth_db, registrar, usrloc.

**Expected reads:**
- `opensips-routing/SKILL.md`
- `opensips-routing/references/3.6/core/routes.md` (for `request_route` reference)
- `opensips-routing/references/3.6/ser-lineage-notes.md` (for the cross-project guardrail)
- `opensips-modules/references/3.6/modules/auth_db.md`
- `opensips-modules/references/3.6/modules/registrar.md`
- `opensips-modules/references/3.6/modules/usrloc.md`

**Expected output properties:**
- A complete `opensips.cfg` with `loadmodule` directives.
- Modules loaded in correct dependency order (`signaling` and `tm` before `auth_db`; `usrloc` before `registrar`).
- A `request_route` block with `www_authorize` and `save` calls.
- `modparam` entries for the auth_db driver pointing at MySQL.
- Comment at the top declaring `# OpenSIPs 3.6`.
- No identifiers from sibling projects (no `pv_*` functions, no Kamailio-specific module names).

**Acceptance:** Pass if the config is syntactically valid OpenSIPs 3.6 and uses only identifiers present in the 3.6 reference set. Spot-check three identifiers (one function, one parameter, one pseudo-variable if any) against the source JSON.

---

### Demo A.2: Stateful proxy with retry

**Prompt:**

> Write me an OpenSIPs config that does stateful proxying with retry on 5xx responses. Give up after three branches. I'm on 3.6.

**Expected skills triggered:** `opensips-routing` (primary), `opensips-modules` (for tm).

**Expected reads:**
- `opensips-routing/SKILL.md`
- `opensips-routing/references/3.6/core/routes.md`
- `opensips-modules/references/3.6/modules/tm.md`

**Expected output properties:**
- Loads `tm.so`.
- Configures `fr_timeout`, `fr_inv_timeout` via `modparam`.
- `request_route` with `t_on_failure("retry")` and `t_relay()`.
- A `failure_route[retry]` block that checks for 5xx and re-relays.
- `t_check_status` with a regex matching 5xx codes.

**Acceptance:** Pass if the config compiles mentally and the tm module's identifiers (fr_timeout, t_relay, t_on_failure, t_check_status, failure_route) all appear correctly per the 3.6 tm.md.

---

### Demo A.3: Dispatcher load balancing

**Prompt:**

> Add a dispatcher pool with two gateways, weighted round-robin, with health probes.

**Expected skills triggered:** `opensips-routing` and `opensips-modules`.

**Expected reads:**
- `opensips-modules/references/{version}/modules/dispatcher.md` (active version per resolution; default 3.6)
- Possibly `opensips-modules/references/{version}/modules/tm.md` (dispatcher depends on tm)

**Expected output properties:**
- `loadmodule "dispatcher.so"` after `tm.so` is loaded.
- `modparam("dispatcher", ...)` directives configuring the algorithm.
- The algorithm value is correct for the active version (specifically named in the dispatcher reference).
- Health probe configuration uses real dispatcher parameters from the reference.
- `ds_select_dst` or equivalent function call with arguments matching the dispatcher reference's signature.

**Acceptance:** Pass if the dispatcher algorithm value is one of the documented algorithm enumerations from dispatcher.md (not a hallucinated one).

---

## Section B: Lookup journeys

### Demo B.1: Module function inspection

**Prompt:**

> What functions does the dialog module export in OpenSIPs 3.6?

**Expected skills triggered:** `opensips-modules` (primary).

**Expected reads:**
- `opensips-modules/SKILL.md`
- `opensips-modules/references/3.6/modules/dialog.md`

**Expected output properties:**
- A list of functions with their signatures.
- The list is reasonably complete (matches what's in dialog.md's "Exported Functions" section).
- For each function, the signature includes parameter types and return information.
- No fabricated functions (every name in the response can be found in the source `dialog.json`).

**Acceptance:** Spot-check by counting — the response should mention at least 80% of the functions in the source. Pick three function names from the response and confirm they appear in `source/3.6/modules/dialog.json`.

---

### Demo B.2: Pseudo-variable lookup

**Prompt:**

> What does `$T_branch_idx` represent in OpenSIPs 3.6, and where can it be used?

**Expected skills triggered:** `opensips-routing` and/or `opensips-modules` (the variable is module-exported by tm).

**Expected reads:**
- `opensips-modules/references/3.6/modules/tm.md` (where the variable is documented).

**Expected output properties:**
- Description of the variable's meaning.
- Type, read/write status, scope, and "available in" route blocks.
- All four metadata items match the source JSON for tm.

**Acceptance:** Pass if the metadata matches the source. Acceptable to have minor wording variation in the description.

---

### Demo B.3: Parameter listing

**Prompt:**

> Show me all parameters of the registrar module for OpenSIPs 3.5.

**Expected skills triggered:** `opensips-modules`.

**Expected reads:**
- `opensips-modules/references/3.5/modules/registrar.md` (the 3.5 path, not 3.6).

**Expected output properties:**
- Lists parameters with name, type, and one-line description.
- All parameters appear in the source `registrar.json` for 3.5.
- No parameters from 3.6 that aren't in 3.5 (this is the version-isolation test for this lookup).

**Acceptance:** Pass if the response is grounded in 3.5's registrar reference. Spot-check by looking for any parameter that's documented as new in 3.6 — it should not appear in this response.

---

## Section C: Review and audit journeys

### Demo C.1: Configuration review

**Prompt** (paste this complete config in the prompt):

> Here's a config someone sent me. Is it correct for OpenSIPs 3.6?
>
> ```
> loadmodule "tm.so"
> loadmodule "dispatcher.so"
> 
> modparam("dispatcher", "list_file", "/etc/opensips/dispatcher.list")
> modparam("dispatcher", "wrong_param_name", 30)
> 
> request_route {
>     t_relay();
> }
> ```

**Expected skills triggered:** `opensips-routing`, possibly `opensips-modules`.

**Expected reads:**
- `opensips-modules/references/3.6/modules/dispatcher.md` (to verify parameter names).

**Expected output properties:**
- Identifies that `wrong_param_name` is not a valid dispatcher parameter for 3.6.
- Suggests the correct parameter name (or asks the user what they meant).
- Does NOT silently rewrite the config without flagging the issue.

**Acceptance:** Pass if the wrong parameter is identified. Bonus if the correct parameter name is suggested with reference to dispatcher.md.

---

### Demo C.2: Security review (scaffold)

**Prompt:**

> Review this OpenSIPs config for security issues, focusing on registration hijacking and INVITE flooding.

**Expected skills triggered:** `opensips-security-advisor`.

**Expected output properties:**
- Acknowledges that the security advisor's substantive content is in development.
- Provides what the scaffold can: pointers to relevant module references for security-related modules.
- Does NOT fabricate a comprehensive audit.

**Acceptance:** Pass if Claude is honest about the scaffold status and provides whatever guidance the scaffold's prose allows. Major fail if Claude produces a fake-looking audit.

---

## Section D: Cross-project guardrail journeys

### Demo D.1: Sibling-project syntax in prompt

**Prompt:**

> Use `pv_get_authattr` to extract the auth attribute in my OpenSIPs config.

**Expected skills triggered:** `opensips-routing`.

**Expected reads:**
- `opensips-routing/references/3.6/ser-lineage-notes.md` (the cross-project guardrail).
- `opensips-routing/references/3.6/core/variables.md` (to find the OpenSIPs equivalent).

**Expected output properties:**
- Recognizes `pv_get_authattr` as not OpenSIPs syntax.
- Suggests the OpenSIPs equivalent (`$authattr`) or asks the user what they meant.
- The explanation references "sibling project in the SIP Express Router lineage" or similar neutral framing — does NOT explicitly name "Kamailio" or "OpenSER."
- Does NOT silently produce a config using `pv_get_authattr`.

**Acceptance:** Pass if (a) `pv_get_authattr` is rejected, (b) an OpenSIPs alternative is suggested, (c) no sibling project is named explicitly.

---

### Demo D.2: Module name from sibling project

**Prompt:**

> Show me the parameters for the `tmx` module in OpenSIPs 3.6.

**Expected skills triggered:** `opensips-modules`.

**Expected reads:**
- `opensips-modules/SKILL.md` (catalog lookup).
- Possibly `opensips-modules/references/3.6/consolidated.json` (search lookup).

**Expected output properties:**
- Recognizes that `tmx` is not in the OpenSIPs 3.6 module set.
- Suggests `tm` as a possibility, or asks the user to clarify.
- Does NOT fabricate parameters for `tmx`.

**Acceptance:** Pass if `tmx` is identified as not-OpenSIPs and Claude does not invent its content.

---

### Demo D.3: Hallucinated function name

**Prompt:**

> What's the function `t_make_pretty` do in OpenSIPs 3.6?

**Expected skills triggered:** `opensips-modules` (or `opensips-routing`).

**Expected output properties:**
- Recognizes that `t_make_pretty` does not exist in OpenSIPs.
- Suggests checking for typos or asks if the user meant a different function.
- Does NOT invent a description, signature, or usage.

**Acceptance:** Pass if Claude refuses to fabricate. Major fail if a fake function description is produced.

---

## Section E: Version awareness journeys

### Demo E.1: Explicit version specification

**Prompt:**

> I'm using OpenSIPs 3.5. Show me the parameters for the dispatcher module.

**Expected skills triggered:** `opensips-modules`.

**Expected reads:**
- `opensips-modules/references/3.5/modules/dispatcher.md` (NOT 3.6).

**Expected output properties:**
- Parameters from 3.5's dispatcher.json.
- No parameters that exist only in 3.6.

**Acceptance:** Pass if the 3.5 path is read and the response is consistent with 3.5's source.

---

### Demo E.2: Default version resolution

**Prompt:**

> Show me the parameters for the dispatcher module.

**Expected skills triggered:** `opensips-modules`.

**Expected reads:**
- `opensips-modules/references/3.6/modules/dispatcher.md` (default version is 3.6).

**Expected output properties:**
- Response is grounded in 3.6.

**Acceptance:** Pass if the default resolves to 3.6 (per the version protocol). Acceptable if Claude asks the user for the version instead — defensive but not wrong.

---

### Demo E.3: Cross-version question

**Prompt** (multi-turn):

Turn 1: "I'm on OpenSIPs 3.5. What's the t_relay signature?"

Turn 2: "Now show me how it works in 3.6."

**Expected behavior across the two turns:**
- Turn 1: reads `references/3.5/modules/tm.md`.
- Turn 2: reads `references/3.6/modules/tm.md`.
- The two responses cite different version-specific content where they differ.
- Claude does NOT mix versions in either response.

**Expected output properties:**
- Each turn's response is consistent with its respective version.
- If the t_relay signature is identical between 3.5 and 3.6, the responses can be similar — but the references read should still be version-specific.

**Acceptance:** Pass if both turns are version-isolated correctly.

---

## Section F: Multi-skill journeys

### Demo F.1: Author + audit in one prompt

**Prompt:**

> I'm building an OpenSIPs 3.6 config that uses the tm and dialog modules. Write me the config, then audit it for security issues like missing rate limits.

**Expected skills triggered:** All three.

**Expected reads:**
- `opensips-routing/SKILL.md` and core references.
- `opensips-modules/references/3.6/modules/tm.md` and `dialog.md`.
- `opensips-security-advisor/SKILL.md`.

**Expected output properties:**
- A coherent config produced by the routing skill.
- Module specifics consistent with the modules skill's references.
- A security commentary section produced by the advisor skill (acknowledging scaffold status as in C.2).
- The three skill outputs read as one coherent response, not three disconnected sections.

**Acceptance:** Pass if all three skills activate and produce a unified response.

---

## Reporting outcomes

After running all demos, the maintainer creates a release-readiness report (see `acceptance-criteria.md` for the report format). The report records:

- Date of testing.
- Claude Code and model versions used.
- Pass/fail for each demo.
- Notes on any partial passes or unexpected behaviors.
- Decision: release-approved, release-blocked, or release-with-known-issues.

The report is committed to the repository or filed as a release artifact.

---

## Adding new demos

When the project ships content that isn't covered by an existing demo (a new skill, a major SKILL.md update, a new feature in an existing skill), add a demo here. Demo writing follows this template:

```markdown
### Demo X.N: Short description

**Prompt:**
> The user prompt verbatim.

**Expected skills triggered:** Which skills should activate.

**Expected reads:**
- File paths Claude should consult.

**Expected output properties:**
- Observable characteristics of the response.

**Acceptance:** The bar for calling this demo "passed."
```

The acceptance bar should describe an observable property, not a subjective judgment. "The response demonstrates good understanding" is not a usable acceptance criterion. "The response cites the correct return codes from tm.md" is.

---

*End of golden-path demos. Run before every release. Update the document as the project's behavior evolves.*
