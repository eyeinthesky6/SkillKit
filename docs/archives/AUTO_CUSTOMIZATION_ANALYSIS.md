# Auto-Customization Analysis: Why SkillKit Doesn't Self-Customize

**Date:** 2025-01-XX  
**Issue:** Workflows are not automatically customized on install/init  
**Root Cause:** Intelligence exists but isn't triggered automatically

---

## 🔍 Current Flow Analysis

### Flow 1: npm install → postinstall.js

```bash
npm install @trinity-os/skillkit
  ↓
postinstall.js runs
  ↓
✅ Checks: Node version, dependencies, build output
❌ Does NOT: Analyze project, customize workflows
```

**What happens:**
- Verifies installation
- Checks CLI binary
- Shows "Next steps: tsk init --cursor"
- **NO project analysis**
- **NO workflow customization**

### Flow 2: tsk init --cursor

```bash
tsk init --cursor
  ↓
✅ Creates .cursor/commands/ directory
✅ Copies templates from templates/workflows/
❌ Copies AS-IS (no customization)
❌ Does NOT use MultiLanguageAnalyzer
❌ Does NOT use WorkflowAdapter
```

**What happens:**
- Copies 13 workflow templates
- Replaces `{{CUSTOM_HEADER}}` placeholder
- **NO language detection**
- **NO command adaptation**
- **NO project analysis**

**Code evidence:**
```typescript:src/cli-commands/init.ts
// Line 591-612: Just copies files, no adaptation
let content = await fs.readFile(sourcePath, 'utf8');
// Replace custom header only
if (customHeader) {
  content = content.replace(placeholderRegex, headerBlock);
}
await fs.writeFile(targetPath, content);
// ❌ NO analyzer.analyze()
// ❌ NO adapter.adaptTemplate()
```

### Flow 3: tsk workflow (The Smart One!)

```bash
tsk workflow --all
  ↓
✅ Analyzes project (MultiLanguageAnalyzer)
✅ Detects languages, tools, package managers
✅ Adapts templates (WorkflowAdapter)
✅ Replaces placeholders with actual commands
✅ Handles monorepos
```

**What happens:**
- **DOES analyze project**
- **DOES customize workflows**
- **DOES detect languages**
- **DOES adapt commands**

**Code evidence:**
```typescript:src/cli-commands/workflow-gen.ts
// Line 74-76: Actually uses the intelligence!
const analyzer = new MultiLanguageAnalyzer(options.dir);
const project = await analyzer.analyze();
const adapter = new WorkflowAdapter(project);
// Line 114: Adapts template
templateContent = adapter.adaptTemplate(templateContent, options.dir);
```

### Flow 4: /META_CUSTOMIZE (Manual)

```bash
/META_CUSTOMIZE in Cursor
  ↓
✅ Runs tsk discover (detects tools)
✅ Tests commands manually
✅ User edits workflows
❌ Still manual process
```

---

## 🎯 The Gap

### What Exists (Intelligence Layer)

1. **MultiLanguageAnalyzer** (`src/intelligence/multi-language-analyzer.ts`)
   - ✅ Detects languages (TS, JS, Python, Java, Go, Rust, PHP, Ruby)
   - ✅ Detects package managers (npm, pnpm, yarn, poetry, pip, etc.)
   - ✅ Detects tools (linters, formatters, test frameworks)
   - ✅ Handles monorepos
   - ✅ Reads package.json, pyproject.toml, etc.

2. **WorkflowAdapter** (`src/intelligence/workflow-adapter.ts`)
   - ✅ Adapts templates to detected languages
   - ✅ Replaces placeholders (`{{INSTALL_COMMAND}}`, `{{LINT_COMMAND}}`, etc.)
   - ✅ Generates language-specific commands
   - ✅ Handles multi-language projects

3. **ProjectAnalyzer** (`src/intelligence/project-analyzer.ts`)
   - ✅ Detects architecture patterns
   - ✅ Detects frameworks
   - ✅ Detects conventions

### What's Missing (Integration)

1. **`init` doesn't use intelligence**
   - Just copies files
   - No analysis
   - No adaptation

2. **`postinstall` doesn't customize**
   - Only verifies installation
   - Doesn't know about project context

3. **Manual step required**
   - User must run `tsk workflow` or `/META_CUSTOMIZE`
   - Not automatic

---

## 💡 Why This Architecture?

### Current Design Philosophy

**"Explicit over Implicit"**
- User must explicitly run customization
- Avoids assumptions
- Gives user control

**Problems:**
- ❌ Users don't know to run `tsk workflow`
- ❌ Workflows are generic until customized
- ❌ Extra step required

### How Other Tools Handle This

#### 1. **ESLint** (Similar Pattern)
```bash
npm install eslint
npx eslint --init  # Manual setup
```
- ✅ Installs tool
- ❌ Requires manual init
- **Similar to SkillKit**

#### 2. **Prettier** (Auto-Detection)
```bash
npm install prettier
# Just works - reads .prettierrc automatically
```
- ✅ Auto-detects config
- ✅ No init needed
- **Better UX**

#### 3. **Husky** (Postinstall Hook)
```bash
npm install husky
# postinstall.js automatically sets up git hooks
```
- ✅ Auto-runs setup
- ✅ Uses project context
- **Best for SkillKit**

