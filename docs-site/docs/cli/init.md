# CLI Commands

## tsk init

Initialize SkillKit in your project.

```bash
tsk init [--all]
```

### Options

- `--all` - Copy all workflows and subtasks (non-interactive)

### What it does

1. Creates `.cursor/commands/` directory
2. Copies 12 core workflows
3. Copies 22 subtasks to `docs/workflows/subtasks/`
4. Sets up git post-commit hooks for AITracking
5. Generates initial `AGENTS.md`

### Example

```bash
# Interactive mode
tsk init

# Non-interactive (all workflows)
tsk init --all
```

## Other Commands

- [Audit](audit) - System health checks
- [Skills](skills) - Manage skills
- [Workflows](workflows) - Manage workflows

