# tsk audit

Comprehensive SkillKit system health check.

```bash
tsk audit [--quick] [--verify] [--format <type>]
```

### Options

- `--quick` - Quick audit (duplicates and critical only)
- `--verify` - Re-run audit to verify previous fixes
- `--format <type>` - Output format: `markdown`, `json`, `text` (default: `markdown`)

### What it checks

1. **Duplicate workflows** - Identifies duplicate workflow files
2. **Workflow structure** - Validates workflow file structure
3. **Command validity** - Tests workflow commands
4. **Skills installation** - Verifies installed skills
5. **Subtask references** - Checks subtask integrity
6. **Environment compatibility** - Tests cross-platform support

### Example

```bash
# Full audit
tsk audit

# Quick audit
tsk audit --quick

# JSON output
tsk audit --format json
```

### Auto-fix

Use `tsk audit:fix` to automatically fix safe issues:

```bash
# Fix safe issues only
tsk audit:fix

# Fix all auto-fixable issues
tsk audit:fix --all

# Dry run (show what would be fixed)
tsk audit:fix --dry-run
```

