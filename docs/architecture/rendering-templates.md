# Rendering Templates Specification

> **Purpose:** Defines the exact Markdown structure the build pipeline produces from JSON source. Companion to `data-pipeline.md`. Specifies file layouts, heading hierarchies, frontmatter usage, code block conventions, and per-element rendering rules for every document type the pipeline handles.
>
> **Audience:** Developers implementing or modifying the rendering modules (`scripts/render-module.ts`, `scripts/render-core.ts`, `scripts/build-consolidated.ts`). Assumes familiarity with the data pipeline spec and ADR-002.
>
> **Status:** Authoritative specification. Changes require an ADR. Implementation details (function signatures, helper utilities) live in code with JSDoc per ADR-004.

---

## 1. Design principles

These principles drive every concrete rule below. When the rules conflict, fall back to the principles.

**The output exists to be read by Claude.** Every formatting choice is justified by how Claude actually consumes Markdown. Decorative formatting that looks nice in a browser but offers nothing to an LLM is excluded. This is why we omit emojis, avoid horizontal rules, and prefer prose over visual flourishes.

**The output also has to be read by humans.** OpenSIPs engineers will review generated files in PRs, search them for specific identifiers, and occasionally read them as documentation in their own right. Anything that's actively hostile to human reading (one-line files, no whitespace, unnatural ordering) is excluded even if Claude could parse it.

**Conform to OpenSIPs upstream conventions where they exist.** The official OpenSIPs documentation has a 20-year-old, stable structure: Overview → Dependencies → Exported Parameters → Exported Functions → Exported Pseudo-Variables → Exported MI Functions → Exported Statistics. Engineers know this structure. Generated files use it.

**Conform to Claude Code skill conventions where they exist.** The `anthropics/skills` repository is the production reference. Patterns observed across `pdf`, `docx`, `pptx`, and `skill-creator` are treated as defaults; deviations require justification.

**Empty sections are omitted, never emitted as headings without content.** An empty `## Exported Events` heading is a negative signal — it tells Claude (and humans) "this category exists but has nothing in it" when the truth might be "this category doesn't apply to this module." Better to omit and let the reader infer absence than to assert emptiness.

**No timestamps in output.** Timestamps are the single most common source of build non-determinism. The pipeline produces stable output; timestamps in content would break that property without informing the reader of anything useful.

**Strict heading hierarchy.** H1 → H2 → H3 → H4 with no skipping. One H1 per file, named after the artifact. H2s are the canonical OpenSIPs section names. H3s are individual items (parameters, functions, variables). H4 is reserved for sub-elements within an item, used sparingly.

---

## 2. File-level structure

Every generated reference file follows the same skeleton:

```markdown
# {Title}
<!-- generated-from: {source-relative-path}
     generator-version: {build-script-version}
     opensips-version: {version}
     doc-type: {document-type} -->

{One-paragraph "When to read this file" lead. Imperative, scoped, ends with a
trigger condition that helps Claude decide whether to open the file.}

## Contents
- [Section name](#section-anchor)
- ...

## Overview
...

## {Other H2 sections in canonical order}
...
```

### 2.1 The H1

One H1 per file. Names the artifact, not the document type. Examples:

- `# tm Module Reference`
- `# Core Pseudo-Variables`
- `# Operators`
- `# Route Block Types`

The H1 is plain text. No backticks around the module name (the H1 is a title, not a code identifier). No version in the H1 — version lives in the HTML comment block and the lead paragraph.

### 2.2 The HTML comment block

Provenance metadata lives in an HTML comment immediately after the H1, before any prose. This is invisible in rendered Markdown, doesn't pollute the LLM's reading flow, and remains greppable for tooling.

```markdown
<!-- generated-from: source/3.6/modules/tm.json
     generator-version: 1.0.0
     opensips-version: 3.6
     doc-type: module -->
```

