<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Milestone 0: Repository scaffolding

## Goal

Create the repository, set up the folder structure, commit the documentation set, configure Node and TypeScript tooling, and establish the GPL-3.0 license — all with no application code yet. At the end of this milestone, anyone who clones the repo can read `CLAUDE.md`, navigate to any document, and understand what the project is, even though nothing builds yet.

## Why this is sequenced here

This is the foundation under everything. The folder structure constrains where every subsequent milestone puts its output. Documentation committed first means contributors orient themselves before touching code. Tooling decisions made up front (Node LTS, TypeScript strict mode, ESM, Vitest, Prettier, ESLint with `eslint-plugin-jsdoc`) are baseline assumptions every other milestone relies on; locking them in here prevents one-off deviations later.

There is a real temptation to skip this milestone and "just start coding." Resist it. A repo that grows code before it grows structure ends up with code in the wrong places, no operating manual, and contributors who can't figure out what to do.

## Tasks

### Task 0.1: Initialize the repository

Create a new Git repository named `opensips-skills`. Set the default branch to `main`. Add a `.gitignore` covering `node_modules/`, `dist/`, `coverage/`, `.env`, and IDE-specific directories (`.vscode/`, `.idea/`). Add `LICENSE` with the GPL-3.0 text per ADR-008 (matches OpenSIPs upstream licensing).

Acceptance: `git clone` produces a working repo with the license file present.

### Task 0.2: Create the full folder structure

Create the directory tree as specified in `CLAUDE.md` and the requirements document, including empty placeholder directories where content arrives in later milestones:

```
opensips-skills/
├── .claude-plugin/
├── docs/
│   ├── architecture/
│   │   └── adr/
│   ├── plan/
│   ├── research/
│   └── testing/
├── plugins/
│   └── opensips/
│       ├── .claude-plugin/
│       └── skills/
│           ├── opensips-routing/
│           ├── opensips-modules/
│           └── opensips-security-advisor/
├── scripts/
│   ├── lib/
│   ├── schemas/
│   └── types/
├── source/
│   ├── 3.5/
│   │   ├── core/
│   │   └── modules/
│   └── 3.6/
│       ├── core/
│       └── modules/
└── tests/
    └── __fixtures__/
```

For directories that will hold generated content but are empty at the start, add a `.gitkeep` file so Git tracks them.

Acceptance: `find . -type d | sort` produces a full tree matching the requirements doc's folder structure.

### Task 0.3: Commit all documentation

Copy the produced documentation set into the repo:

- `/CLAUDE.md`
- `/README.md` (placeholder for now; full version comes in milestone 10)
- `/docs/vision.md`
- `/docs/requirements.md`
- `/docs/architecture/data-pipeline.md`
- `/docs/architecture/rendering-templates.md`
- `/docs/architecture/skill-authoring-guide.md`
- `/docs/architecture/adr/000-template.md`
- `/docs/architecture/adr/001-router-index-over-per-module-skills.md` through `008-ser-lineage-neutral-framing.md`
- `/docs/plan/README.md` and the eleven milestone files
- `/docs/research/` — the three research reports (data pipeline, rendering templates, skill authoring)
- `/docs/testing/` placeholder files

Verify cross-references resolve. Anywhere a document points at another document by relative path, follow the link and confirm it exists.

Acceptance: `find docs -name '*.md' | wc -l` produces a count matching the documentation inventory. No broken cross-references.

### Task 0.4: Set up the Node.js project

Create `package.json` with:

- `"type": "module"` for ESM.
- `"engines": { "node": ">=20.0.0" }` per ADR-004.
- `"license": "GPL-3.0-or-later"`.
- A `scripts` block with placeholder entries for `build`, `validate`, `clean`, `test`, `test:golden`, and `lint`. Each placeholder runs `echo "Not yet implemented" && exit 1` until the corresponding milestone wires it up.
- Empty `dependencies` and `devDependencies` blocks (populated in milestone 1).

