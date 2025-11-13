# File Naming Conventions Analysis

## 📋 Current Patterns

### ✅ **Standard Pattern: kebab-case**

**Most files follow kebab-case (lowercase with hyphens):**

#### CLI Commands (`src/cli-commands/`)
- ✅ `workflow-gen.ts`
- ✅ `audit-fix.ts`
- ✅ `dedupe-workflows.ts`
- ✅ `validate-workflow.ts`
- ✅ `meta-customize.ts`
- ✅ `skill-load.ts`
- ✅ `skills-add.ts`
- ✅ `list-workflows.ts`
- ✅ `workflows-add.ts`
- ✅ `build-agents.ts`

#### Intelligence (`src/intelligence/`)
- ✅ `multi-language-analyzer.ts`
- ✅ `project-analyzer.ts`
- ✅ `workflow-adapter.ts`

#### Other Source Files
- ✅ `agents-builder.ts`
- ✅ `skill-loader.ts`
- ✅ `version-checker.ts`
- ✅ `skill-resolver.ts`
- ✅ `command-mapper.ts`
- ✅ `agents-md.ts`

### ✅ **Single Word Files**

**Simple, single-word files (no hyphens needed):**
- ✅ `cli.ts`
- ✅ `index.ts`
- ✅ `types.ts`
- ✅ `errors.ts`
- ✅ `base.ts`
- ✅ `registry.ts`
- ✅ `github.ts`
- ✅ `storage.ts`
- ✅ `tui.ts`
- ✅ `planner.ts`
- ✅ `audit.ts`
- ✅ `runner.ts`
- ✅ `executor.ts`
- ✅ `formatter.ts`
- ✅ `sandbox.ts`
- ✅ `integration.ts`
- ✅ `defaults.ts`

### ✅ **Test Files**

**Test files use `.test.ts` suffix:**
- ✅ `__tests__/audit.test.ts`
- ✅ `__tests__/cli-validation.test.ts`
- ✅ `__tests__/planner.test.ts`
- ✅ `__tests__/registry.test.ts`
- ✅ `__tests__/sandbox.test.ts`
- ✅ `__tests__/sandbox.security.test.ts`
- ✅ `__tests__/validator.test.ts`
- ✅ `__tests__/version-checker.test.ts`
- ✅ `workflow-generation.test.ts` (root level - **inconsistency**)

### ⚠️ **Inconsistencies Found**

1. **Test File Location:**
   - Most tests: `src/__tests__/`
   - One test: `src/workflow-generation.test.ts` (root level)
   - **Recommendation:** Move to `src/__tests__/workflow-generation.test.ts`

2. **No camelCase or PascalCase:**
   - ✅ Good: No camelCase files (e.g., `workflowGen.ts`)
   - ✅ Good: No PascalCase files (e.g., `WorkflowGen.ts`)

3. **No snake_case:**
   - ✅ Good: No snake_case files (e.g., `workflow_gen.ts`)

## 📐 **Established Convention**

### **Primary Rule: kebab-case for multi-word files**

```
✅ Correct:
- workflow-gen.ts
- multi-language-analyzer.ts
- audit-fix.ts

❌ Incorrect:
- workflowGen.ts (camelCase)
- WorkflowGen.ts (PascalCase)
- workflow_gen.ts (snake_case)
- workflowGen.tsx (camelCase)
```

### **Secondary Rule: Single words stay single**

```
✅ Correct:
- cli.ts
- index.ts
- types.ts

❌ Incorrect:
- cli-command.ts (unnecessary hyphenation)
```

### **Test Files: `.test.ts` suffix**

```
✅ Correct:
- audit.test.ts
- workflow-generation.test.ts
- cli-validation.test.ts

❌ Incorrect:
- auditTest.ts
- audit.spec.ts (should use .test.ts)
```

## 🔍 **TypeScript Configuration**

From `tsconfig.json`:
```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true  // ✅ Enforces case sensitivity
  }
}
```

This ensures:
- ✅ File names are case-sensitive
- ✅ Imports must match exact casing
- ✅ Prevents cross-platform issues

## 📊 **File Naming Statistics**

### By Pattern:
- **kebab-case (multi-word):** ~35 files (70%)
- **single-word:** ~15 files (30%)
- **test files:** 9 files (all use `.test.ts`)

### By Directory:
- `cli-commands/`: All kebab-case ✅
- `intelligence/`: All kebab-case ✅
- `runtime/`: All single-word ✅
- `adapters/`: Mix (kebab-case + single-word) ✅
- `package-manager/`: Mix (kebab-case + single-word) ✅
- `__tests__/`: All `.test.ts` ✅

## ✅ **Recommendations**

### 1. **Standardize Test File Location**
```bash
# Move to standard location
mv src/workflow-generation.test.ts src/__tests__/workflow-generation.test.ts
```

### 2. **Document Convention**
Add to `README.md` or `CONTRIBUTING.md`:
```markdown
## File Naming Convention

- **Multi-word files:** Use kebab-case (`workflow-gen.ts`)
- **Single-word files:** No hyphens (`cli.ts`)
- **Test files:** Use `.test.ts` suffix (`audit.test.ts`)
- **Test location:** Place in `src/__tests__/` directory
```

### 3. **ESLint Rule (Optional)**
Consider adding a lint rule to enforce kebab-case:
```json
{
  "rules": {
    "unicorn/filename-case": ["error", { "case": "kebabCase" }]
  }
}
```

## 🎯 **Summary**

### ✅ **What's Working:**
1. **Consistent kebab-case** for multi-word files
2. **Single words** stay simple
3. **Test files** use `.test.ts` suffix
4. **TypeScript** enforces case sensitivity

### ⚠️ **Minor Issues:**
1. **One test file** at root level instead of `__tests__/`
2. **No documented convention** in README

### 📝 **Current Standard:**
- **Multi-word:** `kebab-case.ts`
- **Single-word:** `word.ts`
- **Tests:** `name.test.ts` in `__tests__/` directory

**Overall:** ✅ **Very consistent!** The codebase follows a clear kebab-case convention with only one minor inconsistency.