Required fields:
- `generated-from`: Path relative to the repository root identifying the source JSON file.
- `generator-version`: Semver version of the build script that produced this file.
- `opensips-version`: The OpenSIPs version this reference covers.
- `doc-type`: One of `module`, `core_variable`, `core_function`, `core_parameter`, `operator`, `statement`, `route_type`, `flag`, `transformation`, `async_statement`, `mi_command`, `event`, `statistic`.

The HTML comment is **not** YAML frontmatter. Reference files do not use YAML frontmatter — that is reserved for SKILL.md per Claude Code skill conventions. Production skills in `anthropics/skills` confirm this pattern.

### 2.3 The lead paragraph

One or two sentences immediately under the comment block. States what the file contains and when Claude should read it. Imperative voice.

Examples:

> Consult this reference whenever modifying SIP transaction handling, configuring failover timeouts, or working with the tm module's exported pseudo-variables. The tm module provides stateful processing for SIP transactions in OpenSIPs 3.6.

> Reference for OpenSIPs core pseudo-variables in version 3.6. Read this file when constructing route scripts that need to inspect or manipulate SIP message fields, transaction state, or runtime context.

The lead paragraph is mandatory. It functions as the per-file analogue of the SKILL.md description and is what Claude reads first to decide whether the rest of the file is relevant.

### 2.4 The Contents table of contents

Mandatory for files exceeding 100 lines after rendering. Strongly recommended below 100 lines for any file with more than three H2 sections.

```markdown
## Contents
- [Overview](#overview)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
```

The TOC contains only H2 anchors, never H3 or deeper. A file with 30 parameters does not list all 30 in the TOC — that's what the section itself provides via H3 headings. The TOC is for navigation between major sections, not for indexing every item.

The TOC is built from the actual sections present in the file. A module with no exported events does not get an `[Exported Events](#exported-events)` line in its TOC.

---

## 3. Per-document-type templates

This section specifies the H2 ordering and per-element rendering for each document type.

### 3.1 Modules (per-item rendering)

A `ModuleDocument` from `source/{version}/modules/{slug}.json` renders to one Markdown file at `plugins/opensips/skills/opensips-modules/references/{version}/modules/{slug}.md`.

Section order:

1. `## Overview`
2. `## How It Works` (only if `how_it_works` is non-empty)
3. `## Dependencies`
4. `## Exported Parameters`
5. `## Exported Functions`
6. `## Exported Pseudo-Variables`
7. `## Exported MI Functions`
8. `## Exported Statistics`
9. `## Exported Events`
10. `## Configuration Examples`

Sections 4–10 are omitted entirely if their corresponding source field is empty or missing. Sections 1 and 3 are always present. Section 2 is conditional on the source field's presence.

#### 3.1.1 Overview

The `overview` field rendered as prose. May span multiple paragraphs. No sub-headings — if the source has internal structure, render it as paragraphs separated by blank lines.

#### 3.1.2 How It Works

Only present when `how_it_works` is non-empty in the source. Rendered as prose, may span multiple paragraphs.

#### 3.1.3 Dependencies

Always present, even when both subsections are empty. The two subsections preserve the OpenSIPs upstream pattern where engineers expect to find both, even if one is empty.

```markdown
## Dependencies

### OpenSIPs Modules

- `tm` — required for stateful transaction processing
- `signaling` — required for SIP message creation

### External Libraries

None.
```

When a list is empty, render `None.` (capitalized, period). When a list has items, render as a bulleted list with `name` in backticks, em dash, and one-line reason. The `optional` flag on a dependency renders as ` (optional)` after the reason.

If `dependencies_optional` exists separately in the source, render it as a third subsection `### Optional Modules`.

#### 3.1.4 Exported Parameters

Each parameter renders as an H3 with the name and type in the heading, followed by description, default value, and at least one example.

```markdown
## Exported Parameters

### `fr_timeout` (integer)

Timeout which is triggered if no final reply for a request or ACK for a
negative INVITE reply arrives, in seconds. After this period, the transaction
is considered failed and any registered failure_route is invoked.

*Default value is 30 seconds.*

**Example.** Set the `fr_timeout` parameter to 10 seconds.

```opensips
modparam("tm", "fr_timeout", 10)
```
```

