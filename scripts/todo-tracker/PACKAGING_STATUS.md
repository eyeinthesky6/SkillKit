# TODO Tracker Packaging Status

**Date:** 11-11-2025  
**Goal:** Transform todo-tracker into standalone npm package `lazy-coding-tracker`

---

## 📊 Current Status

### ✅ Completed
- [x] Core detection patterns (50+ patterns)
- [x] Priority classification system
- [x] Business logic exclusions
- [x] Help flag (`--help`, `-h`)
- [x] Focus flag (`--focus=<dir>`)
- [x] Include flag (`--include=<dir>`)
- [x] Config flag (`--config=<path>`)
- [x] Debug flag (`--debug`)
- [x] Configs flag (`--configs`)
- [x] Scripts flag (`--scripts`)
- [x] Markdown report generation
- [x] Console output with summaries

### 🚧 In Progress
- [ ] JSON output format (`--format=json`)
- [ ] Table output format (`--format=table`)
- [ ] Custom output path (`--output=<path>`)

### ⏳ Planned (Before Packaging)
- [ ] Git integration (`--since=<ref>`, `--blame`, `--age`)
- [ ] Filtering flags (`--priority`, `--category`, `--type`)
- [ ] CI/CD flags (`--exit-code`, `--max-issues`, `--max-blockers`)
- [ ] Codebase-agnostic (remove trading-specific references)
- [ ] Configuration file support (`.lazy-coding-tracker.config.js`)
- [ ] Package structure setup
- [ ] Tests
- [ ] Documentation

---

## 🎯 Implementation Plan

### Phase 1: Output Formats (This Week) ⏳ **CURRENT**

**Priority: HIGH** - Needed for CI/CD integration

1. **Add `--format` flag**
   - Options: `markdown` (default), `json`, `table`
   - Parse format from args
   - Route to appropriate generator function

2. **Add `--output` flag**
   - Custom output file path
   - Handle directory creation
   - Support different extensions based on format

3. **Implement JSON generator**
   - Structured JSON output
   - Include all issue data
   - Summary statistics
   - CI/CD friendly format

4. **Implement Table generator**
   - Console table output
   - No file writing
   - Pretty formatting

**Files to modify:**
- `scripts/todo-tracker/todo-tracker.cjs` - Add flag parsing and generators

---

### Phase 2: Codebase Agnostic (Next Week)

**Priority: HIGH** - Required for packaging

1. **Remove trading-specific references**
   - Business logic exclusions (lines 173-218)
   - Priority classification keywords
   - Replace with generic patterns

2. **Make domain exclusions configurable**
   - Move hardcoded exclusions to config
   - Provide sensible defaults
   - Allow user overrides

3. **Generic priority classification**
   - Remove trading-specific triggers
   - Use generic application triggers
   - Make configurable via config file

**Files to modify:**
- `scripts/todo-tracker/todo-tracker.cjs` - Remove trading references
- Create `.lazy-coding-tracker.config.js` template

---

### Phase 3: Package Structure (Before New Repo)

**Priority: HIGH** - Required for npm package

1. **Create package structure**
   ```
   lazy-coding-tracker/
   ├── package.json
   ├── README.md
   ├── bin/
   │   └── lazy-coding-tracker.js
   ├── lib/
   │   ├── scanner.js
   │   ├── patterns.js
   │   ├── reporter.js
   │   └── formatters.js
   ├── config/
   │   └── default-config.js
   └── tests/
       └── ...
   ```

2. **Update package.json**
   - Name: `lazy-coding-tracker`
   - Bin entry point
   - Dependencies
   - Scripts

3. **Refactor code**
   - Split into modules
   - Export functions
   - CLI wrapper

**Files to create:**
- `package.json`
- `bin/lazy-coding-tracker.js`
- `lib/` directory with modules

---

### Phase 4: Git Integration (Optional)

**Priority: MEDIUM** - Nice to have

1. **`--since=<ref>` flag**
   - Use `git diff --name-only`
   - Filter files to scan
   - Performance improvement

2. **`--blame` flag**
   - Add git blame info
   - Author, date per issue

3. **`--age` flag**
   - Calculate TODO age
   - Track technical debt

---

### Phase 5: New Repository Setup

**Priority: HIGH** - Final step

1. **Create new repository**
   - Name: `lazy-coding-tracker`
   - Initialize with package structure
   - Add CI/CD

2. **Move code**
   - Copy from `scripts/todo-tracker/`
   - Update imports
   - Test standalone

3. **Publish to npm**
   - Beta release first
   - Get feedback
   - Stable release

4. **Import in SkillKit**
   - Add as dependency
   - Update imports
   - Test integration

---

## 📋 Next Steps (Immediate)

1. ✅ **Create flags roadmap** (DONE)
2. ⏳ **Implement `--format=json`** (IN PROGRESS)
3. ⏳ **Implement `--format=table`**
4. ⏳ **Implement `--output=<path>`**
5. ⏳ **Test with SkillKit codebase**
6. ⏳ **Make codebase-agnostic**
7. ⏳ **Create package structure**

---

## 🔗 Related Documents

- `FLAGS_ROADMAP.md` - Complete flags documentation
- `PACKAGING_PLAN.md` - Original packaging plan
- `README.md` - User documentation
- `CONFIG_GUIDE.md` - Configuration guide

---

**Status:** Phase 1 Implementation  
**Next:** Add `--format` and `--output` flags

