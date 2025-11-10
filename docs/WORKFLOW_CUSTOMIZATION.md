# Workflow Customization Guide

**Purpose:** Learn how to customize and create your own SkillKit workflows for Cursor IDE

---

## Table of Contents

1. [Overview](#overview)
2. [Workflow Structure](#workflow-structure)
3. [Customizing Existing Workflows](#customizing-existing-workflows)
4. [Creating Custom Workflows](#creating-custom-workflows)
5. [Best Practices](#best-practices)
6. [Examples](#examples)
7. [Troubleshooting](#troubleshooting)

---

## Overview

SkillKit workflows are markdown documents that guide AI agents through multi-step development processes. They're designed to be:

- **Readable:** Clear instructions for both humans and AI
- **Actionable:** Include specific commands to execute
- **Adaptable:** Conditional logic based on project state
- **Validated:** Quality gates throughout the process

### How Workflows Work

1. User invokes workflow in Cursor: `@BEGIN_SESSION.md`
2. AI agent reads the markdown document
3. Agent follows instructions phase by phase
4. Agent executes `tsk` commands and interprets results
5. Agent adapts behavior based on diagnostics and checks
6. Agent validates at each quality gate

---

## Workflow Structure

### Basic Template

```markdown
# Workflow Name - SkillKit Workflow

**Purpose:** What this workflow accomplishes

---

## Phase 1: Phase Name

Brief description of what happens in this phase.

1. Step one
2. Step two

\`\`\`bash
tsk command-to-execute
\`\`\`

### Conditional Logic

**If condition A:**
- Do this

**If condition B:**
- Do that

---

## Phase 2: Next Phase

...

---

**SkillKit Commands Used:**
- `tsk command1` - Description
- `tsk command2` - Description
```

### Key Components

#### 1. Title & Purpose
```markdown
# Workflow Name - SkillKit Workflow
**Purpose:** Clear, concise statement of the workflow's goal
```

#### 2. Phase Structure
Each workflow is divided into phases for clarity:
```markdown
## Phase 1: Context Loading
## Phase 2: Diagnostics
## Phase 3: Analysis
```

#### 3. Command Blocks
Use code blocks for executable commands:
```markdown
\`\`\`bash
tsk diagnose --json
\`\`\`
```

#### 4. Conditional Logic
Provide branching based on state:
```markdown
**If errors found:**
- Summarize the errors
- Ask user: "Should I fix these first?"

**If clean:**
- Confirm system is healthy
- Proceed to next phase
```

#### 5. Quality Gates
Validation checkpoints:
```markdown
## Phase 6: Validation

After implementation:

\`\`\`bash
tsk exec lint
tsk exec typecheck
tsk exec test
\`\`\`

Fix any issues before proceeding.
```

#### 6. Documentation Steps
Always include documentation:
```markdown
## Phase 7: Documentation

Update documentation:
- Add code comments
- Update README if needed
- Update AITracking log
```

---

## Customizing Existing Workflows

### Method 1: Copy and Modify

1. **Copy the workflow:**
   ```bash
   cp .cursor/commands/BEGIN_SESSION.md .cursor/commands/BEGIN_SESSION_CUSTOM.md
   ```

2. **Edit the file:**
   ```bash
   code .cursor/commands/BEGIN_SESSION_CUSTOM.md
   ```

3. **Modify phases to suit your needs:**
   - Add new phases
   - Remove unnecessary steps
   - Change command sequences
   - Adjust conditional logic

4. **Use in Cursor:**
   ```
   @BEGIN_SESSION_CUSTOM.md
   ```

### Method 2: Override with Local Template

1. **Create custom templates directory:**
   ```bash
   mkdir -p templates/workflows/custom
   ```

2. **Copy and edit:**
   ```bash
   cp templates/workflows/BEGIN_SESSION.md templates/workflows/custom/BEGIN_SESSION.md
   # Edit the file
   ```

3. **Generate from custom template:**
   ```bash
   tsk workflow --template BEGIN_SESSION --dir . --templates templates/workflows/custom
   ```
   *(Note: `--templates` flag would need to be added in future version)*

---

## Creating Custom Workflows

### Example: Code Review Workflow

Create `.cursor/commands/CODE_REVIEW.md`:

```markdown
# Code Review - SkillKit Workflow

**Purpose:** Systematic code review with quality checks and documentation

---

## Phase 1: Pre-Review Setup

Prepare for the review:

1. Ensure clean git status
2. Run full diagnostics
3. Note current state

\`\`\`bash
git status
tsk diagnose
\`\`\`

---

## Phase 2: Code Quality Analysis

Run quality checks:

\`\`\`bash
tsk exec lint
tsk exec typecheck
tsk exec test
\`\`\`

**Document findings:**
- Linting issues: [count]
- Type errors: [count]
- Test failures: [count]

---

## Phase 3: Architecture Review

Check for architectural patterns:

1. Verify contracts-first approach (if project uses Zod)
2. Check for proper layering (controllers/services/repos)
3. Validate error handling patterns
4. Check for circular dependencies

\`\`\`bash
tsk diagnose --json | grep "circular"
\`\`\`

---

## Phase 4: Security Review

Check for common security issues:

1. Search for hardcoded secrets
2. Check for SQL injection vulnerabilities
3. Validate input sanitization
4. Review authentication/authorization logic

**Search patterns:**
- `password =`
- `apiKey =`
- Raw SQL queries
- `eval()` usage

---

## Phase 5: Performance Review

Check for performance issues:

1. Look for N+1 queries
2. Check for memory leaks
3. Verify proper caching
4. Review database indexes

---

## Phase 6: Documentation Check

Verify documentation:

1. README up to date
2. Code comments present
3. API documentation current
4. CHANGELOG updated

---

## Phase 7: Final Report

Summarize findings:

\`\`\`
Code Review Summary:
- Quality Issues: [count]
- Security Issues: [count]
- Performance Issues: [count]
- Documentation Issues: [count]

Recommendations:
1. [Priority 1 fix]
2. [Priority 2 fix]
3. [Priority 3 fix]
\`\`\`

---

**SkillKit Commands Used:**
- `tsk diagnose` - System analysis
- `tsk exec lint` - Code linting
- `tsk exec typecheck` - Type checking
- `tsk exec test` - Test execution
```

### Example: Database Migration Workflow

Create `.cursor/commands/DB_MIGRATION.md`:

```markdown
# Database Migration - SkillKit Workflow

**Purpose:** Safe database schema migration with rollback plan

---

## Phase 1: Pre-Migration Checks

\`\`\`bash
# Backup database
# Verify connection
# Check current schema version
\`\`\`

---

## Phase 2: Migration Plan

1. Document changes
2. Create rollback script
3. Test in staging

---

## Phase 3: Execute Migration

**If contracts-first project:**
1. Update Zod schemas FIRST
2. Generate migration from schema
3. Apply migration

**Standard approach:**
1. Write migration script
2. Test locally
3. Apply to staging
4. Verify

---

## Phase 4: Post-Migration Validation

\`\`\`bash
tsk exec test
# Run integration tests
# Verify data integrity
\`\`\`

---

## Phase 5: Rollback Plan

Document rollback steps:
1. Restore from backup
2. Apply rollback script
3. Verify system state

---

**SkillKit Commands Used:**
- `tsk exec test` - Validation
```

---

## Best Practices

### 1. Phase-Based Design
- Break workflows into clear phases
- Each phase should have a single focus
- Phases should be sequential but modular

### 2. Use SkillKit Commands
Instead of raw shell commands, leverage `tsk` commands:

**Good:**
```bash
tsk diagnose
tsk exec lint
tsk exec quality-gate
```

**Avoid:**
```bash
npm run lint
tsc --noEmit
npm test
```

**Why:** SkillKit commands are environment-aware and adapt to your project.

### 3. Structured Output
Request JSON output for AI parsing:

```bash
tsk diagnose --json
```

### 4. Conditional Logic
Provide clear branching:

```markdown
**If [condition]:**
- Action A

**Otherwise:**
- Action B
```

### 5. Quality Gates
Include validation at key points:

```markdown
## Phase 6: Validation

Before proceeding:
\`\`\`bash
tsk exec quality-gate
\`\`\`

**If failing:** Stop and fix issues
**If passing:** Proceed to next phase
```

### 6. Documentation
Every workflow should update documentation:

```markdown
## Phase 7: Documentation

Update AITracking:
- Summarize changes
- Note any issues encountered
- Document decisions made
```

### 7. Error Handling
Provide clear error paths:

```markdown
**If errors occur:**
1. Log the error
2. Check recent changes
3. Ask user for guidance
```

---

## Examples

### Quick Check Workflow

```markdown
# Quick Check - SkillKit Workflow

**Purpose:** Fast validation before commit

---

## Execute

\`\`\`bash
tsk exec lint
tsk exec typecheck
\`\`\`

**If passing:** Ready to commit
**If failing:** Fix issues first
```

### Refactor Workflow

```markdown
# Refactor - SkillKit Workflow

**Purpose:** Safe refactoring with validation

---

## Phase 1: Pre-Refactor

\`\`\`bash
tsk exec test
\`\`\`

Ensure all tests pass before starting.

---

## Phase 2: Execute Refactor

1. Make changes
2. Keep tests passing throughout
3. Commit frequently

---

## Phase 3: Post-Refactor

\`\`\`bash
tsk exec quality-gate
\`\`\`

Verify no regressions introduced.
```

---

## Troubleshooting

### Workflow Not Appearing in Cursor

1. **Check file location:**
   ```bash
   ls .cursor/commands/
   ```
   Workflows must be in `.cursor/commands/` directory.

2. **Check file extension:**
   Must be `.md` (markdown).

3. **Restart Cursor:**
   Cursor may need to be restarted to pick up new workflows.

### AI Agent Not Following Workflow

1. **Check command syntax:**
   Ensure `tsk` commands are in code blocks:
   ```markdown
   \`\`\`bash
   tsk diagnose
   \`\`\`
   ```

2. **Be explicit:**
   Provide clear, step-by-step instructions. AI agents follow instructions literally.

3. **Use structured output:**
   Request `--json` flags for AI to parse:
   ```bash
   tsk diagnose --json
   ```

### Commands Failing

1. **Check SkillKit installation:**
   ```bash
   tsk --version
   ```

2. **Verify project initialization:**
   ```bash
   tsk diagnose
   ```

3. **Check command availability:**
   ```bash
   tsk list-workflows
   ```

---

## Advanced: Dynamic Workflow Generation

### Future Feature: Workflow Templates with Variables

*(Coming in v1.2)*

```markdown
# ${WORKFLOW_NAME} - SkillKit Workflow

**Purpose:** ${WORKFLOW_PURPOSE}

## Phase 1: ${PHASE1_NAME}

${PHASE1_STEPS}
```

Generate with:
```bash
tsk workflow generate --name "Feature X" --template dynamic --vars vars.json
```

---

## Resources

- [Workflow Templates Source](../templates/workflows/) - Official templates
- [SkillKit CLI Reference](./cli-reference.md) - All `tsk` commands
- [Cursor Documentation](https://cursor.sh/docs) - Cursor IDE docs
- [Example Workflows](../examples/workflows/) - Community examples

---

## Contributing Workflows

Want to share your custom workflows?

1. Fork SkillKit repository
2. Add your workflow to `templates/workflows/community/`
3. Submit a pull request
4. Include:
   - Workflow file
   - Use case description
   - Example output

---

**Questions?** Open an issue on [GitHub](https://github.com/trinity-os/skillkit/issues)

