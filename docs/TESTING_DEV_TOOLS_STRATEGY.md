# Testing Development Tools Without Recursion

**Date:** 2025-01-XX  
**Purpose:** Guide for testing SkillKit and similar dev tools on real projects without recursive confusion

---

## 🎯 The Problem

When developing a tool like SkillKit that is meant to be used in development environments, you face a challenge:

- **If you install SkillKit in the SkillKit repo itself**, you might:
  - Create circular dependencies
  - Confuse which version is being tested
  - Pollute your development environment
  - Make it unclear if bugs are in the tool or the test setup

- **But you need to test on real projects** to ensure:
  - The tool works in actual usage scenarios
  - Integration with real workflows
  - Cross-platform compatibility
  - User experience validation

---

## 🔍 How Other Dev Tools Handle This

### 1. **Isolated Test Projects** (Most Common)

**Examples:** ESLint, Prettier, Jest, TypeScript

**Strategy:**
- Maintain separate test projects in `test-projects/` directory
- These projects are **NOT** the tool's own repo
- Test projects simulate real-world usage
- The tool is installed as a dependency in test projects

**How it works:**
```bash
# In SkillKit repo
pnpm build
pnpm link  # Creates global symlink

# In test project
cd test-projects/my-test-app
pnpm link @trinity-os/skillkit  # Uses local build
tsk init  # Test the tool
```

**Benefits:**
- ✅ Clean separation between tool development and testing
- ✅ Tests real usage patterns
- ✅ No recursion issues
- ✅ Can test multiple project types (Python, TypeScript, etc.)

**SkillKit Implementation:**
- ✅ Already has `test-projects/` directory
- ✅ Has `python-project/` example
- ⚠️ Could expand with more test projects

---

### 2. **Dogfooding with Explicit Isolation**

**Examples:** Git, Docker, Kubernetes

**Strategy:**
- Use the tool on itself, but with **explicit version control**
- Use `npm link` or local builds
- Mark test directories clearly
- Use `.gitignore` to exclude test artifacts

**How it works:**
```bash
# Build SkillKit
pnpm build

# Link locally
pnpm link

# In a separate test directory (not in SkillKit repo)
mkdir ~/skillkit-test-projects
cd ~/skillkit-test-projects/my-app
pnpm link @trinity-os/skillkit
tsk init
```

**Benefits:**
- ✅ Tests real-world scenarios
- ✅ No confusion about which version is running
- ✅ Can test edge cases on complex projects

---

### 3. **CI/CD with Test Matrix**

**Examples:** All major dev tools

**Strategy:**
- Automated testing in CI/CD pipelines
- Test against multiple project types
- Use containers/VMs for isolation
- Test published versions vs. local builds

**How it works:**
```yaml
# .github/workflows/test-real-projects.yml
- name: Test on TypeScript project
  run: |
    cd test-projects/ts-project
    npm install
    npx tsk init
    # Run assertions

- name: Test on Python project
  run: |
    cd test-projects/python-project
    pip install -e ../..  # Install from source
    tsk init
    # Run assertions
```

**Benefits:**
- ✅ Automated, repeatable tests
- ✅ Tests multiple environments
- ✅ Catches regressions early

**SkillKit Implementation:**
- ✅ Has CI workflow
- ⚠️ Could add test-projects to CI matrix

---

### 4. **Version Pinning and Sandboxing**

**Examples:** npm, yarn, pnpm

**Strategy:**
- Test with specific versions
- Use `npx` or `pnpm dlx` to test published versions
- Use local builds with version suffixes
- Clear separation between dev and test

**How it works:**
```bash
# Test published version
cd test-projects/my-app
npx @trinity-os/skillkit@latest init

# Test local build
cd test-projects/my-app
pnpm link @trinity-os/skillkit@file:../..  # Link to parent
tsk init
```

**Benefits:**
- ✅ Tests both published and development versions
- ✅ No version confusion
- ✅ Can test upgrade scenarios

---

### 5. **Docker/Container Isolation**

**Examples:** Docker itself, Kubernetes, Terraform

**Strategy:**
- Use containers for complete isolation
- Test in clean environments
- No pollution of host system
- Easy to reset between tests

**How it works:**
```dockerfile
# Dockerfile.test
FROM node:20
WORKDIR /test
COPY test-projects/my-app .
RUN npm install -g @trinity-os/skillkit
RUN tsk init
RUN npm test
```

**Benefits:**
- ✅ Complete isolation
- ✅ Reproducible environments
- ✅ Tests cross-platform compatibility
- ✅ No host system pollution

---

## 🛠️ Recommended Strategy for SkillKit

### **Multi-Layered Approach**

#### **Layer 1: Unit Tests** (Already Implemented ✅)
- Test individual functions and modules
- Fast, isolated, no recursion risk
- Location: `src/__tests__/`

#### **Layer 2: Integration Tests with Test Projects** (Partially Implemented ⚠️)
- Use `test-projects/` directory
- Test real workflows on real project types
- Use `pnpm link` to test local builds

**Recommended Structure:**
```
test-projects/
├── typescript-project/     # TypeScript + npm
├── python-project/         # Python + poetry (exists ✅)
├── nodejs-project/        # Node.js + pnpm
├── monorepo-project/      # Complex monorepo
└── empty-project/         # Fresh project
```

