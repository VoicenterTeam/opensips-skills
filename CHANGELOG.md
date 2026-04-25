# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Project initialization. Repository scaffolding complete: directory structure, GPL-3.0 license, .gitignore, package.json with placeholder scripts, tsconfig.json with strict mode, ESLint flat config with JSDoc enforcement, Prettier configuration, Claude Code plugin manifests (marketplace.json + plugin.json), and the full documentation set (CLAUDE.md, vision, requirements, architecture docs, ADRs 001-009, 11 milestone files, research reports, schema specs, testing strategy, superpower execution plan).
- ADR-009: `data/` adopted as the canonical source-data location (deviating from the plan's `source/`); build dynamically discovers versions from `data/{X.Y}/` folders matching `^\d+\.\d+$`; current scope expanded from {3.5, 3.6} to {3.4, 3.5, 3.6}; guides included in v1 wherever the data has them.

[Unreleased]: https://github.com/OpenSIPS/opensips-skills/compare/HEAD
