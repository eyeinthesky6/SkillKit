# META: Create New Workflow

**Purpose:** Template and guide for creating new SkillKit workflows

---

## Step 1: Define Workflow Purpose

**Answer these questions:**

1. **What is this workflow for?**
   - Example: "Deploy to staging environment"
   - Example: "Run security audit"
   - Example: "Generate weekly report"

2. **Who triggers it?**
   - Developer (via /COMMAND)
   - AI agent (automatically)
   - CI/CD system

3. **When is it used?**
   - Daily, weekly, on-demand?
   - Before/after specific events?

4. **What's the expected outcome?**
   - Files created/modified?
   - Commands executed?
   - Reports generated?

---

## Step 2: Identify Steps

**Break workflow into logical phases:**

```markdown
## Example: DEPLOY_STAGING workflow

Phase 1: Pre-flight checks
Phase 2: Build for staging
Phase 3: Run smoke tests
Phase 4: Deploy to staging
Phase 5: Verify deployment
Phase 6: Notify team
```

**Aim for 3-8 phases (not too few, not too many)**

---

## Step 3: Map to Existing Subtasks

**Check `docs/workflows/subtasks/` for reusable pieces:**

| Your Phase | Existing Subtask |
|------------|------------------|
| Pre-flight checks | run-diagnostics.md, run-tests.md |
| Build | check-dependencies.md |
| Deploy | (need custom steps) |
| Verify | (need custom steps) |
| Notify | (need custom steps) |

**Reuse when possible, create new subtasks when needed!**

---

## Step 4: Create Subtasks (if needed)

**If no existing subtask fits, create new ones:**

```bash
# Example: Create deploy-to-staging subtask
cat > docs/workflows/subtasks/deploy-to-staging.md << 'EOF'
# Deploy to Staging (Subtask)

## Purpose
Deploy application to staging environment.

## Commands

```bash
# Build for staging:
NODE_ENV=staging npm run build

# Deploy:
./scripts/deploy-staging.sh

# Or platform-specific:
heroku deploy --app myapp-staging
# vercel deploy --prod=false
# aws s3 sync dist/ s3://staging-bucket/
\```

## Verification

```bash
# Check deployment:
curl https://staging.myapp.com/health

# Expected: {"status": "ok"}
\```

---

**Return deployment URL to main workflow.**
EOF
```

**Keep subtasks focused (15-30 lines max)!**

---

## Step 5: Write Main Workflow

**Use this template:**

````markdown
# [Workflow Name]

**Purpose:** [One sentence description]

---

## {{CUSTOM_HEADER}}
<!-- Project-specific rules -->
---

## Phase 1: [Name] ([Time estimate])

**See:** @docs/workflows/subtasks/[subtask-name].md

**Quick version:**
```bash
[Essential command]
```

**What this does:** [Brief explanation]

**Stop if:** [Failure condition]

---

## Phase 2: [Name] ([Time estimate])

**See:** @docs/workflows/subtasks/[subtask-name].md

**Quick version:**
```bash
[Essential command]
```

---

[... continue for all phases ...]

---

## ✅ Success Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

**Commands used:**
- `[command1]` - [Description]
- `[command2]` - [Description]
````

---

## Step 6: Add Cursor Command Shortcut

**Create `.cursor/commands/[WORKFLOW_NAME].md`:**

```markdown
# /[WORKFLOW_NAME]

@docs/workflows/[WORKFLOW_NAME].md
```

**Now users can type:** `/[WORKFLOW_NAME]`

---

## Step 7: Test the Workflow

**Run through it manually:**

```bash
# 1. Trigger workflow:
/YOUR_NEW_WORKFLOW

# 2. Follow each phase
# 3. Note any issues:
   - Commands fail?
   - Steps unclear?
   - Missing prerequisites?

# 4. Refine and iterate
```

---

## Step 8: Document in AGENTS.md

**Add to project `AGENTS.md`:**

```markdown
## Available Workflows

### [Your Workflow Name]
- **Trigger:** `/YOUR_WORKFLOW`
- **Purpose:** [One sentence]
- **When to use:** [Context]
- **Duration:** ~[X] minutes
```

---

## Step 9: Add to Sprint Status Template

**If this is a recurring workflow, add to BEGIN_SESSION menu:**

Edit `templates/workflows/BEGIN_SESSION.md`:

```markdown
## Step 5: Task Menu

```
What would you like to do?

[... existing options ...]
8. 🆕 [Your workflow name]
```

## Routes

- **8** → `@YOUR_WORKFLOW.md`
```

---

## Examples of Good Workflows

### Simple Workflow (3-5 phases):
- `DEDUP.md` - Find duplicate code
- `CONTINUE.md` - Resume previous work

### Medium Workflow (5-8 phases):
- `FIX_BUGS.md` - Debug and fix issues
- `DEPLOY_PREP.md` - Pre-deployment checks

### Complex Workflow (8-12 phases):
- `IMPLEMENT_FEATURE.md` - Full feature development
- `SYSTEM_AUDIT.md` - Comprehensive system review

---

## Workflow Naming Conventions

**Good names:**
- `IMPLEMENT_FEATURE` (action + noun)
- `FIX_BUGS` (action + noun)
- `DEPLOY_PREP` (action + noun)
- `SECURITY_AUDIT` (adjective + noun)

**Bad names:**
- `STUFF` (too vague)
- `DO_THE_THING` (unclear)
- `WORKFLOW_1` (meaningless)

---

## Best Practices

### DO:
✅ Keep phases focused (one clear goal each)
✅ Provide quick commands for speed
✅ Reference subtasks for details
✅ Include time estimates
✅ Add clear failure conditions
✅ Test the workflow yourself first

### DON'T:
❌ Create mega-workflows (split into multiple!)
❌ Duplicate subtask content inline
❌ Skip error handling
❌ Forget time estimates
❌ Leave steps ambiguous
❌ Skip testing

---

## Checklist for New Workflow

Before considering it "done":

- [ ] Purpose is clear (one sentence)
- [ ] 3-8 logical phases defined
- [ ] Reuses existing subtasks where possible
- [ ] New subtasks created (if needed)
- [ ] Commands are cross-platform aware
- [ ] Time estimates included
- [ ] Failure conditions specified
- [ ] Success criteria listed
- [ ] Cursor command shortcut created
- [ ] Tested manually (works!)
- [ ] Documented in AGENTS.md
- [ ] Added to BEGIN_SESSION (if recurring)

---

## ✅ Your New Workflow is Ready!

**Share it:**
- Commit to git
- Update team documentation
- Announce in team chat

**Maintain it:**
- Run `/AUDIT_SKILLKIT` periodically
- Update based on feedback
- Refine commands as project evolves

---

**Remember: Workflows are living documents. Start simple, refine over time!**

