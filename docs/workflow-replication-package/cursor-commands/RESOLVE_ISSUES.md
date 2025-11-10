# RESOLVE_ISSUES - Address Recorded Problems

**⚡ TL;DR:** Check for recorded issues (duplicates, deps), resolve before marking complete

---

## 🎯 **When to Use**

Run at **end of ANY workflow** before marking feature complete:
- After `implement-feature.md`
- After `fix-all.md`
- After `FEATURE_FIX_STRATEGY.md`
- Before `FINAL_CHECK.md`

---

## 📋 **Protocol**

```bash
TODAY=$(date +%Y%m%d)

echo "🔍 Checking for recorded issues..."

# 1. Check for duplicate issues
if [ -f "/tmp/dedup_issues_${TODAY}.log" ]; then
  echo "🔴 UNRESOLVED DUPLICATES FOUND:"
  cat "/tmp/dedup_issues_${TODAY}.log"
  echo ""
  echo "🔧 MUST CONSOLIDATE:"
  
  # Extract features with duplicates
  while IFS='|' read -r type feature count timestamp; do
    [ "$type" = "DUPLICATE" ] && echo "  - Feature: $feature ($count)"
  done < "/tmp/dedup_issues_${TODAY}.log"
  
  echo ""
  echo "Run for each: bash .cursor/commands/DEDUP.md fix \"feature name\""
  echo ""
  echo "❌ FEATURE NOT COMPLETE until duplicates resolved"
  exit 1
fi

# 2. Check for dependency chain issues
if [ -f "/tmp/chain_issues_${TODAY}.log" ]; then
  echo "⚠️  DEPENDENCY CHAIN ISSUES:"
  cat "/tmp/chain_issues_${TODAY}.log" | head -20
  echo ""
  echo "⚠️  Review and fix errors in dependency chain"
  echo ""
  # Not blocking, but should address
fi

# 3. All clear
echo "✅ No recorded issues - safe to mark complete"
exit 0
```

---

## 🔴 **Priority Order**

**Agent MUST fix in this order:**

1. **Broken/Incomplete Implementations** (highest)
   - Missing methods
   - Mocks/stubs
   - TODOs

2. **Duplicates** (critical - causes core drift)
   - Multiple files for same feature
   - Consolidate into canonical
   - Update all imports

3. **Dependency Chain** (important)
   - Errors in connected features
   - Type mismatches
   - Import issues

---

## ✅ **Integration**

**Add to end of ALL code workflows:**

```bash
# After completing work
bash .cursor/commands/RESOLVE_ISSUES.md

# If exit code 1: MUST fix issues first
# If exit code 0: Safe to proceed
```

---

## 📊 **Issue Log Format**

**Duplicates:** `/tmp/dedup_issues_YYYYMMDD.log`
```
DUPLICATE|feature-name|5 files|2025-11-04 15:30
DUPLICATE|analytics|3 files|2025-11-04 16:45
```

**Dependency Chain:** `/tmp/chain_issues_YYYYMMDD.log`
```
packages/shared/src/services/fee.ts:45 - Type error
packages/shared/src/services/fee.ts:67 - Missing import
```

---

**Status:** ✅ Run before marking any feature complete

