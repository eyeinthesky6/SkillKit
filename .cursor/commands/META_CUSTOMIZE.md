# META: Customize SkillKit to Project

**Purpose:** Adapt all SkillKit workflows to this specific project

**Run this ONCE after initial installation, then anytime project structure changes**

---

## Step 1: Analyze Current Project (2min)

```bash
# Detect tech stack:
tsk discover

# Show project structure:
ls -la

# Check package managers:
ls package.json requirements.txt go.mod composer.json pom.xml 2>/dev/null
```

**Note findings:**
- Primary language: _____________
- Package manager: _____________
- Test framework: _____________
- Linter: _____________
- Build tool: _____________

---

## Step 2: Test Commands (5min)

### Test each project command manually:

**Lint:**
```bash
# Try in order:
npm run lint
npx eslint .
pylint src/
golangci-lint run
```

**Note what works:** _____________

**Tests:**
```bash
# Try in order:
npm test
pytest
go test ./...
mvn test
```

**Note what works:** _____________

**Build:**
```bash
# Try in order:
npm run build
python setup.py build
go build
mvn package
```

**Note what works:** _____________

---

## Step 3: Update Workflow Commands

**For each workflow file in `.cursor/commands/` and `docs/workflows/`:**

### Find and replace generic commands with actual:

**Example - If your project uses `pnpm` instead of `npm`:**

```bash
# In all workflow files, replace:
npm install → pnpm install
npm test → pnpm test
npm run lint → pnpm run lint
```

**Example - If your project has custom scripts:**

```bash
# Replace generic commands:
tsk exec lint → npm run lint:check
tsk exec test → npm run test:unit
```

---

## Step 4: Update Custom Header

**Edit `.cursor/commands/BEGIN_SESSION.md`:**

Replace `{{CUSTOM_HEADER}}` with project-specific rules:

```markdown
## ⚠️ PROJECT RULES

- NO MOCKS, NO STUBS, NO PARTIAL IMPLEMENTATION
- Follow design system: docs/design-system.md
- All API changes need: docs/api-changelog.md update
- Test coverage must stay above 80%
```

**Copy same header to all other workflows!**

---

## Step 5: Customize Subtasks

**Check each subtask in `docs/workflows/subtasks/` and adjust:**

### Example customizations:

**`run-tests.md`** - Add your test command:
```bash
# Your actual command:
npm run test:coverage -- --watchAll=false
```

**`run-lint.md`** - Add your linter:
```bash
# Your actual lint setup:
npm run lint && npm run format:check
```

**`commit-changes.md`** - Match your commit conventions:
```markdown
## Commit Format

<type>(<scope>): <subject>

Types: feat|fix|docs|test|refactor|chore
Scope: component|api|ui|core

Example: feat(button): add loading state
```

---

## Step 6: Update File Paths

**If your project structure differs:**

```bash
# Standard:
src/ tests/ docs/

# Your project (example):
lib/ spec/ documentation/
```

**Update paths in workflows:**
- `src/` → `lib/`
- `tests/` → `spec/`
- `docs/` → `documentation/`

---

## Step 7: Configure Diagnostics

**Create/edit `.skillkit.config.json`:**

```json
{
  "commands": {
    "lint": "pnpm run lint:check",
    "test": "pnpm run test:unit",
    "typecheck": "pnpm run type-check",
    "build": "pnpm run build:prod"
  },
  "paths": {
    "src": "lib",
    "tests": "spec",
    "docs": "documentation"
  },
  "rules": {
    "maxErrors": 10,
    "requireTests": true,
    "minCoverage": 80
  }
}
```

---

## Step 8: Test Customized System

**Run through a complete workflow:**

```bash
# 1. Start session:
/BEGIN_SESSION

# 2. Should load YOUR project context
# 3. Should run YOUR commands
# 4. Should follow YOUR rules

# Test a feature workflow:
/IMPLEMENT_FEATURE

# Verify commands match your project!
```

---

## Step 9: Document Customizations

**Create `docs/SKILLKIT_CUSTOMIZATIONS.md`:**

```markdown
# SkillKit Customizations for [Project Name]

## Date: [Today's date]

## Commands:
- Lint: `pnpm run lint:check`
- Test: `pnpm run test:unit`
- Build: `pnpm run build:prod`

## Custom Rules:
- [List your project rules]

## Modified Workflows:
- BEGIN_SESSION.md: Updated custom header
- IMPLEMENT_FEATURE.md: Changed npm → pnpm
- [etc.]

## Modified Subtasks:
- run-tests.md: Added coverage requirement
- commit-changes.md: Updated commit format
- [etc.]
```

---

## Step 10: Commit Customizations

```bash
git add .cursor/ docs/workflows/ .skillkit.config.json
git commit -m "chore: customize SkillKit workflows for project"
```

---

## ✅ Customization Complete!

**SkillKit is now tailored to YOUR project!**

**Next steps:**
- Run `/AUDIT_SKILLKIT` periodically to refine further
- Update customizations when project structure changes
- Share `docs/SKILLKIT_CUSTOMIZATIONS.md` with team

---

**This is a ONE-TIME setup (unless major project changes)**

