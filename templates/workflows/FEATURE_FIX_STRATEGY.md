# Feature Fix Strategy

**Purpose:** Systematically fix incomplete features with multiple errors

---

## Phase 0: Assess Situation

**Determine if this strategy applies:**

```bash
# Count errors in the feature
ERROR_THRESHOLD=20  # Adjust based on project size

# Generic error counting (adapt to your tools)
if [ -f "package.json" ]; then
  # JavaScript/TypeScript
  LINT_ERRORS=$(npm run lint 2>&1 | grep -c "error\|✖" || echo "0")
  TYPE_ERRORS=$(npm run type-check 2>&1 | grep -c "error" || echo "0")
  TEST_ERRORS=$(npm run test 2>&1 | grep -c "failed\|✖" || echo "0")
elif [ -f "pyproject.toml" ]; then
  # Python
  LINT_ERRORS=$(python -m flake8 src/ 2>&1 | wc -l || echo "0")
  TYPE_ERRORS=$(python -m mypy src/ 2>&1 | grep -c "error" || echo "0")
  TEST_ERRORS=$(python -m pytest 2>&1 | grep -c "failed\|ERROR" || echo "0")
fi

TOTAL_ERRORS=$((LINT_ERRORS + TYPE_ERRORS + TEST_ERRORS))

echo "Error Assessment:"
echo "- Lint errors: $LINT_ERRORS"
echo "- Type errors: $TYPE_ERRORS"
echo "- Test failures: $TEST_ERRORS"
echo "- Total errors: $TOTAL_ERRORS"

if [ $TOTAL_ERRORS -lt $ERROR_THRESHOLD ]; then
  echo "✅ Use standard FIX_BUGS workflow (errors < $ERROR_THRESHOLD)"
  exit 0
else
  echo "🚨 Use FEATURE_FIX_STRATEGY (errors >= $ERROR_THRESHOLD)"
fi
```

---

## Phase 1: Map Error Distribution

**Understand where errors are concentrated:**

```bash
echo "🔍 Analyzing error distribution..."

# Create error map (adapt paths to your project)
if [ -f "package.json" ]; then
  npm run lint 2>&1 | grep -B1 "error\|✖" | grep "\.ts\|\.js" | sort | uniq -c | sort -nr > error_map.txt
elif [ -f "pyproject.toml" ]; then
  python -m flake8 src/ 2>&1 | cut -d: -f1 | sort | uniq -c | sort -nr > error_map.txt
fi

echo "Top error files:"
cat error_map.txt | head -10

# Identify problematic modules
echo "Problematic modules:"
cat error_map.txt | awk '$1 > 10 {print $2}' | xargs dirname | sort | uniq -c | sort -nr
```

---

## Phase 2: Prioritize Fix Order

**Strategic fixing order:**

```bash
echo "🎯 Prioritization Strategy:"

# 1. Core infrastructure first
echo "1. 🔧 Fix core/shared modules first"
echo "   - Files imported by many others"
echo "   - Foundation types/interfaces"
echo "   - Critical dependencies"

# 2. High-impact errors
echo "2. 🎯 Fix high-impact errors"
echo "   - Breaking changes (build failures)"
echo "   - Runtime errors (crashes)"
echo "   - Security issues"

# 3. Systematic cleanup
echo "3. 🧹 Systematic error cleanup"
echo "   - Fix one module at a time"
echo "   - Re-run checks after each module"
echo "   - Track progress"
```

---

## Phase 3: Execute Fixes (One Module at Time)

**Systematic fixing approach:**

```bash
# Choose target module
TARGET_MODULE="path/to/most/problematic/module"

echo "🎯 Fixing module: $TARGET_MODULE"

# 1. Isolate module errors
echo "Step 1: Isolate module errors"
# Run checks only on this module
# npm run lint $TARGET_MODULE
# npm run type-check $TARGET_MODULE

# 2. Fix highest impact errors first
echo "Step 2: Fix critical errors"
# Address build-breaking errors
# Fix type errors
# Fix obvious logic errors

# 3. Re-validate after fixes
echo "Step 3: Re-validate"
# Re-run all checks
# Ensure no regressions
# Update error counts

# 4. Move to next module
echo "Step 4: Select next target"
# Re-run error analysis
# Choose next highest impact module
```

---

## Phase 4: Track Progress

**Monitor improvement over time:**

```bash
# Create progress log
PROGRESS_LOG="docs/audit/feature_fix_progress_$(date +%Y-%m-%d).md"

cat >> "$PROGRESS_LOG" << EOF
# Feature Fix Progress - $(date)

## Error Counts Over Time
- Start: $TOTAL_ERRORS errors
- After module 1: [update after each]
- After module 2: [update after each]
- Target: < $ERROR_THRESHOLD errors

## Modules Fixed
1. $TARGET_MODULE - [errors reduced by X]

## Current Status
- [ ] Core infrastructure complete
- [ ] High-impact errors resolved
- [ ] Ready for standard bug fixing workflow
EOF

echo "📊 Progress logged to: $PROGRESS_LOG"
```

---

## Phase 5: Transition to Standard Workflow

**When to switch approaches:**

```bash
# Re-assess error count
CURRENT_ERRORS=$(./count_errors.sh)  # Implement error counting script

if [ $CURRENT_ERRORS -lt $ERROR_THRESHOLD ]; then
  echo "✅ Transition to FIX_BUGS workflow"
  echo "Use standard bug fixing for remaining errors"
  exit 0
else
  echo "🔄 Continue FEATURE_FIX_STRATEGY"
  echo "Still $CURRENT_ERRORS errors (> $ERROR_THRESHOLD threshold)"
fi
```

---

## Success Criteria

- ✅ Error count reduced significantly
- ✅ Core infrastructure stabilized
- ✅ Progress tracked and documented
- ✅ Clear transition plan to standard workflows
- ✅ No new critical errors introduced

---

## Decision Framework

**Use FEATURE_FIX_STRATEGY when:**
- Total errors > 20 (configurable threshold)
- Errors concentrated in few modules
- Standard FIX_BUGS workflow overwhelmed
- Need systematic, prioritized approach

**Switch to FIX_BUGS when:**
- Errors < 20 total
- Errors evenly distributed
- Standard debugging approach sufficient
- Individual bug fixing more effective

---

**Commands:**
- Error counting and mapping scripts
- Module isolation tools
- Progress tracking scripts
- Validation and testing tools

**When to use:** When feature has 20+ errors and needs systematic fixing strategy
