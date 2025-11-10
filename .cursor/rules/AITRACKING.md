# AITracking Rules

**Status:** REQUIRED

---

## Rule 1: Check Before Workflow

```bash
# Load recent logs:
ls -t docs/AITracking/AIAction_*.md 2>/dev/null | head -3 | xargs tail -20
```

**What to check:** Recent work, issues, patterns

---

## Rule 2: Create Log for New Task

**File:** `docs/AITracking/AIAction_DD-MM-YYYY_task_name.md`

**Template:**
```markdown
# AI Action Log: [Task Name]

**Date:** DD-MM-YYYY  
**Task:** [Brief description]  
**Status:** 🟡 In Progress

---

## 🎯 Task Objective
[What you're doing]

## 📝 Actions Taken
- File: `path/to/file.ts`
- Change: [What changed]

## ✅ Results
[What was accomplished]
```

---

## Rule 3: Update During Work

```bash
echo "## 🔄 Progress Update" >> "$LOG_FILE"
echo "- File: \`$FILE\` modified" >> "$LOG_FILE"
```

---

## Rule 4: Finalize After Completion

```bash
sed -i 's/Status: 🟡 In Progress/Status: ✅ Complete/' "$LOG_FILE"
```

---

## Rule 5: Post-Commit (Auto)

Post-commit hook auto-updates logs. Verify after commit.

---

## File Naming

**Format:** `AIAction_DD-MM-YYYY_task_name.md`  
**Example:** `AIAction_07-11-2025_fix_button.md`

---

## Checklist

- [ ] Checked recent logs before starting
- [ ] Created log for new task
- [ ] Updated log during work
- [ ] Finalized log (Status: ✅ Complete)
- [ ] Post-commit hook ran

---

**See:** @docs/workflows/subtasks/aitracking.md