#### 4. **TypeScript** (Config-Driven)
```bash
npm install typescript
# Reads tsconfig.json automatically
```
- ✅ Auto-detects config
- ✅ No init needed
- **Config-driven**

---

## 🏗️ Proposed Architecture

### Option 1: Smart `init` (Recommended)

**Make `init` automatically customize:**

```typescript
// In src/cli-commands/init.ts
async function generateWorkflows() {
  // 1. Analyze project
  const analyzer = new MultiLanguageAnalyzer(projectRoot);
  const project = await analyzer.analyze();
  const adapter = new WorkflowAdapter(project);
  
  // 2. For each template
  for (const template of templates) {
    let content = await fs.readFile(template, 'utf8');
    
    // 3. Adapt automatically
    if (project.languages.length > 0) {
      content = adapter.adaptTemplate(content, projectRoot);
    }
    
    // 4. Write customized version
    await fs.writeFile(targetPath, content);
  }
}
```

**Benefits:**
- ✅ Automatic customization
- ✅ No extra step
- ✅ Works out of the box

### Option 2: Smart `postinstall`

**Detect if in project and auto-customize:**

```javascript
// In scripts/postinstall.js
if (isInProjectDirectory()) {
  // Auto-run customization
  const { execSync } = require('child_process');
  try {
    execSync('tsk workflow --all --silent', { stdio: 'ignore' });
  } catch {
    // Fail silently - user can run manually
  }
}
```

**Benefits:**
- ✅ Fully automatic
- ✅ No user action needed
- ⚠️ Might be too aggressive

### Option 3: Hybrid (Best UX)

**Smart defaults with opt-out:**

```typescript
// In init command
if (options.autoCustomize !== false) {  // Default: true
  // Analyze and customize
  await autoCustomizeWorkflows(projectRoot);
} else {
  // Just copy templates
  await copyTemplates(projectRoot);
}
```

**Benefits:**
- ✅ Automatic by default
- ✅ User can opt-out
- ✅ Best of both worlds

---

## 📊 Comparison: Current vs Proposed

### Current Flow

```
npm install
  ↓
postinstall (verify only)
  ↓
tsk init --cursor
  ↓
Copy templates (generic)
  ↓
User must run: tsk workflow --all
  ↓
Workflows customized
```

**Steps:** 5  
**Manual steps:** 1  
**Time:** ~2 minutes

### Proposed Flow (Option 1)

```
npm install
  ↓
postinstall (verify only)
  ↓
tsk init --cursor
  ↓
Analyze project (automatic)
  ↓
Customize workflows (automatic)
  ↓
Workflows ready (customized)
```

**Steps:** 5  
**Manual steps:** 0  
**Time:** ~30 seconds

---

## 🔧 Implementation Plan

### Phase 1: Enhance `init` Command

1. **Add analysis step:**
   ```typescript
   // After creating directories, before copying templates
   const analyzer = new MultiLanguageAnalyzer(projectRoot);
   const project = await analyzer.analyze();
   const adapter = new WorkflowAdapter(project);
   ```

2. **Adapt templates:**
   ```typescript
   // Instead of just copying
   let content = await fs.readFile(sourcePath, 'utf8');
   if (project.languages.length > 0) {
     content = adapter.adaptTemplate(content, projectRoot);
   }
   await fs.writeFile(targetPath, content);
   ```

3. **Show what was detected:**
   ```typescript
   console.log(`Detected: ${project.languages.map(l => l.language).join(', ')}`);
   console.log(`Package managers: ${project.structure.packageManagers.join(', ')}`);
   ```

### Phase 2: Add Opt-Out

```typescript
.option('--no-auto-customize', 'Skip automatic workflow customization')
```

### Phase 3: Update Documentation

- Update README to show automatic customization
- Remove manual `tsk workflow` step from quick start
- Update META_CUSTOMIZE to mention it's optional

---

## 🎯 Why This Matters

### Current Problem

**User Experience:**
1. Install SkillKit
2. Run `tsk init --cursor`
3. Get generic workflows
4. Workflows don't match project
5. User confused
6. Must discover `tsk workflow` command
7. Finally get customized workflows

**Result:** Poor first impression, extra friction

### With Auto-Customization

**User Experience:**
1. Install SkillKit
2. Run `tsk init --cursor`
3. Get customized workflows immediately
4. Workflows match project perfectly
5. User happy

**Result:** Great first impression, zero friction

---

## 📝 Recommendations

### Immediate Fix

**Enhance `init` command to automatically customize:**
- Use existing `MultiLanguageAnalyzer`
- Use existing `WorkflowAdapter`
- No new code needed
- Just wire it up

### Long-Term

**Consider smart postinstall:**
- Detect project context
- Auto-customize if safe
- Fallback to manual if needed

---

## ✅ Conclusion

**The intelligence exists, it's just not being used in `init`!**

**Solution:** Wire up `MultiLanguageAnalyzer` and `WorkflowAdapter` in the `init` command.

**Impact:** Zero-friction setup, workflows work immediately.

---

*This is a simple integration issue, not an architecture problem. The tools are there, they just need to be connected.*

