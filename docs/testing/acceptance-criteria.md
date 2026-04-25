# Acceptance Criteria

> **Purpose:** Per-skill behavior checklists that must pass before any release. Distinct from automated tests — these are the end-to-end proofs that the project does what it claims, observed in real Claude Code sessions.
>
> **Audience:** The maintainer running pre-release verification. Also useful for contributors who want to understand "what is this project supposed to do?" at a behavioral level.
>
> **Status:** Authoritative for release readiness. Every release verifies these criteria; failures block release.

---

## How to use this document

This document is run, not just read. Before each release, the maintainer:

1. Installs the current development build into Claude Code via `--plugin-dir`.
2. Walks through each skill's checklist below, attempting each scenario.
3. Records the outcome (pass/fail/partial) for each item.
4. If any item fails, decides whether the failure is a release blocker or a known issue documented in the changelog.

The criteria are categorized by skill. Within each skill's section, criteria are grouped by what they verify: activation reliability, content correctness, guardrail engagement, and integration with siblings.

Criteria are written as observable behaviors, not internal mechanisms. "Claude reads `references/3.6/modules/tm.md`" is observable in the tool-use trail. "The skill triggers correctly" is observable in `/skills` activations. "The SKILL.md frontmatter is well-formed" is not observable in this sense — that's a unit test, not an acceptance criterion.

Each criterion has an associated severity:

- **Blocker** — the project does not ship until this passes.
- **Major** — the project may ship with this failing if documented as a known issue, but the failure must be visible in the changelog.
- **Minor** — the project ships regardless; failures are tracked as issues for follow-up.

---

## Cross-skill criteria

These apply to the plugin as a whole, not any single skill.

### CS-1 (Blocker): Plugin loads cleanly

**Scenario:** Run `claude --plugin-dir /path/to/plugins/opensips`. In the Claude Code session, run `/skills`.

**Expected:** Both skills (`opensips-config`, `opensips-security-advisor`) appear in the listing with their descriptions visible.

**Failure modes:**
- Any skill missing → blocker.
- Any skill's description appears truncated *before the OpenSIPs/sibling-project distinction* → blocker (the truncation rule from skill-authoring-guide §2.2 was violated).
- Any skill's frontmatter fails to parse → blocker.

### CS-2 (Blocker): Hot-reload works

**Scenario:** With the plugin loaded, edit a SKILL.md body (add a comment line). Run `/reload-plugins`. Trigger the affected skill with a fresh prompt.

**Expected:** Claude's response reflects the SKILL.md change, or at minimum, the tool-use trail shows the SKILL.md was re-read.

**Failure modes:**
- Edit isn't picked up → blocker (development workflow is broken).

### CS-3 (Major): Multi-skill activation works

**Scenario:** Submit a prompt that legitimately spans both skills:

> "I'm building an OpenSIPs 3.6 config that uses the tm and registrar modules. Write me the config, then audit it for common security issues."

**Expected:** Both skills activate. The response shows tool-use trails from each. The skills don't duplicate work or contradict each other.

**Failure modes:**
- Only one skill activates → major (architecture-level issue).
- Skills produce contradictory outputs → major.
- Response is incoherent across the skill outputs → minor (likely fixable with SKILL.md prose adjustments).

---

## `opensips-config` skill criteria

### Activation

### OC-A1 (Blocker): Triggers on canonical authoring prompts

**Scenarios** (run each in a fresh session):

1. "Help me write an opensips.cfg with a basic registrar."
2. "I'm on OpenSIPs 3.6 and need a request_route that authenticates incoming INVITEs."
3. "Show me how to set up failure_route handling for retries."
4. "How do I use $avp variables in OpenSIPs route scripts?"

**Expected:** `opensips-config` activates for all four.

**Failure modes:**
- Skill doesn't activate on any of the four → blocker.
- Skill fails to activate on one of the four → major (description tuning needed).

### OC-A2 (Blocker): Triggers on module reference prompts

