# TODO Tracker

**Enhanced Comprehensive TODO Tracker for AI-Generated Codebases**

A specialized tool for detecting incomplete implementations, deceptive language patterns, and code quality issues in AI-generated codebases.

## 🆕 Context-Aware Detection (2025-11-13)

**NEW:** Context-aware pattern detection with **82% reduction in false positives** (690 → 124 issues)!

- **Context Window Analysis** - Analyzes surrounding code for better accuracy
- **Confidence Scoring** - Multi-indicator detection with confidence thresholds
- **Research-Based** - Based on CodeT5, CodeBERT, and InferCode research

**Results:**
- COMMENTED_OUT_CODE: 12 → 0 issues (100% false positives eliminated)
- Deceptive Language: 309 → 21 issues (93% reduction)
- Overall: 82% reduction in false positives

See [CONTEXT_AWARE_README.md](./CONTEXT_AWARE_README.md) for details and research attributions.

---

## Features

### 🎯 Core Capabilities

1. **Explicit TODO Markers** - Detects TODO/FIXME/HACK/XXX/BUG comments
2. **Deceptive Language Detection** - Finds 50+ patterns like "simplified", "workaround", "for now"
3. **Commented Code Detection** - Identifies commented-out executable code (TOP BLOCKER)
4. **Incomplete Implementation Detection** - Finds stubs, placeholders, "not implemented" patterns
5. **Priority Classification** - Domain-aware blocker/critical/major/minor prioritization
6. **Business Logic Filtering** - Reduces false positives with domain-specific exclusions
7. **Action Guidance** - Provides one-liner guidance for each issue type

### 📊 Detection Categories

- **Temporal** - Time-based temporary code ("for now", "temporary")
- **Incomplete** - Missing implementations (stubs, placeholders)
- **Deceptive** - Misleading comments/code ("simplified", "workaround")
- **Technical Debt** - Hardcoded values, deprecated code
- **Explicit** - Direct TODOs/bugs
- **Temporary** - Workarounds, stubs
- **Commented Code** - Executable code that's commented out

---

## Usage

### Basic Usage

```bash
# Run from project root (excludes scripts/ folder by default)
node scripts/todo-tracker/todo-tracker.cjs

# Include scripts folder (contains utility/admin code)
node scripts/todo-tracker/todo-tracker.cjs --scripts

# Focus on specific directory
node scripts/todo-tracker/todo-tracker.cjs --focus=packages/shared/src
```

### Directory Scanning

By default, the tool scans:
- `apps/`, `packages/`, `src/`, `lib/`, `.` (current directory)
- Excludes: `node_modules/`, `.git/`, `dist/`, `build/`, `docs/`, `scripts/`, etc.

Use `--scripts` to include the `scripts/` folder if it contains important code.

### Output

Reports are saved to `docs/audit/Comprehensive_TODO_Analysis_YYYY-MM-DD.md`

---

## Why This Tool?

### Better Than Standard TODO Trackers

**Standard tools (like leasot) only detect:**
- `// TODO:`
- `// FIXME:`
- `// HACK:`

**This tool detects:**
- ✅ All standard TODO markers
- ✅ Deceptive language ("simplified", "workaround", "for now")
- ✅ Commented-out executable code
- ✅ Incomplete implementations (`throw new Error("not implemented")`)
- ✅ Mock data and placeholders
- ✅ Domain-specific patterns

### Perfect for AI-Generated Code

AI-generated code often contains:
- Deceptive language that looks complete but isn't
- Commented-out code causing type errors
- Stubs and placeholders
- Temporary solutions

This tool catches all of these patterns.

---

## Configuration

Currently uses hardcoded patterns. Future enhancements will support:
- Configuration file (`.todo-tracker.config.js`)
- Custom pattern definitions
- Project-specific exclusions

---

## 📚 Documentation

### Context-Aware Detection
- [CONTEXT_AWARE_README.md](./CONTEXT_AWARE_README.md) - Complete guide with research attributions
- [docs/todo-tracker/CONTEXT_AWARE_IMPROVEMENTS_13-11-2025.md](../docs/todo-tracker/CONTEXT_AWARE_IMPROVEMENTS_13-11-2025.md) - Improvement plan
- [docs/todo-tracker/CONTEXT_AWARE_IMPLEMENTATION_13-11-2025.md](../docs/todo-tracker/CONTEXT_AWARE_IMPLEMENTATION_13-11-2025.md) - Implementation details

### Other Documentation
See `docs/todo-tracker/` folder for:
- `TODO_Tracker_Comparison_10-11-2025.md` - Comparison with leasot
- `AI_Generated_Codebase_TODO_Tracking_Analysis_10-11-2025.md` - Analysis and learnings
- `FALSE_POSITIVE_ANALYSIS_13-11-2025.md` - False positive analysis
- `COMPREHENSIVE_ISSUE_ANALYSIS_13-11-2025.md` - Comprehensive issue breakdown

---

## Roadmap

### Phase 1: Quick Wins
- [ ] JSON output format (`--format=json`)
- [ ] Table output format (`--format=table`)
- [ ] Configuration file support

### Phase 2: Git Integration
- [ ] Track TODO age
- [ ] Git blame integration
- [ ] Incremental scanning (`--since=HEAD~1`)

### Phase 3: Advanced Features
- [ ] AST-based parsing
- [ ] Issue tracking integration
- [ ] HTML report generation

---

## Project Structure

```
scripts/todo-tracker/
├── todo-tracker.cjs              # Main script
├── README.md                      # This file
├── CONTEXT_AWARE_README.md        # Context-aware detection guide
└── docs/todo-tracker/             # Documentation
    ├── CONTEXT_AWARE_IMPROVEMENTS_13-11-2025.md
    ├── CONTEXT_AWARE_IMPLEMENTATION_13-11-2025.md
    ├── FALSE_POSITIVE_ANALYSIS_13-11-2025.md
    ├── COMPREHENSIVE_ISSUE_ANALYSIS_13-11-2025.md
    ├── TODO_Tracker_Comparison_10-11-2025.md
    └── AI_Generated_Codebase_TODO_Tracking_Analysis_10-11-2025.md
```

---

## Contributing

This is an experimental project folder. Feel free to experiment and enhance!

**Note:** Scripts directory is gitignored, so changes here won't affect the main repository.

---

**Last Updated:** 2025-11-13

