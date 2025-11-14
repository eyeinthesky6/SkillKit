# Testing Approach Clarification

**Question:** Do we download external repos into the workspace for testing?

**Answer:** No. We create **controlled test projects** within the workspace.

---

## 🎯 The Approach

### **Option 1: Controlled Test Projects (Recommended ✅)**

**What we do:**
- Create minimal test projects in `test-projects/`
- These are **small, focused, committed to repo**
- Simulate real project structures without the complexity
- Examples: `python-project/`, `typescript-project/`, `nodejs-project/`

**Structure:**
```
test-projects/
├── python-project/          # Minimal Python + Poetry project
│   ├── pyproject.toml
│   ├── app.py
│   └── test_app.py
├── typescript-project/      # Minimal TypeScript project
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
└── nodejs-project/         # Minimal Node.js project
    ├── package.json
    └── index.js
```

**Pros:**
- ✅ Small and fast
- ✅ No external dependencies
- ✅ No recursion risk (no SkillKit installed)
- ✅ Committed to repo (version controlled)
- ✅ AI can see everything
- ✅ Easy to reset between tests

**Cons:**
- ⚠️ Not "real" projects (but simulate real scenarios)

---

### **Option 2: External Repos (NOT Recommended ❌)**

**What we DON'T do:**
- Download real projects from GitHub
- Clone large repos into workspace
- Test on projects that might already have SkillKit

**Why NOT:**
- ❌ Large repos (hundreds of MB)
- ❌ External dependencies (slow to install)
- ❌ Might already have SkillKit (recursion!)
- ❌ Hard to control (what if they update?)
- ❌ Can't commit to our repo (too large)
- ❌ AI can't see full context easily

---

### **Option 3: Hybrid Approach (Optional 📝)**

**If we need "real-world" testing:**

Create a separate directory that's **gitignored**:

```
test-projects/
├── python-project/          # Controlled (committed)
├── typescript-project/      # Controlled (committed)
└── real-world/             # External repos (gitignored)
    ├── .gitignore          # Ignore everything here
    ├── some-real-project/   # Cloned from GitHub
    └── another-project/     # Cloned from GitHub
```

**Usage:**
```bash
# Clone external repo (one-time, manual)
cd test-projects/real-world
git clone https://github.com/some-user/some-project.git

# Test on it
cd some-project
pnpm link @trinity-os/skillkit
tsk init
# ... test ...

# Results still captured to test-results/ (in workspace)
```

**Pros:**
- ✅ Real-world scenarios
- ✅ Doesn't pollute main repo
- ✅ Results still visible to AI

**Cons:**
- ⚠️ Manual setup
- ⚠️ Need to manage external repos
- ⚠️ Risk of recursion if they have SkillKit

---

## 🎯 Recommended Strategy for SkillKit

### **Primary: Controlled Test Projects**

1. **Create minimal test projects** that simulate real scenarios:
   - Python + Poetry (✅ exists: `python-project/`)
   - TypeScript + npm
   - Node.js + pnpm
   - Monorepo structure
   - Empty project (fresh install test)

2. **These are committed to repo:**
   ```bash
   test-projects/
   ├── python-project/     # Committed ✅
   ├── typescript-project/  # Committed ✅
   └── nodejs-project/     # Committed ✅
   ```

3. **Test workflow:**
   ```bash
   # Build SkillKit
   pnpm build
   pnpm link
   
   # Test on controlled project
   cd test-projects/python-project
   pnpm link @trinity-os/skillkit
   tsk init
   
   # Capture results
   # → test-results/integration/python-project.jsonl
   ```

### **Secondary: Real-World Testing (Optional)**

If needed, use `test-projects/real-world/` (gitignored):

```bash
# .gitignore
test-projects/real-world/*
!test-projects/real-world/.gitkeep
```

**But results still go to workspace:**
```bash
# Results captured to workspace (not gitignored)
test-results/integration/real-world-some-project.jsonl
```

---

## 📋 What We Actually Do

### **Current Setup:**
```
test-projects/
├── python-project/          # ✅ Minimal Python project (committed)
│   ├── pyproject.toml
│   ├── app.py
│   └── test_app.py
└── workflow-test/           # ✅ Test project with workflows (committed)
    └── .cursor/commands/
```

### **What We Should Add:**
```
test-projects/
├── python-project/          # ✅ Exists
├── typescript-project/      # 📝 To create
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
├── nodejs-project/         # 📝 To create
│   ├── package.json
│   └── index.js
└── empty-project/          # 📝 To create (fresh install test)
    └── (empty, just for tsk init test)
```

### **What We DON'T Do:**
```
test-projects/
└── real-repos/             # ❌ Don't clone external repos here
    └── some-large-project/  # ❌ Too big, might have SkillKit
```

---

## 🎯 Summary

**Answer:** No, we don't download external repos. Instead:

1. **Create minimal test projects** in `test-projects/` (committed to repo)
2. **These simulate real scenarios** without the complexity
3. **Results captured to `test-results/`** (AI-visible)
4. **Optional:** Use `test-projects/real-world/` (gitignored) for real repos if needed

**Key Principle:**
- **Controlled test projects** = Fast, reliable, AI-visible
- **External repos** = Slow, complex, risky, not recommended

**Note:** Currently `test-results/` is gitignored. For AI-agentated workflows, we should:
- Either: Commit test results (remove from .gitignore)
- Or: Store summaries in `docs/test-results/` (committed)

---

## 🔧 Implementation

### **Step 1: Expand Controlled Test Projects**

```bash
# Create TypeScript test project
mkdir test-projects/typescript-project
cd test-projects/typescript-project
npm init -y
npm install typescript @types/node --save-dev
# Add minimal tsconfig.json, src/index.ts

# Create Node.js test project
mkdir test-projects/nodejs-project
cd test-projects/nodejs-project
npm init -y
# Add minimal index.js

# Create empty project (for fresh install test)
mkdir test-projects/empty-project
# (empty, just for testing tsk init on fresh project)
```

### **Step 2: Test Runner Uses These**

```typescript
// scripts/test-integration.ts
const testProjects = [
  'python-project',
  'typescript-project',
  'nodejs-project',
  'empty-project'
];

for (const project of testProjects) {
  // Test on each controlled project
  // Capture results to test-results/integration/
}
```

### **Step 3: Results Always in Workspace**

All test results go to `test-results/` (committed to repo):
- `test-results/integration/*.jsonl` (structured data)
- `test-results/reports/*.md` (human/AI readable)

**AI can read everything!**

---

## ✅ Best Practice

**For SkillKit (AI-Agentated):**
- ✅ Use controlled test projects (committed)
- ✅ Keep them minimal and focused
- ✅ Capture all results to workspace
- ❌ Don't clone external repos (unless really needed)
- ❌ Don't test on projects that might have SkillKit

**The test projects are like "fixtures" in traditional testing - small, controlled, repeatable.**

