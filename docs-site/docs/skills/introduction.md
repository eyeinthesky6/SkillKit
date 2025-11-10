# Creating Skills

This guide covers everything you need to know to create powerful, secure skills with SkillKit.

## Table of Contents

- [Skill Anatomy](#skill-anatomy)
- [Quick Start](#quick-start)
- [Metadata (SKILL.yaml)](#metadata-skillyaml)
- [Implementation (index.js)](#implementation-indexjs)
- [Schemas](#schemas)
- [Sandbox API](#sandbox-api)
- [Best Practices](#best-practices)
- [Advanced Topics](#advanced-topics)
- [Testing Skills](#testing-skills)
- [Publishing Skills](#publishing-skills)

## Skill Anatomy

A skill consists of four core files:

```
my-skill/
├── SKILL.yaml          # Metadata and configuration
├── index.js            # Implementation
├── input.schema.json   # Input validation
└── output.schema.json  # Output validation
```

## Quick Start

### Generate a Skill

```bash
tsk gen-skill my-awesome-skill
cd examples/skills/my-awesome-skill
```

### Test Your Skill

```bash
echo '{"message": "test"}' | tsk run . --stdin
```

### Customize

Edit the files to implement your logic!

## Metadata (SKILL.yaml)

### Complete Example

```yaml
name: file-processor
version: 1.2.3
description: Processes files and generates reports
tags:
  - files
  - reporting
  - automation
inputs: ./input.schema.json
outputs: ./output.schema.json
allowedPaths:
  read:
    - './data/**'
    - './config.json'
  write:
    - './output/**'
    - './reports/**'
allowedCommands:
  - node
  - git
  - /^npm (install|ci)$/
steps:
  - Read files from data directory
  - Process each file according to rules
  - Generate summary report
  - Write output to reports directory
retries: 2
dryRunSupported: true
dependencies:
  - json-validator
  - data-transformer
```

### Field Reference

#### `name` (required)

- Must be kebab-case (lowercase letters, numbers, dashes only)
- Should be unique and descriptive
- Example: `data-transformer`, `api-client`, `file-merger`

#### `version` (required)

- Semantic versioning: `MAJOR.MINOR.PATCH`
- Follow [SemVer](https://semver.org/) principles
- Example: `1.0.0`, `2.1.3`, `0.5.0-beta`

#### `description` (required)

- 10-200 characters
- Clear, concise description of what the skill does
- Used by the planner for skill selection

#### `tags` (required)

- Array of lowercase strings
- Used for discovery and filtering
- Be specific: `["json", "validation"]` better than `["data"]`
- Common tags: `automation`, `files`, `api`, `data`, `reporting`

#### `inputs` (required)

- Path to JSON Schema file (relative to SKILL.yaml)
- Or inline JSON Schema object
- Defines expected input structure

```yaml
# File reference
inputs: ./input.schema.json

# Inline schema
inputs:
  type: object
  properties:
    name:
      type: string
  required: [name]
```

#### `outputs` (required)

- Path to JSON Schema file or inline schema
- Defines output structure for validation

#### `allowedPaths` (required)

- Whitelist of file paths the skill can access
- Supports glob patterns (`*`, `**`)
- Separate read and write permissions

**Examples:**

```yaml
allowedPaths:
  read:
    - './**' # Everything in skill directory
    - '../shared/**' # Shared resources
    - '/tmp/cache/**' # Absolute paths allowed
  write:
    - './output/**' # Output directory only
    - './logs/*.log' # Log files only
```

**Security Note:** Be as restrictive as possible!

#### `allowedCommands` (required)

- Array of allowed commands
- Exact matches or regex patterns
- Empty array `[]` if no commands needed

**Examples:**

```yaml
allowedCommands:
  - node # Exact match
  - git # Exact match
  - /^npm (install|ci)$/ # Regex (wrap in /.../)
  - /^echo .+$/ # Regex pattern
```

**Security Note:** Commands are executed without shell, preventing injection attacks.

#### `steps` (required)

- Array of 1-10 descriptive steps
- Each step: 10+ characters
- Used for documentation and understanding
- Should describe what the skill does, not how

**Example:**

```yaml
steps:
  - Validate input data structure
  - Connect to external API
  - Transform response data
  - Write results to output file
```

#### `retries` (optional, default: 1)

- Number of retry attempts on failure (0-3)
- Useful for transient errors
- Set to 0 for non-idempotent operations

#### `dryRunSupported` (optional, default: true)

- Whether skill supports dry-run mode
- In dry-run, `context.dryRun` is true
- Skill should simulate but not execute side effects

#### `dependencies` (optional, default: [])

- Array of other skill names this skill depends on
- Currently informational (future: automatic execution)
- Example: `["data-loader", "validator"]`

### Alternative: Markdown Format

You can also use `SKILL.md` with YAML frontmatter:

```markdown
---
name: my-skill
version: 1.0.0
description: Does something cool
tags: [example]
inputs: ./input.schema.json
outputs: ./output.schema.json
allowedPaths:
  read: ['./**']
  write: ['./output/**']
allowedCommands: []
steps:
  - Step one
  - Step two
retries: 1
dryRunSupported: true
dependencies: []
---

# My Skill

This is extended documentation about the skill.

## Usage

... more docs ...
```

## Implementation (index.js)

### Function Signature

```javascript
/**
 * @param {object} input - Validated input data
 * @param {Sandbox} sandbox - Secure execution environment
 * @param {object} context - Execution context
 * @param {string} context.cwd - Current working directory
 * @param {object} context.env - Environment variables
 * @param {boolean} context.dryRun - Whether this is a dry run
 * @returns {Promise<object>|object} - Output data (will be validated)
 */
module.exports = async function (input, sandbox, context) {
  // Your implementation here
  return output;
};
```

### Basic Example

```javascript
module.exports = async function (input, sandbox, context) {
  // 1. Access validated input
  const { filename, content } = input;

  // 2. Use sandbox for file operations
  sandbox.writeFile(filename, content);

  // 3. Return validated output
  return {
    success: true,
    path: filename,
    bytes: content.length,
  };
};
```

### TypeScript Support

```typescript
import { Sandbox } from '@trinity-os/skillkit';

interface Input {
  message: string;
}

interface Output {
  result: string;
}

interface Context {
  cwd: string;
  env: NodeJS.ProcessEnv;
  dryRun: boolean;
}

export default async function (input: Input, sandbox: Sandbox, context: Context): Promise<Output> {
  return {
    result: `Processed: ${input.message}`,
  };
}
```

### Handling Dry Run

```javascript
module.exports = async function (input, sandbox, context) {
  const { dryRun } = context;

  if (dryRun) {
    console.log('[DRY RUN] Would write to:', input.filename);
    return {
      success: true,
      simulated: true,
    };
  }

  // Actual operations
  sandbox.writeFile(input.filename, input.content);

  return {
    success: true,
    simulated: false,
  };
};
```

### Error Handling

```javascript
module.exports = async function (input, sandbox, context) {
  try {
    // Your logic
    const data = sandbox.readFile(input.path);
    return { data };
  } catch (error) {
    // Errors are automatically caught and logged
    // You can throw with custom messages
    throw new Error(`Failed to read ${input.path}: ${error.message}`);
  }
};
```

## Schemas

### Input Schema

Define what data your skill expects:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "sourceFile": {
      "type": "string",
      "description": "Path to source file",
      "minLength": 1
    },
    "options": {
      "type": "object",
      "properties": {
        "encoding": {
          "type": "string",
          "enum": ["utf8", "utf16le", "ascii"],
          "default": "utf8"
        },
        "skipEmpty": {
          "type": "boolean",
          "default": false
        }
      }
    }
  },
  "required": ["sourceFile"],
  "additionalProperties": false
}
```

### Output Schema

Define what your skill returns:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "linesProcessed": {
      "type": "integer",
      "minimum": 0
    },
    "outputPath": {
      "type": "string"
    }
  },
  "required": ["success", "linesProcessed"],
  "additionalProperties": false
}
```

### Schema Best Practices

1. **Use `additionalProperties: false`** to catch typos
2. **Mark fields as required** when they truly are
3. **Provide defaults** for optional fields
4. **Add descriptions** for documentation
5. **Use enums** to restrict choices
6. **Set min/max** for numbers and strings
7. **Use formats** like `email`, `uri`, `date-time`

## Sandbox API

The sandbox provides secure access to the file system and commands.

### File Operations

#### `readFile(path, encoding?)`

```javascript
// Read as string (default utf8)
const content = sandbox.readFile('./data.txt');

// Read as buffer
const buffer = sandbox.readFile('./image.png', null);

// Custom encoding
const content = sandbox.readFile('./file.txt', 'utf16le');
```

#### `writeFile(path, content, encoding?)`

```javascript
// Write string
sandbox.writeFile('./output.txt', 'Hello World');

// Write with encoding
sandbox.writeFile('./data.txt', content, 'utf8');
```

#### `deletePath(path)`

```javascript
// Delete file
sandbox.deletePath('./temp.txt');

// Delete directory (recursive)
sandbox.deletePath('./temp-dir');
```

### Command Execution

#### `executeCommand(command, args, options?)`

```javascript
// Basic execution
const result = await sandbox.executeCommand('node', ['--version']);
console.log(result.stdout); // v18.0.0
console.log(result.exitCode); // 0

// With options
const result = await sandbox.executeCommand('git', ['status'], {
  cwd: '/path/to/repo',
  timeout: 5000,
  env: { GIT_AUTHOR: 'Bot' },
});

// With input
const result = await sandbox.executeCommand('node', ['-e', 'process.stdin'], {
  input: 'console.log("hi")',
});
```

**Result Object:**

```typescript
{
  exitCode: number | null; // 0 for success, null if killed
  stdout: string; // Standard output
  stderr: string; // Standard error
  duration: number; // Milliseconds
}
```

### Path Resolution

All paths are resolved relative to the skill's directory unless absolute.

```javascript
// Relative to skill directory
sandbox.writeFile('./output.json', data); // ./my-skill/output.json

// Absolute path (must be in allowedPaths)
sandbox.writeFile('/tmp/cache/data.json', data);

// Parent directory access (must be in allowedPaths)
sandbox.readFile('../shared/config.json');
```

## Best Practices

### 1. Validate Early

```javascript
module.exports = async function (input, sandbox, context) {
  // Additional validation beyond schema
  if (!input.path.endsWith('.json')) {
    throw new Error('Only JSON files are supported');
  }

  // ... rest of logic
};
```

### 2. Use Descriptive Errors

```javascript
// Bad
throw new Error('Failed');

// Good
throw new Error(`Failed to process ${input.filename}: Invalid JSON format at line 42`);
```

### 3. Handle Dry Run

```javascript
module.exports = async function (input, sandbox, context) {
  if (context.dryRun) {
    console.log(`[DRY RUN] Would process ${input.files.length} files`);
    // Return realistic output for testing
    return { filesProcessed: input.files.length };
  }

  // Real implementation
};
```

### 4. Be Idempotent

Skills should produce the same result when run multiple times:

```javascript
// Good: overwrites file
sandbox.writeFile('./output.json', data);

// Bad: appends (non-idempotent)
const existing = sandbox.readFile('./output.json');
sandbox.writeFile('./output.json', existing + data);
```

### 5. Minimal Permissions

Request only the permissions you need:

```yaml
# Good
allowedPaths:
  read: ["./input/**"]
  write: ["./output/**"]

# Bad
allowedPaths:
  read: ["./**", "../../**"]
  write: ["./**"]
```

### 6. Structured Output

Return structured data, not just strings:

```javascript
// Good
return {
  success: true,
  filesProcessed: 10,
  errors: [],
  duration: 1234,
};

// Bad
return 'Processed 10 files in 1234ms';
```

### 7. Log Appropriately

```javascript
// Use console for user-facing information
console.log('Processing file 5 of 10...');
console.warn('Skipping invalid entry');
console.error('Failed to connect to API');

// Don't log sensitive data
console.log('API Key:', apiKey); // ❌ Never!
```

## Advanced Topics

### Working with Node Modules

Skills can use Node.js built-in modules:

```javascript
const path = require('path');
const fs = require('fs'); // Use sandbox instead!

module.exports = async function (input, sandbox, context) {
  const filename = path.basename(input.path);
  const ext = path.extname(filename);

  // ... logic
};
```

**Note:** External npm packages are not yet supported but are planned.

### Async/Await

Skills can be async:

```javascript
module.exports = async function (input, sandbox, context) {
  // Sequential
  const data1 = await sandbox.executeCommand('curl', [url1]);
  const data2 = await sandbox.executeCommand('curl', [url2]);

  // Parallel
  const [data1, data2] = await Promise.all([
    sandbox.executeCommand('curl', [url1]),
    sandbox.executeCommand('curl', [url2]),
  ]);

  return { data1, data2 };
};
```

### Streaming Large Files

For large files, process in chunks:

```javascript
module.exports = async function (input, sandbox, context) {
  const content = sandbox.readFile(input.path);
  const lines = content.split('\n');

  let processed = 0;
  for (const line of lines) {
    // Process line by line
    if (line.trim()) {
      processed++;
    }
  }

  return { linesProcessed: processed };
};
```

### Conditional Commands

Execute commands based on conditions:

```javascript
module.exports = async function (input, sandbox, context) {
  // Check if git repo
  try {
    await sandbox.executeCommand('git', ['rev-parse', '--git-dir']);
    // It's a git repo, proceed
  } catch (error) {
    throw new Error('Not a git repository');
  }

  // Continue with git operations
};
```

### Multi-Step Workflows

```javascript
module.exports = async function (input, sandbox, context) {
  // Step 1: Read input files
  const files = input.files.map((f) => ({
    name: f,
    content: sandbox.readFile(f),
  }));

  // Step 2: Process data
  const processed = files.map((f) => ({
    name: f.name,
    lines: f.content.split('\n').length,
  }));

  // Step 3: Generate report
  const report = processed.map((p) => `${p.name}: ${p.lines} lines`).join('\n');

  // Step 4: Write output
  sandbox.writeFile('./report.txt', report);

  return {
    filesProcessed: files.length,
    reportPath: './report.txt',
  };
};
```

## Testing Skills

### Manual Testing

```bash
# Create test input
echo '{"key": "value"}' > test-input.json

# Run skill
tsk run ./my-skill --input test-input.json

# Dry run first
tsk run ./my-skill --input test-input.json --dry-run
```

### Automated Testing

Create a test script:

```javascript
// test-skill.js
const { InMemorySkillRegistry, SkillRunner } = require('@trinity-os/skillkit');

async function testSkill() {
  const registry = new InMemorySkillRegistry();
  await registry.loadFromDirectory('./my-skill');

  const skill = registry.get('my-skill');
  const runner = new SkillRunner({ dryRun: true });

  const result = await runner.run(skill, {
    // Test input
    key: 'value',
  });

  console.assert(result.success, 'Skill should succeed');
  console.assert(result.output.key === 'value', 'Output should match');

  console.log('✓ All tests passed');
}

testSkill().catch(console.error);
```

Run with:

```bash
node test-skill.js
```

## Publishing Skills

### 1. Documentation

Add a README.md to your skill:

```markdown
# My Skill

Brief description of what it does.

## Usage

\`\`\`bash
tsk run my-skill --input example.json
\`\`\`

## Input

- `field1`: Description
- `field2`: Description

## Output

- `result`: Description

## Examples

...
```

### 2. Share on GitHub

```bash
cd my-skill
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/user/my-skill.git
git push -u origin main
```

### 3. Submit to Skills Gallery

Open a PR to add your skill to the [Skills Gallery](./skills-gallery.md).

## Next Steps

- [API Reference](./api/README.md) - Detailed API documentation
- [Security](./security.md) - Security best practices
- [Skills Gallery](./skills-gallery.md) - Browse existing skills
- [Examples](../examples/skills) - Study example implementations

## Getting Help

- [GitHub Issues](https://github.com/trinity-os/skillkit/issues) - Report problems
- [GitHub Discussions](https://github.com/trinity-os/skillkit/discussions) - Ask questions
- [Contributing](../CONTRIBUTING.md) - Contribute improvements