Rendering rules:

- **H3 heading**: backtick-wrapped name, parenthesized type. Format: `### \`{name}\` ({type})`.
- **Description**: prose from the source `description` field. May span multiple paragraphs.
- **Default value line**: italicized, single line. Format: `*Default value is {value}.*` Omitted entirely if the source has no default.
- **Possible values**: when `possible_values` is non-empty, render after the default as a bulleted list with `**Possible values:**` label.
- **Range constraints**: when `valid_range_min` or `valid_range_max` are set, render as `*Valid range: {min} to {max}.*` after the default.
- **Notes**: when `notes` is non-empty, render as a paragraph with `**Notes:**` lead.
- **Example**: bold-captioned, fenced code block. Caption format: `**Example.** {description from source if present, else generic phrase}.`. Code fence uses ` ```opensips ` language tag.

H3 ordering: alphabetical by parameter name, regardless of source-JSON order.

#### 3.1.5 Exported Functions

Each function renders as an H3 with the signature in the heading.

```markdown
## Exported Functions

### `t_relay([flags], [outbound_proxy])`

Forwards the current request to the destination URI in a stateful manner.
Creates a new transaction if one does not already exist, then attempts to
send the request and registers any configured failure_route for invocation
on negative replies.

**Parameters:**

- `flags` *(string, optional)* — comma-separated list of behavior flags. Supported flags:
  - `no-auto-477` — disable automatic 477 generation on send failure
  - `no-dns-failover` — disable DNS-based failover for this transaction
- `outbound_proxy` *(string, optional)* — explicit next-hop URI

**Return codes:**

- `1` — request forwarded successfully
- `-1` — generic internal error
- `-2` — bad message (parsing errors)
- `-3` — too many branches

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** Relay a request and handle failures.

```opensips
if (!t_relay()) {
    sl_reply_error();
    exit;
}
```
```

Rendering rules:

- **H3 heading**: backtick-wrapped signature from the source `signature` field. Format: `### \`{signature}\``.
- **Description**: prose.
- **Parameters**: only present when `parameters` array is non-empty. Bulleted list, one item per parameter. Format per parameter: `- \`{name}\` *({type}, {required|optional})* — {description}`. Sub-bullets for nested options (flags within a flag set, allowed values for an enum).
- **Return codes**: only when `return_values` is non-empty. Bulleted list. Format: `- \`{value}\` — {description}`.
- **Usable from**: only when `usage_context` is non-empty. Single line, comma-separated route block names. Format: `**Usable from:** {context list}`.
- **Related functions**: only when `related_functions` is non-empty. Bulleted list with backticked names. Heading `**Related:**`.
- **Deprecation marker**: when `deprecated` is true, render `> **Deprecated.**` blockquote at the top of the description.
- **Example**: same format as parameters. At least one example per function. Caption from the example's `description` field.

H3 ordering: alphabetical by function name.

#### 3.1.6 Exported Pseudo-Variables

```markdown
## Exported Pseudo-Variables

### `$T_branch_idx`

Returns the index of the current branch within a transaction. Read-only in all
contexts; available only when the transaction has multiple branches.

- **Type:** integer
- **Read/write:** read-only
- **Scope:** transaction
- **Available in:** REQUEST_ROUTE (after t_relay), BRANCH_ROUTE, FAILURE_ROUTE

**Example.** Log the current branch index.

```opensips
xlog("Processing branch $T_branch_idx\n");
```
```

Rendering rules:

- **H3 heading**: backtick-wrapped variable name including the leading `$`.
- **Description**: prose.
- **Property list**: bulleted list of metadata. Type, read/write, scope, available-in route blocks. One bullet per property. Order is fixed: type, read/write, scope, scope context.
- **Possible values**: when present, bulleted sub-list under the property list.
- **Example**: same format as parameters and functions.

#### 3.1.7 Exported MI Functions

```markdown
## Exported MI Functions

### `t_uac_dlg`

Generates a SIP request out-of-dialog. Useful for sending arbitrary requests
without an associated client.

**Parameters:**

- `method` *(string, required)* — SIP method (INVITE, OPTIONS, etc.)
- `ruri` *(string, required)* — Request-URI
- `headers` *(string, optional)* — additional headers, separated by `\r\n`

**Returns:** JSON object containing the generated transaction's local tag.

**Example.** Send an out-of-dialog OPTIONS via mi_fifo.

```bash
opensips-mi t_uac_dlg method=OPTIONS ruri=sip:test@example.com
```
```

Rendering rules:

- **H3 heading**: backtick-wrapped MI command name.
- **Description**: prose.
- **Parameters**: bulleted list, same format as function parameters.
- **Returns**: single paragraph describing the return value structure. When the source has structured return-value information, render as a sub-list.
- **Example**: bash-fenced, since MI calls are typically issued from the command line.

#### 3.1.8 Exported Statistics

```markdown
## Exported Statistics

### `tm:received_replies`

Counter of all SIP replies received by the tm module since startup or the last
statistics reset.

- **Type:** counter
- **Reset:** via `mi statistics_reset tm:received_replies`
```

Rendering rules:

- **H3 heading**: backtick-wrapped statistic name (often `module:name` form).
- **Description**: prose.
- **Property list**: bulleted, with type and reset method.
- No example required for statistics — they are observed, not invoked.

#### 3.1.9 Exported Events

```markdown
## Exported Events

### `E_TM_BRANCH_FAILED`

Triggered when a branch within a transaction receives a final negative reply
that does not result in transaction failure (e.g., one of several parallel
branches fails but others succeed).

**Parameters:**

- `tindex` *(integer)* — transaction hash table index
- `tlabel` *(integer)* — transaction label
- `branch_id` *(integer)* — index of the failed branch
- `reply_code` *(integer)* — SIP status code received

**Subscribe via:** `event_route[E_TM_BRANCH_FAILED]` or `subscribe_event` MI command
```

Rendering rules:

- **H3 heading**: backtick-wrapped event name.
- **Description**: prose.
- **Parameters**: bulleted list of event payload fields.
- **Subscribe via**: how to consume the event.

#### 3.1.10 Configuration Examples

Top-level examples that demonstrate the module in realistic use, beyond the per-element examples earlier in the file.

```markdown
## Configuration Examples

### Stateful proxy with failover

Configure the tm module for a stateful proxy that retries on 5xx responses
and gives up after three branches.

```opensips
loadmodule "tm.so"

modparam("tm", "fr_timeout", 30)
modparam("tm", "fr_inv_timeout", 120)

route {
    t_on_failure("retry");
    if (!t_relay()) {
        sl_reply_error();
    }
}

failure_route[retry] {
    if (t_check_status("5[0-9][0-9]")) {
        t_on_failure("retry");
        t_relay();
    }
}
```
```

Rendering rules:

- **H3 heading**: short descriptive title from the source `title` field.
- **Description**: one to three sentences from the source `description` field.
- **Code block**: opensips-fenced.
- **Explanation**: optional prose after the code block, from the source `explanation` field.

### 3.2 Core document types (aggregated rendering)

Core document types render in aggregated form: one source JSON file produces one Markdown file containing every item from that source as an H2 section.

Twelve core types map to twelve generated files in `plugins/opensips/skills/opensips-routing/references/{version}/core/`:

| Source file | Generated file | H1 title |
|---|---|---|
| `async.json` | `async.md` | `# Asynchronous Statements` |
| `events.json` | `events.md` | `# Core Events` |
| `flags.json` | `flags.md` | `# Message Flags` |
| `functions.json` | `functions.md` | `# Core Functions` |
| `mi_commands.json` | `mi-commands.md` | `# Core MI Commands` |
| `operators.json` | `operators.md` | `# Operators` |
| `parameters.json` | `parameters.md` | `# Core Parameters` |
| `routes.json` | `routes.md` | `# Route Block Types` |
| `statements.json` | `statements.md` | `# Statements` |
| `statistics.json` | `statistics.md` | `# Core Statistics` |
| `transformations.json` | `transformations.md` | `# Transformations` |
| `variables.json` | `variables.md` | `# Core Pseudo-Variables` |