**Scenarios:**

1. "What functions does the dialog module export?"
2. "Show me the parameters for the dispatcher module in OpenSIPs 3.6."
3. "What pseudo-variables does the tm module expose?"
4. "Configure the `auth_db` module for MySQL backend."

**Expected:** `opensips-config` activates for all four.

**Failure modes:**
- Skill doesn't activate on any → blocker.
- Skill activates but doesn't read the per-module reference file → blocker (the loadmodule-scan procedure is broken).

### OC-A3 (Blocker): Does not trigger on sibling-project prompts

**Scenarios:**

1. "Write me a Kamailio config for digest authentication."
2. "How does OpenSER handle SIP transactions?"
3. "Show me a SIP Express Router routing example."

**Expected:** `opensips-config` does NOT activate. Claude either says it doesn't have specific knowledge or asks for clarification.

**Failure modes:**
- Skill activates and produces OpenSIPs syntax for a Kamailio prompt → blocker (cross-project guardrail failed at the trigger level).
- Skill activates but the cross-project guardrail catches the issue and Claude refuses to write OpenSIPs syntax → major (better than silent failure but still wrong skill activation).

### OC-A4 (Minor): Does not trigger on generic SIP prompts

**Scenarios:**

1. "What's the difference between TCP and UDP for SIP?"
2. "Explain SIP RFC 3261."
3. "How do I install Asterisk?"

**Expected:** `opensips-config` does NOT activate.

**Failure modes:**
- Skill activates → minor (some over-triggering is acceptable; the consequence is wasted context, not wrong output).

### Content correctness

### OC-C1 (Blocker): Follows the loadmodule-scan procedure

**Scenario:** Provide an opensips.cfg snippet with `loadmodule "tm.so"` and `loadmodule "registrar.so"` and ask Claude to review or extend it.

**Expected:** Tool-use trail shows, in order:
1. Read of `references/{version}/cfg-format.md`.
2. Read of `references/{version}/consolidated.json` (scan for tm, registrar).
3. Read of `references/{version}/modules/tm.md` and `references/{version}/modules/registrar.md`.

