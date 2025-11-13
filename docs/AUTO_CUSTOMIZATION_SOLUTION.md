# Auto-Customization Solution: Making `init` Smart

**Date:** 2025-01-XX  
**Problem:** `init` copies templates without customization  
**Solution:** Wire up existing intelligence to `init` command

---

## 🎯 The Fix

### Current Code (Line 592-612 in init.ts)

```typescript
let content = await fs.readFile(sourcePath, 'utf8');

// Replace or remove custom header placeholder
if (customHeader) {
  content = content.replace(placeholderRegex, headerBlock);
} else {
  content = content.replace(removeRegex, '');
}

await fs.writeFile(targetPath, content);
// ❌ NO customization
```

### Proposed Code

```typescript
let content = await fs.readFile(sourcePath, 'utf8');

// Replace or remove custom header placeholder
if (customHeader) {
  content = content.replace(placeholderRegex, headerBlock);
} else {
  content = content.replace(removeRegex, '');
}

// ✅ NEW: Auto-customize based on project
if (options.autoCustomize !== false) {  // Default: true
  try {
    const analyzer = new MultiLanguageAnalyzer(projectRoot);
    const project = await analyzer.analyze();
    
    if (project.languages.length > 0) {
      const adapter = new WorkflowAdapter(project);
      content = adapter.adaptTemplate(content, projectRoot);
    }
  } catch (error) {
    // Fail gracefully - continue with unadapted template
    console.log(chalk.dim(`   ⚠️  Could not customize ${file} (using generic template)`));
  }
}

await fs.writeFile(targetPath, content);
```

---

## 📋 Implementation Steps

### Step 1: Add Option

```typescript
.option('--no-auto-customize', 'Skip automatic workflow customization', false)
```

### Step 2: Add Analysis (Before Template Loop)

```typescript
// Analyze project once (before loop)
let project: MultiLanguageProject | null = null;
let adapter: WorkflowAdapter | null = null;

if (options.autoCustomize !== false) {
  try {
    console.log(chalk.gray('🔍 Analyzing project structure...'));
    const analyzer = new MultiLanguageAnalyzer(projectRoot);
    project = await analyzer.analyze();
    adapter = new WorkflowAdapter(project);
    
    if (project.languages.length > 0) {
      console.log(chalk.cyan(`\n📦 Detected ${project.languages.length} language stack(s):`));
      for (const lang of project.languages) {
        const tools = [
          lang.framework,
          lang.packageManager,
          lang.testFramework,
          lang.linter,
        ].filter(Boolean).join(', ');
        console.log(chalk.gray(`   • ${lang.language} (${lang.rootPath}) - ${tools || 'no tools detected'}`));
      }
      if (project.isMonorepo) {
        console.log(chalk.yellow('   ⚠️  Monorepo detected - workflows will include all languages'));
      }
    } else {
      console.log(chalk.yellow('   ⚠️  No languages detected - using generic templates'));
    }
  } catch (error) {
    console.log(chalk.yellow('   ⚠️  Could not analyze project - using generic templates'));
    project = null;
    adapter = null;
  }
}
```

### Step 3: Adapt Templates (In Loop)

```typescript
let content = await fs.readFile(sourcePath, 'utf8');

// Replace custom header
if (customHeader) {
  content = content.replace(placeholderRegex, headerBlock);
} else {
  content = content.replace(removeRegex, '');
}

// ✅ Auto-customize if project was analyzed
if (adapter && project && project.languages.length > 0) {
  try {
    content = adapter.adaptTemplate(content, projectRoot);
  } catch (error) {
    // Continue with unadapted template
    console.log(chalk.dim(`   ⚠️  Could not adapt ${file} - using generic version`));
  }
}

await fs.writeFile(targetPath, content);
```

---

## 🎯 Benefits

### Before
- Generic workflows
- User must run `tsk workflow` manually
- Extra step required
- Poor first impression

### After
- Customized workflows immediately
- Zero manual steps
- Works out of the box
- Great first impression

---

## 🔄 Backward Compatibility

### Opt-Out Available

```bash
tsk init --cursor --no-auto-customize
```

Users who want generic templates can opt-out.

### Existing Behavior Preserved

- If analysis fails → falls back to generic
- If no languages detected → uses generic
- All existing options still work

---

## 📊 Comparison with Other Tools

### ESLint
- ❌ Requires `npx eslint --init`
- ✅ SkillKit: Automatic

### Prettier
- ✅ Auto-detects config
- ✅ SkillKit: Similar (auto-detects project)

### Husky
- ✅ Auto-runs postinstall
- ✅ SkillKit: Similar (auto-runs in init)

---

## ✅ Testing Plan

1. **Test with TypeScript project:**
   ```bash
   cd typescript-project
   tsk init --cursor
   # Should detect TypeScript, pnpm, eslint
   # Should customize workflows
   ```

2. **Test with Python project:**
   ```bash
   cd python-project
   tsk init --cursor
   # Should detect Python, poetry, ruff
   # Should customize workflows
   ```

3. **Test with mixed project:**
   ```bash
   cd mixed-project
   tsk init --cursor
   # Should detect both languages
   # Should create multi-language workflows
   ```

4. **Test opt-out:**
   ```bash
   tsk init --cursor --no-auto-customize
   # Should use generic templates
   ```

---

## 🚀 Rollout Plan

1. **Implement fix** (this PR)
2. **Test locally** with various projects
3. **Update documentation** (remove manual step)
4. **Release** as patch version
5. **Monitor** user feedback

---

*Simple fix, huge impact. The intelligence exists, just needs to be connected.*

