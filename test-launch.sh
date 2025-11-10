#!/bin/bash
# Launch test script for SkillKit v1.1

echo "🚀 SkillKit v1.1 Launch Test"
echo "========================================"
echo ""

echo "Step 1: Building..."
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

echo "Step 2: Testing discover command..."
node dist/cli.js discover
if [ $? -ne 0 ]; then
    echo "❌ Discover failed!"
    exit 1
fi
echo "✅ Discover works"
echo ""

echo "Step 3: Testing list-workflows..."
node dist/cli.js list-workflows
if [ $? -ne 0 ]; then
    echo "❌ List workflows failed!"
    exit 1
fi
echo "✅ List workflows works"
echo ""

echo "Step 4: Testing explain..."
node dist/cli.js explain quality-gate
if [ $? -ne 0 ]; then
    echo "❌ Explain failed!"
    exit 1
fi
echo "✅ Explain works"
echo ""

echo "Step 5: Testing suggest..."
node dist/cli.js suggest
if [ $? -ne 0 ]; then
    echo "❌ Suggest failed!"
    exit 1
fi
echo "✅ Suggest works"
echo ""

echo "Step 6: Testing Python project..."
cd test-projects/python-project
node ../../dist/cli.js discover
if [ $? -ne 0 ]; then
    echo "❌ Python discover failed!"
    exit 1
fi
cd ../..
echo "✅ Python project works"
echo ""

echo "========================================"
echo "🎉 All tests passed!"
echo "SkillKit v1.1 is ready to launch!"

