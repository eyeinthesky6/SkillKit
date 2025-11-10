# Workflows Commands

## tsk workflows:add

Install workflows from GitHub.

```bash
tsk workflows:add <user/repo>
```

### Example

```bash
tsk workflows:add trinity-os/community-workflows
```

## tsk validate-workflow

Validate a workflow file structure.

```bash
tsk validate-workflow <path-to-workflow.md>
```

### What it checks

- Workflow structure (phases, steps)
- Subtask references
- Skill references
- Potential conflicts with existing workflows

### Example

```bash
tsk validate-workflow .cursor/commands/MY_WORKFLOW.md
```

## tsk dedupe-workflows

Remove duplicate workflow files.

```bash
tsk dedupe-workflows
```

Automatically detects and removes duplicate workflows based on canonical naming.

