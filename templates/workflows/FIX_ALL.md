# Fix All Errors

**Purpose:** Systematically fix all lint, type, and build errors

---

## Phase 0: Error Assessment

**Get complete error picture:**

```bash
echo "🔍 ERROR ASSESSMENT: Getting complete error picture"

# Detect project type and tools
if [ -f "package.json" ]; then
  PROJECT_TYPE="javascript"
  LINT_CMD="npm run lint"
  TYPE_CMD="npm run type-check"
  BUILD_CMD="npm run build"
  TEST_CMD="npm test"
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  PROJECT_TYPE="python"
  LINT_CMD="python -m flake8 src/"
  TYPE_CMD="python -m mypy src/"
  BUILD_CMD="python -m build"
  TEST_CMD="python -m pytest"
else
  echo "❌ Unsupported project type"
  exit 1
fi

echo "Project type: $PROJECT_TYPE"
echo "Lint command: $LINT_CMD"
echo "Type command: $TYPE_CMD"
echo "Build command: $BUILD_CMD"
echo "Test command: $TEST_CMD"
```

---

## Phase 1: Generate Error Report

**Create comprehensive error analysis:**

```bash
ERROR_REPORT="docs/audit/error_analysis_$(date +%Y-%m-%d).md"

cat > "$ERROR_REPORT" << 'EOF'
# Error Analysis Report

**Date:** $(date)
**Project:** $(basename $(pwd))
**Type:** ${PROJECT_TYPE}

## Error Summary

### Linting Errors
EOF

# Run lint and capture
$LINT_CMD 2>&1 | tee /tmp/lint_errors.log
LINT_COUNT=$(grep -cE "error|✖|E[0-9]|W[0-9]" /tmp/lint_errors.log || echo "0")

echo "- Total lint errors: $LINT_COUNT" >> "$ERROR_REPORT"
echo "" >> "$ERROR_REPORT"
echo "### Top Lint Error Files" >> "$ERROR_REPORT"
grep -E "error|✖|E[0-9]|W[0-9]" /tmp/lint_errors.log | cut -d: -f1 | sort | uniq -c | sort -nr | head -10 >> "$ERROR_REPORT"

# Run type check
echo "" >> "$ERROR_REPORT"
echo "### Type Errors" >> "$ERROR_REPORT"
$TYPE_CMD 2>&1 | tee /tmp/type_errors.log
TYPE_COUNT=$(grep -c "error" /tmp/type_errors.log || echo "0")

echo "- Total type errors: $TYPE_COUNT" >> "$ERROR_REPORT"
echo "" >> "$ERROR_REPORT"
echo "### Top Type Error Files" >> "$ERROR_REPORT"
grep "error" /tmp/type_errors.log | cut -d: -f1 | sort | uniq -c | sort -nr | head -10 >> "$ERROR_REPORT"

# Build check
echo "" >> "$ERROR_REPORT"
echo "### Build Status" >> "$ERROR_REPORT"
$BUILD_CMD 2>&1 | tee /tmp/build_errors.log
BUILD_STATUS=$?
echo "- Build status: $([ $BUILD_STATUS -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')" >> "$ERROR_REPORT"

if [ $BUILD_STATUS -ne 0 ]; then
  echo "" >> "$ERROR_REPORT"
  echo "### Build Errors" >> "$ERROR_REPORT"
  grep -A2 -B1 "error\|Error\|ERROR" /tmp/build_errors.log | head -20 >> "$ERROR_REPORT"
fi

echo "" >> "$ERROR_REPORT"
echo "## Action Plan" >> "$ERROR_REPORT"
echo "" >> "$ERROR_REPORT"

# Generate action plan
TOTAL_ERRORS=$((LINT_COUNT + TYPE_COUNT))

if [ $BUILD_STATUS -ne 0 ]; then
  echo "### 🚨 PRIORITY 1: Fix Build Errors" >> "$ERROR_REPORT"
  echo "- Build must pass before other fixes" >> "$ERROR_REPORT"
  echo "- Focus on compilation/import errors" >> "$ERROR_REPORT"
elif [ $TOTAL_ERRORS -gt 50 ]; then
  echo "### 🚨 PRIORITY 1: Use FEATURE_FIX_STRATEGY" >> "$ERROR_REPORT"
  echo "- Too many errors ($TOTAL_ERRORS) for manual fixing" >> "$ERROR_REPORT"
  echo "- Use systematic approach for error-heavy features" >> "$ERROR_REPORT"
else
  echo "### ✅ PRIORITY 1: Manual Error Fixing" >> "$ERROR_REPORT"
  echo "- Fix errors systematically by file/type" >> "$ERROR_REPORT"
  echo "- Start with highest impact files" >> "$ERROR_REPORT"
fi

echo "" >> "$ERROR_REPORT"
echo "### Error Categories to Fix:" >> "$ERROR_REPORT"
echo "1. **Syntax Errors** - Fix immediately (block everything)" >> "$ERROR_REPORT"
echo "2. **Import Errors** - Fix dependencies first" >> "$ERROR_REPORT"
echo "3. **Type Errors** - Fix type safety issues" >> "$ERROR_REPORT"
echo "4. **Style/Lint Errors** - Fix formatting and style" >> "$ERROR_REPORT"

echo "" >> "$ERROR_REPORT"
echo "**Report generated:** $(date)" >> "$ERROR_REPORT"

echo "📊 Error analysis complete!"
echo "📄 Report: $ERROR_REPORT"
echo ""
echo "📈 Summary:"
echo "- Lint errors: $LINT_COUNT"
echo "- Type errors: $TYPE_COUNT"
echo "- Build status: $([ $BUILD_STATUS -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo "- Total errors: $TOTAL_ERRORS"
```

