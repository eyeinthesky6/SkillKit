# Create Tests

**🏭 PRODUCTION HARDENING:** ❌ NO placeholder tests ✅ REAL test cases with assertions

```bash
FEATURE_ID="$1"

# Find files, create missing tests
FEATURE_FILES=$(grep -rl "@feature:$FEATURE_ID" packages/shared/src/ --include="*.ts" | grep -v ".test.")

for file in $FEATURE_FILES; do
  TEST_FILE="${file%.ts}.test.ts"
  [ ! -f "$TEST_FILE" ] && cat > "$TEST_FILE" << 'EOF'
import { describe, it, expect } from 'vitest';

describe('FEATURE_ID', () => {
  it('should work', () => {
    // Arrange, Act, Assert
  });
});
EOF
done

# Run tests
pnpm test -- --run $FEATURE_ID
pnpm test:coverage -- $FEATURE_ID
```

**Checklist:**
- [ ] All methods tested
- [ ] Error cases covered
- [ ] Edge cases covered

**🏭 NO PLACEHOLDER TESTS:** Replace `it('should work', ...)` with real test cases