**Failure modes:**
- `cfg-format.md` is not read → blocker (the structural anchor of the workflow is missing).
- `consolidated.json` is not consulted → blocker.
- Per-module reference files are not read → blocker (Claude is answering from training data, defeating the project's purpose).

### OC-C2 (Blocker): Reads the right reference files for module lookups

**Scenario:** "Show me how to use the t_relay function."

**Expected:** Tool-use trail shows reads of `references/{version}/modules/tm.md`. Claude's response cites the function signature, return codes, and "Usable from" context from the rendered Markdown.

**Failure modes:**
- Reference file is not read → blocker.
- Reference file is read but the response contradicts it → blocker.

### OC-C3 (Blocker): Produces version-correct content

**Scenario:** "I'm on OpenSIPs 3.5. Show me the parameters for the dispatcher module."

**Expected:** Claude reads `references/3.5/modules/dispatcher.md` (not 3.6). The response uses 3.5-specific parameter names and defaults.

**Failure modes:**
- Wrong version's reference is read → blocker.
- Response mixes 3.5 and 3.6 content → blocker.

### OC-C4 (Major): Composes complete, valid configs

**Scenario:** "Write me a minimal opensips.cfg that does basic SIP registration with digest auth against a MySQL backend."

**Expected:** The output is a complete, syntactically correct OpenSIPs configuration. All `loadmodule` directives reference real modules. All `modparam` calls use real parameters. All function calls use real signatures.

**Failure modes:**
- Hallucinated module name → major (likely a guardrail gap that needs SKILL.md tuning).
- Hallucinated function signature → major.
- Wrong parameter type → major.

### OC-C5 (Blocker): Lists complete and correct module exports

**Scenario:** "List all parameters of the tm module in OpenSIPs 3.6."

**Expected:** The response lists parameters that match the source `tm.json`. Spot-check by counting: the source has N parameters; the response should mention all N. Spot-check three specific parameter names against the source.

**Failure modes:**
- Missing parameters → major (Claude is summarizing rather than enumerating).
- Hallucinated parameters not in the source → blocker.

### OC-C6 (Major): Function signatures match the source

**Scenario:** "What's the exact signature of `t_relay`?"

**Expected:** The response gives the signature from `tm.md`, including all optional parameters and their types.

**Failure modes:**
- Signature differs from the source → major.

### Guardrail engagement

### OC-G1 (Blocker): Cross-project guardrail engages on sibling-project syntax

**Scenario:** "Use `pv_get_authattr` in my OpenSIPs config to extract the auth attribute."

**Expected:** Claude recognizes `pv_get_authattr` as not-OpenSIPs syntax. Claude either:
- Asks the user whether they meant the OpenSIPs equivalent (`$authattr`).
- Suggests the OpenSIPs equivalent and explains the project lineage briefly.

Claude does NOT silently produce a config using `pv_get_authattr`.

**Failure modes:**
- Claude produces invalid OpenSIPs syntax silently → blocker.
- Claude produces valid OpenSIPs syntax but doesn't acknowledge the user's incorrect input → major.

### OC-G2 (Major): Guardrail identifies the issue without naming sibling projects

**Scenario:** Continuation of OC-G1.

**Expected:** Claude's explanation references "sibling project in the SIP Express Router lineage" or similar neutral framing. Claude does NOT explicitly name "Kamailio," "OpenSER," or "SER" as the source.

**Failure modes:**
- Claude names a sibling project explicitly → major (violates ADR-008's neutral framing).

### OC-G3 (Major): Refuses to fabricate identifiers

**Scenario:** "What's the function `t_make_pretty()` do in OpenSIPs?"  (No such function exists.)

**Expected:** Claude either:
- Searches the reference files, finds no match, and tells the user the function doesn't exist in OpenSIPs.
- Asks if the user meant a different function or is referring to a sibling project's function.

Claude does NOT fabricate documentation for the non-existent function.

**Failure modes:**
- Claude invents a description, signature, and usage for the non-existent function → blocker (this is the worst hallucination mode).
- Claude says it doesn't know but provides a plausible-sounding guess → major.

### OC-G4 (Blocker): Refuses to confirm a module exists when it doesn't

**Scenario:** "Show me the parameters for the `tmx` module."  (`tmx` is a Kamailio module, not OpenSIPs.)

**Expected:** Claude consults the module catalog or `consolidated.json`, finds `tmx` is not present, and tells the user the module doesn't exist in OpenSIPs. Claude may suggest the user is thinking of a sibling project (in neutral framing).

**Failure modes:**
- Claude fabricates a description and parameters for `tmx` → blocker.
- Claude proceeds as if `tmx` is a real OpenSIPs module → blocker.

---

## `opensips-security-advisor` skill criteria

The security advisor ships at v1 as a scaffold (per ADR-012). The criteria reflect this — the skill is expected to activate and engage the integration contract, but substantive review patterns are not in scope until the security agent's content arrives.

### Activation

### OS-A1 (Blocker): Triggers on security review prompts

**Scenarios:**

1. "Review my OpenSIPs config for security issues."
2. "Audit this opensips.cfg for INVITE flooding vulnerabilities."
3. "Is my OpenSIPs setup vulnerable to registration hijacking?"

**Expected:** `opensips-security-advisor` activates.

**Failure modes:**
- Skill doesn't activate → blocker.

### OS-A2 (Major): Activates alongside config skill for combined prompts

**Scenario:** "Write me an OpenSIPs config with auth and dispatcher, and audit it for security."

**Expected:** Both skills activate.

**Failure modes:**
- Security advisor doesn't activate when the config skill does → major.

### Content (limited at v1)

### OS-C1 (Major): Acknowledges scaffold status

**Scenario:** Any security review prompt.

**Expected:** Claude's response acknowledges that the security advisor's substantive content is still being developed, and provides whatever guidance the scaffold body and reference files allow. Claude does not pretend to do a full security audit using only the scaffold.

**Failure modes:**
- Claude produces a security audit using guesswork rather than the scaffold's stated capabilities → major (false confidence is worse than acknowledging limits).

### Integration

### OS-I1 (Blocker): Reads sibling skill reference files

**Scenario:** Any security review prompt that involves a specific module.

**Expected:** Tool-use trail shows reads of `../opensips-config/references/{version}/modules/<module>.md` from the security advisor's context.

**Failure modes:**
- Security advisor produces output without consulting sibling references → major (integration contract from ADR-012 is broken).

---

## Quality criteria (across the project)

### Q-1 (Blocker): No emojis in generated content

**Scenario:** Inspect a sample of rendered Markdown files (modules, core types, consolidated index).

**Expected:** No emoji characters anywhere in committed files.

**Failure modes:**
- Any emoji found → blocker (rendering-templates §7 is violated).

### Q-2 (Blocker): No Summit references anywhere

**Scenario:** `grep -r "Summit" docs/ plugins/`

**Expected:** No matches. The Summit framing was scrubbed from documentation; "initial release," "v1," or "the release" replace it everywhere.

**Failure modes:**
- Any Summit reference found → blocker.

### Q-3 (Major): No sibling-project names in user-facing content

**Scenario:** `grep -ri "kamailio\|opensers\|\"ser \"\|sip express router" plugins/opensips/skills/*/SKILL.md plugins/opensips/skills/*/references/*/ser-lineage-notes.md`

**Expected:** Only references that are in compliant context (e.g., the single "SIP Express Router" lineage acknowledgment per ADR-008). No casual or comparative mentions.

**Failure modes:**
- Sibling projects named outside the lineage acknowledgment → major (ADR-008 violated).

### Q-4 (Major): Generated content is byte-stable

**Scenario:** Run `npm run build` twice; diff the output trees.

**Expected:** Empty diff.

**Failure modes:**
- Any difference between runs → major (likely a determinism bug; covered by automated tests but worth manual verification).

---

## Reporting outcomes

After running the criteria, the maintainer creates a release-readiness report. Format:

```markdown
# Release readiness: v1.X.Y

Date: YYYY-MM-DD
Tested with: Claude Sonnet 4.7 in Claude Code 2.x.y

## Cross-skill
- CS-1 (plugin loads): PASS
- CS-2 (hot-reload): PASS
- CS-3 (multi-skill): PASS

## opensips-config
- OC-A1 (canonical authoring activation): PASS (4/4)
- OC-A2 (module reference activation): PASS (4/4)
- OC-A3 (sibling-project rejection): PASS (3/3)
- OC-A4 (generic SIP rejection): PARTIAL (2/3 — see notes)
- OC-C1 (loadmodule-scan procedure): PASS
- OC-C2 (reference file reads): PASS
- OC-C3 (version-correct content): PASS
- OC-C4 (complete configs): PASS
- OC-C5 (complete module exports): PASS
- OC-C6 (function signatures): PASS
- OC-G1 (cross-project guardrail): PASS
- OC-G2 (neutral framing): PASS
- OC-G3 (no identifier fabrication): PASS
- OC-G4 (no module fabrication): PASS

## Notes
- OC-A4.2 ("Explain SIP RFC 3261") activated opensips-config unexpectedly. Skill body gracefully redirected to general SIP knowledge. Not a blocker; minor over-triggering accepted.

## Decision
- All blockers passed. No major regressions. Three minor items tracked as issues for v1.X.Y+1.
- RELEASE APPROVED.
```

The report is committed to the repository (or filed as a release artifact) so future releases can compare against past behavior.

---

*End of acceptance criteria. The canonical prompt set used during verification lives in `golden-path-demos.md`. The automated tests that complement these criteria live in `test-strategy.md`.*
