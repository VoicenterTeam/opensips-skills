/**
 * Guide-level composer that turns one {@link GuideDocument} into a complete
 * Markdown reference file.
 *
 * Per ADR-009 §M4, the build pipeline emits one file per guide document type
 * — `installation.md`, `configuration.md`, `syntax.md` — under
 * `plugins/.../opensips-config/references/{version}/guides/`. The orchestrator
 * only invokes this composer when the source `data/{version}/guides/`
 * directory exists (3.4 and 3.6 currently; 3.5 has no guides folder and the
 * orchestrator skips the call). Adding or removing guide doc types requires
 * extending {@link guideFileNames} and the type-specific section dispatch
 * below.
 *
 * Two correctness contracts (mirroring the per-module composer):
 *
 *   - **Deterministic.** The same input always produces byte-identical
 *     output. Two consecutive renders are byte-equal — the build's
 *     "build twice, diff is empty" gate depends on it.
 *   - **Side-effect-free.** No filesystem access, no globals, no clocks.
 *     The orchestrator owns all I/O.
 *
 * Field handling vs. the {@link GuideDocumentSchema} (see
 * `scripts/schemas/guides.schema.ts`):
 *
 *   - **`title`** — required; rendered as H1 verbatim.
 *   - **`synopsis`** — optional; rendered as the body of an `## Overview`
 *     section when non-empty / non-whitespace, otherwise the section is
 *     suppressed.
 *   - **`installation_steps`** — schema-tagged "Installation Specific" but
 *     handled wherever it appears. Rendered under `## Installation Steps`
 *     with one H3 per step, the description prose, an optional notes
 *     paragraph, and a `bash`-fenced code block per step that joins the
 *     `commands[]` lines with newlines. Steps render in source order
 *     (the schema's `step_number` carries narrative sequence).
 *   - **`prerequisites`** — rendered under `## Prerequisites` as a bulleted
 *     list of `- name (required|optional) — description` items.
 *   - **`troubleshooting`** — rendered under `## Troubleshooting` as a
 *     bulleted list of `- **{problem}** — {solution}` items. Schema-tagged
 *     "Installation Specific" but real upstream data carries
 *     troubleshooting on configuration guides too (e.g. 3.4 configuration);
 *     handled wherever present.
 *   - **`configuration_sections`** — schema-tagged "Configuration Specific"
 *     but real upstream data uses it on syntax guides too (e.g. 3.6
 *     syntax). Rendered under `## Configuration Sections` with one H3 per
 *     section, the description prose, a `**Parameters:**` bullet list
 *     when non-empty, and one fenced code block per example with an
 *     italic caption when the example carries a description.
 *   - **`best_practices`** — rendered under `## Best Practices` with one
 *     H3 per item (`### {title}` + description).
 *   - **`content_markdown`** — the raw upstream Markdown blob. Per Rule 3
 *     of CLAUDE.md, this content is **passed through unchanged** — it
 *     frequently contains OpenSIPs.org navigation HTML, version-switcher
 *     link soup, and DocBook-derived punctuation. The renderer does **not**
 *     surface this field as part of the canonical output: every guide
 *     doc type has structured fields that carry the curated content, and
 *     dumping `content_markdown` would re-introduce the navigation noise
 *     the upstream extractor stripped. The field stays available via the
 *     committed source JSON for traceability.
 *
 * Type-specific section dispatch (post-Overview, in TOC order):
 *
 *   - `installation_guide` → Prerequisites, Installation Steps, Troubleshooting,
 *     Best Practices.
 *   - `configuration_guide` → Configuration Sections, Best Practices,
 *     Troubleshooting.
 *   - `syntax_guide` → Configuration Sections, Best Practices,
 *     Troubleshooting.
 *
 * `configuration_guide` and `syntax_guide` share their dispatch because the
 * real upstream data does: 3.6 syntax populates `configuration_sections` and
 * `best_practices`, 3.4 configuration populates `troubleshooting` and
 * `best_practices`. Sections that have no source content are silently
 * omitted (the "no empty sections" rule from
 * `rendering-templates.md` §2.4).
 */