Underscores in source filenames become hyphens in generated filenames.

#### 3.2.1 Common structure for core files

```markdown
# {H1 title}
<!-- generated-from: source/{version}/core/{source-file}
     generator-version: ...
     opensips-version: {version}
     doc-type: {doc-type} -->

{Lead paragraph stating what this file covers and when to read it.}

## Contents
- [Item 1 name](#item-1-name)
- [Item 2 name](#item-2-name)
...

## {Item 1 name}
{rendered item}

## {Item 2 name}
{rendered item}
```

Note that core files use H2 (not H3) for individual items, because there is no intermediate categorization layer. The aggregated file is one level shallower than a module file.

The Contents TOC for core files is mandatory regardless of length, because aggregated files often have many items and navigation is critical.

Items are sorted alphabetically by name.

#### 3.2.2 Per-item rendering by core type

The exact rendering of each item type follows the corresponding module sub-section format with H-levels shifted up by one (because items become H2 instead of H3):

- **Core variables** (`variables.json`): same format as module pseudo-variables (§3.1.6) but with H2 headings.
- **Core functions** (`functions.json`): same format as module functions (§3.1.5) but with H2 headings.
- **Core parameters** (`parameters.json`): same format as module parameters (§3.1.4) but with H2 headings.
- **Core MI commands** (`mi_commands.json`): same format as module MI functions (§3.1.7) but with H2 headings.
- **Core statistics** (`statistics.json`): same format as module statistics (§3.1.8) but with H2 headings.
- **Core events** (`events.json`): same format as module events (§3.1.9) but with H2 headings.

#### 3.2.3 Type-specific item formats

Some core types have no module equivalent and need specific rendering rules.

**Operators** (`operators.json`):

```markdown
## `+` (addition)

Numeric addition or string concatenation depending on operand types.

- **Operand type:** binary
- **Applicable to:** integer, string
- **Precedence:** 11
- **Associativity:** left

**Example.** Addition.

```opensips
$var(sum) = $var(a) + $var(b);
```
```

**Statements** (`statements.json`):

```markdown
## `if`

Conditional execution. Evaluates the expression and executes the
consequent block when the result is truthy.

**Syntax:**

```
if (expression) {
    statements
} else {
    statements
}
```

**Usable from:** any route block

**Example.** Method dispatch.

```opensips
if (is_method("INVITE")) {
    t_relay();
} else {
    sl_reply("405", "Method Not Allowed");
}
```
```

**Route blocks** (`routes.json`):

```markdown
## `request_route`

Entry point for processing incoming SIP requests. Invoked once per inbound
SIP request before any other processing.

- **Trigger:** every inbound SIP request
- **Can call routes:** yes

**Available variables:** `$ru`, `$rU`, `$si`, `$sp`, `$ci`, all message headers via `$hdr(name)`

**Available functions:** all script functions and module functions exported
to REQUEST_ROUTE context.

**Syntax:**

```
request_route {
    statements
}
```

**Example.**

```opensips
request_route {
    if (!mf_process_maxfwd_header(10)) {
        sl_reply("483", "Too Many Hops");
        exit;
    }
    if (is_method("INVITE")) {
        route(handle_invite);
    }
}
```
```

**Flags** (`flags.json`):

Each flag type (Message Flags, Branch Flags, Script Flags) is rendered as an H2. The flag's exported functions become a bulleted list.

```markdown
## Message Flags

Message flags are persisted for the duration of a SIP transaction. Maximum
of 32 flags available per message.

- **Persistence:** transaction
- **Max flags:** 32

**Functions:**

- `setflag(flag)` — set a flag on the current message
- `resetflag(flag)` — clear a flag
- `isflagset(flag)` — test whether a flag is set

**Example.** Mark a transaction for accounting.

```opensips
setflag(1);
```
```

**Transformations** (`transformations.json`):

