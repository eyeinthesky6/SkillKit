#!/bin/bash
# Test SkillKit on Bash (Git Bash or WSL)

echo "========================================"
echo "Testing SkillKit on Bash"
echo "========================================"
echo ""

echo "[1/6] Testing version command..."
tsk --version
if [ $? -ne 0 ]; then
    echo "ERROR: Version command failed"
    exit 1
fi
echo ""

echo "[2/6] Testing init command..."
cd /tmp || cd "$TEMP" || exit 1
rm -rf skillkit-test-bash
mkdir skillkit-test-bash
cd skillkit-test-bash
npm init -y > /dev/null 2>&1
tsk init --all
if [ $? -ne 0 ]; then
    echo "ERROR: Init command failed"
    exit 1
fi
echo ""

echo "[3/6] Verifying workflows created..."
if [ ! -f ".cursor/commands/BEGIN_SESSION.md" ]; then
    echo "ERROR: BEGIN_SESSION.md not found"
    exit 1
fi
echo "Found BEGIN_SESSION.md"
echo ""

echo "[4/6] Verifying subtasks created..."
if [ ! -d "docs/workflows/subtasks" ]; then
    echo "ERROR: Subtasks directory not found"
    exit 1
fi
echo "Found subtasks directory"
echo ""

echo "[5/6] Testing audit command..."
tsk audit
if [ $? -ne 0 ]; then
    echo "WARNING: Audit command had issues (may be expected)"
fi
echo ""

echo "[6/6] Testing diagnose command..."
tsk diagnose
if [ $? -ne 0 ]; then
    echo "WARNING: Diagnose command had issues (may be expected in empty project)"
fi
echo ""

echo "========================================"
echo "BASH TEST COMPLETE"
echo "========================================"
cd /tmp || cd "$TEMP" || exit 1
rm -rf skillkit-test-bash