import type { z } from "zod";
import type { GuideDocumentSchema } from "../schemas/guides.schema.js";
import {
  renderBold,
  renderBulletList,
  renderCodeBlock,
  renderH1,
  renderH3,
  renderItalic,
  renderLeadParagraph,
  renderSection,
  renderTOC,
  toAnchor,
  type TocEntry,
} from "../lib/markdown-builders.js";
import { renderProvenance } from "../lib/frontmatter.js";
import { sanitizeRenderedText } from "../lib/sanitize.js";
import { getLeadParagraph } from "../render-core/lead-paragraphs.js";

type GuideDocument = z.infer<typeof GuideDocumentSchema>;
type GuideDocType = GuideDocument["document_type"];

type InstallStep = NonNullable<GuideDocument["installation_steps"]>[number];
type Prerequisite = NonNullable<GuideDocument["prerequisites"]>[number];
type TroubleshootingItem = NonNullable<GuideDocument["troubleshooting"]>[number];
type ConfigSection = NonNullable<GuideDocument["configuration_sections"]>[number];
type ConfigExample = ConfigSection["examples"][number];
type BestPractice = NonNullable<GuideDocument["best_practices"]>[number];

/**
 * Map from guide document type to the canonical output filename used by
 * the orchestrator when writing the rendered Markdown into
 * `plugins/.../opensips-config/references/{version}/guides/`.
 *
 * Adding a new guide doc type means: extend the schema enum upstream,
 * add a key here, add a lead-paragraph factory in
 * `scripts/render-core/lead-paragraphs.ts`, and extend the type-specific
 * dispatch in {@link renderGuide}.
 * @example
 * guideFileNames["installation_guide"]; // "installation.md"
 */
export const guideFileNames: Readonly<Record<GuideDocType, string>> = {
  installation_guide: "installation.md",
  configuration_guide: "configuration.md",
  syntax_guide: "syntax.md",
} as const;

/**
 * Map from guide document type to the source-file stem used in the
 * provenance comment's `generated-from:` path. Mirrors {@link guideFileNames}
 * but without the `.md` extension and pointing at the JSON source under
 * `data/{version}/guides/`.
 */
const guideSourceStems: Readonly<Record<GuideDocType, string>> = {
  installation_guide: "installation",
  configuration_guide: "configuration",
  syntax_guide: "syntax",
} as const;

/** Section-heading constants. One source of truth for heading → anchor. */
const SECTION_OVERVIEW = "Overview";
const SECTION_PREREQUISITES = "Prerequisites";
const SECTION_INSTALLATION_STEPS = "Installation Steps";
const SECTION_CONFIGURATION_SECTIONS = "Configuration Sections";
const SECTION_BEST_PRACTICES = "Best Practices";
const SECTION_TROUBLESHOOTING = "Troubleshooting";

/**
 * Utility — true when the supplied string field carries content worth
 * rendering. Mirrors the per-module composer's `hasContent`.
 * @param value - Candidate string.
 * @returns Whether to treat the value as present.
 */
