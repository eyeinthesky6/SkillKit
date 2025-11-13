# Technical Debt Analysis

**Purpose:** Analyze code complexity, duplication, and outdated patterns

---

## Phase 1: Code Complexity Analysis

**Measure code complexity metrics:**

```bash
ANALYSIS_DATE=$(date +%Y-%m-%d)
REPORT_FILE="docs/audit/tech_debt_analysis_${ANALYSIS_DATE}.md"

cat > "$REPORT_FILE" << 'EOF'
# Technical Debt Analysis Report

**Date:** ${ANALYSIS_DATE}
**Project:** $(basename $(pwd))

## Executive Summary

### Debt Score: [Calculated below]
### Key Findings:
- [Top issues identified]
- [Actionable recommendations]

---
EOF

echo "🔍 Analyzing code complexity..."

# Find source directories
if [ -d "src" ]; then
  SRC_DIR="src"
elif [ -d "lib" ]; then
  SRC_DIR="lib"
elif [ -d "packages" ]; then
  SRC_DIR="packages"
else
  SRC_DIR="."
fi

echo "## 1. File Complexity (Lines of Code)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Analyze file sizes
find $SRC_DIR -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.java" | \
  xargs wc -l | sort -nr | head -20 | \
  while read lines file; do
    if [ "$lines" -gt 500 ]; then
      echo "- 🚨 **$file**: $lines lines (TOO LARGE)" >> "$REPORT_FILE"
    elif [ "$lines" -gt 300 ]; then
      echo "- ⚠️ **$file**: $lines lines (LARGE)" >> "$REPORT_FILE"
    else
      echo "- ✅ **$file**: $lines lines" >> "$REPORT_FILE"
    fi
  done

echo "" >> "$REPORT_FILE"
echo "### Complexity Recommendations" >> "$REPORT_FILE"
LARGE_FILES=$(find $SRC_DIR -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.java" | xargs wc -l | awk '$1 > 300' | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
  echo "- $LARGE_FILES files > 300 lines - consider splitting into smaller modules" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"
```

---

## Phase 2: Code Duplication Check

**Find duplicate code blocks:**

```bash
echo "## 2. Code Duplication" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for code duplication tools
if command -v jscpd >/dev/null 2>&1; then
  echo "Using JSCPD for duplication detection..." >> "$REPORT_FILE"
  npx jscpd $SRC_DIR --min-lines 10 --reporters console 2>/dev/null | tail -10 >> "$REPORT_FILE" || echo "No significant duplications found" >> "$REPORT_FILE"
elif command -v pmccabe >/dev/null 2>&1; then
  echo "Using PMCCABE for complexity analysis..." >> "$REPORT_FILE"
  pmccabe $SRC_DIR/* | sort -nr | head -10 >> "$REPORT_FILE" || echo "Complexity analysis completed" >> "$REPORT_FILE"
else
  echo "⚠️ No advanced duplication tools found. Manual review recommended." >> "$REPORT_FILE"
  echo "Install: npm install -g jscpd  # JavaScript/TypeScript" >> "$REPORT_FILE"
  echo "Or: pip install pmccabe        # General complexity" >> "$REPORT_FILE"
fi

# Basic duplication check using grep
echo "" >> "$REPORT_FILE"
echo "### Basic Pattern Duplication" >> "$REPORT_FILE"
echo "- Checking for repeated code patterns..." >> "$REPORT_FILE"

# Find repeated function signatures (basic check)
if [ -n "$(find $SRC_DIR -name "*.py" | head -1)" ]; then
  echo "- Python functions with similar signatures:" >> "$REPORT_FILE"
  grep -r "def " $SRC_DIR --include="*.py" | sed 's/.*def /def /' | sort | uniq -c | sort -nr | awk '$1 > 1' | head -5 >> "$REPORT_FILE" || echo "  No obvious duplications" >> "$REPORT_FILE"
fi

if [ -n "$(find $SRC_DIR -name "*.ts" -o -name "*.js" | head -1)" ]; then
  echo "- JavaScript/TypeScript functions with similar signatures:" >> "$REPORT_FILE"
  grep -r "function \|=> \|const .* = (" $SRC_DIR --include="*.ts" --include="*.js" | wc -l >> "$REPORT_FILE" 2>/dev/null || echo "  Analysis skipped" >> "$REPORT_FILE"
fi
```

---

## Phase 3: Outdated Patterns Analysis

**Find deprecated code patterns:**

