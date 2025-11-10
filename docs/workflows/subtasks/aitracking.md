# AITracking (Subtask)

## Load Recent Context

```bash
# Today's logs:
ls -t docs/AITracking/AIAction_$(date +%d-%m-%Y)_*.md 2>/dev/null | head -3 | xargs cat

# Last 5 logs:
ls -t docs/AITracking/AIAction_*.md 2>/dev/null | head -5 | xargs tail -30

# Search:
grep -r "keyword" docs/AITracking/ 2>/dev/null | head -10
```

---

## Create New Log

```bash
TODAY=$(date +%d-%m-%Y)
TASK_NAME="task_name"  # lowercase, underscores
LOG_FILE="docs/AITracking/AIAction_${TODAY}_${TASK_NAME}.md"
```

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

## Update During Work

```bash
echo "## 🔄 Progress Update" >> "$LOG_FILE"
echo "- File: \`$FILE\` modified" >> "$LOG_FILE"
```

---

## Finalize After Completion

```bash
sed -i 's/Status: 🟡 In Progress/Status: ✅ Complete/' "$LOG_FILE"
```

---

## Link Commit

```bash
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "## 📦 Commit: $COMMIT_HASH" >> "$LOG_FILE"
echo "**Message:** $(git log -1 --pretty=%B)" >> "$LOG_FILE"
```

---

**Return to main workflow.**

