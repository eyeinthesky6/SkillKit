# Load Context (Subtask)

## Purpose
Load recent project context for AI agent awareness.

## Load AI Tracking Logs

```bash
# Get recent AI actions:
ls -t docs/AITracking/AIAction_*.md | head -5 | xargs cat

# Or specific date:
cat docs/AITracking/AIAction_$(date +%d-%m-%Y)_*.md
```

## Load Recent Commits

```bash
# Last 10 commits:
git log --oneline -10

# Last 24 hours:
git log --since="24 hours ago" --pretty=format:"%h %s"

# With file changes:
git log --stat -5
```

## Load Sprint Status

```bash
# Current sprint:
cat docs/SprintStatus/Sprint_Status-$(date +%d-%m-%Y).md

# Or latest:
ls -t docs/SprintStatus/*.md | head -1 | xargs cat
```

## Display Context Summary

```markdown
## 📋 Session Context

### Recent Changes:
[Last 5 commits]

### Current Sprint Status:
[Today's sprint notes]

### Recent AI Actions:
[Last 3 AI tracking logs]

### Active TODOs:
[From sprint status or issue tracker]
```

---

**Context loaded - proceed with session.**