```bash
echo "" >> "$REPORT_FILE"
echo "## 3. Outdated Patterns & Technical Debt" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for various outdated patterns
echo "### Deprecated Language Features" >> "$REPORT_FILE"

# JavaScript/TypeScript checks
if [ -n "$(find $SRC_DIR -name "*.ts" -o -name "*.js" | head -1)" ]; then
  echo "#### JavaScript/TypeScript Issues:" >> "$REPORT_FILE"

  # Check for var usage (should use let/const)
  VAR_COUNT=$(grep -r "var " $SRC_DIR --include="*.ts" --include="*.js" | wc -l 2>/dev/null || echo "0")
  if [ "$VAR_COUNT" -gt 0 ]; then
    echo "- ⚠️ 'var' usage: $VAR_COUNT instances (use 'let'/'const')" >> "$REPORT_FILE"
  fi

  # Check for any usage (should use proper types)
  ANY_COUNT=$(grep -r ": any\|any>" $SRC_DIR --include="*.ts" | wc -l 2>/dev/null || echo "0")
  if [ "$ANY_COUNT" -gt 10 ]; then
    echo "- ⚠️ Excessive 'any' types: $ANY_COUNT (use proper types)" >> "$REPORT_FILE"
  fi

  # Check for console.log in production code
  CONSOLE_COUNT=$(grep -r "console\." $SRC_DIR --include="*.ts" --include="*.js" | grep -v "test" | wc -l 2>/dev/null || echo "0")
  if [ "$CONSOLE_COUNT" -gt 5 ]; then
    echo "- ⚠️ Console statements: $CONSOLE_COUNT (remove for production)" >> "$REPORT_FILE"
  fi
fi

# Python checks
if [ -n "$(find $SRC_DIR -name "*.py" | head -1)" ]; then
  echo "#### Python Issues:" >> "$REPORT_FILE"

  # Check for old-style classes
  CLASS_COUNT=$(grep -r "^class .*:$" $SRC_DIR --include="*.py" | grep -v "(object)" | wc -l 2>/dev/null || echo "0")
  if [ "$CLASS_COUNT" -gt 0 ]; then
    echo "- ⚠️ Old-style classes: $CLASS_COUNT (inherit from object or use dataclasses)" >> "$REPORT_FILE"
  fi

  # Check for wildcard imports
  WILDCARD_COUNT=$(grep -r "from .* import \*" $SRC_DIR --include="*.py" | wc -l 2>/dev/null || echo "0")
  if [ "$WILDCARD_COUNT" -gt 0 ]; then
    echo "- ⚠️ Wildcard imports: $WILDCARD_COUNT (use explicit imports)" >> "$REPORT_FILE"
  fi
fi

echo "" >> "$REPORT_FILE"
echo "### Code Quality Issues" >> "$REPORT_FILE"

# TODO/FIXME comments (technical debt markers)
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX\|HACK" $SRC_DIR | wc -l 2>/dev/null || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
  echo "- 📝 TODO/FIXME comments: $TODO_COUNT (address technical debt)" >> "$REPORT_FILE"
fi

# Commented out code
COMMENTED_COUNT=$(grep -r "^\s*//#\|^#\s" $SRC_DIR | wc -l 2>/dev/null || echo "0")
if [ "$COMMENTED_COUNT" -gt 50 ]; then
  echo "- 🗑️ Commented code blocks: ~$COMMENTED_COUNT (remove dead code)" >> "$REPORT_FILE"
fi

# Empty functions/classes
EMPTY_COUNT=$(grep -A5 -B1 "^\s*def \|^\s*function \|^\s*class " $SRC_DIR | grep -c "pass\|{}\|\s*$" || echo "0")
if [ "$EMPTY_COUNT" -gt 10 ]; then
  echo "- 🎭 Empty implementations: $EMPTY_COUNT (implement or remove stubs)" >> "$REPORT_FILE"
fi
```

---

## Phase 4: Calculate Debt Score

**Generate overall technical debt assessment:**

