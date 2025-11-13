# Implementation Roadmap - Adopting Best Practices

Based on analysis of jscpd, leasot, eslint-plugin-todo, and other successful tools.

---

## 🎯 Key Findings

### What Successful Tools Do Differently

1. **AST-Based Parsing** (not regex) - Understands code structure
2. **Tokenization** - Breaks code into semantic units
3. **Caching** - Caches results for performance
4. **Git Integration** - Tracks authors and age
5. **Rule-Based Architecture** - Modular, configurable rules
6. **Multiple Output Formats** - JSON, HTML, console, markdown
7. **Thresholds** - Configurable failure conditions

---

## 📋 Implementation Plan

### Phase 1: AST Parser Integration (HIGH PRIORITY)

**Goal**: Replace regex-based detection with AST-based detection

**Why**: 
- Reduces false positives by 80%+
- Understands code context (function calls vs declarations)
- Industry standard approach

**Implementation**:
```javascript
// Add AST parser support
const parser = require('@typescript-eslint/parser');
const traverse = require('@babel/traverse').default;

function parseFile(filePath, content) {
  try {
    return parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators']
    });
  } catch (e) {
    // Fallback to regex for unsupported files
    return null;
  }
}

function extractComments(ast) {
  const comments = [];
  traverse(ast, {
    enter(path) {
      if (path.node.leadingComments) {
        comments.push(...path.node.leadingComments);
      }
      if (path.node.trailingComments) {
        comments.push(...path.node.trailingComments);
      }
    }
  });
  return comments;
}
```

**Benefits**:
- ✅ Know if TODO is in comment vs code
- ✅ Know if "add" is method call vs incomplete work
- ✅ Understand JSDoc vs regular comments
- ✅ Reduce false positives significantly

**Timeline**: 1-2 weeks

---

### Phase 2: Caching System (HIGH PRIORITY)

**Goal**: Cache parsed ASTs and results for unchanged files

**Why**:
- Dramatically improves performance
- Enables incremental scanning
- Industry standard (jscpd does this)

**Implementation**:
```javascript
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(process.cwd(), '.todo-tracker-cache');

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getCachedResult(filePath) {
  const hash = getFileHash(filePath);
  const cacheFile = path.join(CACHE_DIR, `${hash}.json`);
  
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(filePath);
    const cacheStats = fs.statSync(cacheFile);
    
    // Cache is valid if file hasn't changed
    if (cacheStats.mtime >= stats.mtime) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }
  }
  
  return null;
}

function setCachedResult(filePath, result) {
  const hash = getFileHash(filePath);
  const cacheFile = path.join(CACHE_DIR, `${hash}.json`);
  
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  
  fs.writeFileSync(cacheFile, JSON.stringify(result));
}
```

**Benefits**:
- ✅ 10x faster on subsequent runs
- ✅ Only parse changed files
- ✅ Enables `--since=HEAD~1` incremental scanning

**Timeline**: 1 week

---

### Phase 3: Git Integration (MEDIUM PRIORITY)

**Goal**: Track TODO authors and age via git blame

**Why**:
- Adds accountability
- Shows TODO age (how long it's been there)
- Industry standard (tickgit, leasot do this)

**Implementation**:
```javascript
const { execSync } = require('child_process');

function getGitBlame(filePath, lineNumber) {
  try {
    const result = execSync(
      `git blame -L ${lineNumber},${lineNumber} --porcelain "${filePath}"`,
      { encoding: 'utf8', cwd: process.cwd() }
    );
    
    const lines = result.split('\n');
    const author = lines.find(l => l.startsWith('author '))?.substring(7);
    const date = lines.find(l => l.startsWith('committer-time '))?.substring(15);
    
    return {
      author: author || 'unknown',
      date: date ? new Date(parseInt(date) * 1000) : null,
      age: date ? Math.floor((Date.now() - parseInt(date) * 1000) / (1000 * 60 * 60 * 24)) : null // days
    };
  } catch (e) {
    return null;
  }
}
```

**Benefits**:
- ✅ Know who added TODO
- ✅ Know when TODO was added
- ✅ Track TODO age (days old)
- ✅ Better accountability

**Timeline**: 1 week

---

### Phase 4: Rule-Based Architecture (MEDIUM PRIORITY)

**Goal**: Convert patterns to independent, configurable rules

**Why**:
- Modular design (like ESLint)
- Rules can be enabled/disabled individually
- Easier to maintain and extend

**Implementation**:
```javascript
class Rule {
  constructor(name, category, severity, description, check) {
    this.name = name;
    this.category = category;
    this.severity = severity;
    this.description = description;
    this.check = check; // Function that checks AST node
    this.enabled = true;
  }
  
  execute(node, context) {
    if (!this.enabled) return null;
    return this.check(node, context);
  }
}

class RuleRegistry {
  constructor() {
    this.rules = [];
  }
  
  register(rule) {
    this.rules.push(rule);
  }
  
  checkFile(ast, filePath) {
    const issues = [];
    
    traverse(ast, {
      enter(path) {
        for (const rule of this.rules) {
          const issue = rule.execute(path.node, {
            file: filePath,
            path: path,
            ast: ast
          });
          
          if (issue) {
            issues.push(issue);
          }
        }
      }
    });
    
    return issues;
  }
}

// Example rule
const incompleteWorkRule = new Rule(
  'INCOMPLETE_WORK',
  'incomplete',
  'medium',
  'Detects incomplete work indicators',
  (node, context) => {
    // Check if node is a comment
    if (node.type === 'CommentLine' || node.type === 'CommentBlock') {
      const text = node.value;
      
      // Check for incomplete work indicators
      if (/TODO|FIXME|needs.*to|not.*implemented/i.test(text)) {
        // Check context: is it descriptive or incomplete?
        if (!/^(Adds?|Removes?|Gets?|Sets?)/i.test(text.trim())) {
          return {
            type: 'INCOMPLETE_WORK',
            message: 'Incomplete work detected',
            severity: 'medium',
            line: node.loc.start.line,
            column: node.loc.start.column
          };
        }
      }
    }
    
    return null;
  }
);
```

**Benefits**:
- ✅ Modular design
- ✅ Rules can be enabled/disabled
- ✅ Easier to test individual rules
- ✅ Easier to add new rules

**Timeline**: 2-3 weeks

---

### Phase 5: Improved Output Formats (LOW PRIORITY)

**Goal**: Add HTML output and improve existing formats

**Why**:
- Better visualization
- Industry standard (jscpd has HTML reports)
- More useful for teams

**Implementation**:
```javascript
function generateHTMLReport(issues) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>TODO Tracker Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .issue { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
    .blocker { border-left: 4px solid #d32f2f; }
    .critical { border-left: 4px solid #f57c00; }
    .major { border-left: 4px solid #fbc02d; }
    .minor { border-left: 4px solid #388e3c; }
  </style>
</head>
<body>
  <h1>TODO Tracker Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <p>Total Issues: ${issues.length}</p>
  
  ${issues.map(issue => `
    <div class="issue ${issue.priority}">
      <h3>${issue.file}:${issue.line}</h3>
      <p><strong>Type:</strong> ${issue.type}</p>
      <p><strong>Severity:</strong> ${issue.severity}</p>
      <p><strong>Message:</strong> ${issue.message}</p>
      <pre>${issue.text}</pre>
    </div>
  `).join('')}
</body>
</html>
  `;
  
  return html;
}
```

**Benefits**:
- ✅ Visual reports
- ✅ Better for sharing with team
- ✅ Interactive (can add filtering, sorting)

**Timeline**: 1 week

---

### Phase 6: Threshold System (LOW PRIORITY)

**Goal**: Add configurable thresholds for different issue types

**Why**:
- Prevents noise from minor issues
- CI/CD integration
- Industry standard (jscpd has thresholds)

**Implementation**:
```javascript
const thresholds = {
  blocker: 0,    // Fail if any blockers
  critical: 5,   // Fail if >5 critical
  major: 20,     // Fail if >20 major
  minor: 100     // Fail if >100 minor
};

