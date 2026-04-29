## Frontmatter field: `suppressible` (addendum to base schema)

### Definition

`suppressible` (boolean, required, default `true`) declares whether a finding emitted by this rule may be silenced by an operator-authored suppression record per `23_SUPPRESSION_PROTOCOL.md`.

- `suppressible: true` — the operator may silence a specific finding instance via a suppression record carrying a justification, optional `expires` date, and a hash of the affected cfg location. Suppressed findings still appear in the report under "suppressed" with the justification visible; they do not contribute to severity-aggregated headline metrics.
- `suppressible: false` — the operator cannot silence findings from this rule. They may downgrade prominence in the report (move to a "review" section, mute notification triggers) but the finding remains visible in every report run. This setting is reserved for findings where the residual risk after any cfg-level mitigation remains structurally severe — typically because no safe form of the underlying primitive exists.

### When to set `suppressible: false`

A rule should be `suppressible: false` only when **all** of the following are true:

1. The vulnerability class has no safe interpolation form, no defensible "we sanitized it" suppression path, and no operator-side compensating control that the cfg can express.
2. Allowing suppression would create a class of false negatives (suppressions accumulate, residual risk goes invisible, the catalog ceases to track real exposure).
3. The rule's remediation path is "remove the primitive entirely" — not "configure it carefully."

Examples in the catalog:
- `OSIPS-SEC-INJECTION-003` (exec-msg-injection) — shell command injection has no safe interpolation form; the documented remediation is "eliminate `exec_*`," not "sanitize inputs."
- `OSIPS-SEC-AUTH-004` (jwt-db-mode-cve) — CVE-2026-25554 is fixed in patched versions; the only acceptable resolutions are upgrade or migrate-off-DB-mode. Suppressing without doing one of those leaves the CVE unaddressed.

The schema is conservative about `suppressible: false`. Most rules — even severity:critical ones — should be `suppressible: true` because legitimate exception cases exist (lab deployments, documented compensating controls, legacy compatibility windows). The `suppressible: false` flag should be rare; the catalog's expected ratio is roughly 90% suppressible, 10% non-suppressible.

### Interaction with `automated`

`suppressible` and `automated` are independent fields:

- `automated: true, suppressible: true` — typical case. Engine fires definitively; operator may suppress with justification.
- `automated: true, suppressible: false` — engine fires definitively; operator cannot fully silence. Used for catastrophic-class findings.
- `automated: false, suppressible: true` — engine emits `review_required`; operator confirms posture by either resolving the finding or recording a suppression with justification. Suppression *is* the documented resolution path for these rules.
- `automated: false, suppressible: false` — invalid combination; the schema rejects rules with this pairing. If the engine cannot fire definitively, the operator must have a suppression path; otherwise the rule is permanently emitting an unactionable finding.

### Default

If `suppressible` is omitted from a rule's frontmatter, the schema treats it as `true`. Authors should still set it explicitly on every rule for clarity.

### Migration note

Rules drafted before this addendum (the entire current catalog) all carry explicit `suppressible` fields. The addendum is the formalization of behavior already in use; no migration is required.
