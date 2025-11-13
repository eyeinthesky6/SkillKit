# Final Check

**Purpose:** Comprehensive final validation before marking feature complete

---

## Phase 1: Run All Quality Gates

**Execute complete quality validation:**

```bash
FEATURE_ID="$1"

echo "🔍 FINAL CHECK: Comprehensive validation for ${FEATURE_ID:-'project'}"

# 1. Linting
echo "1. 🧹 Running linter..."
if [ -f "package.json" ]; then
  npm run lint 2>&1 | tee /tmp/final-lint.log
  LINT_ERR=$(grep -cE "error|✖|failed" /tmp/final-lint.log || echo "0")
elif [ -f "pyproject.toml" ]; then
  python -m flake8 src/ 2>&1 | tee /tmp/final-lint.log
  LINT_ERR=$(grep -cE "error|✖|E[0-9]" /tmp/final-lint.log || echo "0")
else
  echo "No linting configured"
  LINT_ERR=0
fi

# 2. Type checking
echo "2. 🔍 Running type checker..."
if [ -f "package.json" ]; then
  npm run type-check 2>&1 | tee /tmp/final-type.log 2>/dev/null || npx tsc --noEmit 2>&1 | tee /tmp/final-type.log
  TYPE_ERR=$(grep -c "error" /tmp/final-type.log || echo "0")
elif [ -f "pyproject.toml" ]; then
  python -m mypy src/ 2>&1 | tee /tmp/final-type.log
  TYPE_ERR=$(grep -c "error:" /tmp/final-type.log || echo "0")
else
  echo "No type checking configured"
  TYPE_ERR=0
fi

# 3. Build
echo "3. 🔨 Running build..."
if [ -f "package.json" ]; then
  npm run build 2>&1 | tee /tmp/final-build.log
  BUILD_FAIL=$?
elif [ -f "pyproject.toml" ]; then
  python -m build 2>&1 | tee /tmp/final-build.log
  BUILD_FAIL=$?
else
  echo "Build check skipped"
  BUILD_FAIL=0
fi

# 4. Tests
echo "4. 🧪 Running tests..."
if [ -f "package.json" ]; then
  npm test -- --watchAll=false 2>&1 | tee /tmp/final-test.log
  TEST_FAIL=$?
elif [ -f "pyproject.toml" ]; then
  python -m pytest 2>&1 | tee /tmp/final-test.log
  TEST_FAIL=$?
else
  echo "Test check skipped"
  TEST_FAIL=0
fi

# 5. Additional checks (customize as needed)
echo "5. 🔍 Running additional checks..."

# Code duplication check
if command -v jscpd >/dev/null 2>&1; then
  npx jscpd src/ --min-lines 10 2>&1 | tee /tmp/final-dup.log
  DUP_ISSUES=$(grep -c "duplication" /tmp/final-dup.log || echo "0")
else
  DUP_ISSUES=0
fi

# TODO/Mock check
TODO_COUNT=$(grep -r "TODO\|FIXME\|MOCK\|STUB" src/ --include="*.ts" --include="*.js" --include="*.py" 2>/dev/null | wc -l || echo "0")

echo ""
echo "📊 FINAL CHECK RESULTS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Lint errors: $LINT_ERR"
echo "Type errors: $TYPE_ERR"
echo "Build status: $([ $BUILD_FAIL -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Test status: $([ $TEST_FAIL -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Duplications: $DUP_ISSUES"
echo "TODOs/Mocks: $TODO_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

---

## Phase 2: Evaluate Results

**Determine next action based on findings:**

```bash
# Calculate total issues
TOTAL_ISSUES=$((LINT_ERR + TYPE_ERR + DUP_ISSUES + TODO_COUNT))
BUILD_STATUS=$([ $BUILD_FAIL -eq 0 ] && echo "PASS" || echo "FAIL")
TEST_STATUS=$([ $TEST_FAIL -eq 0 ] && echo "PASS" || echo "FAIL")

echo ""
echo "🎯 EVALUATION:"

