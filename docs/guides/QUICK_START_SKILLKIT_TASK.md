# Quick Start: Using SkillKit Task System

**Purpose:** Get started with the new SkillKit task planning and execution system

---

## 🚀 Quick Start

### 1. Plan a Task

See which skill SkillKit would select for a task:

```bash
tsk plan "fix ESLint errors"
```

**Output:**
```
📋 Skill Selection Plan

Task: fix ESLint errors
Selected Skill: fix-eslint
Confidence: 85.0%
Reason: Matched tags: lint; Matched 2 keywords in name/description
```

### 2. Execute a Task

Run a task through SkillKit (plan + execute):

```bash
tsk task "fix ESLint errors"
```

**What happens:**
1. Plans the task (selects skill)
2. Executes the selected skill
3. Logs usage to telemetry
4. Reports results

### 3. Check Usage

See how often skills are being used:

```bash
tsk stats
```

**Output:**
```
📊 Skill Usage Statistics

Total Runs: 15
Success: 14
Failures: 1
Avg Duration: 1234ms

By Skill:

  fix-eslint:
    Runs: 7
    Failures: 0
    Avg Duration: 850ms
    Last Used: 1/15/2025, 2:30:00 PM
```

---

## 📝 In Cursor IDE

### Use the Unified Command

Type `/SKILLKIT_TASK` in Cursor and describe your task.

**Example:**
```
User: /SKILLKIT_TASK
Task: Fix all TypeScript errors in the project
```

The agent will:
1. Run `tsk plan "Fix all TypeScript errors in the project"`
2. Review the selected skill
3. Run `tsk task "Fix all TypeScript errors in the project"`
4. Report results

---

## 🎯 Common Use Cases

### Fix Lint Errors

```bash
tsk task "fix ESLint errors"
```

### Fix Type Errors

```bash
tsk task "fix TypeScript errors"
```

### Format Code

```bash
tsk task "format code with Prettier"
```

### Run Tests

```bash
tsk task "run test suite"
```

### Refactor Code

```bash
tsk task "refactor API service layer"
```

---

## ⚙️ Advanced Options

### Plan with Tags

```bash
tsk plan "process data" --tags json validation
```

### Task with Input

```bash
tsk task "process files" --input '{"files": ["a.txt", "b.txt"]}'
```

### Task with Input File

```bash
tsk task "process files" --input-file input.json
```

### JSON Output (for AI)

```bash
tsk plan "fix errors" --json
tsk task "fix errors" --json
```

### Minimum Confidence

```bash
tsk plan "fix errors" --min-confidence 0.7
```

---

## 🔍 Troubleshooting

### "No skills found"

**Problem:** No skills are available.

**Solution:**
1. Create a skill: `tsk gen-skill my-skill`
2. Or install skills: `tsk install <repo>`

### "No suitable skill found"

**Problem:** No skill matches the task.

**Solution:**
1. Check available skills: `tsk list-skills`
2. Create a new skill for this task
3. Or proceed with manual work

### Low Confidence

**Problem:** Selected skill has low confidence (<50%).

**Solution:**
1. Review the plan output
2. Check if task description is clear
3. Consider creating a more specific skill
4. Use `--tags` to narrow selection

---

## 📊 Monitoring

### View Statistics

```bash
tsk stats
```

### View Raw Logs

```bash
# Skill usage
cat logs/audit/skills-usage.jsonl

# Planning history
cat logs/audit/plan-history.jsonl
```

### JSON Statistics

```bash
tsk stats --json
```

---

## 🔗 Integration

### With Existing Workflows

Update existing Cursor commands to use SkillKit:

```markdown
## Step 1: Plan Task

Run: `tsk plan "<task description>"`

## Step 2: Execute Task

Run: `tsk task "<task description>"`
```

### With CI/CD

Add to your CI pipeline:

```yaml
- name: Fix lint errors
  run: tsk task "fix ESLint errors"
```

---

## 💡 Best Practices

1. **Be Specific:** Clear task descriptions get better skill matches
   - ✅ Good: "fix ESLint errors in TypeScript files"
   - ❌ Bad: "fix errors"

2. **Use Tags:** When planning, use tags to narrow selection
   ```bash
   tsk plan "process data" --tags json validation
   ```

3. **Check Stats:** Regularly check `tsk stats` to see what's being used

4. **Create Skills:** If tasks don't match, create skills for common tasks

5. **Monitor Logs:** Review audit logs to understand usage patterns

---

## 🎓 Next Steps

1. **Create Your First Skill:**
   ```bash
   tsk gen-skill my-awesome-skill
   ```

2. **Test It:**
   ```bash
   tsk task "use my awesome skill"
   ```

3. **Check Usage:**
   ```bash
   tsk stats
   ```

4. **Integrate with Cursor:**
   - Use `/SKILLKIT_TASK` for all tasks
   - Or update existing commands to use SkillKit

---

*For more details, see:*
- `docs/SKILLKIT_INTEGRATION_FIX_SUMMARY.md` - Full implementation details
- `docs/SKILLKIT_INTEGRATION_ANALYSIS.md` - Problem analysis
- `docs/skills.md` - Creating skills

