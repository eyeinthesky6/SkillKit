# TODO Tracker Refactoring Plan - ESLint-Inspired Architecture

## Current Problems

1. **Regex-based pattern matching** - Too many false positives
2. **Extensive exclusions** - 381 lines of exclusions needed
3. **No context awareness** - Can't distinguish between similar patterns
4. **Patterns are too broad** - Match words in isolation

## Solution: Rule-Based Architecture (Like ESLint)

### Phase 1: Add AST Parser Support

**Goal**: Parse code into AST to understand structure

**Implementation**:
- Use `@babel/parser` or `typescript-eslint` parser
- Parse files into AST
- Traverse AST nodes
- Check nodes in context

**Benefits**:
- Understand code structure
- Distinguish between function calls vs declarations
- Know if something is in a comment vs code
- Detect string literals vs identifiers

### Phase 2: Create Rule System

**Goal**: Convert patterns to independent rules

**Rule Structure**:
```javascript
{
  name: 'INCOMPLETE_WORK',
  category: 'incomplete',
  severity: 'medium',
  description: 'Detects incomplete work indicators',
  check: (node, context) => {
    // AST-based check
    // Return issue if found, null otherwise
  }
}
```

**Benefits**:
- Rules are independent and reusable
- Rules can be enabled/disabled individually
- Rules have metadata (severity, category, etc.)
- Rules can have options for configuration

### Phase 3: Context-Aware Rules

**Goal**: Make rules smart by default

**Context Checks**:
- Node type (FunctionDeclaration, CallExpression, etc.)
- Parent context (is it in a comment? in a string?)
- Sibling nodes (what comes before/after?)
- Scope information (is it a method? a variable?)

**Example**:
```javascript
// Instead of matching "add" everywhere
// Check: Is "add" a method call? → Don't flag
// Check: Is "add" in a TODO comment? → Flag it
// Check: Is "add" in a string literal? → Don't flag
```

### Phase 4: Reduce Exclusions

**Goal**: Handle common patterns in rules, not exclusions

**Strategy**:
- Move common exclusions into rule logic
- Rules check context before flagging
- Exclusions only for edge cases
- Reduce from 381 lines to <50 lines

## Implementation Steps

### Step 1: Add AST Parser
```javascript
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function parseFile(filePath, content) {
  try {
    return parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators']
    });
  } catch (e) {
    // Fallback to regex if parsing fails
    return null;
  }
}
```

### Step 2: Create Rule Base Class
```javascript
class Rule {
  constructor(name, category, severity, description) {
    this.name = name;
    this.category = category;
    this.severity = severity;
    this.description = description;
  }
  
  check(node, context) {
    // Override in subclasses
    return null;
  }
}
```

### Step 3: Convert Patterns to Rules
```javascript
class IncompleteWorkRule extends Rule {
  check(node, context) {
    // Check if node is a comment
    if (node.type === 'CommentLine' || node.type === 'CommentBlock') {
      const text = node.value;
      
      // Check for incomplete work indicators
      if (this.hasIncompleteWorkContext(text)) {
        // Check context: is it descriptive or incomplete?
        if (this.isDescriptive(text)) {
          return null; // Don't flag descriptive comments
        }
        
        return {
          type: 'INCOMPLETE_WORK',
          message: 'Incomplete work detected',
          severity: this.severity
        };
      }
    }
    
    return null;
  }
  
  hasIncompleteWorkContext(text) {
    // Check for incomplete work indicators
    return /TODO|FIXME|needs.*to|not.*implemented/i.test(text);
  }
  
  isDescriptive(text) {
    // Check if it's descriptive (e.g., "Adds two numbers")
    return /^(Adds?|Removes?|Gets?|Sets?)/i.test(text.trim());
  }
}
```

### Step 4: Rule Registry
```javascript
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
          const issue = rule.check(path.node, {
            file: filePath,
            path: path
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
```

## Migration Strategy

### Phase 1: Hybrid Approach (Current)
- Keep regex patterns as fallback
- Add AST parser for TypeScript/JavaScript files
- Gradually convert patterns to rules

### Phase 2: AST-First (Future)
- Use AST for all supported file types
- Regex only for unsupported file types
- All rules are AST-based

### Phase 3: Full AST (Future)
- All file types use AST
- No regex patterns
- Rules are context-aware by default

## Benefits

1. **Accuracy**: Understands code structure
2. **Fewer False Positives**: Context-aware by default
3. **Maintainability**: Rules are independent
4. **Extensibility**: Easy to add new rules
5. **Performance**: AST parsing is fast and efficient
6. **Reduced Exclusions**: From 381 lines to <50 lines

## Timeline

- **Week 1**: Add AST parser, create rule system
- **Week 2**: Convert high-false-positive patterns to rules
- **Week 3**: Convert all patterns to rules
- **Week 4**: Remove regex patterns, reduce exclusions

## Success Metrics

- **False Positives**: Reduced by 80%
- **Exclusions**: Reduced from 381 to <50 lines
- **Accuracy**: Improved from 60% to 95%
- **Performance**: No degradation (AST parsing is fast)

