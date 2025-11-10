# DEDUP - Duplicate Detection & Resolution

**⚡ TL;DR:** Detects duplicates → Records issue → Agent MUST fix before feature complete

**🎯 PURPOSE:** Detect critical duplication, log for resolution (non-blocking during scan, MUST resolve before done)

---

## 🎯 **Usage**

```bash
# Before work: Check if duplicates exist
bash .cursor/commands/DEDUP.md check "fee calculation"

# After work: Verify no new duplicates created
bash .cursor/commands/DEDUP.md verify "fee calculation"

# Found duplicates? Auto-consolidate
bash .cursor/commands/DEDUP.md fix "fee calculation"
```

---

## 📋 **Protocol**

```bash
#!/bin/bash
ACTION="$1"  # check | verify | fix
FEATURE="$2"

case "$ACTION" in
  check|verify)
    echo "🔍 Scanning for: $FEATURE"
    
    # Find all matching files
    FILES=$(grep -ril "$FEATURE" packages/shared/src/ apps/ --include="*.ts" | grep -v ".test." | grep -v "node_modules")
    
    # Group by type
    CONTRACTS=$(echo "$FILES" | grep "contracts/")
    SERVICES=$(echo "$FILES" | grep "services/")
    UTILS=$(echo "$FILES" | grep "utilities/")
    ADAPTERS=$(echo "$FILES" | grep "adapters/")
    
    # Count duplicates
    C_COUNT=$(echo "$CONTRACTS" | grep -c . || echo "0")
    S_COUNT=$(echo "$SERVICES" | grep -c . || echo "0")
    U_COUNT=$(echo "$UTILS" | grep -c . || echo "0")
    A_COUNT=$(echo "$ADAPTERS" | grep -c . || echo "0")
    
    # Report
    echo "
📊 Duplicate Analysis:
- Contracts: $C_COUNT files
- Services: $S_COUNT files
- Utilities: $U_COUNT files
- Adapters: $A_COUNT files
"
    
    # Show files
    [ $C_COUNT -gt 1 ] && echo "⚠️  Multiple contracts:" && echo "$CONTRACTS"
    [ $S_COUNT -gt 1 ] && echo "⚠️  Multiple services:" && echo "$SERVICES"
    [ $U_COUNT -gt 1 ] && echo "⚠️  Multiple utilities:" && echo "$UTILS"
    [ $A_COUNT -gt 1 ] && echo "⚠️  Multiple adapters:" && echo "$ADAPTERS"
    
    # Decision (RECORDS ISSUE)
    TOTAL=$((C_COUNT + S_COUNT + U_COUNT + A_COUNT))
    if [ $TOTAL -gt 4 ]; then
      echo "
🔴 DUPLICATES DETECTED: $TOTAL files found
🔴 CRITICAL: Must consolidate before feature complete
🔴 Recorded in: /tmp/dedup_issues_\$(date +%Y%m%d).log
"
      # Record issue for resolution
      echo "DUPLICATE|$FEATURE|$TOTAL files|$(date)" >> /tmp/dedup_issues_$(date +%Y%m%d).log
      
      # Exit 0 to not stop workflow, but agent MUST address
      exit 0
    else
      echo "✅ No duplicates - single implementation"
      exit 0
    fi
    ;;
    
  fix)
    echo "🔧 Consolidating: $FEATURE"
    
    # 1. Find all files
    FILES=$(grep -ril "$FEATURE" packages/shared/src/ apps/ --include="*.ts" | grep -v ".test.")
    
    # 2. Analyze each file for quality
    echo "📋 Analyzing file quality..."
    for file in $FILES; do
      # Count mocks/TODOs (bad indicators)
      MOCKS=$(grep -c "mock\|stub\|TODO\|FIXME\|placeholder" "$file" 2>/dev/null || echo "0")
      
      # Count actual code lines (good indicator)
      CODE_LINES=$(grep -cE "^[[:space:]]*(export|function|class|const|async)" "$file" 2>/dev/null || echo "0")
      
      # Count imports from this file (usage indicator)
      FILE_NAME=$(basename "$file" .ts)
      USAGE=$(grep -r "from.*$FILE_NAME" packages/ apps/ --include="*.ts" | wc -l)
      
      # Score: usage * code_lines - mocks
      SCORE=$(( (USAGE * CODE_LINES) - (MOCKS * 10) ))
      
      echo "$SCORE|$USAGE|$CODE_LINES|$MOCKS|$file"
    done | sort -t'|' -k1 -rn > /tmp/dedup_analysis.txt
    
    # 3. Identify canonical (highest score = most used + most complete - least mocks)
    CANONICAL=$(head -1 /tmp/dedup_analysis.txt | cut -d'|' -f5)
    
    echo "
✅ CANONICAL (keep): $CANONICAL
$(head -1 /tmp/dedup_analysis.txt | awk -F'|' '{print "   Usage: "$2" imports | Code: "$3" lines | Issues: "$4" mocks/TODOs"}')"
    
    echo "
❌ DUPLICATES (review for deletion):
"
    tail -n +2 /tmp/dedup_analysis.txt | while IFS='|' read score usage code mocks file; do
      echo "   $file"
      echo "   Usage: $usage imports | Code: $code lines | Issues: $mocks mocks/TODOs"
      echo ""
    done
    
    # 4. Show consolidation plan
    echo "
🔧 CONSOLIDATION PLAN:

1. Review canonical: $CANONICAL
2. Check for missing functionality in duplicates
3. Merge any unique code into canonical
4. Update imports in consumers:
"
    
    # Find all imports of duplicate files
    tail -n +2 /tmp/dedup_analysis.txt | cut -d'|' -f5 | while read dup_file; do
      DUP_NAME=$(basename "$dup_file" .ts)
      CONSUMERS=$(grep -rl "from.*$DUP_NAME" packages/ apps/ --include="*.ts" --include="*.tsx" | grep -v "$dup_file")
      [ -n "$CONSUMERS" ] && echo "   Update imports in:" && echo "$CONSUMERS" | sed 's/^/      /'
    done
    
    echo "
5. Delete duplicate files (after import update)
6. Run: pnpm run lint && pnpm run type-check
7. Commit: 'refactor: consolidate $FEATURE duplicates'

⚠️  MANUAL REVIEW REQUIRED - Do not auto-delete!
"
    ;;
    
  *)
    echo "Usage: DEDUP.md {check|verify|fix} \"feature name\""
    exit 1
    ;;
esac
```

