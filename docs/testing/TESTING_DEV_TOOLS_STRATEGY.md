# Testing Development Tools Without Recursion (AI-Agentated Workflow)

**Date:** 2025-01-XX  
**Purpose:** Guide for testing SkillKit in AI-agentated workflows where test results must be visible to AI agents

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

- **CRITICAL CONSTRAINT: AI-Agentated Workflow**
  - This codebase is AI-agentated and managed
  - AI agents need visibility into test results
  - Test results must be stored in accessible formats (JSON, Markdown)
  - Feedback loops must be automated and visible
  - AI needs structured data to learn from test outcomes

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

## 🛠️ Recommended Strategy for SkillKit (AI-Agentated)

### **AI-Visible Testing Approach**

#### **Layer 1: Unit Tests** (Already Implemented ✅)
- Test individual functions and modules
- Fast, isolated, no recursion risk
- Location: `src/__tests__/`
- Results: Vitest output → AI can read

#### **Layer 2: Integration Tests with Test Projects** (IN WORKSPACE ✅)
- **CRITICAL: Keep test projects IN workspace** (`test-projects/`)
- **NOTE: Test projects are gitignored** (see `.gitignore`) - they stay local
- Test real workflows on real project types
- Use `pnpm link` to test local builds
- **Capture all results to structured files** for AI visibility

**Structure:**
```
test-projects/
├── typescript-project/     # TypeScript + npm
├── python-project/        # Python + poetry (exists ✅)
├── nodejs-project/        # Node.js + pnpm
├── mixed-language-project/ # Complex: Python + TypeScript + Go (NEW)
└── empty-project/         # Fresh project

test-results/              # NEW: AI-readable test results (also gitignored)
├── integration/
│   ├── 2025-01-XX-typescript-project.jsonl
│   ├── 2025-01-XX-python-project.jsonl
│   ├── 2025-01-XX-mixed-language-project.jsonl
│   └── summary.json
└── reports/
    └── 2025-01-XX-integration-test-report.md
```

**Note:** Test projects are gitignored to keep them local and avoid committing test artifacts. Results are captured to `test-results/` for AI visibility.

#### **Layer 3: Automated Test Runner with Result Capture** (NEW 📝)
- Script that runs tests on all test-projects
- Captures structured results (JSON/JSONL)
- Generates markdown reports
- Stores in `test-results/` directory
- AI can read and learn from results

#### **Layer 4: CI/CD with Artifact Storage** (Partially Implemented ⚠️)
- Add test-projects to CI workflow
- Store test artifacts in workspace
- Generate reports that AI can read
- Test on multiple Node versions and OS

---

## 📋 Practical Implementation Guide (AI-Agentated)

### **Step 1: Expand Test Projects (IN WORKSPACE)**

Create diverse test projects **within the workspace**:

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

### **Step 2: Create Test Result Storage**

Create directory for AI-readable results:

```bash
mkdir -p test-results/integration
mkdir -p test-results/reports
```

### **Step 3: Create Automated Test Runner**

Create `scripts/test-integration.ts` that:
1. Builds SkillKit
2. Links it locally
3. Tests on each test-project
4. Captures structured results
5. Generates markdown reports

**Result Format (JSONL for AI parsing):**
```json
{"timestamp":"2025-01-XX","project":"python-project","test":"init","status":"pass","output":"...","duration":1234}
{"timestamp":"2025-01-XX","project":"python-project","test":"workflows-installed","status":"pass","count":12}
{"timestamp":"2025-01-XX","project":"ts-project","test":"init","status":"fail","error":"..."}
```

### **Step 4: Add Test Scripts to package.json**

```json
{
  "scripts": {
    "test:integration": "tsx scripts/test-integration.ts",
    "test:integration:report": "tsx scripts/generate-test-report.ts"
  }
}
```

### **Step 5: Test Workflow (AI-Visible)**

```bash
# 1. Build SkillKit
pnpm build

# 2. Link locally
pnpm link

# 3. Run automated integration tests
pnpm test:integration
# → Captures results to test-results/integration/*.jsonl

# 4. Generate report
pnpm test:integration:report
# → Creates test-results/reports/YYYY-MM-DD-integration-report.md

# 5. AI can now read:
# - test-results/integration/*.jsonl (structured data)
# - test-results/reports/*.md (human-readable summary)
# - logs/audit/*.jsonl (audit logs from test runs)
```

### **Step 6: CI Integration with Artifact Storage**

Add to `.github/workflows/ci.yml`:

```yaml
test-integration:
  name: Integration Tests (AI-Visible)
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
    
    - name: Run Integration Tests
      run: |
        pnpm test:integration
    
    - name: Generate Test Report
      run: |
        pnpm test:integration:report
    
    - name: Upload Test Results (for AI)
      uses: actions/upload-artifact@v4
      with:
        name: test-results-${{ matrix.os }}-${{ matrix.project }}
        path: |
          test-results/integration/*.jsonl
          test-results/reports/*.md
        retention-days: 30
    
    - name: Commit Test Results (if on main)
      if: github.ref == 'refs/heads/main'
      run: |
        git config user.name "CI"
        git config user.email "ci@skillkit"
        git add test-results/
        git commit -m "test: integration results ${{ matrix.os }}-${{ matrix.project }}" || exit 0
        git push || exit 0
```