function checkThresholds(issues) {
  const counts = {
    blocker: issues.filter(i => i.priority === 'blocker').length,
    critical: issues.filter(i => i.priority === 'critical').length,
    major: issues.filter(i => i.priority === 'major').length,
    minor: issues.filter(i => i.priority === 'minor').length
  };
  
  if (counts.blocker > thresholds.blocker) {
    console.error(`❌ Blockers exceeded: ${counts.blocker} > ${thresholds.blocker}`);
    process.exit(1);
  }
  
  if (counts.critical > thresholds.critical) {
    console.error(`❌ Critical exceeded: ${counts.critical} > ${thresholds.critical}`);
    process.exit(1);
  }
  
  // ... etc
}
```

**Benefits**:
- ✅ CI/CD integration
- ✅ Prevents noise
- ✅ Configurable per project

**Timeline**: 1 week

---

## 🚀 Quick Wins (Can Implement Now)

### 1. Add Git Blame Support
- Track TODO authors
- Track TODO age
- **Effort**: 2-3 hours
- **Impact**: High (adds accountability)

### 2. Improve Error Message Detection
- Already done! ✅
- Context-aware error message detection
- **Impact**: High (reduced false positives)

### 3. Add HTML Output
- Visual reports
- **Effort**: 4-6 hours
- **Impact**: Medium (better visualization)

### 4. Add Threshold System
- CI/CD integration
- **Effort**: 2-3 hours
- **Impact**: Medium (prevents noise)

---

## 📊 Expected Impact

### Before Improvements
- **False Positives**: High (many exclusions needed)
- **Performance**: Slow (no caching)
- **Accuracy**: ~60%
- **Exclusions**: 381 lines

### After Phase 1-2 (AST + Caching)
- **False Positives**: Low (<10%)
- **Performance**: Fast (10x faster with caching)
- **Accuracy**: ~90%
- **Exclusions**: <100 lines

### After All Phases
- **False Positives**: Very Low (<5%)
- **Performance**: Very Fast (caching + incremental)
- **Accuracy**: >95%
- **Exclusions**: <50 lines

---

## 🎯 Success Criteria

1. **False Positive Rate**: <5%
2. **Performance**: <5 seconds for 1000 files (with cache)
3. **Accuracy**: >95%
4. **Exclusions**: <50 lines
5. **Git Integration**: Track authors and age
6. **Output Formats**: JSON, HTML, console, markdown
7. **CI/CD Ready**: Exit codes, thresholds

---

## 📝 Next Steps

1. **Start with Phase 1** - AST Parser Integration (highest impact)
2. **Add Phase 2** - Caching System (performance boost)
3. **Add Phase 3** - Git Integration (accountability)
4. **Iterate** - Test on real codebases, gather feedback
5. **Refine** - Improve based on usage patterns

---

## 🔗 References

- **jscpd**: https://github.com/kucherenko/jscpd
- **leasot**: https://github.com/pgilad/leasot
- **eslint-plugin-todo**: https://github.com/benmosher/eslint-plugin-todo
- **tickgit**: https://github.com/augmentable-dev/tickgit