```markdown
## `s.len`

Returns the length of a string in bytes.

- **Class:** string
- **Input:** string
- **Output:** integer
- **Chainable:** yes

**Syntax:**

```
{s.len}
```

**Example.** Test username length.

```opensips
if ($rU.len > 10) {
    sl_reply("403", "Username too long");
}
```
```

**Async statements** (`async.json`):

Same format as statements (§3.2.3) but with the additional `**Available in:** ` line.

### 3.3 The consolidated index (machine-readable, not Markdown)

The consolidated index is JSON, not Markdown. Its rendering rules are specified in `data-pipeline.md` §2.5 and §7.3. This document covers only the human-readable Markdown surface.

---

## 4. Code block conventions

### 4.1 Language tags

| Content type | Language tag | Rationale |
|---|---|---|
| OpenSIPs script (opensips.cfg fragments) | `opensips` | Signals intent to humans. Recognized by community syntax extensions. Falls back to plain rendering. |
| Bash / shell commands | `bash` | Standard. |
| JSON (responses, fixtures, examples) | `json` | Standard. |
| Plain text (output samples, log lines) | `text` | Use sparingly — most "plain text" is actually JSON, log format, or shell output and should be tagged accordingly. |
| Syntax-template snippets | (untagged) | When rendering a syntax template like `if (expression) { … }`, use untagged fences. The content is illustrative pseudo-code, not real OpenSIPs script. |

The `opensips` tag is non-standard but harmless. Most Markdown renderers fall back to plain rendering for unknown tags. Tagging signals intent to human reviewers and is forward-compatible with future syntax highlighting.

### 4.2 The `...` convention

Code examples use `...` on its own line to indicate elided context, matching OpenSIPs upstream documentation:

```opensips
...
modparam("tm", "fr_timeout", 10)
...
```

This is preferred over comments like `# (other config) ` or full surrounding context. It signals "this is the relevant fragment; the surrounding context is omitted" without inventing fake context.

### 4.3 Inline code

Use backticks for:

- Function and parameter names: `t_relay()`, `fr_timeout`
- Pseudo-variable names: `$ru`, `$T_branch_idx`
- File paths: `/etc/opensips/opensips.cfg`
- Module names: `tm`, `dialog`, `dispatcher`
- Configuration keywords: `loadmodule`, `modparam`, `route`

Do not use backticks for:

- Section labels (`Parameters`, `Returns`)
- Generic prose terms

### 4.4 Captions

Examples have bold captions:

```markdown
**Example.** Set the `fr_timeout` parameter to 10 seconds.

```opensips
modparam("tm", "fr_timeout", 10)
```
```

The caption format is `**Example.** {description}.` — bold "Example", period, space, description, period. Single sentence. The description comes from the source JSON's example metadata. When the source has no description, the caption is just `**Example.**`.

Multiple examples in one section are not numbered. The OpenSIPs upstream "Example 1.1, 1.2, …" convention is a DocBook artifact and not preserved in our Markdown rendering.

---

## 5. Cross-references

### 5.1 Within a file

When prose in section A refers to section B in the same file, use a Markdown anchor link:

