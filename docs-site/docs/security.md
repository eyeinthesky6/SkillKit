# Security

SkillKit emphasizes secure execution by default.

## Sandbox
- Path allowlists with glob matching (picomatch)
- Command allowlist; spawn with `shell: false`
- Windows and POSIX safe arguments

## Validation
- Zod-based validators for inputs/outputs (planned)
- One constrained retry for transient failures

## Trust metadata (planned)
- `trust.verified`, `trust.signature`, `trust.verified_by`
- `tsk verify-skill <name>` to check signatures
