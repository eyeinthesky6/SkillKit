# Tech Debt Analysis - Code Health Review

**⚡ TL;DR:** Analyze complexity, duplication, outdated patterns

**Status**: ✅ ACTIVE - Quarterly or before major release  
**Duration**: 15 minutes  
**Output**: `docs/audit/Tech_Debt_Report_<DATE>.md`

---

## 📋 **What Gets Analyzed**

1. **Complexity** - High cyclomatic complexity files
2. **Duplication** - Duplicate code blocks
3. **Dead Code** - Unused exports, imports
4. **Outdated Patterns** - Deprecated patterns still in use
5. **File Size** - Oversized services (> 500 lines)
6. **Test Coverage** - Untested critical code

---

## 🔧 **Protocol (15 Minutes)**

```bash
TODAY=$(date +"%d-%m-%Y")
REPORT_FILE="docs/audit/Tech_Debt_Report_${TODAY}.md"

echo "# Tech Debt Report - ${TODAY}" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. File complexity (lines of code)
echo "## 1. Large Files (> 500 lines)" >> "$REPORT_FILE"
find packages/shared/src/services -name "*.ts" -type f -exec wc -l {} \; | \
  awk '$1 > 500' | sort -rn | head -10 | \
  while read -r lines file; do
    echo "- $file: $lines lines" >> "$REPORT_FILE"
  done
echo "" >> "$REPORT_FILE"

# 2. Duplicate schemas
echo "## 2. Schema Duplication" >> "$REPORT_FILE"
pnpm run schemas:analyze 2>&1 | tee -a "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 3. Deprecated patterns still in use
echo "## 3. Deprecated Patterns" >> "$REPORT_FILE"

# Check for TypeScript enums (should be z.enum)
TS_ENUMS=$(grep -r "^enum " packages/shared/src/ --include="*.ts" | wc -l)
echo "- TypeScript enums: $TS_ENUMS (should use z.enum())" >> "$REPORT_FILE"

# Check for 'any' usage (should be typed)
ANY_USAGE=$(grep -r ": any" packages/ apps/ --include="*.ts" | grep -v ".test." | wc -l)
echo "- 'any' type usage: $ANY_USAGE (should be typed)" >> "$REPORT_FILE"

# Check for wildcard exports (causes circular deps)
WILDCARD_EXPORTS=$(grep -r "export \* from" packages/shared/src/ --include="*.ts" | wc -l)
echo "- Wildcard exports: $WILDCARD_EXPORTS (use explicit named exports)" >> "$REPORT_FILE"

# Check for direct file imports (should be barrel imports)
DIRECT_IMPORTS=$(grep -r "from '.*\.contract'" packages/ apps/ --include="*.ts" | wc -l)
echo "- Direct file imports: $DIRECT_IMPORTS (use barrel imports)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 4. Circular dependencies
echo "## 4. Circular Dependencies" >> "$REPORT_FILE"
pnpm exec madge --circular packages/shared/src 2>&1 | tee /tmp/circular.log
CYCLES=$(grep -c "Circular" /tmp/circular.log || echo "0")
echo "- Dependency cycles: $CYCLES" >> "$REPORT_FILE"
if [ $CYCLES -gt 0 ]; then
  grep "Circular" /tmp/circular.log | head -5 >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# 5. TODO/FIXME count (technical debt markers)
echo "## 5. Technical Debt Markers" >> "$REPORT_FILE"
node scripts/validation/todo-tracker.cjs > /tmp/todos.txt
TODO_COUNT=$(grep -c "TODO\|FIXME\|HACK" /tmp/todos.txt || echo "0")
MOCK_COUNT=$(grep -c "MOCK\|STUB" /tmp/todos.txt || echo "0")
echo "- TODOs/FIXMEs: $TODO_COUNT" >> "$REPORT_FILE"
echo "- Mocks/Stubs: $MOCK_COUNT" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 6. Commented out code
echo "## 6. Commented Out Code" >> "$REPORT_FILE"
COMMENTED=$(grep -rE "^\s*//.*\(|^\s*//.*{" packages/shared/src/ --include="*.ts" | wc -l)
echo "- Commented code blocks: ~$COMMENTED" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 7. Import pattern violations
echo "## 7. Import Pattern Violations" >> "$REPORT_FILE"
# Check for @profitpilot/platform (deprecated)
OLD_PLATFORM=$(grep -r "@profitpilot/platform" packages/ apps/ --include="*.ts" | wc -l)
echo "- Old @profitpilot/platform imports: $OLD_PLATFORM (use @profitpilot/shared/utilities)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Summary
echo "## 📊 Tech Debt Score" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Calculate debt score (higher = more debt)
DEBT_SCORE=$(($TS_ENUMS + ($ANY_USAGE / 10) + ($WILDCARD_EXPORTS * 2) + ($CYCLES * 5) + ($TODO_COUNT / 10) + ($MOCK_COUNT * 2)))
echo "**Total Debt Score: $DEBT_SCORE points**" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| Category | Count | Weight | Impact |" >> "$REPORT_FILE"
echo "|----------|-------|--------|--------|" >> "$REPORT_FILE"
echo "| Large files | $(find packages/shared/src/services -name "*.ts" -exec wc -l {} \; | awk '$1 > 500' | wc -l) | Low | $([ $(find packages/shared/src/services -name "*.ts" -exec wc -l {} \; | awk '$1 > 500' | wc -l) -eq 0 ] && echo '✅' || echo '⚠️') |" >> "$REPORT_FILE"
echo "| TS enums | $TS_ENUMS | Medium | $([ $TS_ENUMS -eq 0 ] && echo '✅' || echo '❌') |" >> "$REPORT_FILE"
echo "| 'any' usage | $ANY_USAGE | High | $([ $ANY_USAGE -lt 10 ] && echo '✅' || echo '❌') |" >> "$REPORT_FILE"
echo "| Circular deps | $CYCLES | Critical | $([ $CYCLES -eq 0 ] && echo '✅' || echo '🔴') |" >> "$REPORT_FILE"
echo "| TODOs | $TODO_COUNT | Medium | $([ $TODO_COUNT -lt 50 ] && echo '✅' || echo '⚠️') |" >> "$REPORT_FILE"
echo "| Mocks/Stubs | $MOCK_COUNT | Critical | $([ $MOCK_COUNT -eq 0 ] && echo '✅' || echo '🔴') |" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Recommendations
echo "## 🎯 Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $DEBT_SCORE -gt 50 ]; then
  echo "### 🔴 HIGH DEBT - Refactoring Sprint Needed" >> "$REPORT_FILE"
  echo "- Allocate 1-2 sprints for technical debt cleanup" >> "$REPORT_FILE"
elif [ $DEBT_SCORE -gt 20 ]; then
  echo "### 🟡 MEDIUM DEBT - Address Top Issues" >> "$REPORT_FILE"
  echo "- Fix top 3 debt sources this sprint" >> "$REPORT_FILE"
else
  echo "### ✅ LOW DEBT - Maintain Quality" >> "$REPORT_FILE"
  echo "- Continue current practices" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# Action plan
echo "## 🛠️ Action Plan" >> "$REPORT_FILE"
echo "1. **Immediate** (This Week):" >> "$REPORT_FILE"
if [ $MOCK_COUNT -gt 0 ]; then
  echo "   - Remove $MOCK_COUNT mocks/stubs (ZERO TOLERANCE)" >> "$REPORT_FILE"
fi
if [ $CYCLES -gt 0 ]; then
  echo "   - Break $CYCLES circular dependencies" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

echo "2. **Short-term** (This Sprint):" >> "$REPORT_FILE"
if [ $TS_ENUMS -gt 0 ]; then
  echo "   - Convert $TS_ENUMS TypeScript enums to z.enum()" >> "$REPORT_FILE"
fi
if [ $WILDCARD_EXPORTS -gt 0 ]; then
  echo "   - Replace $WILDCARD_EXPORTS wildcard exports with named exports" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

echo "3. **Long-term** (Next Quarter):" >> "$REPORT_FILE"
echo "   - Reduce 'any' usage by 50% (current: $ANY_USAGE)" >> "$REPORT_FILE"
echo "   - Split large files (> 500 lines) into focused modules" >> "$REPORT_FILE"

cat "$REPORT_FILE"
```

---

## ✅ **Success Criteria**

- ✅ Tech debt quantified (score < 20 is healthy)
- ✅ Top debt sources identified
- ✅ Action plan with priorities
- ✅ Quarterly trend tracked

---

**Status**: ✅ ACTIVE  
**Frequency**: Quarterly or before major release  
**See Also**: `SYSTEM_AUDIT.md`, `SPRINT_PLANNING.md`