> See [Exported Functions](#exported-functions) for the `t_relay` definition.

Anchors follow GitHub's slugification: lowercase, spaces to hyphens, special characters dropped.

### 5.2 To another reference file

Use prose containing the bare relative path. Do not use Markdown links across files.

> For the `tm_replication_cluster` parameter, see `references/3.6/modules/tm.md` and search for the `tm_replication_cluster` heading.

> The dialog module's behavior depends on tm. See `references/3.6/modules/tm.md`.

Why prose-with-path instead of Markdown links: production Claude skills (`anthropics/skills`) consistently use this pattern. The path is more directly actionable for Claude (which reads via bash) than a Markdown link, and prose carries the intent ("see X for Y") that a bare link would not.

### 5.3 To upstream OpenSIPs documentation

Do not link to upstream OpenSIPs documentation URLs. The reference files are version-pinned snapshots; linking to live documentation would create version drift between what the reference says and what the link shows. Engineers who want to see upstream docs can find them.

The exception is the HTML comment block, which records `generated-from` provenance for tooling.

---

## 6. Length and chunking thresholds

| File length | Required action |
|---|---|
| ≤ 100 lines | Contents TOC optional. |
| 101–300 lines | Contents TOC mandatory. |
| 301–500 lines | Contents TOC mandatory. Consider whether section consolidation is appropriate. |
| 501–800 lines | Acceptable. Production Claude skills include files in this range. TOC mandatory. |
| > 800 lines | Strong signal to split. See §6.1. |

### 6.1 Splitting large module files

When a module's rendered output would exceed 800 lines, split into multiple files:

```
modules/tm/
├── index.md         # Overview, How It Works, Dependencies, Configuration Examples, TOC of others
├── parameters.md    # Exported Parameters
├── functions.md     # Exported Functions
├── variables.md     # Exported Pseudo-Variables
├── mi.md           # Exported MI Functions
└── stats.md        # Exported Statistics, Events
```

The `index.md` file becomes the entry point. Its lead paragraph and TOC point at the other files in the module folder using the §5.2 cross-reference style.

This is a build-script decision based on rendered output length, not a source-JSON decision. The same module's source JSON produces a single file when small and a folder when large.

The threshold and split policy are checked at build time. The build emits a warning when a single file exceeds 600 lines (a forewarning of the 800-line split threshold) and an error when it exceeds 1200 lines without a split.

---

## 7. What we explicitly do not emit

These patterns appear in some documentation but are excluded from generated reference files.

**No emojis.** Decorative. Inflate token count without informational value.

**No horizontal rules (`---`).** Section boundaries are conveyed by headings. Horizontal rules are visual filler.

**No HTML beyond the provenance comment block.** Markdown is the target format. HTML breaks renderers, complicates parsing, and the comment block is the only HTML feature with semantic value (invisible metadata).

**No badges, shields, or status icons.** Generated reference files are not READMEs.

**No footnotes.** Markdown footnote support is renderer-dependent. Footnote-worthy content goes inline as parenthetical or as a "Notes" sub-section.

**No collapsible sections (`<details>`, `<summary>`).** Same renderer-dependence concern. Long content gets a sub-heading or a separate file.

**No inline images.** Reference files are pure text. Architectural diagrams, when needed, live in `docs/` and are referenced by path from prose.

**No frontmatter.** Production Claude skills do not use frontmatter on reference files. The HTML comment block carries provenance; the H1 plus lead paragraph carry the human-and-LLM-readable metadata.

**No tables for parameter or function definitions.** H3 sections with prose and bulleted property lists are used instead. Tables are reserved for terse summary lookup tables (see §8).

**No timestamps in content.** No "Last updated", no "Generated on", no copyright year. Provenance is in the HTML comment block, which is invisible to readers and stable across builds.

**No "(none)" or "N/A" placeholders.** When a section has no content, the section is omitted entirely. Empty sections are negative signals.

---

## 8. Optional but encouraged additions

These patterns are not required but improve readability and Claude's navigation when present.

**Quick-reference tables at the top of large files.** A compact table mapping name → type → one-line summary, immediately after the lead paragraph, before the Contents TOC. Limit to ~20 rows per the LLM-table-readability research; longer files split the table or omit it.

```markdown
## Parameters at a Glance

| Parameter | Type | Default | Description |
|---|---|---|---|
| `fr_timeout` | integer | 30 | Final-reply timeout for non-INVITE transactions |
| `fr_inv_timeout` | integer | 120 | Final-reply timeout for INVITE transactions |
| ... | ... | ... | ... |
```

**See Also section at the end.** Cross-references to related modules or core sections, in prose form per §5.2.

```markdown
## See Also

The dialog module builds on tm to provide stateful dialog tracking; see
`references/3.6/modules/dialog.md`. For core-level transaction concepts
that apply to all modules, see `references/3.6/core/functions.md`.
```

These additions are emitted when the source JSON has corresponding fields (`quick_reference_table`, `see_also`); otherwise they are omitted.

---

## 9. Worked example: a complete tm module reference

This section shows how all the rules combine to produce a complete generated file. Source: `source/3.6/modules/tm.json`. Output: `plugins/opensips/skills/opensips-modules/references/3.6/modules/tm.md`.

```markdown
# tm Module Reference
<!-- generated-from: source/3.6/modules/tm.json
     generator-version: 1.0.0
     opensips-version: 3.6
     doc-type: module -->

The tm module provides stateful processing for SIP transactions in OpenSIPs.
Read this file when working with transaction timeouts, retransmissions,
parallel branches, on-reply or on-failure routes, or any feature that
requires SIP transactions to persist beyond a single message.

## Contents
- [Overview](#overview)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Exported Parameters](#exported-parameters)
- [Exported Functions](#exported-functions)
- [Exported Pseudo-Variables](#exported-pseudo-variables)
- [Exported MI Functions](#exported-mi-functions)
- [Exported Statistics](#exported-statistics)
- [Configuration Examples](#configuration-examples)

## Overview

The tm module implements SIP transaction layer functionality including
retransmission absorption, branch parallel processing, transaction timer
management, and stateful reply forwarding. Transactions created by tm are
the foundation for failure_route and onreply_route processing.

## How It Works

When a request arrives, tm creates a transaction context that persists until
all branches receive a final response or timeout. Replies received during
this window are correlated to the transaction and may trigger configured
onreply_route or failure_route handlers.

[... more prose ...]

## Dependencies

### OpenSIPs Modules

- `signaling` — required for SIP message creation primitives

### External Libraries

None.

## Exported Parameters

### `fr_timeout` (integer)

Timeout which is triggered if no final reply for a request or ACK for a
negative INVITE reply arrives, in seconds.

*Default value is 30 seconds.*

**Example.** Reduce final-reply timeout for a low-latency deployment.

```opensips
modparam("tm", "fr_timeout", 10)
```

### `fr_inv_timeout` (integer)

[... and so on ...]

## Exported Functions

### `t_relay([flags], [outbound_proxy])`

Forwards the current request to the destination URI in a stateful manner.

**Parameters:**

- `flags` *(string, optional)* — comma-separated behavior flags
- `outbound_proxy` *(string, optional)* — explicit next-hop URI

**Return codes:**

- `1` — request forwarded successfully
- `-1` — generic internal error
- `-2` — bad message
- `-3` — too many branches

**Usable from:** REQUEST_ROUTE, FAILURE_ROUTE

**Example.** Relay a request and handle failures.

```opensips
if (!t_relay()) {
    sl_reply_error();
    exit;
}
```

[... and so on ...]

## Configuration Examples

### Stateful proxy with retry on 5xx

Configure tm for a stateful proxy that retries on 5xx responses.

```opensips
loadmodule "tm.so"

modparam("tm", "fr_timeout", 30)

route {
    t_on_failure("retry");
    if (!t_relay()) {
        sl_reply_error();
    }
}

failure_route[retry] {
    if (t_check_status("5[0-9][0-9]")) {
        t_relay();
    }
}
```
```

---

## 10. Validation rules

The build script validates rendering output at the end of Stages 3 and 4 (per `data-pipeline.md`). A rendered file fails validation if any of the following hold:

- Multiple H1 headings in a single file.
- A heading level is skipped (e.g., H2 followed by H4 with no H3).
- An H2 section is emitted with empty body (only the heading and whitespace).
- A code fence is opened without a closing fence.
- A backtick is opened in inline content without a closing backtick.
- A Markdown link with empty href or empty text.
- An HTML element other than the provenance comment.
- Trailing whitespace on any line.
- More than two consecutive blank lines.
- A file exceeding 1200 lines without being a split-target index file.

Validation failures abort the build with exit code 3 and a structured error identifying the offending file and the rule violated. This catches rendering bugs at build time rather than letting malformed Markdown ship.

---

*End of specification. Implementation lives in `scripts/render-module.ts`, `scripts/render-core.ts`, and `scripts/lib/markdown-builders.ts`. Function-level documentation lives in JSDoc per ADR-004. Changes to this specification require an ADR.*
