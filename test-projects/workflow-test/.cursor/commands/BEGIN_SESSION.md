# Begin Session

**Purpose:** Start development with context and diagnostics

---

---
## ⚠️ NO MOCKS, NO STUBS
---

## Step 1: Load Context (30s)

```bash
# Check recent work (if docs exist)
TODAY=$(date +"%d-%m-%Y" 2>/dev/null || date +"%Y-%m-%d")
[ -d "docs/AITracking" ] && ls -t docs/AITracking/*${TODAY}* 2>/dev/null | head -3

# Show recent commits
git log --oneline --since="8 hours ago" 2>/dev/null | head -5
```

**What this does:** Shows your recent work and commits

---

## Step 2: Run Diagnostics (2min)

```bash
tsk diagnose 2>&1 | tee /tmp/skillkit-diagnostics.log
```

**What this does:** Checks project health (lint, types, tests)

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
