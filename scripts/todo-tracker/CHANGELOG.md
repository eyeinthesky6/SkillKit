# Changelog

## [Unreleased]

### Added
- ✅ **Config file support** - `.todo-tracker.config.js` for customization
- ✅ **Self-exclusion** - Always excludes itself from scanning
- ✅ **Gitignore support** - Respects `.gitignore` patterns by default
- ✅ **--include flag** - Scan specific folders even if excluded by default
- ✅ **--config flag** - Specify custom config file path
- ✅ **Configurable exclusions** - Three-tier exclusion system (always/default/custom)
- ✅ **17 new patterns** - From developer research on AI-generated code
- ✅ **Security category** - New category for security vulnerabilities

### Changed
- ✅ **Codebase-agnostic** - Removed trading-specific references
- ✅ **Exclusion logic** - Now uses config-based system with gitignore support
- ✅ **Default directories** - Scans `apps`, `packages`, `src`, `lib` by default

### Fixed
- ✅ Script no longer scans itself
- ✅ Respects gitignore by default
- ✅ Can scan scripts folder with `--include` flag

---

## Features

### Configuration System
- Config file: `.todo-tracker.config.js`
- Example config: `.todo-tracker.config.js.example`
- Documentation: `CONFIG_GUIDE.md`

### Exclusion System
1. **Always excluded** - Cannot be overridden (node_modules, .git, dist, self)
2. **Default excluded** - Can be overridden with `--include` (docs, scripts, etc.)
3. **Custom excluded** - Project-specific exclusions via config

### Gitignore Integration
- Reads `.gitignore` automatically
- Respects gitignore patterns
- Can be disabled via config

### Command Line Options
- `--focus=<dir>` - Focus scan on specific directory
- `--include=<dir>` - Include folder even if excluded by default (can use multiple times)
- `--config=<path>` - Use custom config file

---

**Last Updated:** 10-11-2025