---

## Phase 2: Prioritized Fixing Strategy

**Fix errors in the right order:**

```bash
echo ""
echo "🎯 FIXING STRATEGY:"

# Critical path - must fix first
echo "1. 🚨 CRITICAL ERRORS (fix immediately):"
echo "   - Syntax errors (break compilation)"
echo "   - Import/module errors (break dependencies)"
echo "   - Build failures"

# High priority
echo "2. 🔴 HIGH PRIORITY (fix next):"
echo "   - Type errors (safety issues)"
echo "   - Runtime errors (break functionality)"

# Medium priority
echo "3. 🟡 MEDIUM PRIORITY (fix systematically):"
echo "   - Code style violations"
echo "   - Unused imports/variables"
echo "   - Documentation issues"

# Low priority
echo "4. 🟢 LOW PRIORITY (fix when convenient):"
echo "   - Minor style issues"
echo "   - Optimization suggestions"
echo "   - Code cleanliness"
```

---

## Phase 3: Execute Fixes

**Fix errors systematically:**

```bash
echo ""
echo "🔧 EXECUTION: Fix errors by category"

# 1. Fix build-breaking errors first
if [ $BUILD_STATUS -ne 0 ]; then
  echo "Step 1: Fixing build errors..."
  # Fix syntax errors, import errors, etc.
  echo "   - Check syntax: $LINT_CMD | head -20"
  echo "   - Fix imports: Check missing dependencies"
  echo "   - Fix compilation errors"
fi

# 2. Fix type errors
if [ $TYPE_COUNT -gt 0 ]; then
  echo "Step 2: Fixing type errors..."
  echo "   - Run: $TYPE_CMD | head -20"
  echo "   - Add missing type annotations"
  echo "   - Fix type mismatches"
  echo "   - Add null checks where needed"
fi

# 3. Fix linting errors
if [ $LINT_COUNT -gt 0 ]; then
  echo "Step 3: Fixing lint errors..."
  echo "   - Run: $LINT_CMD | head -20"
  echo "   - Fix formatting (prettier, black, etc.)"
  echo "   - Remove unused imports/variables"
  echo "   - Fix naming conventions"
fi

echo ""
echo "💡 TIPS:"
echo "- Fix one file at a time, re-run checks after each"
echo "- Use your IDE's error highlighting"
echo "- Commit after each major fix batch"
echo "- Re-run full checks after every 10 fixes"
```

---

## Phase 4: Validate Progress

**Track improvement and verify fixes:**

