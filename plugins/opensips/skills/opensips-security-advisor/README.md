# opensips-security-advisor

Active skill in v1.1 of the `opensips-skills` plugin. Reviews OpenSIPs
configurations for security issues across 12 vulnerability families:
authentication, injection, MI exposure, TLS posture, DoS defense,
relay and routing, identity spoofing, STIR/SHAKEN, media, dispatcher
and load-balancer, tracing and logging, and configuration hygiene.

Read-only. Produces a Markdown report. Reads sibling skill
`opensips-config`'s reference data for identifier sanity-checking.

Entry point: `SKILL.md`. Procedural spine: `references/workflow.md`.

For the design rationale and v1 scope, see
`docs/superpowers/specs/2026-04-29-opensips-security-advisor-v1-design.md`
and `docs/architecture/adr/014-security-advisor-v1-single-skill.md`.