---

## 🚨 **Root Causes of Duplication**

### **Why Agents Create Duplicates:**

1. **Blind Coding** - Not checking existing code first
2. **Session Amnesia** - Different agent, different session
3. **Similar Names** - `FeeService` vs `FeeCalculationService`
4. **Different Packages** - Same logic in multiple packages
5. **Incomplete Search** - Only checked one location
6. **Mock vs Real** - Created new instead of completing existing

### **DEDUP Prevents:**

- ✅ Scans ALL packages (shared, core, apps)
- ✅ Identifies canonical by USAGE (not agent preference)
- ✅ Scores files: (usage × code) - mocks
- ✅ Shows which file is MOST WIRED UP
- ✅ Prevents deleting active code for mock code

---

## 🎯 **Scoring Algorithm**

```
Score = (Usage Count × Code Lines) - (Mock/TODO Count × 10)

High score = More used + More complete - Less mocks
→ This is the CANONICAL file to keep

Low score = Less used OR more mocks OR less code
→ These are duplicates to review/delete
```

**Example:**
```
File A: 15 imports × 200 lines - (5 mocks × 10) = 2950 ← CANONICAL
File B: 2 imports × 50 lines - (20 mocks × 10) = -100 ← DUPLICATE (mock!)
File C: 0 imports × 100 lines - (0 mocks × 10) = 0 ← UNUSED
```

---

## 🔴 **CRITICAL: Duplicates MUST Be Fixed**

**Workflow behavior:**

```bash
# 1. During Phase 0 - Detect & Record
bash .cursor/commands/DEDUP.md check "feature"
# → Detects duplicates
# → Records in /tmp/dedup_issues_YYYYMMDD.log
# → Agent continues (doesn't stop mid-phase)

# 2. Agent continues implementation phases...

# 3. Before marking complete - MUST RESOLVE
# Check for recorded issues:
if [ -f /tmp/dedup_issues_$(date +%Y%m%d).log ]; then
  echo "🔴 UNRESOLVED DUPLICATES - Run consolidation"
  bash .cursor/commands/DEDUP.md fix "feature"
  # Agent MUST consolidate before feature complete
fi
```

**Priority:**
1. ✅ Broken/incomplete implementations (highest)
2. 🔴 **Duplicates** (critical - causes drift)
3. ⚠️  Dependency chain issues (important)

**Key:** Doesn't stop mid-workflow, but MUST resolve before done

---

**Status:** ✅ Single command for all duplication checks