**Key Points:**
- Test results stored in `test-results/` (in workspace)
- Results committed to repo (AI can read)
- Artifacts uploaded for CI visibility
- JSONL format for AI parsing
- Markdown reports for human/AI reading

---

## 🚫 What NOT to Do

### ❌ **Don't Install SkillKit in SkillKit Repo Root**
```bash
# BAD - Creates confusion
cd SkillKit/
tsk init  # Which version? What's being tested?
```

### ❌ **Don't Test on External Projects (AI Can't See Results)**
```bash
# BAD - AI has no visibility
cd ~/my-other-project
tsk init  # Results not in workspace, AI can't learn
```

### ❌ **Don't Test Without Capturing Results**
```bash
# BAD - No feedback for AI
cd test-projects/python-project
tsk init  # No structured results captured
```

### ✅ **DO: Test in Workspace with Result Capture**
```bash
# GOOD - AI can see results
cd test-projects/python-project
tsk init
# Results captured to test-results/integration/*.jsonl
# AI can read and learn from results
```

---

## ✅ Best Practices (AI-Agentated)

### **1. Keep Tests in Workspace**
- Test projects in `test-projects/` (within workspace)
- AI can read test results
- Results stored in `test-results/` directory
- Structured formats (JSONL, JSON) for AI parsing

### **2. Capture All Results**
- Every test run generates structured output
- Store in `test-results/integration/*.jsonl`
- Generate markdown reports in `test-results/reports/`
- Commit results to repo (AI can read history)

### **3. Version Control**
- Always know which version is being tested
- Use `pnpm link` for local builds
- Tag test runs with version numbers in results
- Include git commit hash in test results

### **4. Clean State with Artifacts Preserved**
- Reset test projects between runs (clean `.cursor/`, `.claude/`)
- **BUT preserve test results** (don't gitignore `test-results/`)
- Document test setup/teardown
- Keep audit logs in `logs/audit/`

### **5. AI-Readable Formats**
- JSONL for structured data (one JSON object per line)
- Markdown for reports (AI can read naturally)
- Include timestamps, versions, errors, outputs
- Store file paths relative to workspace root

### **6. Automation with Visibility**
- Automate all test runs
- Results automatically captured
- Reports automatically generated
- AI can read results immediately after tests

---

## 📊 Testing Checklist (AI-Agentated)

### **Before Release:**
- [ ] Unit tests pass
- [ ] Integration tests on test-projects pass
- [ ] Test results captured to `test-results/integration/*.jsonl`
- [ ] Test report generated in `test-results/reports/`
- [ ] Tested on TypeScript project (results visible)
- [ ] Tested on Python project (results visible)
- [ ] Tested on Node.js project (results visible)
- [ ] Tested on Windows (results in workspace)
- [ ] Tested on Linux (results in workspace)
- [ ] Tested on macOS (results in workspace)
- [ ] Tested with local build (`pnpm link`)
- [ ] AI can read test results (verify JSONL format)
- [ ] No recursion issues
- [ ] Test artifacts committed to repo (for AI visibility)

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

## 🎯 Summary (AI-Agentated Workflow)

**The Key Principle:** **Isolation + Real-World Testing + AI Visibility**

1. **Never test the tool on itself** (creates recursion)
2. **Use isolated test projects IN WORKSPACE** (controlled environment, AI-visible)
3. **Capture all test results** (structured formats for AI)
4. **Store results in workspace** (AI can read and learn)
5. **Automate in CI/CD** (consistency, results committed)
6. **Document everything** (clarity for AI and humans)

**For SkillKit (AI-Agentated):**
- ✅ Already has test-projects structure
- ✅ Has unit tests
- ✅ Has audit logging system (`logs/audit/`)
- ✅ Has AITracking system (`docs/AITracking/`)
- ⚠️ Should expand test-projects
- ⚠️ Should create automated test runner with result capture
- ⚠️ Should add `test-results/` directory structure
- ⚠️ Should add CI integration that commits test results
- 📝 Should create test result parser for AI

**Critical Difference:**
- **Traditional:** Test externally, manual feedback
- **AI-Agentated:** Test in workspace, structured results, AI reads automatically

---

## 📚 Further Reading

- [Testing Your Own Tools](https://github.com/eslint/eslint/tree/main/tests/fixtures)
- [Dogfooding Best Practices](https://en.wikipedia.org/wiki/Eating_your_own_dog_food)
- [CI/CD for Dev Tools](https://docs.github.com/en/actions/guides/building-and-testing-nodejs)