```bash
echo ""
echo "✅ VALIDATION: Track progress"

# Re-run checks
echo "Re-running error checks..."
$LINT_CMD > /tmp/lint_after.log 2>&1
$TYPE_CMD > /tmp/type_after.log 2>&1
$BUILD_CMD > /tmp/build_after.log 2>&1

NEW_LINT_COUNT=$(grep -cE "error|✖|E[0-9]|W[0-9]" /tmp/lint_after.log || echo "0")
NEW_TYPE_COUNT=$(grep -c "error" /tmp/type_after.log || echo "0")
NEW_BUILD_STATUS=$?

echo ""
echo "📊 PROGRESS REPORT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Lint errors: $LINT_COUNT → $NEW_LINT_COUNT ($(($LINT_COUNT - $NEW_LINT_COUNT)) fixed)"
echo "Type errors: $TYPE_COUNT → $NEW_TYPE_COUNT ($(($TYPE_COUNT - $NEW_TYPE_COUNT)) fixed)"
echo "Build: $([ $BUILD_STATUS -eq 0 ] && echo 'PASS' || echo 'FAIL') → $([ $NEW_BUILD_STATUS -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

IMPROVEMENT=$(( ($LINT_COUNT - $NEW_LINT_COUNT) + ($TYPE_COUNT - $NEW_TYPE_COUNT) ))
echo "🎯 Errors fixed: $IMPROVEMENT"

if [ $NEW_BUILD_STATUS -eq 0 ] && [ $NEW_LINT_COUNT -eq 0 ] && [ $NEW_TYPE_COUNT -eq 0 ]; then
  echo "🎉 SUCCESS: All errors fixed!"
  exit 0
elif [ $IMPROVEMENT -gt 0 ]; then
  echo "📈 PROGRESS: $IMPROVEMENT errors fixed, continue fixing..."
  # Update the report
  echo "" >> "$ERROR_REPORT"
  echo "## Progress Update - $(date)" >> "$ERROR_REPORT"
  echo "- Errors fixed: $IMPROVEMENT" >> "$ERROR_REPORT"
  echo "- Remaining: $(($NEW_LINT_COUNT + $NEW_TYPE_COUNT))" >> "$ERROR_REPORT"
else
  echo "⚠️ No progress detected - review fixing approach"
fi
```

---

## Phase 5: Completion Check

**Verify all errors are resolved:**

```bash
echo ""
echo "🎯 COMPLETION CHECK:"

# Final comprehensive check
FINAL_LINT=$($LINT_CMD 2>&1 | grep -cE "error|✖|E[0-9]|W[0-9]" || echo "0")
FINAL_TYPE=$($TYPE_CMD 2>&1 | grep -c "error" || echo "0")
$BUILD_CMD > /dev/null 2>&1
FINAL_BUILD=$?

if [ $FINAL_LINT -eq 0 ] && [ $FINAL_TYPE -eq 0 ] && [ $FINAL_BUILD -eq 0 ]; then
  echo "✅ COMPLETE: All errors fixed!"
  echo "🎉 Ready for next phase"
  exit 0
else
  echo "⚠️ REMAINING ERRORS:"
  [ $FINAL_LINT -gt 0 ] && echo "   - Lint: $FINAL_LINT errors"
  [ $FINAL_TYPE -gt 0 ] && echo "   - Type: $FINAL_TYPE errors"
  [ $FINAL_BUILD -ne 0 ] && echo "   - Build: failing"
  echo ""
  echo "Continue fixing or use FEATURE_FIX_STRATEGY for overwhelming errors"
  exit 1
fi
```

---

## Success Criteria

- ✅ All syntax/import errors fixed
- ✅ Build passes successfully
- ✅ Type errors resolved
- ✅ Linting errors addressed
- ✅ Progress tracked and documented
- ✅ No new errors introduced

---

## Error Categories & Fixes

### Syntax Errors
- **Common:** Missing semicolons, brackets, quotes
- **Fix:** Use IDE syntax highlighting, run linter

### Import Errors
- **Common:** Missing dependencies, wrong paths, circular imports
- **Fix:** Check package.json/pyproject.toml, verify file paths

### Type Errors
- **Common:** Missing types, wrong types, null safety
- **Fix:** Add type annotations, use union types, add null checks

### Style Errors
- **Common:** Formatting, naming, unused code
- **Fix:** Run formatters (prettier, black), fix naming, remove unused code

---

**Commands:**
- Linting tools (`eslint`, `flake8`, `pylint`)
- Type checkers (`tsc --noEmit`, `mypy`)
- Build tools (`npm run build`, `python -m build`)
- Formatters (`prettier`, `black`)

**When to use:** When there are multiple lint/type errors to fix systematically
