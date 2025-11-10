# Continue Work

**Purpose:** Resume from last session

---

## Step 1: Find Last Work

```bash
# Find most recent work log
LATEST=$(ls -t docs/AITracking/*.md 2>/dev/null | head -1)

if [ -z "$LATEST" ]; then
  echo "No previous work found. Starting fresh."
  # Route to BEGIN_SESSION
  exit 0
fi

echo "Last work: $LATEST"
tail -20 "$LATEST"
```

**What this does:** Shows your last session's work

---

## Step 2: Check Status

```bash
# Check if last task was completed
if grep -q "Status: Complete\|✅ Complete" "$LATEST"; then
  echo "Last task completed. Starting new session."
else
  echo "Last task NOT completed."
fi
```

---

## Step 3: Load Context

```bash
# Show changes since last session
git diff HEAD~1 --stat

# Run current diagnostics
tsk diagnose
```

**What this does:** Shows current state

---

## Step 4: Decision

**If last task complete:**
- Start fresh with `@BEGIN_SESSION.md`

**If last task incomplete:**
```
Options:
1. Continue last task
2. Start new task
3. Review and decide
```

---

## Step 5: Resume

**If continuing:**
1. Review last work notes
2. Check current file state
3. Continue from where stopped

**If starting new:**
- Route to `@BEGIN_SESSION.md`

---

**Commands:**
- `git diff` - See changes
- `tsk diagnose` - Current state

