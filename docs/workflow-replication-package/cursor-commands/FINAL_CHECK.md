# Final Check + Auto-Route

```bash
FEATURE_ID="$1"

# 0. Check for unresolved issues (CRITICAL)
bash .cursor/commands/RESOLVE_ISSUES.md
if [ $? -ne 0 ]; then
  echo "❌ FINAL CHECK FAILED: Unresolved duplicates/issues"
  echo "🔀 Route: Resolve issues first"
  exit 1
fi

# 1. Run all checks
pnpm run lint 2>&1 | tee /tmp/final-lint.log
LINT=$(grep -cE "error|✖" /tmp/final-lint.log || echo "0")

pnpm run type-check 2>&1 | tee /tmp/final-type.log
TYPE=$(grep -c "error TS" /tmp/final-type.log || echo "0")

pnpm run build > /tmp/final-build.log 2>&1
BUILD=$?

node scripts/validation/todo-tracker.cjs > /tmp/final-todos.txt
TODOS=$(grep -c "TODO\|FIXME\|MOCK" /tmp/final-todos.txt || echo "0")

[ -n "$FEATURE_ID" ] && pnpm test -- --run $FEATURE_ID && TESTS=$? || TESTS=0
[ -n "$FEATURE_ID" ] && bash .cursor/commands/CHECK_DEPS.md "$FEATURE_ID" && CHAIN=$? || CHAIN=0

# Report
echo "
Lint: $LINT | Type: $TYPE | Build: $([ $BUILD -eq 0 ] && echo 'OK' || echo 'FAIL')
TODOs: $TODOS | Tests: $([ $TESTS -eq 0 ] && echo 'OK' || echo 'FAIL') | Chain: $([ $CHAIN -eq 0 ] && echo 'OK' || echo 'FAIL')
"

# Route if errors
TOTAL=$((LINT + TYPE + TODOS))
[ $TOTAL -eq 0 ] && [ $BUILD -eq 0 ] && [ $TESTS -eq 0 ] && [ $CHAIN -eq 0 ] && echo "✅ PASSED" && exit 0

echo "❌ FAILED - Routing..."
[ $TODOS -gt 50 ] && echo "→ FEATURE_FIX_STRATEGY.md" && exit 1
[ $LINT -gt 20 ] || [ $TYPE -gt 20 ] && echo "→ fix-all.md" && exit 1
[ $CHAIN -ne 0 ] && echo "→ CHECK_DEPS.md" && exit 1
[ $TESTS -ne 0 ] && echo "→ CREATE_TESTS.md" && exit 1
echo "→ fix-all.md"
exit 1
```

**Routes:**
- TODO > 50 → FEATURE_FIX_STRATEGY
- Errors > 20 → fix-all
- Chain broken → CHECK_DEPS
- Tests fail → CREATE_TESTS
- Build fail → fix-all