function hasContent(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Format a single prerequisite as a bullet line.
 *
 * Output shape: `name (required|optional) — description` (or just
 * `name (required|optional)` when the description is blank).
 * @param p - Prerequisite to format.
 * @returns The bullet body (without leading `- ` or trailing newline,
 *   both added by {@link renderBulletList}).
 */
function formatPrerequisiteBullet(p: Prerequisite): string {
  const tag = p.required ? "required" : "optional";
  const head = `${p.name} (${tag})`;
  return hasContent(p.description) ? `${head} — ${p.description}` : head;
}

/**
 * Render the installation-step block for a single step. Output:
 * H3 step heading + description paragraph + `bash`-fenced commands +
 * optional notes paragraph.
 *
 * The fence language is `bash` rather than `opensips` because installation
 * steps emit shell commands (per `rendering-templates.md` §4.1's choice of
 * `bash` for shell content). When `commands` is empty no fence is emitted.
 * @param step - Step record.
 * @returns A Markdown block ending in `"\n"`.
 */
function renderInstallStep(step: InstallStep): string {
  const heading = renderH3(`Step ${step.step_number}: ${step.title}`);
  let body = `${heading}\n`;
  if (hasContent(step.description)) {
    body += `${step.description}\n\n`;
  }
  if (step.commands.length > 0) {
    body += renderCodeBlock(step.commands.join("\n"), "bash");
    body += "\n";
  }
  if (hasContent(step.notes)) {
    body += `${step.notes}\n\n`;
  }
  return body;
}

/**
 * Render a single troubleshooting item as a bullet line.
 * @param item - The `{problem, solution}` pair.
 * @returns The bullet body.
 */
function formatTroubleshootingBullet(item: TroubleshootingItem): string {
  return `${renderBold(item.problem)} — ${item.solution}`;
}

/**
 * Render a single configuration-section example as an italic caption plus
 * a fenced code block. The fence language defaults to `opensips` when the
 * upstream `language` field is missing or empty.
 * @param example - Example to render.
 * @returns A Markdown block ending in `"\n"`.
 */
function renderConfigExample(example: ConfigExample): string {
  const lang = hasContent(example.language) ? example.language : "opensips";
  const caption = hasContent(example.description) ? `${renderItalic(example.description)}\n\n` : "";
  return `${caption}${renderCodeBlock(example.code, lang)}`;
}

/**
 * Render a single configuration-section as an H3 block: heading + prose +
 * optional parameters list + zero-or-more example blocks.
 * @param section - Section to render.
 * @returns A Markdown block ending in `"\n"`.
 */
function renderConfigSection(section: ConfigSection): string {
  const heading = renderH3(section.section_name);
  let body = `${heading}\n`;
  if (hasContent(section.description)) {
    body += `${section.description}\n\n`;
  }
  if (section.parameters.length > 0) {
    body += `${renderBold("Parameters:")}\n\n`;
    body += renderBulletList(section.parameters.map((p) => `\`${p}\``));
    body += "\n";
  }
  for (const example of section.examples) {
    body += renderConfigExample(example);
    body += "\n";
  }
  return body;
}

/**
 * Render a single best-practice as an H3 block.
 * @param bp - Best practice entry.
 * @returns A Markdown block ending in `"\n"`.
 */
function renderBestPractice(bp: BestPractice): string {
  const heading = renderH3(bp.title);
  let body = `${heading}\n`;
  if (hasContent(bp.description)) {
    body += `${bp.description}\n`;
  }
  return body;
}

/**
 * Compose one {@link GuideDocument} into a complete Markdown file.
 *
 * The function is **deterministic** — given the same input, returns
 * byte-identical output. It is **side-effect-free** — no I/O, no globals.
 * The orchestrator (M4.E) owns filesystem writes.
 *
 * Section emission order:
 *
 * 1. `# {doc.title}` (H1)
 * 2. Provenance HTML comment block.
 * 3. Lead paragraph (from `getLeadParagraph(doc.document_type, version)`).
 * 4. Contents TOC (built dynamically from sections that actually emit content).
 * 5. `## Overview` — only when `doc.synopsis` is non-empty.
 * 6. **Type-specific sections**, dispatched on `doc.document_type`:
 * - `installation_guide`: Prerequisites, Installation Steps,
 * Troubleshooting, Best Practices.
 * - `configuration_guide` / `syntax_guide`: Configuration Sections,
 * Best Practices, Troubleshooting.
 *
 * Empty / absent optional arrays produce no section at all (the
 * "no empty sections" rule). The `content_markdown` field is intentionally
 * not rendered — see the file-level JSDoc.
 * @param doc - Validated GuideDocument from
 *   `data/{version}/guides/{installation,configuration,syntax}.json`.
 * @param version - Active OpenSIPs version string (e.g., `"3.6"`).
 * @param generatorVersion - Build script version (e.g., `"0.1.0"`).
 * @returns Complete Markdown content with exactly one trailing newline.
 * @example
 * renderGuide(installationDoc, "3.6", "0.1.0");
 * // # Compile and Install v3.6
 * // <!-- generated-from: data/3.6/guides/installation.json
 * //      generator-version: 0.1.0
 * //      opensips-version: 3.6
 * //      doc-type: installation_guide -->
 * //
 * // Compile and install instructions for OpenSIPs 3.6. Read this file ...
 * //
 * // ## Contents
 * // ...
 * // ## Overview
 * // ...
 * // ## Prerequisites
 * // ...
 * // ## Installation Steps
 * // ### Step 1: Compile
 * // ...
 */
export function renderGuide(doc: GuideDocument, version: string, generatorVersion: string): string {
  const stem = guideSourceStems[doc.document_type];

  const head =
    renderH1(doc.title) +
    renderProvenance({
      generatedFrom: `data/${version}/guides/${stem}.json`,
      generatorVersion,
      opensipsVersion: version,
      docType: doc.document_type,
    }) +
    "\n" +
    renderLeadParagraph(getLeadParagraph(doc.document_type, version));

  // 1. Overview (synopsis). Suppressed when synopsis is empty/whitespace.
  const overviewBody = hasContent(doc.synopsis)
    ? renderSection(SECTION_OVERVIEW, doc.synopsis.trim())
    : "";

  // 2. Build type-specific section bodies. Each is "" when its source array
  //    is missing or empty (no-empty-sections rule).
  const prerequisitesBody =
    doc.prerequisites && doc.prerequisites.length > 0
      ? renderSection(
          SECTION_PREREQUISITES,
          renderBulletList(doc.prerequisites.map(formatPrerequisiteBullet)),
        )
      : "";

  const installationStepsBody =
    doc.installation_steps && doc.installation_steps.length > 0
      ? renderSection(
          SECTION_INSTALLATION_STEPS,
          // Steps preserve source order; step_number carries the narrative
          // sequence and is captured in each H3.
          doc.installation_steps.map(renderInstallStep).join(""),
        )
      : "";

  const configurationSectionsBody =
    doc.configuration_sections && doc.configuration_sections.length > 0
      ? renderSection(
          SECTION_CONFIGURATION_SECTIONS,
          doc.configuration_sections.map(renderConfigSection).join(""),
        )
      : "";

  const bestPracticesBody =
    doc.best_practices && doc.best_practices.length > 0
      ? renderSection(SECTION_BEST_PRACTICES, doc.best_practices.map(renderBestPractice).join(""))
      : "";

  const troubleshootingBody =
    doc.troubleshooting && doc.troubleshooting.length > 0
      ? renderSection(
          SECTION_TROUBLESHOOTING,
          renderBulletList(doc.troubleshooting.map(formatTroubleshootingBullet)),
        )
      : "";

  // 3. Dispatch the section ordering on document_type. Configuration and
  //    syntax share an ordering because the real upstream data overlaps.
  let typeSpecificBody = "";
  switch (doc.document_type) {
    case "installation_guide":
      typeSpecificBody =
        prerequisitesBody + installationStepsBody + troubleshootingBody + bestPracticesBody;
      break;
    case "configuration_guide":
    case "syntax_guide":
      typeSpecificBody = configurationSectionsBody + bestPracticesBody + troubleshootingBody;
      break;
  }

  // 4. Build the TOC from sections that actually emitted content. Order
  //    must match the body emission order so anchors line up with the
  //    visual section sequence.
  const tocEntries: TocEntry[] = [];
  const addEntry = (label: string, body: string): void => {
    if (body.length > 0) {
      tocEntries.push({ label, anchor: toAnchor(label) });
    }
  };
  addEntry(SECTION_OVERVIEW, overviewBody);
  switch (doc.document_type) {
    case "installation_guide":
      addEntry(SECTION_PREREQUISITES, prerequisitesBody);
      addEntry(SECTION_INSTALLATION_STEPS, installationStepsBody);
      addEntry(SECTION_TROUBLESHOOTING, troubleshootingBody);
      addEntry(SECTION_BEST_PRACTICES, bestPracticesBody);
      break;
    case "configuration_guide":
    case "syntax_guide":
      addEntry(SECTION_CONFIGURATION_SECTIONS, configurationSectionsBody);
      addEntry(SECTION_BEST_PRACTICES, bestPracticesBody);
      addEntry(SECTION_TROUBLESHOOTING, troubleshootingBody);
      break;
  }
  const toc = renderTOC(tocEntries);

  // 5. Compose head + TOC + Overview + type-specific sections, then
  //    normalise excess blank lines (matching the per-module composer's
  //    final pass) and force exactly one trailing newline.
  const composed = head + toc + overviewBody + typeSpecificBody;
  const collapsed = composed.replace(/(?:\n[ \t]*){3,}/g, "\n\n");
  const cleaned = sanitizeRenderedText(collapsed);
  return `${cleaned.replace(/\n+$/, "")}\n`;
}
