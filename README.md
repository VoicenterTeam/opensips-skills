<p align="center"><img src="docs/OpensipsSkillsLogo.png" alt="OpenSIPs Skills" width="240"></p>

# opensips-skills

> Claude Code plugin providing two Agent Skills for working with OpenSIPs: configuration authoring and security review.

[![CI](https://github.com/VoicenterTeam/opensips-skills/workflows/CI/badge.svg)](https://github.com/VoicenterTeam/opensips-skills/actions)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)

## What this is

OpenSIPs is twenty years old and runs some of the world's most demanding real-time communication infrastructure — carrier networks, contact centers, CPaaS platforms, enterprise PBXes. It has hundreds of modules, a domain-specific scripting language, and documentation that spans thousands of pages across multiple versions. Ask any general-purpose LLM to write you an `opensips.cfg` and the result looks right and is subtly broken: a parameter name from the wrong version, a function signature borrowed from a sibling SER-lineage project, a pseudo-variable that does not exist. The output compiles, runs, and fails in production.

This is a knowledge problem, not a model problem. Training data conflates OpenSIPs with other projects descending from the SIP Express Router (SER) lineage and conflates syntax across versions that have drifted over two decades. Without a grounded reference, the model has no way to tell the difference. `opensips-skills` solves this by grounding Claude in version-specific, OpenSIPs-authoritative documentation. Every function signature, parameter, pseudo-variable, MI command, and module dependency is mirrored from upstream extraction and rendered as Markdown reference files Claude reads on demand.

The plugin ships two skills:

- **`opensips-config`** — entry point for all OpenSIPs configuration work: authoring and editing `opensips.cfg` route scripts, looking up module exports, and answering questions about cfg syntax. Owns the loadmodule-scan workflow: read `cfg-format.md`, scan `consolidated.json`, then read each loaded module's per-module reference before answering.
- **`opensips-security-advisor`** — reviews `opensips.cfg` files for security issues across 12 vulnerability families (authentication, injection, MI exposure, TLS posture, DoS defense, relay and routing, identity spoofing, STIR/SHAKEN, media, dispatcher and load-balancer, tracing and logging, configuration hygiene). Read-only. Produces a Markdown report with severity-ranked findings, cited remediations, and explicit abstention when confidence is insufficient. Reads `opensips-config`'s reference data for identifier sanity-checking. See [ADR-014](docs/architecture/adr/014-security-advisor-v1-single-skill.md) for the design rationale.

Version coverage is dynamic. As of this release the plugin covers OpenSIPs **3.4, 3.5, 3.6, and 4.0**. New versions arrive by dropping a folder under `data/` — no code change required.

The audience this is built for: SIP and VoIP engineers who already know OpenSIPs — carriers, ITSPs, contact centers, CPaaS operators — and want a pair programmer that produces a working `request_route` in sixty seconds instead of twenty minutes, without the silent bugs that come from LLM hallucination. A secondary audience is engineers new to OpenSIPs who want to try it: every answer cites a real reference file they can read themselves, so the plugin doubles as a guided experience.

## Install

The plugin runs inside Claude Code. The two install paths:

```bash
# Via the Claude Code plugin marketplace (once published)
/plugin marketplace add VoicenterTeam/opensips-skills
/plugin install opensips@opensips-skills

# Or, locally for development
claude --plugin-dir /path/to/opensips-skills/plugins/opensips
```

After installation, run `/skills` inside Claude Code to confirm both `opensips-config` and `opensips-security-advisor` are listed. The skills do not need to be invoked by name — they activate automatically when a prompt mentions the concerns each one targets (configuration work for the first, security review for the second). There is no per-version install step; the plugin ships every supported version's reference tree in one package (3.4, 3.5, 3.6, 4.0) and resolves the active version from the prompt at trigger time.

## Quick example

**Prompt:**

> "I'm on OpenSIPs 4.0. Write me a `request_route` that loads `tm` and `registrar`, authenticates inbound REGISTER via `auth_db`, and stores location."

**What happens behind the scenes:**

- `opensips-config` activates because the prompt names `opensips.cfg` concerns and a route block. It follows the loadmodule-scan workflow: reads `references/4.0/cfg-format.md` to ground in the cfg structure, reads `references/4.0/consolidated.json` for the module index, then reads `references/4.0/modules/tm.md`, `references/4.0/modules/registrar.md`, and `references/4.0/modules/auth_db.md` to ground the function signatures, plus `references/4.0/core/variables.md` for the pseudo-variable list. For example, the skill confirms that `www_authorize` (not `www_authenticate` from a sibling project) is the OpenSIPs name, and that `auth_db.calculate_ha1` takes an integer (`1`), not the boolean keyword some sibling projects accept.

**The response includes a config like:**

```
loadmodule "tm.so"
loadmodule "registrar.so"
loadmodule "auth.so"
loadmodule "auth_db.so"
loadmodule "usrloc.so"
loadmodule "sl.so"

modparam("auth_db", "db_url", "mysql://opensips:pw@localhost/opensips")
modparam("auth_db", "calculate_ha1", 1)
modparam("auth_db", "load_credentials", "rpid")

request_route {
    if (is_method("REGISTER")) {
        if (!www_authorize("", "subscriber")) {
            www_challenge("", "auth");
            exit;
        }
        if (!save("location")) {
            sl_reply_error();
        }
        exit;
    }
    # ... in-dialog and call routing below
}
```

**Plus a short narrative** explaining what each block does and why each function call is the one chosen — `www_authorize` for REGISTER (the registrar is the challenger), `$authattr` read directly rather than through a sibling-project accessor pattern, `save("location")` paired with an explicit error reply on failure. If the user follows up with "now suggest flood protection," `opensips-config` reads `references/4.0/modules/pike.md` and `references/4.0/modules/ratelimit.md` and proposes `loadmodule "pike.so"` plus `pike_check_req()` early in `request_route`.

The whole exchange takes one prompt and one response. The skill activates automatically; the user does not invoke it by name. Every identifier in the response — function names, parameter names, pseudo-variables, module names — is checked against `references/4.0/` before it is emitted.

## A second example: a pure reference lookup

Not every prompt needs the full authoring flow. A reference-only question takes a different path:

**Prompt:**

> "On OpenSIPs 3.5, what does `dispatcher`'s `ds_select_dst` function take as arguments, and which algorithm codes are valid?"

**What happens:**

- `opensips-config` activates because the prompt names a specific module (`dispatcher`) and asks about an exported function.
- The skill consults `references/3.5/consolidated.json` to confirm `ds_select_dst` is exported by `dispatcher` and to find the per-module reference path. It then reads `references/3.5/modules/dispatcher.md` for the full signature, the algorithm-code list, the route-block availability, and the relevant `modparam(...)` entries (`ds_probing_mode`, `ds_ping_method`, partition setup).
- The answer quotes signatures verbatim from the reference, lists each algorithm code with its distribution semantics, and notes the route blocks where the function is callable. The answer is grounded in 3.5 specifically — if the user later switches to 3.6 or 4.0, the same prompt re-runs the lookup against `references/3.6/` or `references/4.0/`.

This is the router-index pattern in practice. The skill's SKILL.md is a catalog and a set of lookup rules; the substantive content lives in the per-module reference file. Claude reads what is needed, when it is needed, and answers from the reference rather than from priors.

## What you can ask the plugin to do

The skill covers the bulk of day-to-day OpenSIPs work that previously required deep documentation diving. A non-exhaustive list:

- **Authoring routes.** Registrars, stateful proxies, NAT traversal, digest authentication, dispatcher load balancing, dynamic routing, dialog tracking, accounting, header manipulation, loose record routing, user location lookup. Each pattern is grounded in the relevant per-module reference and produces working OpenSIPs syntax for the active version — not generic boilerplate.
- **Looking up exports.** "What functions does `dialog` export?" "What parameters does `dispatcher` take?" "Which module owns `t_relay`?" "What does `$dlg_val(name)` return?" The router-index pattern reads the consolidated index for the source, then reads the per-module file for the answer.
- **Reviewing pasted configs.** Paste an `opensips.cfg` fragment and ask for a refactor, an extension, or a sanity check. The skill cross-references every named function, pseudo-variable, and module against the active version's reference set; identifiers that do not match are flagged with a request for clarification rather than silently accepted.
- **Cross-version work.** State the version explicitly ("I'm on 3.4" or "I'm on 4.0") and the answer pulls from that version's reference tree. The plugin does not blend versions; if you ask about a function that exists in one version but not another, it tells you which.

What the plugin does **not** do: it does not write configs for sibling SER-lineage projects, does not connect to a live OpenSIPs server, does not run a config in a sandbox, and does not develop new C modules. Those are legitimate future capabilities that fall outside this project's v1 scope.

## How it works

```
Upstream extraction project           This project (opensips-skills)
opensips-docs-collector  ──────►   data/{version}/
  produces JSON per version              core/, modules/, guides/
                                         │
                                         │ npm run build (deterministic)
                                         ▼
                                   plugins/opensips/skills/
                                     opensips-config/       (authoring + reference)
                                       references/{version}/
                                         cfg-format.md      (hand-authored)
                                         ser-lineage-notes.md (hand-authored)
                                         modules-index.md   (generated)
                                         core/*.md          (generated)
                                         modules/*.md       (generated)
                                         guides/*.md        (generated, where upstream provides)
                                         consolidated.json  (lookup)
                                     opensips-security-advisor/   (security review, hand-authored)
                                       SKILL.md
                                       references/
                                         workflow.md            (procedural spine)
                                         output-format.md       (finding shape + Markdown report)
                                         taxonomy.md            (severity ladder, L1/L2 profiles)
                                         taint-model.md         (sources/sanitizers/sinks)
                                         rules/<family>/        (58 rules in 12 families)
                                         version-notes/         (per-version CVE inventory)
                                         knowledge/             (vuln reference, sanitizer registry)
```

Data flows in one direction. The upstream `opensips-docs-collector` project extracts OpenSIPs documentation per version and emits validated JSON. This project mirrors that JSON under `data/`, validates it against locally mirrored Zod schemas (with a SHA-256 hash check that fails fast on contract drift), and renders two Markdown families: per-item files for modules (one Markdown per module) and aggregated files for core types (variables, operators, statements, transformations, flags, parameters, async, events, MI commands, statistics, functions, route blocks). Where the upstream extraction provides them, installation/configuration/syntax guides are rendered alongside. A consolidated JSON index per version provides fast lookup keyed by function name, pseudo-variable, MI command, parameter-by-module, and a `moduleDependencies` graph.

`opensips-config` owns the authoring and reference surface: route-block decisions, NAT and authentication patterns, dispatcher and dialog setup, the procedural shape of an `opensips.cfg`, and all per-module reference data. The loadmodule-scan workflow — read `cfg-format.md`, read `consolidated.json` for the module index, then read each loaded module's per-module reference file — grounds every signature, parameter, and pseudo-variable in version-correct content. The skill is **version-isolated** per [ADR-003](docs/architecture/adr/003-version-isolated-folders.md) because OpenSIPs identifiers drift between releases and answers must be unambiguous about the active version.

`opensips-security-advisor` is the security review surface, activated in v1.1.0 per [ADR-014](docs/architecture/adr/014-security-advisor-v1-single-skill.md). It carries 58 rules across 12 vulnerability families (authentication, injection, MI exposure, TLS posture, DoS defense, relay and routing, identity spoofing, STIR/SHAKEN, media, dispatcher and load-balancer, tracing and logging, configuration hygiene). Read-only — it produces a Markdown report with severity-ranked findings, cited remediations, and explicit abstention when confidence is insufficient. Unlike `opensips-config`, this skill is **cross-version** because most security knowledge does not vary by OpenSIPs version; per-rule frontmatter (`applies_if_opensips_version`) and a `version-notes/` tree carry the version-specific concerns. The advisor reads (does not write) `opensips-config`'s reference data to sanity-check identifiers in the configuration under review against the active OpenSIPs version.

The cross-project guardrail runs through the skill. OpenSIPs is one of several projects descending from the SIP Express Router (SER), and identifiers from sibling projects look familiar enough to corrupt training-data priors. The SKILL.md instructs Claude to treat the active version's reference set as the only source of truth for valid identifiers. A function name, parameter, or pseudo-variable that is not in `references/{version}/` is flagged rather than fabricated. A `ser-lineage-notes.md` in each version's tree carries the operational rule with concrete confusion patterns drawn from real cases.

Determinism is enforced in CI. The build pipeline runs twice and diffs the output; any byte-level difference is a build failure. Schema-hash drift, validation failures, version-isolation violations, golden-file regressions, lint errors, and unreplaced `MODULE_INDEX_PLACEHOLDER` markers all surface as discrete CI gates. The result is that the generated reference set is reproducible from input data alone — what users install matches what was tested.

## Supported OpenSIPs versions

| Version | Status | Modules |
|---|---|---|
| 4.0 | ✅ supported | 195 |
| 3.6 | ✅ supported | 194 |
| 3.5 | ✅ supported | 186 |
| 3.4 | ✅ supported | 179 |

All four versions ship a complete reference tree (`cfg-format.md`, `consolidated.json`, `core/`, `guides/`, `modules/`, `modules-index.md`, `ser-lineage-notes.md`). The plugin resolves the active version from the user's prompt at trigger time and reads exclusively from that version's directory.

The dynamic-discovery design carries forward to whatever OpenSIPs ships next. Per [ADR-009](docs/architecture/adr/009-data-folder-and-dynamic-version-discovery.md), no version is hard-coded anywhere in the codebase — the build scans `data/` for any `^\d+\.\d+$` directory and processes whatever it finds. Adding the next version is a data operation: extract upstream against the new release, drop `data/X.Y/` into this repository, run `npm run baseline:update -- --only X.Y`, and the next build covers it. The same applies in reverse: when an OpenSIPs version ages out and upstream stops extracting it, it drops out of the build automatically.

Version isolation is strict. Each version's reference tree is built, indexed, and consumed independently. There is no cross-version reasoning, and the build pipeline asserts (in CI) that no generated file in one version's tree references another version's identifiers. When the user states a version, the answer comes from within that version only.

## Documentation

- [Vision](docs/vision.md) — one-page narrative of why this project exists.
- [Requirements](docs/requirements.md) — what the project is building.
- [Architecture](docs/architecture/) — data pipeline, rendering templates, skill authoring guide.
- [ADRs](docs/architecture/adr/) — recorded architectural decisions.
- [Implementation plan](docs/plan/) — milestone-by-milestone build plan.
- [Test strategy](docs/testing/test-strategy.md) — what is tested at each level and the CI gates.
- [Golden-path demos](docs/testing/golden-path-demos.md) — the manual checklist run before each release.
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to help.
- [CLAUDE.md](CLAUDE.md) — project operating manual for AI pair programmers.

## Contributing

Contributions are welcome. The kinds of contributions that fit here:

- Bug fixes in the build pipeline, the rendering scripts, or the test suite.
- Documentation improvements — clearer prose, better cross-references, fixed typos.
- Test additions and CI improvements.
- New ADRs proposing architectural changes (the ADR comes before the code).
- New OpenSIPs version coverage, when upstream extraction is available — drop the data folder, run the baseline update, open a PR.

Some contributions belong elsewhere:

- Module reference content goes upstream to `opensips-docs-collector`. This project is a faithful transformer of upstream JSON; if a module reference is wrong, the fix is upstream so every consumer benefits. The hand-authored `SKILL.md` files and `ser-lineage-notes.md` are the only authored Markdown in the skill trees — everything else is generated.
- `opensips-security-advisor` content is hand-authored (unlike `opensips-config`'s reference tree, which is generated from upstream JSON). Per [ADR-014](docs/architecture/adr/014-security-advisor-v1-single-skill.md), changes to rules, the workflow, output format, taxonomy, taint model, version notes, or knowledge docs go directly under `plugins/opensips/skills/opensips-security-advisor/references/`. Changes that affect rule counts, severity assignments, or the report template should be validated against the fixtures in `docs/testing/security-advisor/fixtures/` before merging.
- Architectural changes — how the skill is structured, how the build works, how versions are resolved — need an ADR before code. See `docs/architecture/adr/000-template.md`.

The local development loop is `npm install`, `npm run validate`, `npm run build`, `npm test`. The build is deterministic; every PR runs the build twice in CI and fails if the output differs. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor guide, including the local development loop, pull request expectations, and the schema mirroring contract.

## Project status

This is the v1.1.0 public release. Two active skills (`opensips-config` and `opensips-security-advisor`), reference content for OpenSIPs 3.4, 3.5, 3.6, and 4.0, and CI gates are all in place. The project has been internally validated against golden-path demos covering route authoring, module reference, version isolation, and security review with severity-ranked findings. Future work — additional OpenSIPs versions, additional skills for operations and module development — is post-v1.1 and is tracked through the project's issue tracker rather than the implementation plan.

If you find a bug, a regression, or a place where the plugin produces a wrong answer, please open an issue with the prompt that triggered it and the version you were targeting. Wrong answers in the generated reference content are usually upstream extraction bugs and get filed in `opensips-docs-collector`; wrong answers from a SKILL.md decision are filed here.

## License

GPL-3.0-or-later, matching upstream OpenSIPs. See [LICENSE](LICENSE).

## Acknowledgments

- The OpenSIPs project and its core team for the underlying SIP server and the documentation this plugin grounds Claude in.
- The upstream `opensips-docs-collector` extraction project for the structured JSON that feeds the build pipeline.
- The Claude Code Agent Skills system for the plugin runtime that makes coordinated, version-aware skill loading possible.