Create `tsconfig.json` extending `@tsconfig/node20/tsconfig.json` (or current LTS variant). Override the strict settings explicitly per ADR-004:

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "outDir": "./dist",
    "rootDir": "./scripts"
  },
  "include": ["scripts/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

Acceptance: `npm install` works (with no dependencies it's a no-op, but the lockfile gets created). `npx tsc --noEmit` runs without errors.

### Task 0.5: Set up linting and formatting

Add Prettier with project defaults via `.prettierrc.json` (or rely on defaults — no config file is also acceptable). Add `.prettierignore` covering `node_modules/`, `dist/`, `plugins/opensips/skills/*/references/` (generated content; not subject to project formatting rules).

Add ESLint config (`.eslintrc.cjs` or `eslint.config.js` for the new flat config format) with:

- `@typescript-eslint/recommended-type-checked`
- `eslint-plugin-jsdoc` with rules requiring `@param`, `@returns`, and matching parameter names per ADR-004.

Wire the `lint` script in `package.json` to run ESLint on `scripts/`.

Acceptance: `npm run lint` produces no errors against an empty `scripts/` tree.

### Task 0.6: Create the Claude Code plugin manifests

Create `.claude-plugin/marketplace.json` at the repo root:

```json
{
  "$schema": "https://json.schemastore.org/claude-marketplace",
  "name": "opensips-marketplace",
  "version": "0.1.0",
  "description": "OpenSIPs Agent Skills for Claude Code",
  "owner": "OpenSIPs",
  "plugins": [
    {
      "name": "opensips",
      "source": "./plugins/opensips",
      "version": "0.1.0",
      "description": "Three coordinated skills for working with OpenSIPs in Claude Code",
      "category": "development"
    }
  ]
}
```

Create `plugins/opensips/.claude-plugin/plugin.json`:

```json
{
  "name": "opensips",
  "version": "0.1.0",
  "description": "OpenSIPs Skills",
  "author": "OpenSIPs",
  "homepage": "https://opensips.org",
  "repository": "https://github.com/<org>/opensips-skills",
  "license": "GPL-3.0-or-later"
}
```

Replace `<org>` with the actual GitHub organization once decided.

Acceptance: Both manifest files exist and parse as valid JSON.

### Task 0.7: Initialize the changelog

Create `CHANGELOG.md` following Keep-a-Changelog format with an `[Unreleased]` section listing "Project initialization, documentation set committed, repository scaffolding complete." This is the first entry; subsequent milestones append their own changelog entries.

Acceptance: `CHANGELOG.md` exists with at least the `[Unreleased]` section and one entry.

### Task 0.8: First commit and push

Stage everything. Make the first commit with a descriptive message — something like `chore: initial repository scaffolding with full documentation set`. Push to the remote.

Verify the repo renders correctly on GitHub: `CLAUDE.md` is visible at the root, `docs/` browses cleanly, the license is detected by GitHub's license-detection logic.

Acceptance: The repo is published and navigable. A new contributor clicking through GitHub can read every document we've written.

## Acceptance criteria

The milestone is done when all of the following are true:

- The repository exists at the canonical name `opensips-skills`.
- The folder structure is complete and matches the requirements document.
- All seventeen authored documents (CLAUDE.md, vision, requirements, three architecture docs, nine ADRs, plan README, eleven milestone files, three research reports) are committed.
- The full milestone-file set in `docs/plan/` is present, even though only this file (00) has been worked on yet.
- `package.json`, `tsconfig.json`, ESLint, and Prettier are configured.
- The two plugin manifest files exist and are valid JSON.
- `npm install` succeeds; `npx tsc --noEmit` passes; `npm run lint` passes against an empty `scripts/` tree.
- The license is GPL-3.0 and detected as such by GitHub.
- A first commit has been pushed and the repository is publicly browsable.

When all of these are true, milestone 0 is complete and milestone 1 can begin.

## Risks and watch-outs

**The "let me just start coding" temptation.** This milestone has no satisfying executable artifact at the end — `npm run build` doesn't do anything; there's nothing to demo. The temptation is to skip ahead and write the validation logic first. Don't. The folder structure and tooling baseline are foundations every later milestone depends on; relaxing them now means relaxing them throughout.

**Folder-structure drift.** It's tempting to "improve" the folder layout while creating it ("wouldn't it be cleaner if we put schemas under `lib/` instead of `scripts/schemas/`?"). The structure is locked in by the architecture docs. Changes require an ADR, not a Task 0.2 deviation.

**Untracked empty directories.** Git doesn't track empty directories. A contributor who clones the repo and finds `source/3.6/modules/` missing assumes something is wrong. The `.gitkeep` files in Task 0.2 prevent this — make sure every empty directory has one.

**Documentation cross-references that look right but aren't.** The architecture docs reference each other and the ADRs by relative path. After commit, click every cross-reference in GitHub's rendered view. Anything that 404s gets fixed before moving on.

**License detection.** GitHub's license-detector looks for `LICENSE` (no extension) at the repo root. Naming the file `LICENSE.md` or `COPYING` works for humans but breaks GitHub's automatic detection. Use `LICENSE` with no extension and the standard GPL-3.0 text.

## Parallelization notes

Tasks 0.4 (Node setup), 0.5 (linting), 0.6 (plugin manifests), and 0.7 (changelog) are independent and can be done in any order. Tasks 0.2 (folder structure) and 0.3 (commit documentation) are sequential but small. Task 0.1 (initialize repo) blocks all others. Task 0.8 (first commit) is the closing action.

For solo work, just do them in order. For two-person work, one person handles 0.1–0.3 (the structural work) while the other handles 0.4–0.7 (the tooling work) once 0.1 is done. Both meet at 0.8.

## Cross-references

- Repository structure: `docs/requirements.md` §6 (Folder Structure).
- License choice: `docs/architecture/adr/008-ser-lineage-neutral-framing.md` confirms GPL-3.0 to match upstream OpenSIPs.
- Tooling decisions: `docs/architecture/adr/004-node-typescript-build-stack.md`.
- Plugin manifest format: `docs/requirements.md` §7.1, §7.2.
- Project operating rules: `/CLAUDE.md` "Rules for changing things" section.

---

*Next milestone: `01-schema-mirroring-and-validation.md`.*
