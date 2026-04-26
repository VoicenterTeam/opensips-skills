<p align="center"><img src="../OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# Research Report: Production-Grade Practices for Deterministic Documentation Build Pipelines

**Scope:** This report synthesizes established practice for deterministic, schema-driven documentation pipelines that transform per-version JSON source into Markdown and a consolidated index, targeting consumption by AI coding assistants (specifically Claude Code Agent Skills). Findings are drawn from tooling projects (Docusaurus, MkDocs/TechDocs, Sphinx, Redoc, tfplugindocs, Pulumi, Anthropic's `skills` repo), the Reproducible Builds project, and adjacent literatures on snapshot testing, CLI ergonomics, and search index generation.

---

## Area 1: Deterministic and Idempotent Build Pipelines

### Established practice

The canonical reference is the [Reproducible Builds project](https://reproducible-builds.org/), which defines reproducibility as bit-by-bit identical output when given the same source and controlled environment, verified by SHA-256 comparison ([Reproducible Builds – Definitions](https://reproducible-builds.org/docs/definition/)). The project enumerates the recurring sources of non-determinism that apply directly to documentation generation:

- **Embedded timestamps.** Build-time `time.now()` in output (e.g. copyright footers, "last updated" strings) is the single most common reproducibility break. The standard remedy is the `SOURCE_DATE_EPOCH` environment variable, a Unix timestamp that tools substitute for "now" ([SOURCE_DATE_EPOCH spec](https://reproducible-builds.org/docs/source-date-epoch/)). Sphinx adopted this in 2015/2016 via PRs [#1954](https://github.com/sphinx-doc/sphinx/pull/1954) and [#2503](https://github.com/sphinx-doc/sphinx/pull/2503), substituting `SOURCE_DATE_EPOCH` into `|today|`, "Last Updated", and copyright notices; the pattern is now the de-facto standard for Debian/NixOS documentation rebuilds ([Sphinx issue #3451](https://github.com/sphinx-doc/sphinx/issues/3451)).
- **Filesystem iteration order.** `readdir()` returns OS-dependent order. The fix is to explicitly sort file lists before iteration — the Reproducible Builds docs note this as the single most common ordering bug and recommend `sort` in every pipeline touching directories ([Stable order for outputs](https://reproducible-builds.org/docs/stable-outputs/)). Angular Material traced exactly this issue to `gulp.src`'s async glob expansion producing different bundle order between runs ([angular/material PR #11570](https://github.com/angular/material/pull/11570)). Go reproducibility guides show the canonical pattern: walk the tree, `sort.Strings(files)`, then process ([OneUptime reproducibility guide](https://oneuptime.com/blog/post/2026-01-24-fix-build-reproducibility-issues/view)).
- **Hash/map iteration order.** Python dicts, JavaScript object key order for non-integer keys, and `Map` serialization can vary. JavaScript's `JSON.stringify` does *not* guarantee key order per the MDN spec, so production projects emit canonical JSON with sorted keys — either via RFC 8785 JCS ([RFC 8785](https://www.rfc-editor.org/rfc/rfc8785)) or libraries such as [`canonical-json`](https://github.com/mirkokiefer/canonical-json) and [`json-stringify-deterministic`](https://www.npmjs.com/package/json-stringify-deterministic). RFC 8785 is specifically intended for "stable content hashes for JSON documents" — exactly our use case for a search/reference index.
- **Hash-based asset names, build-path leakage, randomness, locale, timezone.** These are enumerated in [Deterministic build systems](https://reproducible-builds.org/docs/deterministic-build-systems/); the fixes are environment pinning (locale=C, TZ=UTC), avoidance of random suffixes, and use of `path.posix` in Node to avoid Windows vs POSIX drift ([cross-platform Node guide](https://github.com/ehmicky/cross-platform-node-guide/blob/main/docs/3_filesystem/file_paths.md)).

### Verification: the "build twice" pattern

Production projects verify reproducibility by building twice in CI and diffing. Qubes OS runs `reprotest` which builds a package twice in two different environments and auto-runs `diffoscope` on any difference ([Qubes OS reproducibility](https://www.qubes-os.org/news/2021/02/28/improvements-in-testing-and-building/)). Yocto's `oe-selftest -r reproducible.ReproducibleTests.test_reproducible_builds` and Nix's `nix build ... --rebuild --check` embody the same pattern ([Yocto reproducibility](https://docs.yoctoproject.org/test-manual/reproducible-builds.html), [NixOS reproducible](https://reproducible.nixos.org/)). For a Node pipeline the minimal CI gate is:

```
npm run build && sha256sum -c build.hashes || (npm run build && diff -r build1/ build2/ && exit 1)
```

Docker supply-chain guides show an identical pattern — build, hash, rebuild, compare digests ([OneUptime Docker reproducibility](https://oneuptime.com/blog/post/2026-02-08-how-to-set-up-docker-build-reproducibility-verification/view)).

### Ordering conventions for generated output

- **Alphabetical by stable identifier (name/slug)** is the right default for reference material: it is human-scannable, makes diffs small when entries are added/removed, and never reorders under content edits. Docusaurus uses `handleDuplicateRoutes` specifically to prevent plugin-order non-determinism ([Docusaurus plugin lifecycle](https://deepwiki.com/facebook/docusaurus/2.2-plugin-lifecycle)).
- **Source/author-specified order** (e.g. curriculum sequences, guides) is used only where there is an explicit `order:` or sidebar file — TechDocs/MkDocs requires it in `mkdocs.yml`'s `nav:` ([mkdocs-techdocs-core README](https://github.com/backstage/mkdocs-techdocs-core)).
- **Dependency order** applies only where rendering of A embeds or references B and transitive closure matters (rarely, for simple JSON→Markdown).

### Recommendation for this project
Sort all outputs alphabetically by module/symbol name; use `SOURCE_DATE_EPOCH` (or simply omit any build timestamp from output); use `json-stringify-deterministic` for the consolidated index; add a CI job that runs the build twice and fails on `diff`. Pin locale to `C` and TZ to `UTC` in CI.

---

## Area 2: Schema Validation and Schema Version Management

### Schema versioning strategy

Traditional SemVer (`MAJOR.MINOR.PATCH`) does not cleanly map to data schemas because there is no concept of a "bug fix" and the consumer/producer relationship is asymmetric. Snowplow introduced **SchemaVer** (`MODEL-REVISION-ADDITION`) specifically for this: MODEL is a breaking schema change that invalidates historical data, REVISION affects some historical data, ADDITION is compatible with all historical data ([SchemaVer spec](https://docs.snowplow.io/docs/pipeline-components-and-applications/iglu/common-architecture/schemaver/), [Snowplow blog](https://snowplow.io/blog/introducing-schemaver-for-semantic-versioning-of-schemas)). This is the right mental model for per-version JSON: a field addition is `0-0-N`, a field rename is a MODEL bump and requires an explicit migration.

The widely-documented pattern for runtime validation + version pinning embeds a `schemaVersion` field in every payload and a compatible range (`schemaCompatibility: "1.x"`) the consumer checks before proceeding ([UlisesGascon POC](https://github.com/UlisesGascon/POC-semver-and-json-schemas)). A build script using this pattern:

1. Reads `source.schemaVersion`.
2. Compares against its expected range via `semver.satisfies()`.
3. If incompatible → **fail fast** with a specific error.
4. If compatible → runs Zod/JSON-Schema/Ajv validation against the full document.

### Drift detection between producer and consumer

When the producer and consumer are separate repositories (e.g. an LLM extraction tool writes JSON, a build tool consumes it), the canonical tools are:

- **Checked-in schema with a content hash.** [`goldenthread`](https://github.com/blackwell-systems/goldenthread) is a Go → TypeScript/Zod compiler whose `goldenthread check` CI command returns a non-zero exit when emitted schemas diverge from source. The pattern — generate schema, hash it, commit the hash, fail CI when the hash drifts — is the generalizable practice.
- **Fixture validation in CI.** ComfyUI's fix for silent fixture drift was "add a Vitest unit test that parses each fixture against its corresponding Zod schema" — every source file is parsed through the schema in CI so a schema change surfaces as a unit-test failure on the fixtures ([ComfyUI issue #10707](https://github.com/Comfy-Org/ComfyUI_frontend/issues/10707)).

### How comparable projects handle the upstream→downstream coupling

- **Terraform (tfplugindocs).** The provider binary is the source of truth; `terraform providers schema -json` is invoked to produce a schema JSON which then drives Markdown template rendering. The `tfplugindocs validate` subcommand is run in CI to catch drift between schema and checked-in docs ([tfplugindocs README](https://github.com/hashicorp/terraform-plugin-docs)). Importantly, `--providers-schema=<json>` lets tests skip the provider build entirely and pin docs to a specific schema snapshot — this is the pattern we want.
- **Pulumi.** A [package schema](https://www.pulumi.com/docs/iac/guides/building-extending/packages/schema/) is emitted from source and drives both SDK generation *and* documentation. "Publishing a component" automatically triggers doc generation from the schema ([Pulumi blog](https://www.pulumi.com/blog/registry-component-api-docs/)). The lesson: one schema drives many outputs; if the schema is invalid, no outputs are produced.
- **Backstage TechDocs.** Uses an "external builder" pattern — docs are generated by the project's own CI with `mkdocs build`, then published to object storage; the Backstage backend only *reads* the artifacts. Schema validation happens inside the generating repo, not the consumer ([TechDocs FAQ](https://backstage.io/docs/features/techdocs/faqs/), [TechDocs architecture](https://deepwiki.com/backstage/backstage/2.3-techdocs)).

### Fail-fast vs. partial-build decision

The dominant opinion in documentation pipelines: **fail fast on malformed input**. A partially-built reference is actively worse than no build, because downstream consumers (especially LLMs) will silently learn incomplete APIs. tfplugindocs errors on schema mismatch rather than emitting partial docs. The Singlestore pipeline lifecycle documents the rule concisely: a batch either succeeds as a whole or rolls back and is retried, with failed items marked `Skipped` and never processed again ([Singlestore pipelines](https://docs.singlestore.com/cloud/load-data/load-data-with-pipelines/pipeline-concepts/the-lifecycle-of-a-pipeline/)).

### Error quality: Zod-specific patterns

Zod's `ZodError.issues[]` carries `{code, path, message}` — the `path` array (e.g. `["modules", 37, "examples", 0, "code"]`) is specifically designed to pinpoint location ([Zod basics](https://zod.dev/basics), [Zod error formatting](https://zod.dev/error-formatting)). Production systems wrap this with [`zod-validation-error`](https://www.npmjs.com/package/zod-validation-error) or [`zod-error`](https://www.npmjs.com/package/zod-error) to produce single-line messages like `"Invalid email at \"user.email\""`. For a build script, concatenate `(file, zod-path, expected, received)` into each log line — this matches TypeScript's `file(line,col): error TSxxxx` format which GitHub Actions already annotates via its built-in TypeScript problem matcher.

### Recommendation
Embed `schemaVersion` in every source JSON file; pin a `schemaCompatibility` range in the build tool; in CI, (a) validate every source file against the Zod schema, (b) compare a hash of the compiled schema against a committed hash and fail on drift. Fail fast on any validation error; never produce a partial build.

---

## Area 3: Partial-Success and Error Handling in Batch Builds

### Failure policies — the three archetypes

Industry terminology ([Google Vertex AI PipelineFailurePolicy](https://cloud.google.com/dotnet/docs/reference/Google.Cloud.AIPlatform.V1/2.0.0/Google.Cloud.AIPlatform.V1.PipelineFailurePolicy?authuser=9)):

| Policy | Behaviour | Use when |
|---|---|---|
| **fail-fast** | Stop scheduling new work on first failure; let in-flight work finish | The output is only useful when complete (a reference manual; an index); any missing item invalidates the whole artifact |
| **fail-slow / continue-on-error** | Run all items; report all failures at end | Items are genuinely independent (independent linters; independent test suites) |
| **isolate-and-continue** | Quarantine bad inputs, mark them `Skipped`, proceed with the rest | Streaming/data pipelines where forward progress is more valuable than completeness |

Azure DevOps' `continueOnError: true` and Codefresh's `fail_fast` flag are concrete instances ([Codefresh discussion](https://app.getbeamer.com/codefreshio7974/ideas/en/continue-on-failure), [Azure pipelines](https://dotnet-helpers.com/devops/continue-azure-pipeline-on-failed-task/)).

For a documentation reference build: **fail-slow, then fail** is usually correct — run all 100 modules, *collect* all validation errors, then exit non-zero with the full list. This gives contributors "here are the 7 things wrong" rather than "fix #1, re-run, fix #2, re-run". This is also how TypeScript compiles: all errors in one pass, exit code 1 if any.

### Error-log design

Good build logs for contributors combine four pieces per error, in this order: (1) source file path, (2) JSON path / field, (3) what the schema expected, (4) what was received. This is what Zod already produces and what TypeScript/ESLint problem matchers consume in GitHub Actions ([GitHub Actions problem matchers](https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md)). Christopher Dignam's guide shows how to wire a custom matcher so build failures appear as PR annotations ([Problem matchers with GitHub Actions](https://christopher.xyz/2023/04/04/github-actions-problem-matchers.html)).

### "Build just this one version"

tfplugindocs supports `--ignore-deprecated` and other selectors ([tfplugindocs generate](https://github.com/hashicorp/terraform-plugin-docs)); Jest supports `--testNamePattern` for selective regeneration. The pattern is a `--only=<pattern>` / `--version=<id>` flag that filters both the input set and the output set. Importantly, selective builds should **not** touch unrelated output files (important for idempotence under concurrent iteration).

### Recommendation
Collect all per-file errors in one pass (fail-slow), then exit non-zero with a structured summary; expose `--only <module>`, `--version <v>`, `--fail-fast` flags; emit errors in a form a GitHub Actions problem matcher can parse (`path/to/file.json:fieldPath: expected X, got Y`).

---

## Area 4: Golden-File Testing for Build Output Stability

### Terminology and tooling

Golden-file, snapshot, and approval tests are synonyms. The output is persisted (the "golden" or "snapshot"), compared byte-for-byte on subsequent runs, and updated explicitly when behaviour changes intentionally ([Widgetbook glossary](https://docs.widgetbook.io/glossary/golden-tests), [Go `goldie` golden files](https://app.dosu.dev/3bbfc5b5-a855-41b3-955e-7576fa7a1016/documents/d0b0b387-ae7c-45b7-86b8-9c0d11e8b165), [testthat snapshot tests](https://testthat.r-lib.org/articles/snapshotting.html)).

For JS/TS the standard primitives are:

- **Vitest / Jest `toMatchSnapshot()` / `toMatchInlineSnapshot()`** — write `__snapshots__/*.snap` once, compare on every run, regenerate via `jest -u` or `vitest -u` ([Jest snapshot docs](https://jestjs.io/docs/snapshot-testing), [Vitest snapshot guide](https://blog.seancoughlin.me/mastering-snapshot-testing-with-vite-vitest-or-jest-in-typescript)).
- **`toMatchFileSnapshot()`** in Vitest for large/multi-line outputs that are unpleasant inline.

### Published best practices (from Jest's own docs)

Jest's official guidance ([Snapshot Testing · Jest](https://jestjs.io/docs/snapshot-testing)):

1. **Commit snapshots and review them as part of code review.** Treat them like any other code.
2. **Keep snapshots readable — focused, short.** Use `eslint-plugin-jest`'s `no-large-snapshots` to enforce this, and `snapshot-diff` for targeted comparisons.
3. **Never blindly regenerate.** The point is to fight the "just run `-u`" habit; every intentional change should be human-reviewed.

### Commit vs. generate-on-the-fly

Kent C. Dodds argues persuasively that committing *build artifacts* (`dist/`) to the default branch poisons diffs and blocks contributor PRs ([Why I don't commit generated files to master](https://kentcdodds.com/blog/why-i-dont-commit-generated-files-to-master)). However, **golden files are not build artifacts — they are test fixtures**, and should always be committed and reviewed.

For this project there is a useful distinction:
- `tests/__snapshots__/*.md` — small, focused per-feature fixtures → commit, review.
- `build/*.md` — the full render of all 100 modules → generally *do not* commit unless the project also publishes these files to consumers (as `anthropics/skills` does commit its `SKILL.md` files because those files *are* the product, see Area 10).

### Per-file golden vs single-file diff

For a 100-module reference, **one golden file per module** is the right choice. Rationale: a change to a single module's JSON should produce a one-file diff that is reviewable in 30 seconds. A single giant golden file would turn every small change into a 10,000-line diff, and reviewers will just `-u` through it — defeating the purpose.

### Update workflow

The canonical update flow across languages ([w3resource](https://www.w3resource.com/jest/snapshot-testing-with-jest.php), [CircleCI guide](https://circleci.com/blog/snapshot-testing-with-jest/)):

1. Developer makes an intentional change (template, schema, extractor).
2. Test suite fails with a diff.
3. Developer runs `npm test -- -u` (or reviews diffs in Vitest UI).
4. Developer commits *both* the code change and the updated `.snap` files in the same PR.
5. Reviewer inspects the snapshot diff to confirm the change is intentional and scoped.

### Examples from documentation-generation projects

- **`opnDossier`** uses `sebdah/goldie/v2` specifically to pin Markdown report output, JSON/YAML exports, and HTML diff outputs ([opnDossier golden files](https://app.dosu.dev/3bbfc5b5-a855-41b3-955e-7576fa7a1016/documents/d0b0b387-ae7c-45b7-86b8-9c0d11e8b165)).
- **tfplugindocs** uses `testscript` fixtures under `tfplugindocs/testdata/scripts` — each script is a self-contained build+assert ([tfplugindocs contributing](https://github.com/hashicorp/terraform-plugin-docs/blob/main/README.md)).

### Recommendation
One golden file per module + one for the consolidated index, stored in `tests/__fixtures__/`; use Vitest `toMatchFileSnapshot()`; add a `npm run test:docs -- -u` script; include in the PR checklist "verify snapshot diffs are intentional and minimal".

---

## Area 5: Rendering Template Systems

### Approaches in the field

| Approach | Example | Trade-offs |
|---|---|---|
| **String concatenation / template literals** | Small rendering utilities in Astro blog llms.txt, Docusaurus plugin internals | Fast (up to 4× Handlebars per [CodeBlocQ benchmark](https://www.codeblocq.com/2016/05/Performance-Comparison-ES6-Template-Literals-vs-HandleBars-in-Node/)), type-safe with TypeScript, no new DSL. But awkward for deeply nested conditionals. |
| **Handlebars / Mustache** | Jekyll themes, OpenAPI Generator templates | Logic-less by design keeps templates clean; huge ecosystem; separation of concerns. Trade-off: you invent custom helpers and lose TS types. |
| **Nunjucks / Liquid** | MkDocs, Jekyll, Shopify | More logic permitted; filters; inheritance. Heavier. |
| **JSX-for-strings (MDX, kitajs/html)** | Docusaurus MDX, modern API doc tools | Leverages React knowledge, composable; requires a compile step. |
| **Go templates** | tfplugindocs (`{{ .SchemaMarkdown }}`, `{{ codefile "terraform" "examples/..." }}`) | Ubiquitous in Go tooling; limited for complex layouts. |

Keith Cirkel's experience report concludes that template literals are fine for small per-fragment renderers, but at scale you end up re-inventing Handlebars' partials with function calls ([Keith Cirkel on template literals](https://www.keithcirkel.co.uk/es6-template-literals/)). The `whilenot.dev` survey of TypeScript code-gen approaches reaches the same conclusion: template engines buy you readability for large outputs at the cost of a second language ([TypeScript source code generation](https://blog.whilenot.dev/posts/typescript-source-code-generation/)).

### Testability

Whether you use template literals or a template engine, the tractable unit is a **pure function** `(schemaObject) → markdownString`. This is what `tfplugindocs` exposes through `--providers-schema=<json>` — the schema is decoupled from the binary so tests can pin the input and assert the output.

### The "empty section" problem

This is where templates tend to generate ugly output: an empty `## Examples` section, a `## Parameters` with an empty list, or worse, "Parameters: undefined". Established patterns:

1. **Conditional blocks at the template boundary.** Handlebars `{{#if examples}}...{{/if}}` / `{{#if examples.length}}...{{/if}}`. Handlebars treats `[]`, `undefined`, `null`, `""`, `0`, `false` as falsy uniformly ([Handlebars conditionals guide](https://idealteamgroup.atlassian.net/wiki/x/QQBwDg)).
2. **Empty-to-absent normalization in the schema layer.** Zod's `.optional().transform(v => v ?? undefined)` removes empty arrays before they reach the template, so the template only needs to check existence not length.
3. **Render-and-prune.** Render the full tree, then post-process to collapse heading levels when a section below them is empty. Used by OpenAPI Generator through Mustache inverted sections `{{^hasRequiredVars}}...{{/hasRequiredVars}}` ([OpenAPI Generator templates](https://openapi-generator.tech/docs/templating/)).

Redoc handles the equivalent "no description" / "no example" / "no security" cases by either omitting the panel entirely or showing a small pull-right placeholder rather than an empty block ([Redoc README](https://github.com/Redocly/redoc)). The lesson: **omit, never emit empty sections** — empty sections are a strong smell to both humans and LLMs that something is missing.

### Recommendation
Use a small number of pure `renderX(data): string` functions in TypeScript with template literals and composable helpers (`renderSection(heading, body)` that returns `""` when body is empty). Reserve Handlebars/Nunjucks only if template editing by non-developers is a goal.

---

## Area 6: File I/O and Filesystem Discipline in Build Scripts

### Atomic writes

The hardened pattern — write to a temporary sibling file, `fsync`, then `rename` onto the target — is implemented in npm's [`write-file-atomic`](https://github.com/npm/write-file-atomic) (used by npm itself). Keys details worth copying:

- The temp name uses `filename + "." + murmurhex(__filename, process.pid, ++invocations)` so concurrent writes to the same target don't collide ([write-file-atomic README](https://github.com/npm/write-file-atomic/blob/main/README.md)).
- The rename step *must* cross the same filesystem or it silently degrades to copy+unlink and loses atomicity ([`atomic-write` caveats](https://www.npmjs.com/package/atomic-write)).
- On error, the partial temp file is unlinked so failed runs don't leave debris.

Ruby/ActiveSupport and Python's `os.replace` embody the same contract. For a build that writes 100+ Markdown files, atomic writes prevent a Ctrl-C mid-build from corrupting half-written files that would then pass validation because they parse as valid but truncated Markdown.

### In-memory filesystems for tests

[`memfs`](https://github.com/streamich/memfs) (streamich) is the standard: it implements Node's `fs` module entirely in memory with JSON volume I/O (`vol.fromJSON({"./README.md": "..."})`, `vol.toJSON()`). The typical Jest setup is:

```js
// __mocks__/fs.js
module.exports = require('memfs').fs;
```

Combined with `unionfs`, a test can mount the real `fs` for read-only fixtures and `memfs` for writes, so the test never touches disk ([memfs docs](https://github.com/streamich/memfs), [Testing with memfs tutorial](https://medium.com/nerd-for-tech/testing-in-node-js-easy-way-to-mock-filesystem-883b9f822ea4)).

### Clean-before-build vs incremental

For a documentation reference build that must be reproducible and idempotent, **clean-before-build** is the right default. Rationale: an incremental build has state (what was built last time, timestamps, hashes), state is where non-determinism hides, and the output set is small (~100 files, sub-second writes). Docusaurus exposes `docusaurus clear` for exactly this reason ([Consensys Docusaurus guide](https://docs-template.consensys.io/create/run-in-development)). An incremental path (`--only`) is still valuable for dev iteration, but the CI build should `rm -rf build/` first.

### Cross-platform paths

Node's `path` module behaves differently on Windows vs POSIX. Two firm rules ([Node.js path docs](https://nodejs.org/api/path.html), [Cross-platform Node guide](https://github.com/ehmicky/cross-platform-node-guide/blob/main/docs/3_filesystem/file_paths.md)):

- **Inside emitted Markdown (links, frontmatter paths, relative refs), always use `path.posix`.** Backslashes in a Markdown link will break on every non-Windows reader. The Office 365 CLI team specifically moved from `path.join` to `path.posix.join` for exactly this bug ([CloudAppie on Node POSIX paths](https://www.cloudappie.nl/node-posix-paths/)).
- **For real filesystem operations (reading source, writing output), use `path.join` (platform-aware).**

Also watch: **case sensitivity.** Linux FS is case-sensitive, macOS HFS+/APFS default is case-*insensitive*, Windows NTFS is case-*preserving but insensitive*. If your 100 module names could collide under case folding (`WebSocket.json` vs `websocket.json`), you get different behaviour on different devs' machines. Normalize slugs to lowercase+kebab-case.

### Recommendation
Use `write-file-atomic` for every output; clean output directory before full builds; use `path.posix` for all strings that will appear in Markdown; use `memfs` for unit tests; lowercase+kebab-case all filenames.

---

## Area 7: Build Orchestration and CLI Ergonomics

### Conventions for flags and behaviour

Community consensus — from docopt, the POSIX CLI guide, and practitioner write-ups ([CLI best practices](https://hackmd.io/@arturtamborski/cli-best-practices), [Caduh CLI ergonomics](https://www.caduh.com/blog/make-your-cli-a-joy-to-use)):

- `-h/--help`, `-V/--version` — always supported.
- `-v/--verbose`, `-q/--quiet` — adjust output detail.
- `-n/--dry-run` — show what would happen without writing.
- `--json` — machine-readable output to stdout; all chatter to stderr.
- `--no-color`, respect `NO_COLOR` env var, detect `!process.stdout.isTTY` and auto-disable colors and spinners.
- `--fail-fast` — stop on first error for iterative debugging.
- Precedence: CLI flags > env vars > config file > defaults.
- Progress/diagnostics → stderr; parseable results → stdout.

### Exit code conventions

The de-facto discipline ([Microsoft Fabric CLI exit codes](https://microsoft.github.io/fabric-cli/exit-codes.html), [CLI best practices](https://hackmd.io/@arturtamborski/cli-best-practices)):

- `0` — success.
- `1` — generic failure.
- `2` — usage error (bad flags, shell built-in misuse).
- `3–9` — project-specific (e.g. `3` = validation failure, `4` = I/O failure, `5` = schema mismatch) if you need to distinguish. Document them.
- Avoid exit codes ≥ 125 (shell-reserved) and 128 + signum (signal-killed).

### Node CLI libraries

Commander (declarative, framework-y) vs yargs (config-object, more flexible) vs yargs-parser (bring-your-own-dispatch) ([Commander vs yargs-parser comparison](https://npm-compare.com/commander,yargs-parser), [Yargs vs Commander deep dive](https://medium.com/@sohail_saifi/command-line-argument-parsing-yargs-vs-commander-and-why-you-should-care-e9c8dac1fcc5)). For a single-binary documentation builder, Commander is typical. For a build that is embedded inside another toolchain, yargs-parser keeps the dependency surface small.

### Progress reporting

The pragmatic rule: short renders (< a few seconds) don't need anything; medium renders want an animated spinner (but only when TTY); long renders (>30s) want a bar with `current/total`. When running in CI, downgrade to plain line-by-line output — spinners corrupt CI logs. Always send progress to stderr so `build > out.json` still works.

### GitHub Actions / CI integration

The two useful primitives:

1. **Problem matchers** (`.github/problem-matchers/docs.json`) scan stdout/stderr for a regex and convert matches into PR annotations with file/line ([actions/toolkit problem matchers](https://github.com/actions/toolkit/blob/main/docs/problem-matchers.md)). Note the hard limits: **10 annotations per step, 50 per job** — above that only a random subset is shown ([Problem Matcher wrapper](https://github.com/marketplace/actions/problem-matcher-wrapper-linter-errors-as-annotations-even-for-fork-prs)).
2. **Workflow commands** — `echo "::error file=x.json,line=1::Schema mismatch"` emits an annotation directly without a matcher.

Emit your build errors in a format the TypeScript problem matcher (shipped by `actions/setup-node`) already understands: `file(line,col): error CODE: message`. You get annotations for free.

### Recommendation
Commander-based CLI with `--version`, `--verbose`, `--dry-run`, `--fail-fast`, `--only`, `--json`; exit code 0 success / 1 generic / 2 usage / 3 validation / 4 I/O; progress to stderr, suppressed under `!isTTY`; emit validation errors in `path:line:col: error: msg` form so GitHub annotates PRs automatically.

---

## Area 8: Consolidated Index Generation

### What other projects build

- **llms.txt / llms-full.txt**: Mintlify, Fern, GitBook auto-host both a short file listing every page with a one-sentence description, and a long file with full content concatenated ([Fern llms.txt](https://buildwithfern.com/learn/docs/ai-features/llms-txt), [Mintlify llms.txt](https://www.mintlify.com/docs/ai/llmstxt)). Fern reports this reduces AI-tool token consumption by 90%+. Mintlify lists pages alphabetically by repository order and appends `.md` extensions so tools can fetch the markdown directly.
- **DocSearch (Algolia)**: crawls the rendered site and builds a flat index of `{url, hierarchy.lvl0..lvl6, content, anchor}` records — one record per chunk, never per page, because search relevance requires subsection granularity ([DocSearch index building](https://docsearch.algolia.com/docs/legacy/how-do-we-build-an-index/), [DocSearch required config](https://docsearch.algolia.com/docs/required-configuration/)).
- **lunr.js pre-built index**: the canonical static-site search pattern is to build the index at build time (Node script that reads all documents, adds to `lunr.Builder`, calls `JSON.stringify(idx)`), commit `index.json`, load it in the browser as a serialised index ([Lunr pre-building indexes](https://lunrjs.com/guides/index_prebuilding.html)). Lunr 2.x indexes are **immutable after build** — this forces you into the build-once-serve-many model that is the right fit for a deterministic pipeline.
- **Meilisearch / TypeSense**: runtime servers; both have `instant-meilisearch` and similar layers that point at an index built by a one-shot import script ([Meilisearch migration from Algolia](https://meilisearch.com/docs/learn/update_and_migration/algolia_migration)).
- **Backstage TechDocs** uses Material-mkdocs's `search_index.json` — generated by `mkdocs build`, served statically ([mkdocs-techdocs-core](https://github.com/backstage/mkdocs-techdocs-core)).

### Flat index from hierarchical data

The universal pattern: walk the tree depth-first, emit one record per leaf-or-heading, preserve the ancestor hierarchy as a `lvl0..lvlN` array. This is literally the DocSearch schema and is the right model for LLM-consumable indexes too.

### Persistence vs runtime-compute

For 100 JSON files → 100 Markdown files + 1 index, the right choice is unambiguously **build-time persisted**: runtime indexing in Node would add 100–500ms cold-start to every agent invocation and reintroduce non-determinism. Lunr itself recommends pre-building for static docs ([Lunr getting started](https://lunrjs.com/guides/getting_started.html)).

### Preventing index drift

Two complementary checks, both cheap:

1. **Counting invariants in CI.** After build, assert: `index.entries.length === glob('build/**/*.md').length`. This catches "oops, rename broke the index" in one line.
2. **Statistical canaries.** Compare against a committed "expected shape" — e.g. `if current_count < 0.8 * expected_count: fail`. This is the pattern Jepsen/other validation pipelines use: a hard lower bound plus a "suspiciously small" soft bound. The spirit is "80% fewer items than expected, something is wrong" mentioned in the query — implement it as a literal threshold check that prints the diff and fails.

### Recommendation
Emit a single `index.json` with one record per module, fields `{id, version, name, slug, summary, path, keywords, lvl0..lvlN}`. Alphabetize records. Validate `index.length === markdown_files.length` and `index.length >= 0.8 * previous_index.length` in CI. Use `json-stringify-deterministic` so the file's sha256 is stable.

---

## Area 9: Multi-Version Support

### Folder-per-version is the dominant model

- **Docusaurus** copies `docs/` into `versioned_docs/version-<X>/` at cut-time; each version is a full snapshot, independent, never fallback-linked to a "master" copy. `versions.json` is the registry ([Docusaurus versioning](https://docusaurus.io/docs/versioning), [Docusaurus v2 migration](https://docusaurus.io/docs/migration/v2/versioned-sites)). The "next"/dev version lives in `docs/`, released versions live in `versioned_docs/version-X/`.
- **MkDocs + `mike`**: deploys versioned sites to branches or to a single gh-pages branch at `/<version>/`.
- **SAP Cloud SDK** uses Docusaurus multi-instance to handle two products with *independent* version streams — separate plugin instances, separate `versions` arrays, separate folder trees ([SAP Cloud SDK versioning](https://deepwiki.com/SAP/cloud-sdk/1.2-documentation-versioning-strategy)).

The lessons that generalize:
- **Snapshot, don't diff.** Don't try to store "version 2 is version 1 with these 3 files different"; that's what Docusaurus v1 did and they explicitly dropped it in v2 because the mental model was too brittle ([Docusaurus v2 versioning blog](https://docusaurus.io/blog/2018/09/11/Towards-Docusaurus-2)).
- **One JSON file lists supported versions.** Everyone standardizes on a top-level `versions.json` that drives the build matrix and the version-selector UI.
- **Deleted versions are removed explicitly.** Docusaurus requires manually deleting `versioned_docs/version-X/` and `versioned_sidebars/version-X-sidebars.json` ([Consensys Docusaurus versioning](https://docs-template.consensys.io/configure/versioning)).

### Branch-per-version vs folder-per-version

Read-the-Docs tags commits; Docusaurus uses folders. For deterministic build pipelines, **folder-per-version is strongly preferred** because:
- One build pass produces all versions; no CI matrix fan-out.
- Cross-version diffs are local (`git diff versioned_docs/`).
- Reproducibility checks work across all versions in one run.

### "New version arrives" workflow

The Docusaurus pattern is representative:
1. Content lives in `docs/` (the "next" version) during development.
2. When `v1.5` ships: `npm run docusaurus docs:version 1.5` copies `docs/` → `versioned_docs/version-1.5/`, prepends `"1.5"` to `versions.json`.
3. `docs/` continues as "next".
4. CI rebuilds all versions; idempotent.

For an LLM-skills target the equivalent is a build script with `npm run docs:cut -- --version=1.5` that copies the current source JSON set into `sources/version-1.5/`, adds to a `versions.json`, and runs the full build.

### Recommendation
`sources/version-<X>/*.json` for input; `build/version-<X>/*.md` for output; a top-level `versions.json` lists supported versions and is the single source of truth for the build matrix; a `docs:cut` script snapshots current → new version atomically; deleting a version is one-shot (`rm -rf sources/version-X build/version-X`).

---

## Area 10: Documentation for AI Consumption

### Emerging standards

- **llms.txt** (Jeremy Howard / Answer.AI, Sept 2024) — a Markdown file at site root with a specific structure: H1 project name, blockquote summary, H2 sections of `[Link](url): description` lines, optional `## Optional` section ([llmstxt.org documentation](https://llmstxtgenerator.org/llmstxt-documentation), [LLMs.txt explained](https://medium.com/data-science/llms-txt-explained-414d5121bcb3)). `llms-full.txt` is the same structure but embeds full content inline.
- **Agent Skills (Anthropic, Dec 2025)** — now an "open standard" adopted by OpenAI Codex CLI and ChatGPT ([Anthropic skills announcement](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), [OpenAI Codex skills](https://developers.openai.com/codex/skills)). A skill is a directory:
  ```
  skill-name/
    SKILL.md        # required: YAML frontmatter + Markdown body
    scripts/        # optional: deterministic automation
    references/     # optional: docs loaded on demand
    assets/         # optional: templates / icons
  ```
  SKILL.md frontmatter requires `name` and `description` ([Claude Code skills](https://code.claude.com/docs/en/skills), [Claude API skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)).

### Progressive disclosure — the key architectural insight

Anthropic's official best-practices and the `anthropics/skills` repo both document a **multi-tier loading model** that dictates how reference docs should be structured ([Claude API skill best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), [Progressive disclosure pattern deep dive](https://deepwiki.com/microsoft/agent-skills/5.3-progressive-disclosure-pattern), [Simon Willison on Codex skills](https://feeds.simonwillison.net/2025/Dec/13/openai-codex-cli)):

| Tier | What loads | Budget |
|---|---|---|
| **Advertise** | `name`, `description` only | ~100 tokens per skill; always in context |
| **Activate** | Full SKILL.md body | < 5,000 words recommended, < 500 lines ideal |
| **Reference** | Files in `references/` | Loaded only when a specific file link is followed |
| **Execute** | Scripts in `scripts/` | Executed, never loaded into context |

The explicit guidance from Anthropic ([skill-creator SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)):
- **Keep SKILL.md under 500 lines / 5,000 words.** Above that, split into `references/`.
- **Descriptions must be "pushy."** Include explicit triggers: "Use when the user mentions X, Y, or Z — *even if they don't explicitly ask for…*".
- **"SKILL.md is a table of contents, not an encyclopedia."** The body points at `references/*.md` with explicit instructions on when to load each.
- **Anti-pattern:** putting activation conditions in the body. The body loads *after* the trigger fires, so conditions in the body can't be read before activation.

### Markdown structure LLMs parse well

Synthesized from the official best-practices doc, Mintlify/Fern's llms.txt generators, and analysis of `anthropics/skills`:

1. **YAML frontmatter** with `name` + `description` (required). Mintlify pulls from `description` or `subtitle` frontmatter into the llms.txt summary ([Fern llms.txt frontmatter](https://buildwithfern.com/learn/docs/ai-features/llms-txt)). This gives ~85% token reduction vs. LLMs scanning full bodies to decide relevance ([Frontmatter-First guide](https://medium.com/@michael.hannecke/frontmatter-first-is-not-optional-context-window-survival-for-local-llms-in-opencode-15809b207977)).
2. **Single H1 title** at the top of the body, immediately after frontmatter.
3. **Strict heading hierarchy** (H1 → H2 → H3, no skipping). LLMs and llms.txt generators rely on this for table-of-contents extraction.
4. **Short paragraphs; fenced code blocks with language tags.** Backtick-fenced with `js`, `ts`, `bash` — untagged blocks confuse syntax-aware tools.
5. **Tables for parameter lists** — more compact than bulleted `name: description` and easier to scan.
6. **No emojis, no horizontal rules, no HTML** — they don't add semantic information and cost tokens.
7. **Link to related content with relative paths** that resolve to `.md` files directly (Mintlify/Fern both emit `.md` suffixes in llms.txt links so tools fetch the Markdown, not the HTML).
8. **"When to use" section first.** Especially for skill-consumed docs — put activation-relevant information at the top.

### Anthropic's own skill structure, observed

The `anthropics/skills` repo demonstrates the pattern at production scale ([anthropics/skills README](https://github.com/anthropics/skills/blob/main/README.md)):

- Each skill is a flat directory with `SKILL.md` + optional subdirectories.
- The `template-skill` is minimal: frontmatter (`name`, `description`), H1 title, brief intro, `## Examples` (bulleted), `## Guidelines` (bulleted).
- Complex skills (e.g. `skill-creator`) split into `SKILL.md` + `agents/grader.md`, `agents/comparator.md`, `agents/analyzer.md`, `references/schemas.md` — the SKILL.md explicitly says "Read `agents/grader.md` when you need to evaluate assertions."
- Document skills (`docx`, `pdf`, `pptx`, `xlsx`) bundle `FORMS.md`, `reference.md`, `examples.md` and `scripts/` with Python helpers — loaded selectively.

### Implications for a JSON → Markdown pipeline targeting Agent Skills

1. **Each module → a standalone file.** Not one giant reference. Each file should be independently meaningful, because skills load files one at a time on demand.
2. **Frontmatter is mandatory.** Every file needs `name`, `description`, `version`. The description is the unit of discovery.
3. **Under 500 lines per file.** Split large modules.
4. **Consolidated index = the llms.txt analog.** Put short descriptions + relative paths in one file that acts as the entry point a skill's SKILL.md references.
5. **No timestamps in output.** The files will be diffed, hashed, and cached by agent tooling; stable output is how you avoid spurious "did docs change?" reloads.

### Recommendation
Emit per-module files with YAML frontmatter (`name`, `description`, `version`, `slug`), single H1, strict H2 sub-sections (`## Overview`, `## Parameters`, `## Examples`, `## Errors`), fenced code with language tags, no timestamps, no empty sections. Emit `index.json` listing every module, its description, and its relative Markdown path. Structure the folder hierarchy to match Anthropic's skill model (`skill-name/SKILL.md` + `references/*.md`) so the output can drop straight into a skill directory.

---

## Cross-Cutting Recommendations for a Node/TypeScript Build Script

Pulling everything together for a ~100 JSON → Markdown pipeline, version-isolated, with a consolidated index, targeting Agent Skills consumption:

| Concern | Recommendation |
|---|---|
| Input | `sources/version-<X>/<module>.json`, each with `schemaVersion`; validated with Zod at build start |
| Schema drift | Commit a hash of the compiled Zod schema; CI fails on drift; CI parses every source file through Zod |
| Failure policy | Fail-slow within one build pass (collect all errors), then exit non-zero with a structured summary; fail-fast is a flag, not the default |
| Output | `build/version-<X>/<module>.md` + `build/version-<X>/index.json`; clean before full build |
| Ordering | Alphabetical by slug for files; sorted keys for JSON via `json-stringify-deterministic` |
| Determinism | No timestamps in output; pinned Node version; locale=C, TZ=UTC in CI; `SOURCE_DATE_EPOCH` respected if used |
| Verification | CI build-twice-and-diff job; index length invariant (`index.length === files.length`); 80% statistical canary |
| Atomic writes | `write-file-atomic` for every output file |
| Paths | `path.posix` for anything emitted into Markdown; `path.join` for FS ops; lowercase+kebab-case slugs |
| Rendering | Pure TS functions with template literals; `renderSection(heading, body)` collapses empty sections |
| Tests | Vitest `toMatchFileSnapshot()` per module + index; `memfs` for unit tests; commit snapshots, review in PRs |
| CLI | Commander; `--version`, `--verbose`, `--dry-run`, `--fail-fast`, `--only <slug>`, `--json`; exit codes 0/1/2/3/4; progress to stderr |
| CI integration | Emit errors in `file:line:col: error: msg` form so built-in problem matchers annotate PRs |
| Versioning | Folder-per-version in input and output; top-level `versions.json`; `docs:cut` script snapshots next → new version |
| LLM-friendly structure | YAML frontmatter (`name`, `description`, `version`) on every file; < 500 lines per file; strict H1→H2→H3; no empty sections; no emojis; relative `.md` links; `index.json` acts as the llms.txt-equivalent |

### Failure modes production teams have hit (and to design against)

- Silent non-determinism from unsorted `readdir()` / hash iteration — caught only after auditor asks "why does the gh-pages diff differ between runs?"
- Partial build accepted as success because fail-slow never exited non-zero (the batch returned counts, not a result).
- Snapshot tests regenerated blindly via `jest -u` with no review, making them regression-proof theatrically but not functionally.
- Empty sections emitted as `## Examples\n\n` and LLMs treating the heading as an authoritative "no examples exist" signal.
- Committing build artifacts to the default branch, polluting git blame and blocking contributor PRs.
- `path.join` producing backslashes in Markdown links on Windows-built CI.
- Skill descriptions too vague ("Documentation for X") so the agent never triggers the skill.
- SKILL.md body > 5,000 words so agents either skip it or truncate mid-workflow.

These are the specific shapes the specification document should pre-empt with explicit requirements.