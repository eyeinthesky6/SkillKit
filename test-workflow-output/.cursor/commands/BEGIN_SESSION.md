# Begin Session

**Purpose:** Start development with context and diagnostics

---

## {{CUSTOM_HEADER}}
<!-- Project-specific critical rules/standards -->
---

## Step 1: Load Context (30s)

**See:** @docs/workflows/subtasks/load-context.md  
**AITracking:** @docs/workflows/subtasks/aitracking.md

**MANDATORY: Check AITracking first!**

```bash
# Load recent AITracking logs (REQUIRED):
ls -t docs/AITracking/AIAction_*.md 2>/dev/null | head -3 | xargs tail -20

# Show recent commits
git log --oneline --since="8 hours ago" 2>/dev/null | head -5
```

**What to check:**
- Recent work completed
- Issues encountered
- Patterns to follow/avoid
- Related tasks

---

## Step 2: Run Diagnostics (2min)

**See:** @docs/workflows/subtasks/run-diagnostics.md

**Quick version:**
```bash
tsk diagnose 2>&1 | tee /tmp/skillkit-diagnostics.log
```

---

## Step 3: Show Summary

```bash
# Extract counts
ERROR_COUNT=$(grep -c "error" /tmp/skillkit-diagnostics.log 2>/dev/null || echo "0")
WARN_COUNT=$(grep -c "warning" /tmp/skillkit-diagnostics.log 2>/dev/null || echo "0")

echo ""
echo "📊 Summary: ${ERROR_COUNT} errors, ${WARN_COUNT} warnings"
```

**What this does:** Shows actual error counts

---

## Step 4: Smart Recommendations

**If errors > 50:** Fix critical errors first  
**If errors > 10:** Consider fixing before new features  
**If errors = 0:** Ready for new work

---

## Step 5: Task Menu

```
What would you like to do?

1. 🚀 Implement new feature
2. 🐛 Fix bugs/errors
3. 🔍 Check for duplicates (DEDUP)
4. ✅ Pre-deployment check
5. 📦 Manage skills (install/list)
6. 🔄 Continue last work
7. 📊 Run audit
```

**Choose option → Route to workflow**

---

## Routes

- **1** → `@IMPLEMENT_FEATURE.md`
- **2** → `@FIX_BUGS.md`
- **3** → `@DEDUP.md`
- **4** → `@DEPLOY_PREP.md`
- **5** → `tsk install` / `tsk list`
- **6** → `@CONTINUE.md`
- **7** → `@SYSTEM_AUDIT.md`

---

**Commands used:**
- `tsk diagnose` - Health check
- `git log` - Recent work
