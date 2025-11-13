#!/bin/bash

# Comprehensive Test Suite for TODO Tracker
# Tests all flags, formats, and functionality

set -e

echo "🧪 TODO Tracker Test Suite"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
test_command() {
    local name="$1"
    local command="$2"
    local expected_exit="$3"
    
    echo -n "Testing: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        exit_code=$?
    else
        exit_code=$?
    fi
    
    if [ "$exit_code" -eq "$expected_exit" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED (exit code: $exit_code, expected: $expected_exit)${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Test basic functionality
echo "📋 Basic Functionality Tests"
echo "----------------------------"
test_command "Basic scan" "node scripts/todo-tracker/todo-tracker.cjs" 0
test_command "Help flag" "node scripts/todo-tracker/todo-tracker.cjs --help" 0
test_command "Version check" "node scripts/todo-tracker/todo-tracker.cjs --help | grep -q 'Enhanced Comprehensive'" 0

# Test output formats
echo ""
echo "📄 Output Format Tests"
echo "---------------------"
test_command "Markdown format (default)" "node scripts/todo-tracker/todo-tracker.cjs --format=markdown" 0
test_command "JSON format" "node scripts/todo-tracker/todo-tracker.cjs --format=json" 0
test_command "HTML format" "node scripts/todo-tracker/todo-tracker.cjs --format=html" 0
test_command "Table format" "node scripts/todo-tracker/todo-tracker.cjs --format=table" 0

# Test flags
echo ""
echo "🚩 Flag Tests"
echo "-------------"
test_command "--debug flag" "node scripts/todo-tracker/todo-tracker.cjs --debug" 0
test_command "--all flag" "node scripts/todo-tracker/todo-tracker.cjs --all" 0
test_command "--configs flag" "node scripts/todo-tracker/todo-tracker.cjs --configs" 0
test_command "--scripts flag" "node scripts/todo-tracker/todo-tracker.cjs --scripts" 0
test_command "--blame flag" "node scripts/todo-tracker/todo-tracker.cjs --blame" 0
test_command "--age flag" "node scripts/todo-tracker/todo-tracker.cjs --age" 0
test_command "--summary flag" "node scripts/todo-tracker/todo-tracker.cjs --summary" 0

# Test filters
echo ""
echo "🔍 Filter Tests"
echo "---------------"
test_command "--priority=blocker" "node scripts/todo-tracker/todo-tracker.cjs --priority=blocker" 0
test_command "--priority=critical" "node scripts/todo-tracker/todo-tracker.cjs --priority=critical" 0
test_command "--priority=major" "node scripts/todo-tracker/todo-tracker.cjs --priority=major" 0
test_command "--category=incomplete" "node scripts/todo-tracker/todo-tracker.cjs --category=incomplete" 0

# Test git integration
echo ""
echo "🔗 Git Integration Tests"
echo "-----------------------"
if git rev-parse --git-dir > /dev/null 2>&1; then
    test_command "--since=HEAD~1" "node scripts/todo-tracker/todo-tracker.cjs --since=HEAD~1" 0
    test_command "--since=main" "node scripts/todo-tracker/todo-tracker.cjs --since=main" 0
else
    echo -e "${YELLOW}⚠ Skipping git tests (not in git repo)${NC}"
fi

# Test output files
echo ""
echo "📁 Output File Tests"
echo "-------------------"
test_command "Custom output path" "node scripts/todo-tracker/todo-tracker.cjs --output=test-output.md" 0
test_command "JSON output file" "node scripts/todo-tracker/todo-tracker.cjs --format=json --output=test-output.json" 0
test_command "HTML output file" "node scripts/todo-tracker/todo-tracker.cjs --format=html --output=test-output.html" 0

# Cleanup test files
rm -f test-output.md test-output.json test-output.html

# Test directory focus
echo ""
echo "📂 Directory Focus Tests"
echo "----------------------"
test_command "--focus=src" "node scripts/todo-tracker/todo-tracker.cjs --focus=src" 0

# Test exclusion system
echo ""
echo "🚫 Exclusion System Tests"
echo "-------------------------"
test_command "Exclusion file loading" "node scripts/todo-tracker/todo-tracker.cjs 2>&1 | grep -q 'Loaded exclusions'" 0

# Summary
echo ""
echo "=========================="
echo "Test Results:"
echo "  ${GREEN}Passed: $PASSED${NC}"
echo "  ${RED}Failed: $FAILED${NC}"
echo "=========================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi


