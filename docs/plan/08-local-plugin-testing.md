# Milestone 8: Local plugin testing

## Goal

Install the plugin in Claude Code via `--plugin-dir` and verify that all three skills load, trigger correctly for canonical prompts, and produce useful output. At the end of this milestone, the plugin is empirically demonstrated to work end-to-end — the path from "user types a prompt" to "Claude responds with version-correct OpenSIPs content using the right reference files" is proven, not assumed.

This is the first milestone where runtime behavior matters. Everything before this was structurally verifiable (validation passes, files render, indexes build, version isolation holds). Runtime behavior — does the right skill activate, does Claude actually read the reference files, does the cross-project guardrail prevent Kamailio identifier leakage — can only be verified by running the plugin against Claude Code with real prompts.

## Why this is sequenced here

Eight previous milestones produced the artifacts the runtime needs: source data, generated references, SKILL.md files, plugin manifests. With those in place, this milestone exercises them. Doing this earlier (e.g., before SKILL.md authoring) would mean testing against placeholder content; doing it later (e.g., after the full test suite) would mean automating tests for behavior we haven't yet verified manually.

This milestone is also the gate before milestone 9 (test suite). The golden-path demos that become regression tests are derived from the prompts that succeed in this milestone. If milestone 8 reveals that certain prompts don't trigger the right skills, those failures are fixed before the demos are codified — otherwise the test suite locks in broken behavior.

## Tasks

### Task 8.1: Install the plugin locally

Open Claude Code in a working directory and install the plugin via the local plugin directory mechanism:

```bash
claude --plugin-dir /path/to/opensips-skills/plugins/opensips
```

Or, if testing against a specific working tree, use the explicit path. Verify all three skills load by running:

```
/skills
```

Expected output: a listing showing `opensips-routing`, `opensips-modules`, and `opensips-security-advisor` with their descriptions truncated to fit the listing format.

If any skill is missing from the listing, debug:

1. Check the plugin manifest (`plugins/opensips/.claude-plugin/plugin.json`) parses as valid JSON.
2. Check each SKILL.md frontmatter parses as valid YAML.
3. Check the directory structure matches what Claude Code expects (skills under `plugins/opensips/skills/<skill-name>/SKILL.md`).
4. Check Claude Code logs (via the developer console or wherever Claude Code surfaces them) for plugin-load errors.

Acceptance: All three skills appear in `/skills` output. Their descriptions are visible (truncated is fine; visible is what matters).

### Task 8.2: Verify trigger reliability for canonical prompts

Run a structured set of prompts and observe which skills activate. Use a fresh Claude Code session for each prompt to avoid context contamination from prior turns.

The trigger test set has four categories:

**Should-trigger prompts (positive cases):**

- "Help me write an opensips.cfg with a basic registrar." → `opensips-routing` should activate.
- "What functions does the dialog module export in OpenSIPs 3.6?" → `opensips-modules` should activate.
- "Review my OpenSIPs config for INVITE flooding vulnerabilities." → `opensips-security-advisor` should activate.
- "I'm on OpenSIPs 3.6 and need a route_block that authenticates incoming INVITEs." → `opensips-routing` should activate.
- "Show me the parameters for the dispatcher module." → `opensips-modules` should activate.

For each, verify (a) the right skill activates, (b) Claude actually reads the SKILL.md body (visible in the tool-use trail), and (c) the response is grounded in the reference files (also visible in the tool-use trail).

**Should-not-trigger prompts (negative cases):**

