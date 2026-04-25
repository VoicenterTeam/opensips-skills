# Research Reports

This directory contains the deep-research reports that informed the architectural decisions in this project. Each report was produced during the design phase, before the corresponding architecture document was written, so that decisions could be grounded in production evidence rather than first-principles guessing.

## Why these are committed

The reports are committed (rather than discarded once their findings were absorbed into ADRs and architecture docs) for three reasons:

1. **Traceability.** When a future contributor asks "why did we decide X?", the architecture doc gives the decision and the ADR gives the rationale. The research report gives the *evidence* — the concrete production examples, the documented benchmarks, the specific failure modes that the decision is responding to.

2. **Re-runnable input.** When circumstances change (new Claude Code releases, schema updates from the upstream extraction project, new patterns in the `anthropics/skills` repo), maintainers can re-read the research, identify what's stale, and re-run targeted research to update the architecture rather than start from scratch.

3. **Open-source courtesy.** Anyone evaluating this project's design choices can see the homework. This is especially valuable for an open-source project that aspires to be a reference implementation for "how to build a Claude Code plugin in a consequential domain" — the research is part of the educational value.

## Reports in this directory

### `data-pipeline-build-pipelines.md`

Research on deterministic documentation build pipelines. Covers ten areas including idempotence, schema validation strategies, partial-success policies, golden-file testing, template systems, file I/O atomicity, CLI design, indexes, multi-version handling, and AI-consumed documentation considerations.

This report informed `docs/architecture/data-pipeline.md` and ADRs 002, 003, 004, and 006.

### `rendering-templates-skill-references.md`

Research on Markdown reference files for Claude Code Agent Skills. Covers production patterns from the `anthropics/skills` repository, OpenSIPs upstream documentation conventions, and the formatting decisions for headings, frontmatter, code blocks, tables, length thresholds, and cross-references.

This report informed `docs/architecture/rendering-templates.md` and ADR 001.

### `skill-authoring-trigger-reliability.md`

Research on writing SKILL.md files with reliable trigger behavior, multi-skill coordination, anti-hallucination guardrails, and body structure. Covers description writing patterns, the documented "undertriggering" problem, the all-caps imperative tradeoff, paired Bad/Good examples, the router-index pattern, and per-skill body templates.

This report informed `docs/architecture/skill-authoring-guide.md` and ADRs 001 and 005.

## How these relate to architecture

Reading order for someone trying to understand a specific decision:

1. The architecture document or skill content names *what* was decided.
2. The corresponding ADR explains *why*, in compressed form.
3. The research report shows the *evidence* the ADR is built on.

You don't have to read the research to use the project. You read it when you want to understand the project's evidence base, when you're proposing a change to a foundational decision, or when you're designing a similar project elsewhere and want to learn from the homework.

## When to update these reports

The reports are point-in-time. They don't get updated incrementally — that would lose their value as historical documents.

When research is needed for a new architectural question, run a fresh research pass and add a new report to this directory. The old report stays as a record of what was known at the time the previous decisions were made.

If a maintainer wants to formally retire a report (because the entire architecture it informed has been replaced), move it to `docs/research/archive/` rather than deleting. The history matters.

---

*Reports below this line.*
