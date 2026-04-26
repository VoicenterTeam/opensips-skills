<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Markdown Reference Files for Claude Code Agent Skills: A Research Report Toward a Rendering Template Specification

This report consolidates evidence from production skill repositories (`anthropics/skills`), Anthropic's official authoring guidance, the OpenSIPS upstream documentation, and the broader LLM-friendly documentation community. Every recommendation is backed by either a concrete example from a shipped skill or a documented practice. It is organized around the ten research questions and concludes with a synthesis of concrete template recommendations.

---

## 1. Structure of Production Reference Files in `anthropics/skills`

The canonical pattern is that `SKILL.md` is a thin orchestrator and one or more `.md` files in (or alongside) `references/` carry the heavy detail. Across the four production document skills and the meta-skill `skill-creator`, the layouts are remarkably consistent.

**`pdf/`** — `SKILL.md` (314 lines / 7.88 KB), `reference.md` (612 lines / 16.3 KB), `forms.md`, plus `scripts/` and `LICENSE.txt`. Note that the references for the document skills sit at the top level of the skill folder, not in a `references/` subdirectory ([skills/pdf](https://github.com/anthropics/skills/tree/main/skills/pdf), [pdf/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md), [pdf/reference.md](https://github.com/anthropics/skills/blob/main/skills/pdf/reference.md)).

**`docx/`** — `SKILL.md`, `ooxml.md`, `docx-js.md`, plus `scripts/` ([docx/ooxml.md](https://github.com/anthropics/skills/blob/main/skills/docx/ooxml.md), [docx/docx-js.md](https://github.com/anthropics/skills/blob/main/skills/docx/docx-js.md)).

**`pptx/`** — `SKILL.md`, `editing.md`, `pptxgenjs.md`, plus `ooxml.md` and `scripts/` ([skills/pptx](https://github.com/anthropics/skills/tree/main/skills/pptx), [pptx/ooxml.md](https://github.com/anthropics/skills/blob/main/skills/pptx/ooxml.md)).

**`skill-creator/`** — `SKILL.md`, `agents/`, `references/schemas.md`, `references/workflows.md`, plus `eval-viewer/`, `assets/`, `scripts/` ([skills/skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator), [skill-creator/references/schemas.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/references/schemas.md), [skill-creator/references/workflows.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/references/workflows.md)).

### Headings actually used

The PDF reference (`reference.md`) demonstrates the canonical style:

```
# PDF Processing Advanced Reference

This document contains advanced PDF processing features, detailed examples,
and additional libraries not covered in the main skill instructions.

## pypdfium2 Library (Apache/BSD License)
### Overview
### Render PDF to Images
### Extract Text with pypdfium2

## JavaScript Libraries
### pdf-lib (MIT License)
#### Load and Manipulate Existing PDF
#### Create Complex PDFs from Scratch
#### Advanced Merge and Split Operations
### pdfjs-dist (Apache License)
#### Basic PDF Loading and Rendering
...

## Advanced Command-Line Operations
## Advanced Python Techniques
## Complex Workflows
## Performance Optimization Tips
## Troubleshooting Common Issues
## License Information
```
([pdf/reference.md](https://github.com/anthropics/skills/blob/main/skills/pdf/reference.md)).

The structural conventions that emerge across all four document skills:

1. **A single H1 at the top** that names the document — e.g., `# PDF Processing Advanced Reference`, `# PDF Processing Guide`, `# PowerPoint OOXML Reference`. There is exactly one H1 per file.
2. **An immediate "what this is" paragraph** under the H1 — typically one or two sentences stating scope and the relationship to `SKILL.md`. The PDF reference opens: *"This document contains advanced PDF processing features, detailed examples, and additional libraries not covered in the main skill instructions."* ([pdf/reference.md](https://github.com/anthropics/skills/blob/main/skills/pdf/reference.md)). The PPTX `ooxml.md` opens with an even more directive line: *"Important: Read this entire document before starting. Critical XML schema rules and formatting requirements are covered throughout"* ([pptx/ooxml.md](https://github.com/anthropics/skills/blob/main/skills/pptx/ooxml.md)).
3. **H2 sections grouped by capability or library**, not by sequential procedure (the procedural framing lives in `SKILL.md`).
4. **H3/H4 deepening** — H3 for a concrete operation ("Render PDF to Images"), H4 for variants ("Load and Manipulate Existing PDF" under "pdf-lib"). The hierarchy is strict (no skipping).
5. **A trailing summary section** — the PDF guide closes with `## Quick Reference` (a table) and `## Next Steps` (cross-references to the other reference file), and the advanced reference closes with `## License Information`.

### Tables actually used

Tables are reserved for **dense, repetitive, lookup-style content**. Two clear patterns appear:

- The **Quick Reference table** in `pdf/SKILL.md` maps task → tool → command/code:

```markdown
| Task | Best Tool | Command/Code |
| --- | --- | --- |
| Merge PDFs | pypdf | `writer.add_page(page)` |
| Extract text | pdfplumber | `page.extract_text()` |
| Fill PDF forms | pdf-lib or pypdf (see FORMS.md) | See FORMS.md |
```
([pdf/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md)).

- The **frontmatter-as-table** rendering of YAML metadata at the top of `pdf/SKILL.md`, with columns `name | description | license`.

Tables are not used for parameter documentation in production skills (see §6 below).

### Frontmatter on reference files

Across all five inspected skills, **only `SKILL.md` carries YAML frontmatter** — none of `reference.md`, `forms.md`, `ooxml.md`, `docx-js.md`, `pptxgenjs.md`, `editing.md`, `references/schemas.md`, or `references/workflows.md` has any frontmatter. The H1 + leading paragraph functions as the metadata equivalent. This is consistent with Anthropic's documentation, which only specifies frontmatter for `SKILL.md` ([Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).

---

## 2. How Claude Code Actually Reads Reference Files

Claude reads reference files **as ordinary files on the filesystem, via bash and the Read tool**. There is no special "skill loader." Anthropic's overview is explicit: *"When a Skill is triggered, Claude uses bash to read SKILL.md from the filesystem, bringing its instructions into the context window. If those instructions reference other files (like FORMS.md or a database schema), Claude reads those files too using additional bash commands"* ([Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)).

The same page enumerates the runtime behaviors:

- *"Metadata pre-loaded: At startup, the name and description from all Skills' YAML frontmatter are loaded into the system prompt"*
- *"Files read on-demand: Claude uses bash Read tools to access SKILL.md and other files from the filesystem when needed"*
- *"No context penalty for large files: Reference files, data, or documentation don't consume context tokens until actually read"*
- *"File paths matter: Claude navigates your skill directory like a filesystem. Use forward slashes (reference/guide.md), not backslashes"*
([Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)).

In practice this means Claude's tool inventory for reference files is `Read` (often via bash `cat` or via the dedicated Read tool) and occasionally `Grep` when looking for a specific symbol. The PPTX skill explicitly tells Claude not to limit reads: *"MANDATORY - READ ENTIRE FILE: Read ooxml.md (~500 lines) completely from start to finish. NEVER set any range limits when reading this file"* ([pptx/SKILL.md via SkillsMP mirror](https://skillsmp.com/skills/anthropics-skills-skills-pptx-skill-md)). This is a tell that, by default, Claude *will* sometimes range-limit Reads, and that authors use prose to override that behavior when full-file reading is required.

What confuses Claude (per Anthropic's troubleshooting list):

- **Missed connections** if the link from `SKILL.md` to a reference is implicit. Anthropic warns that authors should *"Watch for: …Missed connections: Does Claude fail to follow references to important files? Your links might need to be more explicit or prominent"* ([Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).
- **Unanchored navigation** in long reference files without a TOC — see §7.
- **Recursive reference chains**: *"Keep the reference graph shallow: every file one hop from SKILL.md. Nested chains like SKILL.md -> advanced.md -> details.md increase the odds Claude only partially reads the target and misses the rest"* ([Generative Programmer, *Skill Authoring Patterns*](https://generativeprogrammer.com/p/skill-authoring-patterns-from-anthropics)).

---

## 3. YAML Frontmatter Conventions on Reference Files

**Empirically: production reference files do not use frontmatter.** Frontmatter is exclusively on `SKILL.md` and contains only the documented Agent Skills fields:

- **Required**: `name` (max 64 chars, lowercase letters/numbers/hyphens, no XML tags) and `description` (max 1024 chars) ([Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).
- **Optional Claude Code extensions**: `allowed-tools`, `disable-model-invocation`, `user-invocable`, `model`, `context`, `agent`, `argument-hint` ([Claude Code skills docs](https://code.claude.com/docs/en/skills)).
- **Sometimes seen**: `license`, `version`, `dependencies`, `compatibility`. The PDF skill, for example, surfaces frontmatter as a table with `name | description | license` ([pdf/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md)). One deep-dive notes that *"The `when_to_use` field appears extensively in the codebase but is not documented in any official Anthropic documentation"* — a useful caution against inventing fields ([Lee Hanchung, *Claude Agent Skills Deep Dive*](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)).

**Implication for a renderer that emits reference files:** treat YAML frontmatter as a `SKILL.md`-only artifact. Reference files should rely on the H1 + lead paragraph pattern. If you need machine-readable metadata (e.g., source-of-truth pointer, generation timestamp, schema version) embed it as an HTML comment block right after the H1 — this is invisible in rendered Markdown, doesn't pollute the LLM's reading flow with non-instructional YAML, and remains greppable.

---

## 4. Heading Hierarchy for LLM-Consumed Docs

The "strict H1→H2→H3, no skipping" rule has both empirical and theoretical support, but the production evidence is more nuanced.

**What the evidence supports.** LLMs treat Markdown headings as topic boundaries during tokenization, and consistent hierarchy improves retrieval and reasoning ([Markdown for AI / MarkFlow](https://markdowntoword.pro/blog/markdown-for-ai-and-llms); [Webex Developers Blog, *LLM-Friendly Content*](https://developer.webex.com/blog/boosting-ai-performance-the-power-of-llm-friendly-content-in-markdown)). Mintlify's documentation guidance is concrete: *"The hierarchy of the headings should reflect the structure of the content, showing the relationship between main topics and subtopics… Long blocks of text can make it harder for AI models to accurately interpret content. Break text down into small chunks that clearly convey individual concepts"* ([Mintlify, *Structure documentation for AI and human readers*](https://www.mintlify.com/blog/structure-documentation-AI-human-readers)). The MarkFlow guidance is even more direct: *"Use headers progressively and consistently. Don't skip from H1 to H3. This helps models maintain context hierarchy. I enforce this with linters like markdownlint in our CI/CD pipeline"* ([MarkFlow, *Markdown for AI*](https://markdowntoword.pro/blog/markdown-for-ai-and-llms)).

**What production skills actually do.** The PDF advanced reference uses H1 → H2 → H3 → H4, and each level transitions logically (`## pypdfium2 Library` → `### Render PDF to Images`; `## JavaScript Libraries` → `### pdf-lib (MIT License)` → `#### Load and Manipulate Existing PDF`). The hierarchy is never skipped. The OpenSIPS documentation, which the rendering tool aims to mirror, has a similar structure (Chapter → numbered section → sub-section), e.g. `1. Admin Guide` → `1.3. Exported Parameters` → `1.3.1. fr_timeout (integer)` ([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html)).

**What is not actually evidence-backed.** There is no public Anthropic statement quantifying parser performance against skipped headings. The strongest backing is: (a) heuristic guidance from Mintlify and similar AI-doc platforms; (b) the consistent practice across all production skills; and (c) the well-established benefit of structural cues for LLM tokenization. Treat "no-skip H1→H2→H3" as a strong convention, not a measured law.

**Patterns that work for repetitive structured content (e.g., parameter lists).** OpenSIPS uses H3 sections per parameter, with a typed signature in the heading itself: *"### 1.3.1. `fr_timeout` (integer)"* ([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html)). This is exactly the right shape for LLM consumption: each parameter becomes a discrete, addressable, greppable unit, and the heading carries its name and type so a single Grep `^### ` produces a usable index.

---

## 5. Code Block Conventions

### What production skills actually do

The PDF advanced reference is striking for using **untagged code fences** — almost all of its code blocks are plain ` ``` ` with no language hint, even for clearly Python or JavaScript content ([pdf/reference.md](https://github.com/anthropics/skills/blob/main/skills/pdf/reference.md)). The PDF SKILL.md likewise uses untagged blocks for both Python and bash. By contrast, third-party guidance recommends tagging: *"Adding syntax highlighting is really easy, the only thing you have to do is add the programming-language after the first three back-ticks"* ([Elischei, *Syntax highlighting in markdown code blocks*](https://elischei.com/syntax-highlighting-in-markdown-code-blocks/)).

The interpretation: Claude does not require language tags to understand code (it can identify Python, bash, JS from content), but **language tags are additive value** — they help human reviewers, and they help LLMs disambiguate edge cases. The production skills omit them probably for legacy/style reasons rather than because they're harmful.

### Conventions for OpenSIPS configuration snippets

OpenSIPS upstream documentation uses unlabeled code blocks (it's DocBook `<programlisting>` rendered to HTML `<pre>`), with comments shown as `# comment` and the convention of using `...` to indicate elided context:

```
...
modparam("tm", "fr_timeout", 10)
...
```
([tm Module example 1.1](https://opensips.org/html/docs/modules/3.6.x/tm.html)).

For Markdown rendering targeted at Claude *and* recognizable to OpenSIPS engineers, the recommended language tags are:

- **`opensips`** — There is a real grammar (the `voxtelesys/opensips-syntax` VS Code extension implements it [voxtelesys/opensips-syntax](https://github.com/voxtelesys/opensips-syntax)), but no widely-installed Markdown renderer recognizes the tag. It is, however, harmless to LLMs and meaningful to human readers.
- **`c`** — OpenSIPS configuration syntax is C-derived (preprocessor `#include`, braces, semicolons, `if/else`); GitHub's renderer will produce mostly-correct highlighting under `c`.
- **`bash`** — for shell invocations like `opensips -C` or `opensips-cli`.
- **untagged** — matches the upstream OpenSIPS docs and is what the production skills do.

A pragmatic recommendation: emit ` ```opensips ` for `opensips.cfg` fragments. It signals intent to humans, doesn't break anything for Claude, and is forward-compatible if an `opensips` highlighter ships in popular renderers.

### Captions and inline comments

The OpenSIPS docs caption every code block with a numbered Example label preceding the block: *"Example 1.1. Set `fr_timeout` parameter"* ([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html)). In Markdown this maps cleanly to a bold caption line, e.g. `**Example 1.1.** Set the \`fr_timeout\` parameter` followed by the fence. The `skill-creator` SKILL.md uses inline shell-fenced examples without captions but with a sentence introducing the example ([skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)). For technical reference docs, the OpenSIPS-style captioning is the better pattern — it gives Claude an unambiguous handle to reference and matches engineer expectation.

---

## 6. Tables vs. Lists for Parameter Documentation

The empirical evidence from production skills points clearly toward **headed sections with definition-style prose, not tables**, for parameter documentation. The OpenSIPS upstream docs use the same pattern.

**Production skills.** No production skill in `anthropics/skills` documents parameters as a Markdown table. `pdf/SKILL.md` uses tables only for the trailing "Quick Reference" lookup ([pdf/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md)). `skill-creator/references/schemas.md` documents JSON fields with prose plus a fenced JSON example, not tables ([schemas.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/references/schemas.md)).

**OpenSIPS upstream pattern.** Each parameter gets its own H3, with prose describing meaning, default value as italicized text, and a fenced example:

```
### 1.3.1. `fr_timeout` (integer)

Timeout which is triggered if no final reply for a request or ACK for a
negative INVITE reply arrives (in seconds).

*Default value is 30 seconds.*

**Example 1.1. Set `fr_timeout` parameter**

modparam("tm", "fr_timeout", 10)
```
([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html)).

**Why this beats a table for LLM consumption.** Improving Agents' empirical study on table formats found that tables of structured records degrade LLM accuracy past a few rows, and that "Markdown-KV" (key: value pairs) outperforms Markdown tables for structured records: *"Markdown-KV came out top, hitting 60.7% accuracy and landing roughly 16 points ahead of CSV"* ([Improving Agents, *Which Table Format Do LLMs Understand Best?*](https://www.improvingagents.com/blog/best-input-data-format-for-llms/)). MarkFlow puts the practical limit at *"5–10 rows maximum to avoid overwhelming the model's context window"* ([MarkFlow](https://markdowntoword.pro/blog/markdown-for-ai-and-llms)).

**Implication.** A renderer producing OpenSIPS module reference docs should emit one H3 per parameter or function, with the parameter name and type in the heading, followed by prose, default value, and an example. Tables should be reserved for terse summary indexes (e.g., a top-of-file "Parameters at a glance" with name + type + one-line description) — not for the canonical definition.

---

## 7. Length and Chunking for Reference Files

Anthropic's documented thresholds:

- **`SKILL.md` body**: *"Keep SKILL.md body under 500 lines for optimal performance. If your content exceeds this, split it into separate files using the progressive disclosure patterns described earlier"* ([Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)).
- **Reference files with TOC at top**: Anthropic's official guidance is *"For reference files longer than 100 lines, include a table of contents at the top"* ([best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)). The `skill-creator` SKILL.md uses the looser threshold *"For large reference files (>300 lines), include a table of contents"* ([skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)). Take the stricter 100-line bar from the platform docs.
- **Practical maximum**: There is no documented hard cap on reference files. The PDF advanced reference is 612 lines / 16.3 KB ([pdf/reference.md](https://github.com/anthropics/skills/blob/main/skills/pdf/reference.md)) and is in active production use. Anthropic explicitly notes *"No context penalty for large files: Reference files, data, or documentation don't consume context tokens until actually read"* ([Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)).

The implicit ceiling is set by what fits comfortably in Claude's working context once loaded, weighed against everything else (conversation, tool outputs, other files). Skills Directory's tertiary guidance is *"Keep individual reference files under 200 lines"* ([Skills Directory, *Skill File Structure*](https://www.skillsdirectory.com/docs/skill-file-structure)) — but this is contradicted by production examples.

**Practical guidance for OpenSIPS module references:**

- Aim for 200–500 lines per module reference under normal conditions.
- Always include a TOC if the file exceeds 100 lines (Anthropic threshold), and especially if it exceeds 300 lines.
- For very large modules (e.g., `tm` upstream has ~24 functions, ~24 parameters, ~18 pseudo-variables, 4 MI commands, 18 statistics — easily 800+ lines), consider splitting into `tm/parameters.md`, `tm/functions.md`, `tm/variables.md` with a thin `tm/index.md` containing the TOC and orientation. Anthropic's domain-organization example shows this pattern: `cloud-deploy/references/{aws,gcp,azure}.md` ([skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)).

---

## 8. Cross-References Between Reference Files

The production pattern is **explicit, prose-embedded, file-name-based pointers**, not bare Markdown links.

From `pdf/SKILL.md`: *"For advanced features, JavaScript libraries, and detailed examples, see REFERENCE.md. If you need to fill out a PDF form, read FORMS.md and follow its instructions"* ([pdf/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md)).

From `pptx/SKILL.md`: *"MANDATORY - READ ENTIRE FILE: Read ooxml.md (~500 lines) completely from start to finish. NEVER set any range limits when reading this file. Read the full file content for detailed guidance on OOXML structure and editing workflows before any presentation editing"* ([pptx/SKILL.md mirror](https://skillsmp.com/skills/anthropics-skills-skills-pptx-skill-md)).

From `skill-creator/SKILL.md`: *"See `references/schemas.md` for the full schema (including the `assertions` field, which you'll add later)"*; *"If generating benchmark.json manually, see `references/schemas.md` for the exact schema the viewer expects"*; *"See agents/analyzer.md (the 'Analyzing Benchmark Results' section) for what to look for"* ([skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)).

The conventions:

1. **Use the bare filename or the relative path**, not a Markdown link. `references/schemas.md` and `REFERENCE.md` both appear unlinked. The reasoning: Claude reads files via bash with the path; the path-as-string is more directly actionable than `[link](...)` syntax. Markdown link syntax is not harmful (and GitHub Copilot's skills documentation does recommend `[test template](./test-template.js)` style [VS Code agent skills docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills)), but the Anthropic production style is bare paths.
2. **Always include intent**, not just a pointer. Compare *"see REFERENCE.md"* (weak) with *"For advanced features, JavaScript libraries, and detailed examples, see REFERENCE.md"* (strong — Claude knows when this file is relevant).
3. **Pin section anchors with prose**, not anchor links. The skill-creator says *"See agents/analyzer.md (the 'Analyzing Benchmark Results' section)"* — the section name is in prose, not as `analyzer.md#analyzing-benchmark-results`. This works because Claude can Grep for the heading when it gets there.
4. **Imperative verbs are stronger than passive ones**. *"Read forms.md and follow its instructions"* outperforms *"More details are in forms.md"* for triggering Claude's reading behavior. This is consistent with skill-creator's own editorial guidance: *"Prefer using the imperative form in instructions"* ([skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)).

**Does Claude follow Markdown links automatically?** No. Claude follows file paths it sees in the prose by issuing Read/bash calls. There is no automatic link-following; the prose triggers the read. MindStudio captures this precisely: *"The critical point is that files don't automatically get loaded. Your skill.md process steps need to explicitly instruct Claude to read specific reference files. This is not a limitation — it's a feature"* ([MindStudio, *Claude Code Skills Architecture*](https://www.mindstudio.ai/blog/claude-code-skills-architecture-skill-md-reference-files)).

**Implication for cross-references between two reference files (B → C, neither is `SKILL.md`):** use the same prose+path pattern. e.g., in `tm/functions.md`: *"For the `tm_replication_cluster` parameter referenced here, see `tm/parameters.md` section `tm_replication_cluster`."*

---

## 9. The "When to Read This File" Pattern

Production reference files **do not** typically use a frontmatter `description` to gate activation (that is `SKILL.md`'s job). Instead, they use **a leading paragraph or "Important" callout** under the H1. Examples:

- `pdf/reference.md` — opens with *"This document contains advanced PDF processing features, detailed examples, and additional libraries not covered in the main skill instructions"* ([pdf/reference.md](https://github.com/anthropics/skills/blob/main/skills/pdf/reference.md)).
- `pptx/ooxml.md` — opens with a directive: *"Important: Read this entire document before starting. Critical XML schema rules and formatting requirements are covered throughout. Incorrect implementation can create invalid PPTX files that PowerPoint cannot open"* ([pptx/ooxml.md](https://github.com/anthropics/skills/blob/main/skills/pptx/ooxml.md)).
- `pdf/forms.md` — opens with the conditional invocation: *"If you need to fill out a PDF form, first check to see if the PDF has fillable form fields. Run this script from this file's directory: python scripts/check_fillable_fields <file.pdf>, and depending on the result go to either the 'Fillable fields' or 'Non-fillable fields' and follow those instructions"* ([pdf/forms.md](https://github.com/anthropics/skills/blob/main/skills/pdf/forms.md)).
- `skill-creator/references/schemas.md` — opens with *"This document defines the JSON schemas used by skill-creator"* ([schemas.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/references/schemas.md)).

The pattern: **one or two sentences, immediately under the H1, that state (a) what's inside, and (b) the trigger condition for reading**. This functions as a per-file analogue of the `SKILL.md` description but is plain prose rather than YAML.

A community summary of the production pattern: *"Long reference files, especially those over a few hundred lines, get a table of contents at the top so Claude can see the full scope even from a truncated read"* ([Generative Programmer](https://generativeprogrammer.com/p/skill-authoring-patterns-from-anthropics)). Combined with a "When to read this" lead paragraph, this gives Claude both routing (when to open it) and orientation (what's where) on a single screen of text.

---

## 10. OpenSIPS Documentation Conventions

The upstream OpenSIPS module docs are generated from DocBook XML and have a stable, decades-old structure. A canonical module page (e.g., `tm`, `options`, `domain`, `topology_hiding`, `presence`, `sqlops`, `prometheus`, `statistics`, `registrar`) follows this exact ordering ([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html), [options Module](https://opensips.org/html/docs/modules/devel/options.html), [domain Module](https://www.opensips.org/docs/modules/3.4.x/domain.html), [topology_hiding Module](https://opensips.org/docs/modules/2.4.x/topology_hiding.html)):

```
Chapter 1. Admin Guide
  1.1. Overview
    1.1.1, 1.1.2, … sub-overviews when needed (e.g., "Per-Branch flags", "DNS Failover")
  1.2. Dependencies
    1.2.1. OpenSIPS Modules
    1.2.2. External Libraries or Applications
  1.3. Exported Parameters
    1.3.1. `param_name` (type)
    1.3.2. …
  1.4. Exported Functions
    1.4.1. `func_name(args)`
    1.4.2. …
  1.5. Exported Pseudo-Variables       (only when applicable)
  1.6. Exported MI Functions           (only when applicable)
  1.7. Exported Statistics             (only when applicable)
  1.8. Known Limitations               (occasional)
Chapter 2. Developer Guide             (only when applicable)
  2.1. Available Functions / API
Chapter 3. Frequently Asked Questions  (occasional)
Chapter 4. Contributors
  4.1. By Commit Statistics
  4.2. By Commit Activity
Chapter 5. Documentation
  5.1. Contributors
```

Plus list-of-tables and list-of-examples cross-reference appendices auto-generated by DocBook ([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html)).

**Per-parameter and per-function structure** is also stable. Each parameter renders as a heading containing the name and parenthesized type, followed by description prose, an italicized default-value line, and at least one bold-labeled example with a fenced snippet. From the live `tm` docs:

```
### 1.3.1. `fr_timeout` (integer)

Timeout which is triggered if no final reply for a request or ACK for a
negative INVITE reply arrives (in seconds).

*Default value is 30 seconds.*

**Example 1.1. Set `fr_timeout` parameter**

modparam("tm", "fr_timeout", 10)
```
([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html)).

**Per-function structure** is similar but adds a parameter list and route-context list:

```
### 1.4.1. `t_relay([flags],[outbound_proxy])`

[Description prose]

The function may take two optional parameters.

The first parameter is a comma separated list of string flags for
controlling the internal behaviour. The supported flags are:
* *no-auto-477* - …
* *no-dns-failover* - …
…

In case of error, the function returns the following codes:
* *-1* - generic internal error
* *-2* - bad message (parsing errors)
…

This function can be used from REQUEST_ROUTE, FAILURE_ROUTE.

**Example 1.25. `t_relay` usage**
```
([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html)).

**Implications for the rendering tool.** A Markdown reference file generated from JSON sources for an OpenSIPS module will feel native to OpenSIPS engineers if it preserves:

1. The **section ordering** Overview → Dependencies → Exported Parameters → Exported Functions → Exported Pseudo-Variables → Exported MI Functions → Exported Statistics. (Drop the Contributors/Documentation chapters — those are upstream contributor metadata, not relevant to the skill.)
2. The **`name (type)`** signature in the heading itself — `### \`fr_timeout\` (integer)` — and the function-with-args form `### \`t_relay([flags],[outbound_proxy])\``.
3. **Italicized "Default value is X"** lines.
4. **Numbered, bold-captioned examples**: `**Example 1.1.** Set the \`fr_timeout\` parameter`, with the fenced block immediately below.
5. **The route-context line for functions**: *"This function can be used from REQUEST_ROUTE, FAILURE_ROUTE."*
6. **Bulleted parameter sub-lists** where a function takes a flag set or returns coded values (see `t_relay` flags/codes above).

The Dependencies section in particular is two distinct H3s under H2, even when one is empty — the empty one renders as `* None.` This convention should be preserved because OpenSIPS engineers know to scan for it.

---

## Synthesis: Recommendations for a Rendering Template Specification

The following recommendations are each supported by the evidence above and are intended to be directly actionable by a JSON-to-Markdown renderer.

### File-level template

```markdown
# {Module Name} Module Reference

{One- or two-sentence "When to read this file" paragraph, ending with a
trigger condition. e.g.: "Consult this reference whenever modifying SIP
transaction handling, configuring failover timeouts, or working with the
tm module's exported pseudo-variables."}

## Contents
- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)

## Overview
…
```

The TOC is mandatory whenever the rendered file exceeds 100 lines (Anthropic threshold per [best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)). The leading paragraph fulfills the "When to read this" pattern from §9.

### Frontmatter

**Do not emit YAML frontmatter on reference files.** This matches all five inspected production skills. If machine-readable provenance is required (source JSON path, generation timestamp, schema version), embed it as an HTML comment block immediately after the H1:

```markdown
# tm Module Reference
<!-- generated-from: opensips-modules/tm.json
     generator-version: 1.0.0
     opensips-version: 3.6.x
     generated-at: 2026-04-25T00:00:00Z -->

This reference covers …
```

### Per-parameter rendering

```markdown
### `fr_timeout` (integer)

{description prose, free-form, may span paragraphs}

*Default value is {default}.*

**Example.** Set the `fr_timeout` parameter.

```opensips
...
modparam("tm", "fr_timeout", 10)
...
```
```

Code fence language tag: `opensips` (per §5; falls back to plain rendering, signals intent to humans, recognized by `voxtelesys/opensips-syntax` [voxtelesys/opensips-syntax](https://github.com/voxtelesys/opensips-syntax)). The `...` lines around the example match upstream OpenSIPS convention. The italicized default-value line and the bold "Example" caption match upstream and are easy for Claude to Grep.

### Per-function rendering

```markdown
### `t_relay([flags], [outbound_proxy])`

{description prose}

**Parameters:**
- `flags` *(string, optional)* — {description}
- `outbound_proxy` *(string, optional)* — {description}

**Return codes:**
- `-1` — generic internal error
- `-2` — bad message (parsing errors)

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** `t_relay` usage.

```opensips
...
if (!t_relay()) {
    sl_reply_error();
    exit;
}
...
```
```

Bulleted parameter lists (not tables) match production skill conventions and the Improving Agents finding that *"Markdown-KV came out top, hitting 60.7% accuracy and landing roughly 16 points ahead of CSV"* for structured records ([Improving Agents](https://www.improvingagents.com/blog/best-input-data-format-for-llms/)).

### Cross-references

Use prose containing the bare relative path, in imperative form:

> *"For the `tm_replication_cluster` parameter, see `tm/parameters.md` and search for the `tm_replication_cluster` heading."*

Avoid Markdown anchor links across files (`tm/parameters.md#tm_replication_cluster`); they are not harmful but production skills consistently use prose+filename, which is more robust to renaming and clearer to Claude ([pdf/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md), [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)).

### Heading hierarchy

Strict H1 → H2 → H3 → H4, no skipping. The H1 names the file. H2s are the OpenSIPS-canonical sections (Overview, Dependencies, Exported Parameters, etc.). H3s are individual parameters/functions/variables/etc. H4 only when an individual function has subcomponents elaborate enough to warrant it (rare). This matches both the upstream OpenSIPS DocBook structure ([tm Module](https://opensips.org/html/docs/modules/3.6.x/tm.html)) and Mintlify's AI-doc guidance ([Mintlify, *Structure documentation for AI*](https://www.mintlify.com/blog/structure-documentation-AI-human-readers)).

### Length thresholds

| Threshold | Action |
|---|---|
| > 100 lines | Add Contents TOC under the lead paragraph (Anthropic platform docs) |
| > 300 lines | TOC is mandatory; consider whether a sub-split would help (skill-creator threshold) |
| > 500 lines | Strongly consider splitting by section (e.g., `module/parameters.md`, `module/functions.md`); precedent: pdf/reference.md is 612 lines and is at the high end of comfortable |
| > 800–1000 lines | Split |

Sources: [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices); [skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md); [pdf/reference.md](https://github.com/anthropics/skills/blob/main/skills/pdf/reference.md).

### What to avoid

- Tables for parameter or function definitions (use H3 + prose + bulleted sub-lists).
- All-caps imperatives like `MUST` / `NEVER` / `ALWAYS` as a default style — Anthropic's skill-creator *"explicitly flags all-caps MUST/ALWAYS/NEVER as a yellow flag to reframe"* ([Generative Programmer](https://generativeprogrammer.com/p/skill-authoring-patterns-from-anthropics)). Reserve them for genuine constraints (the PPTX `ooxml.md` uses them sparingly and only for truly destructive rules).
- Frontmatter on reference files (no production skill does this).
- Markdown anchor links across files (production skills use prose+filename).
- Recursive reference chains (`A → B → C`); keep references one hop from the entry point ([Generative Programmer](https://generativeprogrammer.com/p/skill-authoring-patterns-from-anthropics)).
- Untagged code blocks for OpenSIPS configuration when an `opensips` tag is harmless — tagging adds value for human reviewers without cost.

### Optional but high-value additions

- A trailing **"Quick Reference" table** for terse lookup of all parameters by name + type + one-line description, mirroring `pdf/SKILL.md`'s pattern ([pdf/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md)). Limit to ~20 rows per Improving Agents/MarkFlow guidance.
- A trailing **"See also" section** with prose pointers to sibling reference files (other modules commonly used together), modeled on `pdf/SKILL.md`'s "Next Steps" ([pdf/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md)).

---

## Caveats and Open Questions

- The 100-vs-300-line TOC threshold is inconsistent between the official Anthropic best-practices doc (100) and the production skill-creator (300). The official doc is the safer authority.
- There is no published Anthropic measurement quantifying the impact of skipped heading levels on Claude's parsing. The "no-skip" rule is best practice and consistent practice, not a measured constant.
- Markdown table performance for LLMs comes from a single GPT-4.1 nano study ([Improving Agents](https://www.improvingagents.com/blog/best-input-data-format-for-llms/)); Claude-specific results may differ. The qualitative finding (tables degrade at scale; key:value lists win) is consistent across multiple sources but the magnitudes are model-specific.
- The `voxtelesys/opensips-syntax` highlighter exists but is not in mainstream Markdown renderers ([voxtelesys/opensips-syntax](https://github.com/voxtelesys/opensips-syntax)); the `opensips` language tag is therefore a forward bet rather than a current renderer feature. It is, however, harmless to fall back to plain text rendering and is meaningful documentation for human readers.
- Anthropic's `anthropics/skills` repository moved its document skills between `skills/{pdf,docx,...}/` and `document-skills/{pdf,docx,...}/` paths during the period of this research; both paths surface in search results, but the `skills/` path is the current canonical location ([repository tree](https://github.com/anthropics/skills/tree/main)).