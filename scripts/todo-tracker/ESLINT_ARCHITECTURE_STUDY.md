# ESLint Architecture Study - How ESLint Handles Patterns & Exclusions

## Key Insights from ESLint's Architecture

### 1. **AST-Based Parsing (Not Regex)**
- ESLint uses **Abstract Syntax Trees** to understand code structure
- Rules have access to AST nodes and their context
- Can distinguish between:
  - Function declarations vs function calls
  - Variable declarations vs variable usage
  - Comments vs code
  - String literals vs identifiers

### 2. **Rule-Based Architecture**
- Each rule is **independent** and **reusable**
- Rules have **metadata**: name, category, severity, description
- Rules can be **enabled/disabled** individually
- Rules can have **options** for configuration

### 3. **Context-Aware Detection**
- Rules receive **AST node** and **context** (parent nodes, scope, etc.)
- Can check:
  - Node type (FunctionDeclaration, CallExpression, etc.)
  - Parent context (is it in a comment? in a string?)
  - Sibling nodes (what comes before/after?)
  - Scope information (is it a method? a variable?)

### 4. **Built-in Exclusions**
- Common patterns are handled by **default** in rules
- Rules are **smart by default**, not dumb with exclusions
- Exclusions are **rare** and **specific**, not broad

### 5. **Configuration Hierarchy**
- **File-level**: `.eslintrc.js` in project root
- **Directory-level**: `.eslintrc.js` in subdirectories
- **Inline**: `// eslint-disable-next-line`
- **Pattern-based**: `.eslintignore` for files

### 6. **Severity Levels**
- **error**: Red, fails build
- **warn**: Yellow, doesn't fail build
- **off**: Disabled

## How ESLint Rules Work

```javascript
// ESLint Rule Structure
module.exports = {
  meta: {
    type: 'problem', // 'problem', 'suggestion', 'layout'
    docs: {
      description: 'Disallow TODO comments',
      category: 'Best Practices',
      recommended: true
    },
    fixable: null, // or 'code' or 'whitespace'
    schema: [] // rule options schema
  },
  create(context) {
    return {
      // AST node visitor
      Program(node) {
        // Check entire program
      },
      Literal(node) {
        // Check string/number literals
        if (node.value.includes('TODO')) {
          context.report({
            node,
            message: 'Unexpected TODO comment'
          });
        }
      }
    };
  }
};
```

## Key Differences from Our Current Approach

### Current (Regex-Based)
- ❌ Matches patterns in isolation
- ❌ No understanding of code structure
- ❌ Requires extensive exclusions
- ❌ Can't distinguish context

### ESLint Approach (AST-Based)
- ✅ Understands code structure
- ✅ Context-aware by default
- ✅ Minimal exclusions needed
- ✅ Can distinguish between similar patterns

## How to Apply ESLint Architecture to TODO Tracker

### 1. Use AST Parser (e.g., @babel/parser, typescript-eslint)
- Parse code into AST
- Traverse AST nodes
- Check nodes in context

### 2. Create Rule System
- Each pattern type = one rule
- Rules are independent and configurable
- Rules have metadata (severity, category, etc.)

### 3. Context-Aware Rules
- Rules check AST node type
- Rules check parent context
- Rules check sibling nodes
- Rules check scope information

### 4. Built-in Smart Defaults
- Rules are smart by default
- Exclusions are rare and specific
- Common patterns handled automatically

## Example: AST-Based TODO Detection

```javascript
// Instead of: /\bTODO\b/gi
// Use AST to check if TODO is in:
// - Comment node → Flag it
// - String literal → Don't flag (might be test data)
// - Variable name → Don't flag (might be variable name)

function checkTodoComment(node, context) {
  if (node.type === 'Line' || node.type === 'Block') {
    if (node.value.includes('TODO')) {
      // Check context: is it in a comment?
      if (isCommentNode(node)) {
        context.report({
          node,
          message: 'TODO comment found',
          severity: 'error'
        });
      }
    }
  }
}
```

## Benefits of AST-Based Approach

1. **Accuracy**: Understands code structure
2. **Fewer False Positives**: Context-aware by default
3. **Maintainability**: Rules are independent
4. **Extensibility**: Easy to add new rules
5. **Performance**: AST parsing is fast and efficient

## Migration Strategy

1. **Phase 1**: Add AST parser (keep regex as fallback)
2. **Phase 2**: Convert high-false-positive patterns to AST rules
3. **Phase 3**: Convert all patterns to AST rules
4. **Phase 4**: Remove regex-based patterns

