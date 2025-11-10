# Parse Test Output (Subtask)

## Purpose
Extract structured information from test results.

## Parse Jest/Mocha Output

```bash
# Run and capture:
npm test 2>&1 | tee test-output.log

# Count results:
PASS=$(grep -c "PASS" test-output.log || echo "0")
FAIL=$(grep -c "FAIL" test-output.log || echo "0")
SKIP=$(grep -c "SKIP" test-output.log || echo "0")

echo "Pass: ${PASS}, Fail: ${FAIL}, Skip: ${SKIP}"
```

## Extract Failed Tests

```bash
# Get list of failures:
grep "✗" test-output.log | cut -d' ' -f2-

# Or:
grep "FAIL" test-output.log -A 3
```

## Parse Coverage

```bash
# Extract coverage percentage:
COVERAGE=$(grep "All files" test-output.log | awk '{print $4}')
echo "Coverage: ${COVERAGE}"
```

## Output Structured Data

```json
{
  "pass": 142,
  "fail": 3,
  "skip": 2,
  "total": 147,
  "coverage": 85.3,
  "failed_tests": [
    "Button component › should handle loading state",
    "API › should timeout gracefully",
    "Auth › should refresh token"
  ]
}
```

---

**Return parsed data to main workflow.**