```bash
echo "" >> "$REPORT_FILE"
echo "## 4. Technical Debt Score" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Calculate debt score
LARGE_FILE_PENALTY=$((LARGE_FILES * 2))
VAR_PENALTY=$((VAR_COUNT / 5))
ANY_PENALTY=$((ANY_COUNT / 10))
CONSOLE_PENALTY=$((CONSOLE_COUNT / 5))
TODO_PENALTY=$((TODO_COUNT / 10))
COMMENTED_PENALTY=$((COMMENTED_COUNT / 100))
WILDCARD_PENALTY=$((WILDCARD_COUNT * 3))

DEBT_SCORE=$((LARGE_FILE_PENALTY + VAR_PENALTY + ANY_PENALTY + CONSOLE_PENALTY + TODO_PENALTY + COMMENTED_PENALTY + WILDCARD_PENALTY))

echo "**Overall Debt Score: $DEBT_SCORE points**" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Score interpretation
if [ $DEBT_SCORE -gt 50 ]; then
  echo "### 🚨 CRITICAL DEBT LEVEL" >> "$REPORT_FILE"
  echo "**Recommendation:** Schedule technical debt sprint immediately" >> "$REPORT_FILE"
elif [ $DEBT_SCORE -gt 20 ]; then
  echo "### ⚠️ HIGH DEBT LEVEL" >> "$REPORT_FILE"
  echo "**Recommendation:** Address top issues this sprint" >> "$REPORT_FILE"
elif [ $DEBT_SCORE -gt 10 ]; then
  echo "### 🟡 MODERATE DEBT LEVEL" >> "$REPORT_FILE"
  echo "**Recommendation:** Fix issues incrementally" >> "$REPORT_FILE"
else
  echo "### ✅ LOW DEBT LEVEL" >> "$REPORT_FILE"
  echo "**Recommendation:** Maintain current standards" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "| Category | Count | Weight | Impact |" >> "$REPORT_FILE"
echo "|----------|-------|--------|--------|" >> "$REPORT_FILE"
echo "| Large files (>300 lines) | $LARGE_FILES | High | $([ $LARGE_FILES -gt 0 ] && echo '⚠️' || echo '✅') |" >> "$REPORT_FILE"
echo "| 'var' usage | $VAR_COUNT | Medium | $([ $VAR_COUNT -gt 5 ] && echo '⚠️' || echo '✅') |" >> "$REPORT_FILE"
echo "| 'any' types | $ANY_COUNT | High | $([ $ANY_COUNT -gt 10 ] && echo '❌' || echo '✅') |" >> "$REPORT_FILE"
echo "| Console statements | $CONSOLE_COUNT | Low | $([ $CONSOLE_COUNT -gt 5 ] && echo '⚠️' || echo '✅') |" >> "$REPORT_FILE"
echo "| TODO comments | $TODO_COUNT | Medium | $([ $TODO_COUNT -gt 20 ] && echo '⚠️' || echo '✅') |" >> "$REPORT_FILE"
echo "| Commented code | ~$COMMENTED_COUNT | Low | $([ $COMMENTED_COUNT -gt 100 ] && echo '⚠️' || echo '✅') |" >> "$REPORT_FILE"
echo "| Wildcard imports | $WILDCARD_COUNT | High | $([ $WILDCARD_COUNT -gt 0 ] && echo '❌' || echo '✅') |" >> "$REPORT_FILE"
```

---

## Phase 5: Generate Action Plan

**Create prioritized recommendations:**

```bash
echo "" >> "$REPORT_FILE"
echo "## 5. Action Plan" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Immediate Actions (This Week)" >> "$REPORT_FILE"
[ $WILDCARD_COUNT -gt 0 ] && echo "- Replace $WILDCARD_COUNT wildcard imports with explicit imports" >> "$REPORT_FILE"
[ $ANY_COUNT -gt 20 ] && echo "- Reduce 'any' type usage by 50%" >> "$REPORT_FILE"
[ $VAR_COUNT -gt 10 ] && echo "- Replace 'var' with 'let'/'const'" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "### Short-term (This Sprint)" >> "$REPORT_FILE"
[ $LARGE_FILES -gt 0 ] && echo "- Break down $LARGE_FILES large files into smaller modules" >> "$REPORT_FILE"
[ $TODO_COUNT -gt 50 ] && echo "- Address high-priority TODO items" >> "$REPORT_FILE"
[ $CONSOLE_COUNT -gt 10 ] && echo "- Remove console statements from production code" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "### Long-term (Next Quarter)" >> "$REPORT_FILE"
echo "- Implement automated code quality checks" >> "$REPORT_FILE"
echo "- Set up regular technical debt reviews" >> "$REPORT_FILE"
echo "- Establish coding standards enforcement" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "**Report generated:** $(date)" >> "$REPORT_FILE"
echo "**Next review:** Quarterly or when debt score > 20" >> "$REPORT_FILE"

echo ""
echo "📊 Technical Debt Analysis Complete!"
echo "📄 Report: $REPORT_FILE"
echo ""
echo "🎯 Key Metrics:"
echo "- Debt Score: $DEBT_SCORE"
echo "- Large Files: $LARGE_FILES"
echo "- TODOs: $TODO_COUNT"
echo "- Quality Issues: $((VAR_COUNT + ANY_COUNT + CONSOLE_COUNT + WILDCARD_COUNT))"
```

---

## Success Criteria

- ✅ Code complexity analyzed
- ✅ Duplication patterns identified
- ✅ Outdated code patterns detected
- ✅ Technical debt score calculated
- ✅ Actionable recommendations provided
- ✅ Report saved to docs/audit/

---

## Debt Score Interpretation

**0-10: ✅ Excellent**
- Low technical debt
- Good code maintainability
- Minimal refactoring needed

**11-20: 🟡 Moderate**
- Some technical debt present
- Address incrementally
- Monitor growth

**21-35: ⚠️ High**
- Significant technical debt
- Dedicated effort needed
- Risk of maintenance issues

**36+: 🚨 Critical**
- High technical debt load
- Immediate refactoring required
- Risk of development slowdown

---

**Commands:**
- File analysis tools (`find`, `wc`, `grep`)
- Code quality tools (`jscpd`, `pmccabe`)
- Text processing (`sed`, `awk`, `sort`)

**When to use:** Quarterly technical reviews, before major releases, or when code quality concerns arise

**Duration:** 15-30 minutes
