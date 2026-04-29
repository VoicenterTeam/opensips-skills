# Chat C Parent-Level Drafts

These are Chat C's outputs that lived at the parent level of the skill folder (`plugins/opensips/skills/opensips-security-advisor/{10_architecture,20_runtime,30_rules,40_versions,90_reference}/`) before the v1.1 consolidation pass — distinct from the Thread 0 canonical tree under `../chat-c-canonical-tree/`.

These drafts include content not present in the Thread 0 canonical tree:

- `40_versions/{3.4,3.5,3.6}.md` — version notes (canonical version preserved here; harvested into `references/version-notes/` with rewrites).
- `90_reference/01_master_vulnerability_reference.md` — 17-section threat reference (CVE values verified by Chat C; harvested into `references/knowledge/vulnerability-reference.md`).
- `90_reference/02_enable_security_gap_analysis.md` — research note on Enable Security gap analysis.
- `90_reference/03_advisor_methodology_research.md` — methodology research stub.
- `90_reference/external_sources.md` — citation list (harvested into `references/knowledge/external-sources.md`).
- `90_reference/sanitizer_registry.yaml` — Chat C's verified YAML sanitizer registry (harvested into `references/knowledge/sanitizer-registry.md`, merged with Chat B's broader Markdown version).
- `10_architecture/{11_DATA_MODEL,13_RULE_AUTHORING,14_DETECTION_ENGINE,15_CONFIDENCE_AND_VERIFICATION,22_REPORT_TEMPLATES}.md` — Chat C's alternate spec authoring (Chat A's versions were chosen as canonical; these alternates also live in `../chat-c-canonical-tree/_orphans/chat_c_alternate_specs/`).
- `30_rules/{auth,injection,mi_exposure,relay_and_routing}/OSIPS-SEC-*.md` — Chat C's 4 rules with the short-form ID scheme (Thread 0 renamed them to long form; Chat B's 58-rule catalog was selected as the v1 source).
- `20_runtime/25_FIXTURE_SCHEMA.md` — Chat C's fixture schema spec (harvested into `docs/testing/security-advisor/test-strategy.md`).

Preserved on disk for traceability. Not consumed at runtime by any skill.