- "Write me a Kamailio config for digest authentication." → No OpenSIPs skill should activate. (Kamailio is a sibling SER-lineage project; the description's exclusion clause should prevent triggering.)
- "What's the difference between TCP and UDP for SIP?" → No skill should activate. (Generic SIP question, not OpenSIPs-specific.)
- "How do I install Asterisk?" → No skill should activate.
- "Explain SIP RFC 3261." → No skill should activate.

For each, verify the skills do not activate and that Claude responds with general knowledge (or a "I don't have specific knowledge here" response).

**Ambiguous prompts (should activate, edge cases):**

- "OpenSIPs vs Kamailio?" → `opensips-routing` may activate; if it does, it should defer to the cross-project guardrail and answer carefully without taking sides.
- "Can you fix this config?" + a paste containing OpenSIPs syntax → `opensips-routing` should activate based on the pasted content even though the prompt itself is generic.

**Multi-skill prompts (should trigger multiple skills together):**

- "Write me a stateful proxy config using the tm and dialog modules, and audit it for security." → All three skills should activate. (Routing for authoring, modules for tm/dialog references, security advisor for the audit.)

Document the actual outcome for each prompt. Expected outcomes are above; record discrepancies for follow-up.

Acceptance: At least 80% of should-trigger prompts activate the expected skill on first try. At least 80% of should-not-trigger prompts correctly suppress activation. Discrepancies are documented.

### Task 8.3: Verify reference-file loading behavior

Trigger reliability is necessary but not sufficient. The skill must also actually consult the reference files — not just acknowledge their existence and answer from training-data priors.

For each of three carefully-chosen prompts, observe Claude's tool-use trail and verify the right files are read:

**Prompt 1: Module-specific question.**
"What does the `t_relay` function do in OpenSIPs 3.6, and what return codes does it produce?"

Expected reads:
- `opensips-modules/SKILL.md` body (after frontmatter triggers).
- `references/3.6/modules/tm.md` (the function lives in the tm module).

Verify: Claude's response cites the function signature and return codes from the rendered Markdown, not from generic training-data knowledge. Spot-check the answer against the source `tm.json` to confirm it matches.

**Prompt 2: Pseudo-variable question.**
"What does `$T_branch_idx` represent in OpenSIPs 3.6, and where can it be used?"

Expected reads:
- `opensips-routing/SKILL.md` body.
- `references/3.6/core/variables.md` (or `references/3.6/modules/tm.md` if the variable is module-exported).

Verify: Claude's response describes the variable's type, scope, read-write status, and available-in route blocks accurately.

**Prompt 3: Cross-project guardrail engagement.**
"Use `pv_get_authattr` to extract the auth attribute in OpenSIPs."

Expected behavior:
- `opensips-routing` activates.
- The cross-project guardrail in the SKILL.md body fires.
- Claude recognizes `pv_get_authattr` as a Kamailio-style identifier, not OpenSIPs syntax.
- Claude either (a) corrects the user with the OpenSIPs equivalent (`$authattr`), or (b) asks the user whether they meant the OpenSIPs syntax instead of constructing something invalid.

Verify: Claude does not silently produce invalid OpenSIPs syntax. The guardrail prose in the SKILL.md actually shapes the response.

Acceptance: All three prompts demonstrate Claude reading the right reference files. The cross-project guardrail demonstrably engages on the third prompt.

### Task 8.4: Verify version-aware behavior

The plugin supports OpenSIPs 3.5 and 3.6 with version-isolated reference trees. The skill descriptions and bodies don't lock to a specific version — they instruct Claude to resolve the active version per the protocol in the requirements doc (user statement, environment variable, file marker, default).

Test version-aware behavior with these prompts:

**Prompt 4.A: Explicit version in user prompt.**
"I'm using OpenSIPs 3.5. Show me the parameters for the dispatcher module."

Expected reads:
- `references/3.5/modules/dispatcher.md`.

Verify: Claude reads the 3.5 file specifically, not 3.6. Compare the response against 3.5's source — any 3.6-specific parameter that doesn't exist in 3.5 should be absent from the response.

**Prompt 4.B: No version specified.**
"Show me the parameters for the dispatcher module."

Expected behavior:
- Claude resolves to the default version (3.6 per the requirements protocol).
- Reads `references/3.6/modules/dispatcher.md`.

Verify: The response uses 3.6 content. If Claude asks the user to clarify the version, that's also acceptable — it's a defensive choice, not a failure.

**Prompt 4.C: Conflicting context.**
"I'm on OpenSIPs 3.5. What's the t_relay signature?" (then in a follow-up turn) "Now show me how it works in 3.6."

Expected behavior:
- First turn: Claude reads `references/3.5/modules/tm.md`.
- Second turn: Claude reads `references/3.6/modules/tm.md`.
- The version context shifts cleanly between turns.

Verify: Claude does not mix versions. The two responses are about different versions and reference-file content.

Acceptance: Version-aware behavior works correctly for all three test cases.

### Task 8.5: Verify multi-skill coordination

When multiple skills activate together, they should cooperate, not compete. Test with a prompt that spans all three skills:

**Prompt 5: Multi-skill scenario.**
"I'm building an OpenSIPs 3.6 config that uses the tm and registrar modules. Write me the config, then audit it for common security issues like missing rate limits."

Expected behavior:
- All three skills activate.
- `opensips-routing` produces the config.
- `opensips-modules` provides the per-module reference data when referenced.
- `opensips-security-advisor` reviews the produced config (with placeholder content since the security advisor is a scaffold per ADR-005).

Verify:
- The response shows tool-use trails from all three skills.
- The skills don't duplicate work (e.g., routing doesn't try to author module references; modules doesn't try to author the config).
- The response reads coherently as a single answer, not as three disconnected outputs.

Note that the security advisor's content is a scaffold — it will identify the activation point but won't have substantive review patterns yet. That's expected and is the responsibility of the security agent (ADR-005). What matters here is that the integration works structurally.

Acceptance: All three skills activate. The response is coherent. The integration contract from ADR-005 holds in practice.

### Task 8.6: Verify hot-reload during development

Claude Code supports `/reload-plugins` to pick up mid-session changes to SKILL.md or reference files. Test this:

1. With a Claude Code session active and the plugin loaded, edit `opensips-routing/SKILL.md` — make a small visible change (add a comment line in the body, for example).
2. Run `/reload-plugins` in Claude Code.
3. Trigger the skill with a routing prompt.
4. Verify Claude's response reflects the edit (or, if the edit was a body comment, verify the SKILL.md body is re-read fresh — visible in the tool-use trail).

This is mostly a sanity check that the development workflow works as documented. If hot-reload doesn't work, the development experience for SKILL.md iteration is severely degraded — every edit means restarting Claude Code.

Acceptance: Edits to SKILL.md are picked up by `/reload-plugins` without a full session restart.

### Task 8.7: Document the testing outcomes

Create `docs/testing/local-test-results.md` (a transient document, not a permanent artifact) recording:

- Date of testing.
- Claude Code version used.
- Each prompt tested (paraphrased if needed for brevity).
- Outcome (pass/fail/partial).
- Notes on any unexpected behavior.

This document is not committed permanently to the repository — it's a snapshot of the test session that informs the work of milestones 9 (test suite) and 10 (release prep). After milestone 9 codifies the golden-path tests, this document can be deleted or archived.

The point of writing it down is twofold: it forces explicit acknowledgment of pass/fail outcomes (rather than vague "looked good"), and it provides the source material for the golden-path test design in milestone 9.

Acceptance: A test-results document exists with outcomes for at least the prompts in Tasks 8.2–8.5.

### Task 8.8: Iterate on issues found

If milestone 8 reveals problems — descriptions that don't trigger reliably, reference files that don't get read, the cross-project guardrail not engaging, version resolution failing — fix them before moving to milestone 9.

The fixes might be:

- **SKILL.md description tweaks** — adjust trigger keywords, strengthen the exclusion clause, front-load the discriminator.
- **SKILL.md body tweaks** — make reference-file pointers more imperative ("Read `references/...`" instead of "See `references/...`"), strengthen the cross-project guardrail, add or improve Bad/Good examples.
- **Reference file fixes** — if the renderer produced something subtly wrong (a malformed code block, an unclosed table, an unexpected character), trace back to the source and fix.
- **Build pipeline fixes** — if the issue is structural (paths wrong, frontmatter malformed), the fix lives in the build script.

For each fix, validate with a re-test of the affected prompts. Don't move on until the test outcomes are clean enough to derive golden-path demos from in milestone 9.

Acceptance: All blocking issues from Tasks 8.2–8.6 are resolved. The test results document shows a clean enough baseline that the golden-path demos can be authored against it.

## Acceptance criteria

The milestone is done when all of the following are true:

- The plugin loads in Claude Code via `--plugin-dir` and all three skills appear in `/skills`.
- At least 80% of should-trigger prompts activate the expected skill on first try.
- At least 80% of should-not-trigger prompts correctly suppress activation.
- For three representative prompts (Module question, PV question, Cross-project guardrail engagement), Claude demonstrably reads the right reference files.
- Version-aware behavior works for explicit version, default version, and version-shifting cases.
- Multi-skill coordination works — all three skills can activate together for a spanning prompt.
- Hot-reload via `/reload-plugins` works.
- A test-results document records the outcomes.
- Any issues found in testing are fixed before the milestone closes.

When all of these are true, milestone 8 is complete. The plugin is empirically demonstrated to work. Milestone 9 (test suite and CI) codifies the verified behavior into automated regression tests.

## Risks and watch-outs

**Trigger inconsistency across model versions.** Skill triggering is probabilistic — Claude Sonnet, Opus, and Haiku can behave slightly differently for the same prompt. If testing happens against one model and the plugin ships against another, behavior may differ. Mitigate by testing against all three model variants if possible. At minimum, document which model the testing was conducted with.

**Truncation in `/skills` listing hiding the exclusion clause.** If the description's exclusion clause ("Do NOT use for Kamailio…") is past the 250-character truncation point, Claude's selection logic may not see it, and the skill could fire on Kamailio prompts. The skill authoring guide §2.2 calls this out; verify by inspecting the actual `/skills` output and confirming the exclusion clause is visible (or front-loaded enough to fall within the truncation window).

**Reference files not loaded because Claude infers.** Claude is sometimes confident enough about its training-data knowledge that it answers without reading the reference file, even when the SKILL.md body says "read references/...". This is a real failure mode. The mitigation is in the SKILL.md body — make the reference-file pointers more imperative ("Read..." not "See...") and reinforce the "do not infer from training data" rule. If a prompt fails this check, iterate the body before moving on.

**Version resolution silently defaulting wrong.** If the user doesn't specify a version and there's no environment marker, Claude defaults to 3.6 per the requirements doc. But "Claude defaults to 3.6" is a behavior of the SKILL.md body, not a structural guarantee. If the body's version-resolution prose is unclear or absent, Claude may default to whichever version it finds first (alphabetically, 3.5 — wrong) or fail to resolve and ask the user (acceptable but slow). Verify the default behavior matches expectations.

**Hot-reload not picking up reference file changes.** `/reload-plugins` reloads SKILL.md content, but reference files might not be re-read within the same conversation if Claude already cached them earlier in the turn. This shouldn't matter in practice (each conversation starts fresh), but if you're debugging a reference file change in a long-running session, restart the session rather than trusting hot-reload for reference files.

**Test outcomes that "feel right" but aren't.** It's tempting to call a test "passing" when the response is plausible-looking but actually subtly wrong. Spot-check by comparing Claude's response against the source JSON for the relevant module. If Claude says `t_relay` returns codes 1, -1, -2, -3 and the source says it returns 1, -1, -2, -3, -4, the test is failing — Claude lost a return code. Be rigorous; the cost of locking in subtle errors as "passing" tests in milestone 9 is much higher than the cost of catching them now.

**The test session getting too long.** Comprehensive trigger testing across many prompts in one session leads to context contamination. Use fresh sessions for each prompt category, or at least for any prompt that depends on default version resolution (which contextual hints from earlier turns can override).

**Documentation lag.** The test-results document is most useful while the testing is happening. If documentation lags behind the actual testing, you'll forget which prompt produced which outcome, and the milestone-9 work will be reconstructed from memory rather than from the test session. Write outcomes immediately as they happen.

**Skill non-activation as a "passing" test.** If `opensips-modules` doesn't activate on "what functions does the dialog module export?" but Claude answers correctly anyway from training data, that's not a passing test — it's a hallucination risk that happened to land correctly this time. The test should fail because the skill didn't activate, regardless of whether the response was correct. Activation reliability is the verified behavior, not response correctness alone.

## Parallelization notes

Tasks 8.1 (install), 8.2 (trigger reliability), 8.3 (reference loading), 8.4 (version-aware), and 8.5 (multi-skill) are sequential — each builds on confidence in the previous. Task 8.6 (hot-reload) can be done in parallel with any of 8.2–8.5 once the plugin is installed. Task 8.7 (documentation) runs concurrent with all testing tasks. Task 8.8 (iterate on issues) is the closing action.

For solo work, do them in order. The testing is interactive and benefits from the cognitive flow of building confidence incrementally — you don't want to be debugging a multi-skill coordination issue in Task 8.5 if you haven't yet verified single-skill triggering in Task 8.2.

## Cross-references

- Plugin install via `--plugin-dir`: `docs/requirements.md` §9.3.
- Version resolution protocol: `docs/requirements.md` §4.3.
- Skill authoring guide §2.8 on iteration testing.
- Three-skill architecture: `docs/architecture/adr/005-three-skill-architecture.md`.
- Cross-project guardrail rationale: `docs/architecture/adr/008-ser-lineage-neutral-framing.md`.

---

*Next milestone: `09-test-suite-and-ci.md`.*
