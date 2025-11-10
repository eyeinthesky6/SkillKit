# Run Tests (Subtask)

## Purpose
Execute project tests with proper environment detection.

## Auto-Detection

```bash
tsk exec test
```

**Automatically detects and runs:**
- Node.js: `npm test` / `yarn test` / `pnpm test`
- Python: `pytest` / `python -m pytest`
- Go: `go test ./...`
- Java: `mvn test` / `gradle test`
- PHP: `phpunit` / `./vendor/bin/phpunit`

## Manual Commands

**Node.js:**

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

**Python:**

```bash
pytest
pytest --verbose
pytest tests/unit
pytest --cov
```

**With coverage:**

```bash
npm test -- --coverage
pytest --cov=src --cov-report=html
```

## Output Handling

```bash
# Capture output:
npm test 2>&1 | tee test-output.log

# Count failures:
TEST_FAILS=$(grep -c "FAIL" test-output.log || echo "0")

if [ $TEST_FAILS -eq 0 ]; then
  echo "✓ All tests passing"
else
  echo "✗ ${TEST_FAILS} tests failing"
fi
```

## Return Status

- Exit code 0: All tests pass
- Exit code != 0: Some tests failed

---

**Return to main workflow after tests complete.**