# Critical failures - cannot proceed
if [ "$BUILD_STATUS" = "FAIL" ]; then
  echo "❌ CRITICAL: Build failing - fix immediately"
  echo "🔀 Route: Use FIX_BUGS workflow for build issues"
  exit 1
fi

if [ $TYPE_ERR -gt 50 ]; then
  echo "❌ CRITICAL: Too many type errors ($TYPE_ERR)"
  echo "🔀 Route: Use FEATURE_FIX_STRATEGY for systematic fixing"
  exit 1
fi

# Quality issues - fix before marking complete
if [ $LINT_ERR -gt 20 ] || [ $TYPE_ERR -gt 10 ]; then
  echo "⚠️  QUALITY: High error count needs attention"
  echo "🔀 Route: Use fix-all workflow for systematic cleanup"
  exit 1
fi

if [ "$TEST_STATUS" = "FAIL" ]; then
  echo "⚠️  TESTS: Test failures detected"
  echo "🔀 Route: Use CREATE_TESTS or FIX_BUGS for test issues"
  exit 1
fi

if [ $TODO_COUNT -gt 10 ]; then
  echo "⚠️  TODOS: High TODO count ($TODO_COUNT)"
  echo "🔀 Route: Use todo-execution workflow"
  exit 1
fi

# Minor issues - can proceed but should note
if [ $TOTAL_ISSUES -gt 0 ]; then
  echo "✅ MINOR: Some issues remain but acceptable"
  echo "📝 Note: $TOTAL_ISSUES minor issues to address later"
  echo "🔀 Route: Mark feature complete, track issues for next sprint"
  exit 0
fi

# All clear
echo "✅ PERFECT: All checks passed!"
echo "🎉 Feature ready for production"
exit 0
```

---

## Phase 3: Generate Completion Report

**Document final validation results:**

```bash
# Create completion report
REPORT_FILE="docs/audit/final_check_$(date +%Y-%m-%d_%H-%M-%S).md"

cat > "$REPORT_FILE" << EOF
# Final Check Report

**Feature:** ${FEATURE_ID:-'Project'}
**Date:** $(date)
**Status:** $([ $? -eq 0 ] && echo '✅ PASSED' || echo '❌ FAILED')

## Validation Results

### Code Quality
- Lint errors: $LINT_ERR
- Type errors: $TYPE_ERR
- Code duplications: $DUP_ISSUES
- TODO/Mock count: $TODO_COUNT

### Build & Test
- Build status: $BUILD_STATUS
- Test status: $TEST_STATUS

### Action Taken
$(if [ $TOTAL_ISSUES -eq 0 ]; then
  echo "- ✅ Feature marked complete"
  echo "- 🎉 Ready for production"
else
  echo "- ⚠️ Issues identified, routed to appropriate workflow"
  echo "- 📋 Issues tracked for resolution"
fi)

## Next Steps
$(if [ $TOTAL_ISSUES -eq 0 ]; then
  echo "1. Deploy to staging/production"
  echo "2. Monitor for issues"
  echo "3. Update documentation"
else
  echo "1. Address issues in routed workflow"
  echo "2. Re-run final check"
  echo "3. Complete when all issues resolved"
fi)
EOF

echo "📄 Report saved: $REPORT_FILE"
```

---

## Success Criteria

- ✅ All validation checks completed
- ✅ Results properly evaluated
- ✅ Appropriate routing decision made
- ✅ Completion report generated
- ✅ Clear next steps documented

---

## Routing Logic

**❌ Cannot proceed (exit 1):**
- Build failures (critical)
- >50 type errors (overwhelming)

**⚠️ Fix required (exit 1):**
- >20 lint errors
- >10 type errors
- Test failures
- >10 TODOs

**✅ Can proceed (exit 0):**
- <20 total issues
- Build and tests pass
- Acceptable quality level

---

**Commands:**
- Quality gate runners (`npm run lint`, `npm run type-check`, etc.)
- Build tools (`npm run build`, `python -m build`)
- Test runners (`npm test`, `pytest`)
- Analysis tools (duplication checkers, TODO counters)

**When to use:** Before marking any feature or project complete, as final quality gate
