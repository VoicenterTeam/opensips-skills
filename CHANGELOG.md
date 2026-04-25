# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **M0 — Repository scaffolding.** Directory structure, GPL-3.0 license, .gitignore, package.json with placeholder scripts, tsconfig.json with strict mode, ESLint flat config with JSDoc enforcement, Prettier configuration, Claude Code plugin manifests (marketplace.json + plugin.json), and the full documentation set (CLAUDE.md, vision, requirements, architecture docs, ADRs 001-009, 11 milestone files, research reports, schema specs, testing strategy, superpower execution plan).
- **ADR-009.** `data/` adopted as the canonical source-data location (deviating from the plan's `source/`); build dynamically discovers versions from `data/{X.Y}/` folders matching `^\d+\.\d+$`; current scope expanded from {3.5, 3.6} to {3.4, 3.5, 3.6}; guides included in v1 wherever the data has them.
- **M1 — Schema mirroring and validation.** Mirrored 19 Zod schemas verbatim from upstream `opensips-docs-collector/src/schemas/` to `scripts/schemas/` with "DO NOT EDIT" headers; deterministic SHA-256 schema-hash check (`npm run schemas:hash`) protects the mirroring contract; dynamic version-discovery stage (`scripts/lib/discover.ts`) pattern-matches `^\d+\.\d+$` and detects optional `guides/` directory per ADR-009; per-file validation stage (`scripts/lib/validate.ts`) maps filenames to Zod schemas and accumulates structured `ValidationIssue`s with parse/schema/io/schema-lookup kinds; orchestrator stub (`scripts/build-references.ts`) wires `npm run validate` end-to-end with the structured exit-code taxonomy from data-pipeline.md §4 (0=success, 2=usage, 3=validation, 5=schema-drift); 51 unit tests across hash/discover/validate.

### Notes
- Real-data validation surfaced an upstream JSON-parse defect in `data/3.4/core/variables.json` at byte 80262 (line 1474, column 7 — stray `.0` token mid-object). Per CLAUDE.md Rule 3, the fix belongs upstream in `opensips-docs-collector`, not here. The pipeline correctly detected and reported it; 3.4 builds will continue to fail validation until the extraction is corrected upstream and `data/3.4/` re-mirrored. 3.5 and 3.6 validate clean.

[Unreleased]: https://github.com/OpenSIPS/opensips-skills/compare/HEAD
