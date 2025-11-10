# Getting Started with SkillKit

Welcome to SkillKit! This guide will help you get up and running quickly.

## Installation

### Prerequisites

- Node.js v18.0.0 or higher
- pnpm v8.15.3 or higher (recommended) or npm/yarn

### Install from npm

```bash
# Using pnpm (recommended)
pnpm add @trinity-os/skillkit

# Using npm
npm install @trinity-os/skillkit

# Using yarn
yarn add @trinity-os/skillkit
```

### Install CLI globally

```bash
# Using pnpm
pnpm add -g @trinity-os/skillkit

# Using npm
npm install -g @trinity-os/skillkit

# Using yarn
yarn global add @trinity-os/skillkit
```

After installation, the `tsk` CLI will be available globally.

## Quick Start

### 1. Create Your First Skill

Use the CLI to generate a new skill scaffold:

```bash
tsk gen-skill my-first-skill
```

This creates a directory in your current location:

```
my-first-skill/
├── SKILL.yaml          # Skill metadata
├── index.js            # Skill implementation
├── input.schema.json   # Input validation schema
└── output.schema.json  # Output validation schema
```

**Output:**
```
✅ Skill created successfully!

📁 Location: my-first-skill

📋 Files created:
   ● SKILL.yaml         - Skill metadata
   ● index.js           - Implementation
   ● input.schema.json  - Input schema
   ● output.schema.json - Output schema

🚀 Next steps:
   1. cd my-first-skill
   2. Edit index.js to implement your logic
   3. tsk run my-first-skill --input '{"message":"world"}'
```

### 2. Understanding the Skill Structure

**SKILL.yaml** - Defines the skill's metadata:

```yaml
name: my-first-skill
version: 0.1.0
description: Example skill my-first-skill
tags: [example]
inputs: ./input.schema.json
outputs: ./output.schema.json
allowedPaths:
  read: ['./data/**']
  write: ['./output/**']
allowedCommands: []
steps:
  - Say hello
retries: 0
dryRunSupported: true
dependencies: []
```

**index.js** - The skill's main function:

```javascript
module.exports = async function (input, sandbox, context) {
  // input: validated input data
  // sandbox: secure execution environment
  // context: { cwd, env, dryRun }

  const msg = input.message || 'world';
  return { greeting: 'Hello, ' + msg + '!' };
};
```

**input.schema.json** - JSON Schema for input validation:

```json
{
  "type": "object",
  "properties": {
    "message": { "type": "string" }
  },
  "required": ["message"],
  "additionalProperties": false
}
```

**output.schema.json** - JSON Schema for output validation:

```json
{
  "type": "object",
  "properties": {
    "greeting": { "type": "string" }
  },
  "required": ["greeting"],
  "additionalProperties": false
}
```

### 3. Run Your Skill

#### Using CLI

Create an input file:

```bash
echo '{"message": "SkillKit"}' > input.json
```

Run the skill (auto-discovers by name):

```bash
tsk run my-first-skill --input input.json
```

**Output:**
```
🚀 Running skill: my-first-skill@0.1.0

✅ Success!

Output:
{
  "greeting": "Hello, SkillKit!"
}

⏱️  Duration: 45ms
📋 Audit log: abc123-def456
```

**Note:** SkillKit auto-discovers skills from:
- Current directory
- `./examples/skills/`
- `./skills/`

No need to specify full paths!

#### Using the API

```typescript
import { InMemorySkillRegistry, SkillRunner } from '@trinity-os/skillkit';

// Load skills from a directory
const registry = new InMemorySkillRegistry();
await registry.loadFromDirectory('./examples/skills');

// Get a specific skill
const skill = registry.get('my-first-skill');

// Create a runner
const runner = new SkillRunner({
  cwd: process.cwd(),
  dryRun: false,
  audit: true,
});

// Execute the skill
const result = await runner.run(skill, {
  message: 'SkillKit',
});

if (result.success) {
  console.log('Output:', result.output);
  // Output: { greeting: 'Hello, SkillKit!' }
} else {
  console.error('Error:', result.error);
}
```

### 4. Explore Example Skills

SkillKit comes with example skills you can learn from:

```bash
# List all discoverable skills (auto-discovers from current dir + examples/)
tsk list-skills

# Run the hello-world example (auto-discovery!)
echo '{"message": "World"}' | tsk run hello-world --stdin
```

**Output:**
```
📦 Found 3 skills:

● my-first-skill@0.1.0
  Example skill my-first-skill
  tags: example
  path: ./my-first-skill

● hello-world@1.0.0
  A simple greeting skill
  tags: example, tutorial
  path: ./examples/skills/hello-world
```

## Core Concepts

### Skills

A **skill** is a self-contained unit of automation with:

- **Metadata**: Name, version, description, tags
- **Schemas**: Input/output validation
- **Permissions**: File paths and commands it can access
- **Implementation**: JavaScript/TypeScript code

### Sandbox

The **sandbox** provides a secure execution environment with:

- **Path restrictions**: Only allowed paths can be read/written
- **Command filtering**: Only whitelisted commands can execute
- **Resource limits**: CPU, memory, and output size constraints
- **Audit logging**: All operations are tracked

### Registry

The **registry** manages available skills:

- Discovers skills from filesystem
- Validates skill metadata
- Provides skill lookup by name or tags

### Runner

The **runner** executes skills with:

- Input/output validation
- Retry logic on failures
- Audit trail generation
- Dry-run mode support

### Planner

The **planner** helps select the right skill for a task:

- Scores skills based on tags and descriptions
- Matches input shapes to schemas
- Provides confidence ratings

## CLI Commands

### List Skills

```bash
# Auto-discovers from current directory + examples/skills/
tsk list-skills

# List skills in specific directory
tsk list-skills ./my-skills
```

### Run a Skill

```bash
# By name (auto-discovery!)
tsk run my-skill --input data.json

# By path (if needed)
tsk run ./path/to/my-skill --input data.json

# With stdin
echo '{"key": "value"}' | tsk run my-skill --stdin

# Dry run (no writes)
tsk run my-skill --input data.json --dry-run

# Custom timeout
tsk run my-skill --input data.json --timeout 60000
```

### View Audit Stats

```bash
# Stats from default audit directory
tsk stats

# Stats from custom directory
tsk stats ./my-logs
```

### Generate New Skill

```bash
# Generate in current directory
tsk gen-skill my-skill

# Generate in specific directory
tsk gen-skill my-skill ./custom-skills

# Force overwrite existing skill
tsk gen-skill my-skill --force
```

**Note:** By default, `gen-skill` prevents accidental overwrites. Use `--force` to overwrite existing skills.

## Configuration Options

### RunnerOptions

```typescript
{
  cwd: string; // Working directory
  env: NodeJS.ProcessEnv; // Environment variables
  dryRun: boolean; // Simulate without writes
  audit: boolean; // Enable audit logging
  autoApply: boolean; // Auto-apply changes
  maxRetries: number; // Retry attempts
  timeout: number; // Execution timeout (ms)
}
```

### SandboxOptions

```typescript
{
  cwd: string;              // Sandbox root directory
  env: NodeJS.ProcessEnv;   // Environment variables
  dryRun: boolean;          // Dry run mode
  limits: {
    maxCpuTime: number;           // CPU time limit (ms)
    maxMemory: number;            // Memory limit (bytes)
    maxFileDescriptors: number;   // File descriptor limit
    maxChildProcesses: number;    // Process limit
    maxStackSize: number;         // Stack size (bytes)
    maxOutputSize: number;        // Output size (bytes)
  },
  timeout: number;          // Overall timeout
}
```

## Security Best Practices

1. **Principle of Least Privilege**: Only grant necessary file and command permissions
2. **Validate All Inputs**: Use strict JSON schemas
3. **Review Audit Logs**: Monitor skill executions for anomalies
4. **Use Dry Run**: Test skills before applying changes
5. **Set Resource Limits**: Prevent resource exhaustion
6. **Avoid Shell Commands**: Use direct Node.js APIs when possible

## Next Steps

- [Creating Skills](./skills.md) - Learn how to build complex skills
- [API Reference](./api/README.md) - Detailed API documentation
- [Security](./security.md) - Security model and best practices
- [Skills Gallery](./skills-gallery.md) - Browse community skills

## Troubleshooting

### Skill not found

**Problem**: 
```
❌ Skill not found: my-skill
   Error Code: SKILL_NOT_FOUND
```

**Solution**: 
1. Create the skill: `tsk gen-skill my-skill`
2. List available skills: `tsk list-skills`
3. Check if skill is in current directory or `examples/skills/`

### No skill metadata

**Problem**:
```
❌ No skill metadata found
   Error Code: MISSING_SKILL_METADATA
```

**Solution**: Ensure your skill directory contains:
- `SKILL.yaml` or `SKILL.md` (metadata)
- `index.js` (implementation)

### Permission denied

**Problem**: `Read/Write access to <path> is not allowed`

**Solution**: Add the path to `allowedPaths.read` or `allowedPaths.write` in SKILL.yaml.

### Command not allowed

**Problem**: `Command not allowed: <command>`

**Solution**: Add the command to `allowedCommands` in SKILL.yaml.

### Validation failed

**Problem**: `Input validation failed` or `Output validation failed`

**Solution**: Check that your data matches the schema in `input.schema.json` or `output.schema.json`.

### Timeout exceeded

**Problem**: Skill execution times out

**Solution**: Increase the timeout with `--timeout <ms>` or optimize your skill code.

## Getting Help

- [GitHub Issues](https://github.com/trinity-os/skillkit/issues) - Report bugs
- [GitHub Discussions](https://github.com/trinity-os/skillkit/discussions) - Ask questions
- [Contributing Guide](../CONTRIBUTING.md) - Contribute to the project

## License

SkillKit is [MIT licensed](../LICENSE).
