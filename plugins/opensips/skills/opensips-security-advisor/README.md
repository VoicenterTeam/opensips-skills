# opensips-security-advisor (scaffold, disabled in v1)

This directory holds a scaffold for a future Claude Code skill. The skill is **not active** in v1 — `SKILL.md` is renamed to `SKILL.md.scaffold` so Claude Code's skill discovery does not pick it up.

The substantive review patterns (risk catalog, audit workflow, severity-tagging, remediation guidance) are owned by a separate authoring agent per ADR-012 and ADR-013, and will land in a follow-up release.

To re-enable the skill:

```
mv SKILL.md.scaffold SKILL.md
```

The `description:` frontmatter and integration contract are already in place; renaming the file back is the only step required to put the skill in front of Claude Code's auto-discovery.
