# Run Typecheck (Subtask)

## Purpose
Run TypeScript type checking without emitting files.

## Command

```bash
# TypeScript:
npx tsc --noEmit

# Or via package script:
npm run typecheck

# With watch mode:
npx tsc --noEmit --watch
```

## Capture Errors

```bash
# Save to file:
npx tsc --noEmit 2>&1 | tee ts-errors.log

# Count errors:
ERROR_COUNT=$(grep "error TS" ts-errors.log | wc -l)

echo "TypeScript errors: ${ERROR_COUNT}"
```

## Common Error Patterns

```bash
# Group by error code:
grep "error TS" ts-errors.log | cut -d' ' -f3 | sort | uniq -c | sort -rn

# Example output:
#   45 TS2339  (Property does not exist)
#   12 TS2345  (Argument type mismatch)
#    8 TS2322  (Type not assignable)
```

## Return Status

```bash
if [ $ERROR_COUNT -eq 0 ]; then
  echo "✓ Type check passed"
  exit 0
else
  echo "✗ ${ERROR_COUNT} type errors"
  exit 1
fi
```

---

**Return typecheck results to workflow.**

