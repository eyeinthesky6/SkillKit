#!/usr/bin/env node

/**
 * Git Hooks Setup Script
 * 
 * This script sets up Git hooks for the repository to ensure code quality.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const hooksDir = path.join(__dirname, '../../.git/hooks');
const preCommitHook = path.join(hooksDir, 'pre-commit');
const commitMsgHook = path.join(hooksDir, 'commit-msg');

// Ensure the hooks directory exists
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

/**
 * Create a pre-commit hook that runs linting and tests
 */
function createPreCommitHook() {
  const content = `#!/bin/sh
# Pre-commit hook that runs linting and tests

echo "\n🔍 Running pre-commit checks...\n"

# Stash unstaged changes to only check staged files
STASH_NAME="pre-commit-$(date +%s)"
git stash save -q --keep-index $STASH_NAME

# Run linter
pnpm lint-staged
LINT_EXIT_CODE=$?

# Run tests
if [ $LINT_EXIT_CODE -eq 0 ]; then
  echo "\n✅ Linting passed. Running tests...\n"
  pnpm test --bail
  TEST_EXIT_CODE=$?
else
  echo "\n❌ Linting failed. Please fix the issues before committing.\n"
  TEST_EXIT_CODE=1
fi

# Restore stashed changes if any
if [ "$(git stash list | grep $STASH_NAME)" ]; then
  git stash pop -q
fi

# Exit with appropriate status
if [ $LINT_EXIT_CODE -ne 0 ] || [ $TEST_EXIT_CODE -ne 0 ]; then
  echo "\n❌ Pre-commit checks failed. Please fix the issues and try again.\n"
  exit 1
fi

echo "\n✅ All checks passed!\n"
exit 0
`;

  fs.writeFileSync(preCommitHook, content, 'utf8');
  fs.chmodSync(preCommitHook, '755');
  console.log('✅ Created pre-commit hook');
}

/**
 * Create a commit-msg hook that enforces commit message format
 */
function createCommitMsgHook() {
  const content = `#!/bin/sh
# Commit-msg hook that enforces commit message format

# Get the commit message
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Commit message format regex
# Example: feat: add new feature
#          ^^^^  ^
#          |     |
#          |     - Subject (start with lowercase, no period at the end)
#          - Type (feat, fix, docs, style, refactor, test, chore)
FORMAT='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,100}'

if ! echo "$COMMIT_MSG" | grep -qE "$FORMAT"; then
  echo "\n❌ Invalid commit message format.\n"
  echo "Please use the following format:"
  echo "  <type>: <subject>\n"
  echo "Types: feat, fix, docs, style, refactor, test, chore"
  echo "Example: feat: add new feature\n"
  exit 1
fi

echo "✅ Commit message format is valid\n"
exit 0
`;

  fs.writeFileSync(commitMsgHook, content, 'utf8');
  fs.chmodSync(commitMsgHook, '755');
  console.log('✅ Created commit-msg hook');
}

// Main function
function main() {
  try {
    console.log('🚀 Setting up Git hooks...\n');
    
    // Create hooks
    createPreCommitHook();
    createCommitMsgHook();
    
    console.log('\n✨ Git hooks setup complete!\n');
  } catch (error) {
    console.error('❌ Error setting up Git hooks:', error);
    process.exit(1);
  }
}

// Run the script
main();
