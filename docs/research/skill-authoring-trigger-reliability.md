# Research Report: Authoring SKILL.md Files for Claude Code Agent Skills — Three Coordinated OpenSIPs Skills

**Scope.** This report distills production evidence and documented best practices specifically targeted at the three problems facing the OpenSIPs skill set (`opensips-routing`, `opensips-modules`, `opensips-security-advisor`): reliable triggering, multi-skill coordination without overlap, anti-hallucination guardrails (especially against importing identifiers from sibling SIP servers in the SER/Kamailio/OpenSER lineage), and SKILL.md body structure/length. Each section ends with concrete recommendations applicable to the OpenSIPs trio.

A few framing facts before the four areas:

- A skill is a directory with a `SKILL.md` whose YAML frontmatter (`name`, `description`) is the only metadata pre-loaded into the system prompt; the body is read only after Claude decides the skill is relevant; reference files and scripts are loaded later still ([Anthropic engineering blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills); [Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)).
- Skill selection is pure LLM reasoning over the `name` + `description` of every installed skill — no embeddings, no classifier, no keyword matcher ([Lee Hanchung deep dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)).
- `description` is hard-capped at 1024 characters in the open Agent Skills spec and the Claude API ([Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)). Claude Code adds further surface-level truncation: descriptions in the `/skills` listing were capped at 250 characters in Claude Code 2.1.86 ([plannotator issue #412](https://github.com/backnotprop/plannotator/issues/412); [skills issue #881](https://github.com/anthropics/skills/issues/881)), and combined `description` + `when_to_use` text per skill is capped at 1,536 characters in the skill listing regardless of overall budget ([Claude Code skills docs](https://code.claude.com/docs/en/skills)).

---

## Research Area 1 — Trigger reliability and description writing

### 1.1 The documented "undertriggering" problem

Anthropic's own `skill-creator` SKILL.md states the problem in plain text:

> "currently Claude has a tendency to 'undertrigger' skills — to not use them when they'd be useful. To combat this, please make the skill descriptions a little bit 'pushy.'"
> — [skills/skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)

Anthropic ships an automated description optimizer that runs each eval query 3 times against a 60/40 train/test split and iterates up to 5 times, with the best version selected by validation pass rate to avoid overfitting; Anthropic ran this on their own six built-in document skills and reported "improved triggering on five of the six" ([skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md); [innovaitionpartners blog](https://innovaitionpartners.com/blog/claude-agent-skills-2.0-the-beginners-guide-to-the-updated-skill-creator)). Independent reproductions of this problem are easy to find: Scott Spence measured a baseline of **20% activation success** across five test prompts on Haiku 4.5 with passive description-only triggering, rising to **80–84%** only after adding hook-based forced evaluation ([Scott Spence](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)). A DEV.to writeup from early 2026 reports that even with a valid description and frontmatter, autonomous triggering achieves "roughly a 50% success rate" in real sessions, attributed to Claude prioritising direct task completion over inspecting the skill list ([dev.to/lizechengnet](https://dev.to/lizechengnet/why-claude-code-skills-dont-trigger-and-how-to-fix-them-in-2026-o7h)).

There is also a documented carve-out: "simple, one-step queries like 'read this PDF' may not trigger a skill even if the description matches perfectly, because Claude can handle them directly with basic tools. Complex, multi-step, or specialized queries reliably trigger skills when the description matches" ([skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)). For OpenSIPs this means trivial prompts ("what is OpenSIPs?") are *expected* not to trigger — that's not a description bug.

### 1.2 The "pushy description" pattern, with production examples

Production descriptions consistently follow a four-part structure: **(1)** capability summary, **(2)** an enumerated trigger list of concrete keywords/contexts, **(3)** a "use whenever" or "trigger especially when" clause that loosens triggering beyond literal phrasing, and **(4)** an explicit exclusion clause.

**`pdf` (Anthropic, source-available production skill):**
> "Use this skill whenever the user wants to do anything with PDF files. This includes reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, creating new PDFs, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file or asks to produce one, use this skill."

**`docx` (Anthropic):** combines positive triggers and an explicit exclusion clause:
> "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of 'Word doc', 'word document', '.docx', or requests to produce professional documents with formatting like tables of contents, headings, page numbers, or letterheads. … If the user asks for a 'report', 'memo', 'letter', 'template', or similar deliverable as a Word or .docx file, use this skill. **Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation.**"

**`pptx` (Anthropic):** uses both an over-triggering instruction *and* a synonym list:
> "Use this skill any time a .pptx file is involved in any way — as input, output, or both. … Trigger whenever the user mentions 'deck,' 'slides,' 'presentation,' or references a .pptx filename, regardless of what they plan to do with the content afterward. If a .pptx file needs to be opened, created, or touched, use this skill."

**`xlsx` (Anthropic):** strongest exclusion clause in the document set:
> "The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved."

**`claude-api` (Anthropic):** uses an explicit `TRIGGER when:` / `SKIP:` two-section style:
> "TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`; user asks for the Claude API, Anthropic SDK, or Managed Agents; … SKIP: file imports `openai`/other-provider SDK, filename like `*-openai.py`/`*-generic.py`, provider-neutral code, general programming/ML."

This `TRIGGER when … SKIP …` shape is essentially the same exclusion-clause idea but written more compactly; it is also precisely the case that hit Claude Code's 250-char display-truncation problem ([skills issue #881](https://github.com/anthropics/skills/issues/881)) — the "DO NOT TRIGGER" branch was being silently chopped, allowing false fires. That bug is a cautionary tale: **front-load the exclusion in the first ~250 characters if the skill shares vocabulary with siblings.**

### 1.3 Trigger keywords vs. phrase patterns

Both matter, and Anthropic's docs require both:

- "Be specific and include key terms. Include both what the Skill does and specific triggers/contexts for when to use it." — [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- "Always write in third person. The description is injected into the system prompt, and inconsistent point-of-view can cause discovery problems. Good: 'Processes Excel files and generates reports.' Avoid: 'I can help…' / 'You can use this to…'" — [same source](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

The recurring opening phrases that work in production are imperative third-person constructs:
- `"Use this skill whenever the user…"` (pdf, docx, pptx)
- `"Use this skill any time a [X file] is involved…"` (pptx, xlsx)
- `"Use when working with [domain] or when the user mentions [keywords]"` (recurring across the API examples)
- `"TRIGGER when: … SKIP: …"` (claude-api)

The "even if they don't explicitly ask for [X]" pattern is repeatedly cited by Anthropic's `skill-creator` and by community guides as the most effective single sentence to add. Generative Programmer's distillation of community practice corroborates: "Positive triggers pull a skill in; exclusions push it out. Both are needed and they compete for the same budget" ([Generative Programmer](https://generativeprogrammer.com/p/skill-authoring-patterns-from-anthropics)).

### 1.4 Description length: documented limit vs. empirical sweet spot

- **Hard limit:** 1024 characters in the spec ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices); [agentskills.io](https://agentskills.io/skill-creation/optimizing-descriptions)).
- **Display truncation:** 250 chars in the Claude Code `/skills` listing as of CC 2.1.86 ([plannotator issue #412](https://github.com/backnotprop/plannotator/issues/412)); 1,536 chars combined `description` + optional `when_to_use` per skill in the dynamic skill-listing budget ([Claude Code skills docs](https://code.claude.com/docs/en/skills)).
- **Aggregate budget:** the skill-listing budget is ~1% of context with an 8,000-char fallback; investigation by community researchers found an undocumented ~16,000-char total budget on the `available_skills` block in Claude Code, with skills truncated based on cumulative total — meaning longer descriptions in one skill can starve descriptions in another ([claude-code issue #13099](https://github.com/anthropics/claude-code/issues/13099)).
- **Empirical sweet spot:** "A few sentences to a short paragraph is usually right" ([agentskills.io](https://agentskills.io/skill-creation/optimizing-descriptions)). Anthropic's own production descriptions for `pdf`, `docx`, `pptx`, `xlsx` are all in the **~400–800 character** range. The `claude-api` skill that bumped over 250 chars of *useful* content tripped the listing truncation bug and had to be shortened. So the practical advice is: keep descriptions ≤250 characters of essential content, then use the remaining budget up to ~1024 chars for additional triggers and exclusion clauses with the understanding that the tail may be truncated in some surfaces.

### 1.5 Avoiding description bloat

Anthropic's `skill-creator` and the optimizer script explicitly warn: "Check that the description stays under the 1024-character limit — descriptions tend to grow during optimization". Two community findings to act on:

1. The truncation algorithm in Claude Code "punishes good documentation practices" — concise skills get truncated alongside verbose ones because truncation is by cumulative total ([claude-code issue #13343](https://github.com/anthropics/claude-code/issues/13343)). Therefore: trim ruthlessly; do not chase every possible synonym.
2. Verbose ALL-CAPS or laundry-list descriptions correlate with skills that misfire because the model can no longer see the intent; mgechev's authoring guide recommends having an LLM critique the description for over-broadness as an explicit step ([mgechev/skills-best-practices](https://github.com/mgechev/skills-best-practices)).

### 1.6 Recommendations for the OpenSIPs trio (Area 1)

| Skill | Description shape (under 250 effective chars + extension) |
|---|---|
| `opensips-routing` | "Authors and edits OpenSIPs SIP server configuration scripts (`opensips.cfg`, route blocks, modules, parameters). Use whenever the user mentions OpenSIPs, opensips.cfg, route{}/branch_route/failure_route, $var/$avp/$pv pseudo-variables, or asks to write/edit SIP routing logic for OpenSIPs. Do NOT use for Kamailio, OpenSER, or SIP Express Router (SER) configurations — those use different identifiers despite shared lineage." |
| `opensips-modules` | "Provides authoritative per-module reference data for OpenSIPs modules (function signatures, exported parameters, dependencies). Use whenever the user references a specific OpenSIPs module by name (e.g. dialog, tm, rr, registrar, dispatcher, drouting, presence, sl, uac, db_mysql, mid_registrar) or asks what functions/parameters a module exports. Do NOT use for Kamailio modules even if they share a name." |
| `opensips-security-advisor` | "Reviews OpenSIPs configurations for security issues (SIP authentication, ACL/firewall rules, rate limiting, INVITE flooding, registration hijacking, RTP relay exposure). Use whenever the user asks for a security review, audit, or hardening check on an OpenSIPs config, or mentions specific risks like 'SIP scanning', 'spoofed REGISTER', or 'toll fraud' in an OpenSIPs context. Do NOT use for general SIP security advice unrelated to OpenSIPs configuration." |

Each leads with the specific server name ("OpenSIPs"), enumerates concrete triggers a real user would type, then carries a hard exclusion against Kamailio/SER/OpenSER. The exclusion belongs **inside the first 250 chars** so that Claude Code's listing truncation cannot strip it.

---

## Research Area 2 — Multi-skill coordination and avoiding overlap

### 2.1 What happens when two skills both look relevant

Claude Code enables `parallel_tool_calls` and Anthropic's marketing materials say skills "combine automatically when work requires multiple areas of expertise, coordinating without you specifying each one" ([Claude Help Center](https://support.claude.com/en/articles/12580051-teach-claude-your-way-of-working-using-skills)). On the technical side, multiple skills can be loaded simultaneously: "Claude can load multiple skills simultaneously. Your skill should work well alongside others, not assume it's the only capability available" ([Anthropic Complete Guide to Building Skills](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)).

Documented collision modes:

- **Naming-collision/auto-trigger ambiguity.** A practitioner described having a `collect-article.md` command and an `article-collection` skill side by side; "Claude would invoke either one depending on the session" until `disable-model-invocation: true` was added on the side-effectful one ([buildtolaunch.substack.com](https://buildtolaunch.substack.com/p/claude-skills-not-working-fix)).
- **Description-overlap mis-routing.** A common report: "vague descriptions lead to missed triggers … overly broad descriptions can cause the wrong Skill to fire. Specificity is everything" ([Analytics Vidhya](https://www.analyticsvidhya.com/blog/2026/03/claude-skills-custom-skills-on-claude-code/)).
- **Task-skill vs. reference-skill confusion.** A "spec-driven planning [skill] does not reason over the available skill" — i.e. a planner skill that fired didn't activate downstream sibling skills, demonstrated as an anti-pattern.

The Iteration loop in Anthropic's Complete Guide explicitly identifies "Overtriggering signals: Skill loads for irrelevant queries, Users disabling it, Confusion about purpose. Solution: Add negative triggers, be more specific" ([Complete Guide PDF](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)).

### 2.2 Specialization patterns from production

Two distinct patterns exist in Anthropic's own skill catalog:

**Pattern A — domain-by-format (parallel, mutually exclusive).** The `pdf`/`docx`/`pptx`/`xlsx` skills carve up the document space by file extension. Each description names its file format prominently and excludes the others. The exclusion clauses are *symmetric* (docx says "Do NOT use for PDFs, spreadsheets…"; xlsx says "Do NOT trigger when the primary deliverable is a Word document…").

**Pattern B — workflow-router with delegated reference (hierarchical, not parallel).** The Complete Guide's recommended pattern for skills that span multiple variants is:
```
cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```
"Claude reads only the relevant reference file" ([Complete Guide PDF](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf); [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)). This is the **router-index pattern** the OpenSIPs project is using for `opensips-modules`.

The MMNTM "Architect's Guide" describes this same router-index idea as the "Hub-and-Spoke" architecture: "SKILL.md (The Hub) … Bundled Resources (The Spokes)" with one of its Iron Laws being "DO NOT read scripts/analyze.py. Treat it as a binary" — the analogous instruction for a router-index over reference data is "load only the per-module file Claude needs, never all of them" ([MMNTM](https://www.mmntm.net/articles/claude-code-skills)).

### 2.3 Cross-referencing between skills

There is no formal mechanism for one skill to "complement" another; what production skills do is name the sibling skill in prose so the reasoning model picks up the relationship. Examples:

- The Complete Guide's pattern: "Our skills teach Claude your team's sprint planning workflow. Together, they enable AI-powered project management."
- The Sentry skill is described as "Automatically analyzes and fixes detected bugs in GitHub Pull Requests using **Sentry's error monitoring data via their MCP server**" — making the dependency explicit.
- mgechev recommends: "Test how an LLM interprets your description in isolation to prevent false triggers (like firing for a React app when it's meant for Angular)" — i.e. each description must hold up alone, regardless of siblings.

A concrete cross-skill phrase you can put in a description (used by community plugin sets): "**This skill complements [other-skill] when …**" — shown in `claude-api` SKILL.md body as a model for routing decisions.

### 2.4 Recommendations for the OpenSIPs trio (Area 2)

1. **Make `opensips-routing` the primary** with the broadest `Use whenever…` clause, and make `opensips-modules` and `opensips-security-advisor` describe themselves as **specialized** in their first sentence ("Provides authoritative per-module reference data…" / "Reviews OpenSIPs configurations for security issues…"). Multiple skills can load together, so don't fight that — instead make sure each one's body knows when it's the "primary" vs. the "support" skill.
2. **Use mutual-exclusion exclusion clauses across the three.** `opensips-routing` should say "For per-module function signatures and exported parameters, the `opensips-modules` skill is the authoritative source." `opensips-modules` should say "Do not use this skill to author full configs; for that, use `opensips-routing`." Cross-references in prose are the only documented coordination mechanism.
3. **Treat `opensips-modules` as a Hub-and-Spoke router-index.** Its SKILL.md should be the workflow + per-module file selector, with the actual module data in `references/<module>.md`. This is the documented Anthropic pattern and is what the existing community router-index examples use.
4. **Front-load disambiguation.** Because Claude Code truncates listing descriptions at 250 chars, the first sentence of each description should both name OpenSIPs and exclude Kamailio/SER. If the listing budget pressure ever truncates the rest, the unique discriminating signal is preserved.
5. **Don't add `disable-model-invocation: true` to the routing or modules skills** — they're reference-and-author skills with no side effects. The security-advisor skill is also fine to auto-trigger because it only reads. (Use `disable-model-invocation` only for skills that *deploy* configs.)

---

## Research Area 3 — Anti-hallucination guardrails in SKILL.md bodies

### 3.1 The "explain-the-why" rule (avoid all-caps imperatives where possible)

The most precise version of the all-caps warning is in Anthropic's `skill-creator`: "If you find yourself writing ALWAYS or NEVER in all caps, reframe it. Explain the reasoning so the model understands why and can make better judgment calls in edge cases".

Generative Programmer's distillation makes the failure mode concrete: "Skills written as strings of ALWAYS, NEVER, MUST in capital letters give Claude rigid rules with no context. The model follows the letter but misses edge cases the author did not anticipate, or over-applies a rule in situations where a judgement call was needed. … 'Use constructor injection. Field injection breaks testability because we cannot mock the field without Spring context' beats 'MUST use constructor injection. NEVER use field injection.' The reasoning becomes the rubric for unanticipated cases" ([Generative Programmer](https://generativeprogrammer.com/p/skill-authoring-patterns-from-anthropics)).

Counter-evidence (when ALL-CAPS *is* correct): for genuinely fragile, machine-verified, narrow-path operations Anthropic's own production skills use them. The `xlsx` skill body reads: "**Every Excel model MUST be delivered with ZERO formula errors (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?)**". The `pdf` skill says: "**IMPORTANT: Never use Unicode subscript/superscript characters …** The built-in fonts do not include these glyphs, causing them to render as solid black boxes" — and immediately follows with the reason. The `pptx` skill uses "**⚠️ USE SUBAGENTS — even for 2-3 slides. You've been staring at the code and will see what you expect, not what's there. Subagents have fresh eyes.**".

The pattern in production: ALL-CAPS imperatives are reserved for failure modes the author has *seen*, are *immediately* followed by an explanation, and live next to a concrete example or a script the model can run instead of reasoning.

### 3.2 Negative examples and the "do not do X" pattern

The empirical research on negation in LLM prompting is mixed and matters here, because it determines whether the OpenSIPs anti-Kamailio guardrails should be phrased negatively or positively.

- Hugging Face's prompt engineering docs say: "Instructions should focus on 'what to do' rather than 'what not to do'" ([Hugging Face prompting guide](https://huggingface.co/docs/transformers/tasks/prompting)).
- A widely-cited practitioner post documents that models like InstructGPT actually performed *worse* with negative prompts as they scaled, and that converting "don't do X" into "do Y" "dramatically improved my outcomes" ([Gadlet](https://gadlet.com/posts/negative-prompting/)).
- Conversely, the modern Claude-targeted advice says negative examples define the *boundary* and prune low-quality paths: "Positive examples define the center of the target, negative examples define the edges. … Without negative examples, the model might statistically default to the 'average'".
- Anthropic's docs themselves use negative examples extensively (the `Bad / Good` pattern) — `xlsx`'s body literally shows three "Bad: hardcoded value" / "Good: Excel formula" pairs. The `pdf`/`pptx` skills include "Known Gotchas" sections that *are* a list of negative examples.

The reconciled rule that holds across the evidence: **paired** examples work (Bad → Good), as do labeled gotcha lists *adjacent to* the correct alternative; bare "do not do X" with no Y to do instead is what backfires. For OpenSIPs anti-hallucination this means: "Do not use Kamailio's `pv_get_*` family" should always be followed by "Use OpenSIPs' `$pv(name)` with these script-variable names instead — see references/pseudo-variables.md."

### 3.3 Cross-domain identifier hallucination (sibling-project leakage)

This is the OpenSIPs project's central anti-hallucination concern (Kamailio/SER/OpenSER lineage), and there is a documented production parallel that maps cleanly:

The `claude-api` skill faces an analogous problem (Anthropic SDK vs. OpenAI SDK) and solves it three ways simultaneously:

1. **Strong description-level exclusion** in the frontmatter ("SKIP: file imports `openai`/other-provider SDK …").
2. **An explicit "model ID" guardrail in the body**, with all-caps because it's machine-verified: "**ALWAYS use claude-opus-4-7 unless the user explicitly names a different model. This is non-negotiable. Do not use claude-sonnet-4-6, claude-sonnet-4-5, or any other model unless the user literally says 'use sonnet' or 'use haiku.' Never downgrade for cost — that's the user's decision, not yours. CRITICAL: Use only the exact model ID strings from the table above — they are complete as-is. Do not append date suffixes. … If any of the model strings above look unfamiliar to you, that's to be expected — that just means they were released after your training data cutoff.**"
3. **A rationale tied to the failure mode** ("released after your training data cutoff") that explicitly cues the model that its priors are stale.

This is the most directly transferable production pattern for OpenSIPs. Replace "model ID" with "module name" / "function signature" / "pseudo-variable" and the structure ports.

The `frontend-design` skill takes a complementary approach for visual hallucination: "Explicitly name the specific failure modes to avoid. Generic instructions ('make it look good') don't work. Specific anti-patterns do: Avoid these specific AI design traps: Generic gradients (especially purple-to-blue on white) …". Note that this is a *named* anti-pattern list — not bare prohibitions.

### 3.4 Strong directive vs. weak prose

Documented effects from Anthropic's own iteration guide:

- "If Claude fails to follow references to important files. Your links might need to be more explicit or prominent." ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices))
- "If Claude B forgot to filter test accounts when I asked for a regional report. The Skill mentions filtering, but maybe it's not prominent enough? … Claude A might suggest reorganizing to make rules more prominent, **using stronger language like 'MUST filter' instead of 'always filter'**, or restructuring the workflow section."

So Anthropic itself documents that escalating from "always" → "MUST" is sometimes the right answer when prose-level guidance is being skipped — but the iteration loop drives that choice (eval before/after), not author intuition. Skill-creator's general bias toward "explain-the-why" is the *first* draft; escalation to imperatives is reserved for cases where evals show the explained version still fails.

### 3.5 Version-specific behavior

The `claude-api` skill demonstrates the production pattern: a **single canonical source-of-truth file** the SKILL.md body forces Claude to consult, with explicit instructions not to construct identifiers from training data:

> "If the user requests an older model not in the table (e.g., 'opus 4.5', 'sonnet 3.7'), **read shared/models.md for the exact ID — do not construct one yourself**."

This is the same router-index idea operating at the version-identifier level: the body redirects to a reference file rather than relying on the model's parametric knowledge.

For the older-API/legacy-pattern case, Anthropic documents a `<details><summary>` collapse:

> "**Bad**: 'If you're doing this before August 2025, use the old API. After August 2025, use the new API.' **Good**: ## Current method … ## Old patterns `<details><summary>Legacy v1 API (deprecated 2025-08)</summary>` … `</details>`. The old patterns section provides historical context without cluttering the main content."

### 3.6 Decision trees and workflows

Decision-tree style structure is in active use in Anthropic's production skills. The `claude-api` skill body opens with: "What does your application need? 0. Are you deploying through Amazon Bedrock, Google Vertex AI, or Microsoft Foundry?" then walks through numbered branches. The `docx` skill opens with a routing table:
```
Task                  | Approach
Read/analyze content  | pandoc or unpack for raw XML
Create new document   | Use docx-js
Edit existing doc     | Unpack → edit XML → repack
```

The Conditional Workflow Pattern in Anthropic's best practices doc spells this out: "Guide Claude through decision points: 1. Determine the modification type: **Creating new content?** → Follow 'Creation workflow' below. **Editing existing content?** → Follow 'Editing workflow' below".

For multi-step procedures the Execution Checklist pattern is documented as a copyable list Claude pastes into its response: "Copy this checklist and check off items as you complete them: `- [ ] Step 1: Analyze the form (run analyze_form.py)`".

### 3.7 Recommendations for the OpenSIPs trio (Area 3)

1. **Adopt the `claude-api` model-ID guardrail wholesale, with OpenSIPs-specific framing.** Put a near-top section in `opensips-routing/SKILL.md` that reads roughly: "**CRITICAL: Use only OpenSIPs identifiers. OpenSIPs descended from the SIP Express Router (SER) lineage and shares ancestry with Kamailio (formerly OpenSER). The function names, module names, and pseudo-variable syntax differ between projects. Common confusions: Kamailio's `pv_*` family is not OpenSIPs syntax (OpenSIPs uses `$var(name)`, `$avp(name)`, `$pv(name)`); Kamailio's `tmx`, `dmq`, `kazoo` modules do not exist in OpenSIPs; OpenSIPs has `proto_*` modules where Kamailio uses `tcpops`/`websocket`. If you recognize an identifier from your training data but cannot find it in the `opensips-modules` reference, assume it is from a sibling project and ask the user, do not construct it.**" The "if it looks unfamiliar … that just means it was released after your training data cutoff" framing inverts cleanly to "if it looks familiar but isn't in the references, it's probably from a sibling project."
2. **Force the modules-reference detour.** In every spot where the routing skill would mention a function or parameter, instead direct Claude to load the relevant `references/<module>.md` from `opensips-modules`. This is the same pattern as `claude-api`'s "read shared/models.md for the exact ID — do not construct one yourself."
3. **Use the Bad/Good paired-example pattern** for cross-project leakage cases. For example: ` Bad (Kamailio): pv_get_authattr(...); Good (OpenSIPs): $authattr(...) — see references/pseudo-variables.md`. Bare "do not use Kamailio syntax" without showing the OpenSIPs equivalent is documented to backfire.
4. **Reserve all-caps imperatives** for the cross-project leakage rule (where it must not be missed) and for any shell command in `opensips-security-advisor` that runs validation. Everywhere else, use the explain-the-why pattern.
5. **For `opensips-security-advisor`,** structure the body as a Plan-Validate-Execute or Self-Correcting Loop: produce a JSON list of identified risks → validate that each cited config line actually exists in the user's config (script can grep) → only then output recommendations. This catches the failure mode where a security advisor cites a Kamailio-flavored vulnerability that doesn't apply.
6. **Use a routing table at the top of `opensips-routing/SKILL.md`** the way `docx` does. Likely rows: "Author new opensips.cfg → see references/cfg-skeleton.md", "Add module → consult opensips-modules skill", "Security review → consult opensips-security-advisor skill".

---

## Research Area 4 — SKILL.md body structure and length

### 4.1 The 500-line / 5,000-word rule: source and counter-evidence

**Source.** "Keep SKILL.md body under 500 lines for optimal performance. If your content exceeds this, split it into separate files using the progressive disclosure patterns described earlier" — Anthropic, *Skill authoring best practices*, the canonical source. Anthropic's Complete Guide says the same: "Keep SKILL.md under 5,000 words". The agentskills.io specification phrases it as <5,000 tokens recommended.

**Counter-examples in production.** Anthropic's own `pdf/SKILL.md` is 314 lines / ~7.88 KB ([raw](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md)) — well under the cap. The `docx`, `pptx`, `xlsx`, and `claude-api` SKILL.mds are likewise under the line cap (the heaviest content lives in their reference files). The fact that Anthropic's most complex production skills stay well under 500 lines is itself the most relevant counter-evidence: the rule is not a soft suggestion. "Generative Programmer" notes the practical inflection at ~300 lines: "Use this for any skill pushing past ~300 lines in SKILL.md. The trade-off is fragmentation: splitting content across files makes it harder for authors to hold the whole skill in their head, and Claude has to make correct routing decisions about which file to load next. Mis-routing costs turns".

**Why the cap matters mechanically.** Once SKILL.md is loaded it stays in context for the whole session ("Claude Code does not re-read the skill file on later turns") and is preserved through auto-compaction with each skill capped at 5,000 tokens post-compaction and a 25,000-token total budget across invoked skills ([Claude Code skills docs](https://code.claude.com/docs/en/skills); [dev.to/jeffreese](https://dev.to/jeffreese/how-rules-and-skills-actually-work-in-claude-code-25gp)). Going past the soft cap risks compaction drops.

### 4.2 Structure of production SKILL.md bodies

**`pdf` (Anthropic):**
```
# PDF Processing Guide
## Overview                  (1-paragraph "this guide covers…")
## Quick Start                (~5 lines of canonical Python)
## Python Libraries
  ### pypdf - Basic Operations
    #### Merge PDFs / Split / Extract Metadata / Rotate
  ### pdfplumber - Text and Table Extraction
  ### reportlab - Create PDFs
    #### Subscripts and Superscripts (with IMPORTANT gotcha)
## Command-Line Tools
  ### pdftotext / qpdf / pdftk
## Common Tasks
  ### Extract Text from Scanned PDFs / Watermark / Extract Images / Password
## Quick Reference            (a markdown table of task → tool → code)
## Next Steps                 (pointers to REFERENCE.md and FORMS.md)
```

**`docx` (Anthropic):**
```
(File: Routing table on first screen)
Task | Approach
Read/analyze content | pandoc or unpack for raw XML
Create new document | Use docx-js - see Creating New Documents below
Edit existing document | Unpack → edit XML → repack
Then sections for each path with code examples and named gotchas.
```

**`pptx` (Anthropic):** Opens with the same Task/Guide table, then has named subsections like "Visual Inspection Checklist" with explicit failure-mode lists.

**`skill-creator` (Anthropic):** Conversational/instructional in tone (because it teaches a process), but still has a clear hierarchy: Overview → High-level process → Per-step subsections → Special-case adaptations (Claude.ai vs. Claude Code).

The recurring shape is:
1. **Overview** (1–3 sentences pointing at the rest of the doc)
2. **Quick Start / Routing table** (decision matrix or canonical 5-line example)
3. **Per-domain or per-task sections** (the substance)
4. **Common Tasks** (recipes the user will actually ask for)
5. **Quick Reference table** (compact lookup, often the most-used part)
6. **Next Steps / Pointers to references** (where to go for more)

### 4.3 The canonical opening section

Anthropic's `pdf` skill opens with: "This guide covers essential PDF processing operations using Python libraries and command-line tools. **For advanced features, JavaScript libraries, and detailed examples, see REFERENCE.md. If you need to fill out a PDF form, read FORMS.md and follow its instructions.**". This is two sentences and it does three things: states scope, names the reference file, names a special-case file.

Decision-rule openings (used by `claude-api` and `docx`) work best when the workflow has clearly different paths. Pure "When to use" prose openings duplicate the description and tend to be redundant — none of Anthropic's production skills have a dedicated `## When to use` section in the body, because that information lives in the description.

### 4.4 Reference-file linking patterns

Anthropic's documented patterns:

- **Conditional pointer**: "**For tracked changes**: See [REDLINING.md](REDLINING.md). **For OOXML details**: See [OOXML.md](OOXML.md). Claude reads REDLINING.md or OOXML.md only when the user needs those features."
- **Domain split**: "**Finance**: Revenue, ARR, billing → See [reference/finance.md](reference/finance.md). **Sales**: Opportunities, pipeline, accounts → See [reference/sales.md](reference/sales.md)."
- **Inline mention with grep hint**: "Find specific metrics using grep: `grep -i 'revenue' reference/finance.md`."

Hard rules:
- "**Keep references one level deep from SKILL.md.** All reference files should link directly from SKILL.md to ensure Claude reads complete files when needed." Nested references cause Claude to use `head -100` previews and miss content.
- "For reference files longer than 100 lines, include a table of contents at the top."
- mgechev: "Just-in-Time (JiT) Loading: Explicitly instruct the agent when to read a file. It will not see these resources until you direct it to (e.g., 'See references/auth-flow.md for specific error codes')."

### 4.5 Scripts: execute vs. read-as-reference

Anthropic explicitly distinguishes: "**Execute the script** (most common): 'Run `analyze_form.py` to extract fields.' **Read it as reference** (for complex logic): 'See `analyze_form.py` for the field extraction algorithm.' For most utility scripts, execution is preferred because it's more reliable and efficient".

The `pdf` skill body uses execution-language consistently — "Run the `fill_fillable_fields.py` script from this file's directory". The `docx` skill is similar: "`python scripts/office/soffice.py --headless --convert-to docx document.doc`" — direct command invocations.

The "black box" rule is the strongest variant of execute-don't-read: "**DO NOT read scripts/analyze.py.** Treat it as a binary. Run with `--help` to see usage. Why: Reading a 500-line script wastes tokens and encourages the model to try 'fixing' the tool rather than using it" ([MMNTM Architect's Guide](https://www.mmntm.net/articles/claude-code-skills)). For deterministic helpers, this is the right default; the SKILL.md body should include a one-line usage example for each script and that's it.

### 4.6 Recommendations for the OpenSIPs trio (Area 4)

1. **Target ~250–400 lines per SKILL.md body**, well under the 500-line cap. Anthropic's own pdf is 314 lines and nobody is shipping anything larger as a body in the public repo.
2. **`opensips-routing/SKILL.md` body skeleton:**
   - `## Overview` (1 sentence + pointer to opensips-modules and opensips-security-advisor)
   - `## Cross-project guardrail` (the Kamailio/SER/OpenSER section; CRITICAL imperative + explanation)
   - `## Routing table` (Task → Approach: "Add module → consult opensips-modules"; "Author opensips.cfg from scratch → see references/cfg-skeleton.md"; "Security review → consult opensips-security-advisor")
   - `## Quick Start` (canonical minimal opensips.cfg with comments)
   - `## Core concepts` (route blocks, branch_route/failure_route, pseudo-variables)
   - `## Common Tasks` (recipes: registration, dial-by-DID, NAT traversal, accounting hookup)
   - `## Quick Reference` (compact table of the most-used statements)
   - `## Next Steps` (one-level-deep links to references and to sibling skills)
3. **`opensips-modules/SKILL.md` body skeleton (router-index):** very lean — workflow + selection.
   - `## Overview` ("This skill provides per-module reference data. SKILL.md is a router; the actual data lives in references/<module>.md.")
   - `## Cross-project guardrail` (same module-name confusion warning)
   - `## How to use` ("When the user names a module, read `references/<module>.md`. Do not infer function signatures from training data.")
   - `## Module index` (an actual table: module name → one-line purpose → reference file path). This is the most important screen of the skill — it is what tells Claude what's available without loading every per-module file.
   - `## When a module is not in the index` ("If a user mentions a module not in the index above, it may be a Kamailio module — confirm with the user before proceeding.")
4. **`opensips-security-advisor/SKILL.md` body skeleton (workflow):**
   - `## Overview`
   - `## Cross-project guardrail`
   - `## Workflow` as a copyable checklist (Plan-Validate-Execute):
     - `[ ]` Step 1: Identify config file and OpenSIPs version
     - `[ ]` Step 2: Generate findings JSON (via `scripts/audit.py` if present, else manual scan)
     - `[ ]` Step 3: Validate each finding cites a real line in the user's config
     - `[ ]` Step 4: Produce report
   - `## Risk catalog` (named anti-patterns with Bad/Good examples — INVITE flooding, registration hijacking, RTP exposure, ACL gaps)
5. **For all three, link references one level deep from SKILL.md.** Nested links demonstrably cause partial reads.
6. **Scripts are one-line invocations in the body.** If any of the three skills bundles helper scripts (e.g. a config grep tool for the security advisor), the body says `Run scripts/grep_unauth.py <path-to-cfg>` — not "see scripts/grep_unauth.py" and not the script's source.

---

## Cross-cutting recommendations summary

For the OpenSIPs three-skill set, in priority order:

1. **Write the descriptions before the bodies.** Description is what determines whether the skill ever runs; the documented Anthropic optimization workflow uses 20 eval queries (8–10 should-trigger + 8–10 should-not-trigger, "near-misses" that share keywords with sibling projects) and 5 iterations. For OpenSIPs, *every* should-not-trigger query should be a Kamailio or SER prompt that uses identifiers the model might confuse — that's the most diagnostic test set you can build.
2. **Ship the cross-project guardrail in three places**: in each description's exclusion clause (front-loaded under 250 chars), at the top of each SKILL.md body (with the "if it looks familiar but isn't in references, ask" rationale), and as named Bad/Good examples in the risk catalog / common tasks sections.
3. **Make `opensips-modules` a router-index, not a knowledge dump.** Its SKILL.md must stay short and act as a dispatch table to per-module reference files. The Anthropic `cloud-deploy` example and the `bigquery-skill` example in the best-practices docs are exactly this pattern.
4. **Use prose cross-references** between the three skills in their bodies (no formal mechanism exists). Each skill's first paragraph after the cross-project guardrail should state which sibling skills are authoritative for what, so Claude can chain-load them.
5. **Reserve ALL-CAPS for: cross-project leakage, security-critical commands, and validated machine-checked invariants.** Everywhere else, use the explain-the-why pattern. This is exactly how Anthropic's own `claude-api`, `pdf`, `xlsx`, and `pptx` skills do it.
6. **Build the eval set first** ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — "Create evaluations BEFORE writing extensive documentation"). For OpenSIPs, the most useful eval is the cross-project confusability test: feed Claude prompts that mix OpenSIPs and Kamailio terminology and confirm the correct skill triggers and the cross-project guardrail fires. Run these against Sonnet, Opus, and Haiku separately because the Anthropic best-practices guide flags model differences as the most common cause of unexpected behavior.

### Notes on uncertainty / disputed evidence

- **Pure activation rate numbers** (Scott Spence's 20% baseline, the dev.to "~50%" figure) come from small-N community tests on specific models and prompts; Anthropic has not published an official benchmark. Treat these as directionally correct rather than precise. The qualitative finding — that undertriggering is real and significant — is supported by Anthropic's own `skill-creator` text and by the existence of Anthropic's automated description-improvement script.
- **The negative-prompt research** (Gadlet, Hugging Face) was conducted on earlier models and may overstate the problem for current Claude. The reconciliation — paired Bad/Good examples work, bare "don't" prompts can drift — is consistent with how Anthropic's own production skills are written.
- **Truncation thresholds** (250 chars in CC 2.1.86, 1,536 chars combined per skill, ~16,000 chars aggregate) are surface-specific and have changed between releases. Build skills assuming the description will be aggressively truncated in some surfaces, and the tail of a long description may not survive.
