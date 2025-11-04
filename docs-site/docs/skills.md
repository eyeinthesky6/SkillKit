# Skills

A skill is a self-contained automation unit with metadata and schemas.

## SKILL.md Spec (MVP)
- name, version, description, tags
- inputs: JSON Schema
- outputs: JSON Schema
- allowedPaths: { read: string[], write: string[] }
- allowedCommands: (string|regex)[]
- steps: array (execution plan)
- retries: number (0|1)
- dryRunSupported: boolean
- dependencies: string[]

## Validation
- CLI will validate schema and trust metadata
- CI validates community skills on PRs
