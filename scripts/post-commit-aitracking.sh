#!/bin/bash
# Post-Commit Hook: Auto-update AITracking logs
# This script runs automatically after every git commit

set -e

# Get commit info
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_DATE=$(git log -1 --pretty=%ci)
COMMIT_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD | tr '\n' ',' | sed 's/,$//')

# Get today's date in DD-MM-YYYY format
TODAY=$(date +%d-%m-%Y)

# Find today's AITracking logs
AITRACKING_DIR="docs/AITracking"
if [ ! -d "$AITRACKING_DIR" ]; then
  # AITracking directory doesn't exist, skip silently
  exit 0
fi

# Find the most recent AITracking log from today
LATEST_LOG=$(ls -t "$AITRACKING_DIR/AIAction_${TODAY}_"*.md 2>/dev/null | head -1)

if [ -z "$LATEST_LOG" ]; then
  # No log for today, try to find any recent log
  LATEST_LOG=$(ls -t "$AITRACKING_DIR/AIAction_"*.md 2>/dev/null | head -1)
fi

if [ -n "$LATEST_LOG" ]; then
  # Append commit info to the log
  cat >> "$LATEST_LOG" << EOF

## 📦 Commit: $COMMIT_HASH

**Message:** $COMMIT_MSG
**Files:** $COMMIT_FILES
**Date:** $COMMIT_DATE

EOF
  echo "✅ Updated AITracking: $LATEST_LOG"
else
  # No log found, create a generic one
  GENERIC_LOG="$AITRACKING_DIR/AIAction_${TODAY}_auto_commit.md"
  cat > "$GENERIC_LOG" << EOF
# AI Action Log: Auto-Generated Commit Log

**Date:** $TODAY  
**Task:** Auto-generated from git commit  
**Status:** ✅ Complete

---

## 📦 Commit: $COMMIT_HASH

**Message:** $COMMIT_MSG
**Files:** $COMMIT_FILES
**Date:** $COMMIT_DATE

---

**Note:** This log was auto-generated. Consider creating a proper AITracking log for future commits.

EOF
  echo "⚠️  Created generic AITracking log: $GENERIC_LOG"
fi

exit 0

