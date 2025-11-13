# Create Tests

**Purpose:** Generate missing test files and basic test structure for features

---

## Phase 1: Analyze Feature Code

**Find feature files and understand structure:**

```bash
# Generic feature file discovery (adapt to your project structure)
FEATURE_NAME="$1"

# Example patterns for different project structures:
# find src/ -name "*${FEATURE_NAME}*" -type f
# find lib/ -name "*${FEATURE_NAME}*" -type f
# find packages/ -name "*${FEATURE_NAME}*" -type f

# Count existing tests
# find tests/ spec/ -name "*${FEATURE_NAME}*" -type f | wc -l
```

---

## Phase 2: Detect Test Framework

**Identify project's testing setup:**

```bash
# Check for common test frameworks
if [ -f "package.json" ]; then
  # JavaScript/TypeScript
  if grep -q "jest\|vitest\|mocha" package.json; then
    TEST_FRAMEWORK="js"
    TEST_CMD="npm test"
  fi
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ] || [ -f "requirements.txt" ]; then
  # Python
  if grep -q "pytest\|unittest" pyproject.toml 2>/dev/null || grep -q "pytest\|unittest" requirements.txt 2>/dev/null; then
    TEST_FRAMEWORK="python"
    TEST_CMD="python -m pytest"
  fi
elif [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
  # Java
  TEST_FRAMEWORK="java"
  TEST_CMD="./mvnw test"
fi

echo "Detected test framework: ${TEST_FRAMEWORK}"
```

---

## Phase 3: Generate Test Files

**Create missing test files with basic structure:**

```bash
# JavaScript/TypeScript example
if [ "$TEST_FRAMEWORK" = "js" ]; then
  # Create test directory structure
  mkdir -p "tests/unit"

  # Generate basic test file
  cat > "tests/unit/${FEATURE_NAME}.test.js" << 'EOF'
import { describe, it, expect } from 'your-test-framework';

describe('${FEATURE_NAME}', () => {
  it('should work correctly', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = yourFunction(input);

    // Assert
    expect(result).toBeDefined();
    // TODO: Add real test assertions
  });
});
EOF

# Python example
elif [ "$TEST_FRAMEWORK" = "python" ]; then
  # Create test directory structure
  mkdir -p "tests/unit"

  # Generate basic test file
  cat > "tests/unit/test_${FEATURE_NAME}.py" << 'EOF'
import pytest
from your_module import your_function

def test_${FEATURE_NAME}_basic():
    """Test ${FEATURE_NAME} basic functionality"""
    # Arrange
    input_data = "test"

    # Act
    result = your_function(input_data)

    # Assert
    assert result is not None
    # TODO: Add real test assertions

def test_${FEATURE_NAME}_edge_cases():
    """Test ${FEATURE_NAME} edge cases"""
    # TODO: Add edge case tests
    pass
EOF

# Java example
elif [ "$TEST_FRAMEWORK" = "java" ]; then
  # Create test directory structure
  mkdir -p "src/test/java"

  # Generate basic test file
  cat > "src/test/java/${FEATURE_NAME}Test.java" << 'EOF'
import org.junit.Test;
import static org.junit.Assert.*;

public class ${FEATURE_NAME}Test {

    @Test
    public void testBasicFunctionality() {
        // Arrange
        YourClass instance = new YourClass();

        // Act
        Object result = instance.yourMethod("test");

        // Assert
        assertNotNull(result);
        // TODO: Add real test assertions
    }
}
EOF
fi
```

---

## Phase 4: Add Test Cases

**Fill in meaningful test cases:**

```bash
# Analyze the feature code to understand what to test
# Look for:
# - Public methods/functions
# - Error conditions
# - Edge cases
# - Integration points

echo "Analyzing ${FEATURE_NAME} for test cases..."
# TODO: Add analysis logic to generate specific test cases
```

---

## Phase 5: Run Tests

**Verify test setup works:**

```bash
# Run the new tests
${TEST_CMD} --testPathPattern="${FEATURE_NAME}" --verbose

# Check test coverage
# npm run test:coverage || python -m pytest --cov=your_package
```

---

## Success Criteria

- ✅ Test files created with proper structure
- ✅ Test framework detected and configured
- ✅ Basic test cases added (even if placeholders)
- ✅ Tests run without syntax errors
- ✅ Project's testing conventions followed

---

## Checklist

- [ ] Test framework detected correctly
- [ ] Test files created in right location
- [ ] Proper naming conventions used
- [ ] Basic test structure generated
- [ ] Tests run without errors
- [ ] TODO placeholders added for real test logic

---

**Commands:**
- Test framework detection scripts
- File generation scripts
- Test runners (`npm test`, `pytest`, etc.)

**When to use:** When implementing features without tests, or when tests are missing from existing features