#### **Layer 3: CI/CD Test Matrix** (Partially Implemented ⚠️)
- Add test-projects to CI workflow
- Test on multiple Node versions
- Test on multiple OS (Windows, Linux, macOS)

#### **Layer 4: Manual Testing with External Projects** (Recommended 📝)
- Test on completely separate projects
- Use `npm link` or published versions
- Document test scenarios

---

## 📋 Practical Implementation Guide

### **Step 1: Expand Test Projects**

Create diverse test projects:

```bash
# Create TypeScript test project
mkdir test-projects/ts-project
cd test-projects/ts-project
npm init -y
npm install typescript @types/node
# Add tsconfig.json, src/, etc.

# Create Node.js project
mkdir test-projects/nodejs-project
cd test-projects/nodejs-project
npm init -y
# Add package.json scripts, etc.
```

### **Step 2: Create Test Scripts**

Add to `package.json`:

```json
{
  "scripts": {
    "test:integration": "node scripts/test-integration.js",
    "test:real-projects": "node scripts/test-real-projects.js"
  }
}
```

### **Step 3: Test Workflow**

```bash
# 1. Build SkillKit
pnpm build

# 2. Link locally
pnpm link

# 3. Test in isolated project
cd test-projects/python-project
pnpm link @trinity-os/skillkit
tsk init --cursor
# Verify workflows installed
# Test commands
# Clean up: rm -rf .cursor/ .claude/

# 4. Test in external project (outside repo)
cd ~/my-other-project
pnpm link @trinity-os/skillkit
tsk init
# Test real usage
```

### **Step 4: CI Integration**

Add to `.github/workflows/ci.yml`:

```yaml
test-real-projects:
  name: Test on Real Projects
  runs-on: ${{ matrix.os }}
  strategy:
    matrix:
      os: [ubuntu-latest, windows-latest, macos-latest]
      project: [python-project, typescript-project]
  
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: pnpm install && pnpm build
    - run: pnpm link --global
    - name: Test ${{ matrix.project }}
      run: |
        cd test-projects/${{ matrix.project }}
        pnpm link @trinity-os/skillkit
        tsk init
        # Run assertions
```

---

## 🚫 What NOT to Do

### ❌ **Don't Install SkillKit in SkillKit Repo**
```bash
# BAD - Creates confusion
cd SkillKit/
tsk init  # Which version? What's being tested?
```

### ❌ **Don't Test on Production Projects**
```bash
# BAD - Risk of breaking real work
cd ~/important-client-project
tsk init  # Might break their setup
```

### ❌ **Don't Mix Test and Dev Environments**
```bash
# BAD - Unclear state
# Using SkillKit while developing SkillKit
# Which code is running?
```

---

## ✅ Best Practices

### **1. Clear Separation**
- Test projects are separate from tool repo
- Use `test-projects/` for controlled testing
- Use external projects for real-world validation

### **2. Version Control**
- Always know which version is being tested
- Use `pnpm link` for local builds
- Use `npx` for published versions
- Tag test runs with version numbers

### **3. Clean State**
- Reset test projects between runs
- Use `.gitignore` for test artifacts
- Document test setup/teardown

### **4. Documentation**
- Document test scenarios
- Record test results
- Track which projects were tested

### **5. Automation**
- Automate repetitive tests
- Use CI/CD for consistency
- Test multiple environments

---

## 📊 Testing Checklist

### **Before Release:**
- [ ] Unit tests pass
- [ ] Integration tests on test-projects pass
- [ ] Tested on TypeScript project
- [ ] Tested on Python project
- [ ] Tested on Node.js project
- [ ] Tested on Windows
- [ ] Tested on Linux
- [ ] Tested on macOS
- [ ] Tested with published version (`npx`)
- [ ] Tested with local build (`pnpm link`)
- [ ] Manual testing on external project
- [ ] No recursion issues
- [ ] Clean test artifacts

---

## 🔗 Examples from Similar Tools

### **ESLint**
- Has `tests/fixtures/` with test projects
- Uses `npm link` for local testing
- CI tests on multiple Node versions
- Separate repo for dogfooding (eslint/eslint)

### **Prettier**
- Has `tests/` directory with various file types
- Tests on real codebases in CI
- Uses version pinning for tests
- Separate test projects for integration

### **Jest**
- Has `examples/` directory
- Tests on real projects in CI
- Uses Docker for isolation
- Clear separation between dev and test

### **TypeScript**
- Has `tests/cases/` with test projects
- Tests compiler on itself (bootstrapping)
- Uses versioned test suites
- CI tests on multiple configurations

---

## 🎯 Summary

**The Key Principle:** **Isolation + Real-World Testing**

1. **Never test the tool on itself** (creates recursion)
2. **Use isolated test projects** (controlled environment)
3. **Test on external projects** (real-world validation)
4. **Automate in CI/CD** (consistency)
5. **Document everything** (clarity)

**For SkillKit:**
- ✅ Already has test-projects structure
- ✅ Has unit tests
- ⚠️ Should expand test-projects
- ⚠️ Should add CI integration for test-projects
- 📝 Should document manual testing workflow

---

## 📚 Further Reading

- [Testing Your Own Tools](https://github.com/eslint/eslint/tree/main/tests/fixtures)
- [Dogfooding Best Practices](https://en.wikipedia.org/wiki/Eating_your_own_dog_food)
- [CI/CD for Dev Tools](https://docs.github.com/en/actions/guides/building-and-testing-nodejs)

