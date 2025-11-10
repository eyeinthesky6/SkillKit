# SkillKit Overview

## What is SkillKit?

SkillKit is a **router-first, sandboxed skill runner** with strong typing and audit trails. It provides a secure framework for building, sharing, and executing modular automation units called "skills."

### Key Characteristics

- 🛡️ **Security-First**: Sandboxed execution with strict permission controls
- 🔍 **Type-Safe**: Strong typing with TypeScript and JSON Schema validation
- 📊 **Auditable**: Comprehensive logging of all operations
- 🧩 **Modular**: Self-contained skills with clear interfaces
- 🚀 **Developer-Friendly**: Simple API and powerful CLI

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                         CLI / API                        │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
        ┌───────▼────────┐    ┌──────▼────────┐
        │   Registry     │    │    Planner    │
        │  (Discovery)   │    │  (Routing)    │
        └───────┬────────┘    └──────┬────────┘
                │                     │
                └──────────┬──────────┘
                           │
                    ┌──────▼───────┐
                    │    Runner    │
                    │  (Executor)  │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼──────┐    ┌─────▼──────┐    ┌─────▼──────┐
  │  Validator │    │   Sandbox  │    │   Audit    │
  │  (Schema)  │    │ (Security) │    │ (Logging)  │
  └────────────┘    └─────┬──────┘    └────────────┘
                          │
                    ┌─────▼──────┐
                    │   Skill    │
                    │    Code    │
                    └────────────┘
```

## Core Components

### 1. Skills

A skill is a self-contained automation unit consisting of:

**Metadata** (`SKILL.yaml` or `SKILL.md`):

```yaml
name: example-skill
version: 1.0.0
description: Does something useful
tags: [automation, example]
inputs: ./input.schema.json
outputs: ./output.schema.json
allowedPaths:
  read: ['./data/**']
  write: ['./output/**']
allowedCommands: ['git', 'node']
steps:
  - Step 1 description
  - Step 2 description
retries: 1
dryRunSupported: true
dependencies: []
```

**Implementation** (`index.js`):

```javascript
module.exports = async function (input, sandbox, context) {
  // Your skill logic here
  return output;
};
```

**Schemas** (JSON Schema files):

- `input.schema.json`: Validates incoming data
- `output.schema.json`: Validates outgoing data

### 2. Registry

The registry discovers and manages available skills.

**Features:**

- Recursive directory scanning
- YAML/Markdown parsing
- Schema loading and validation
- Skill lookup by name or tags

**Usage:**

```typescript
import { InMemorySkillRegistry } from '@trinity-os/skillkit';

const registry = new InMemorySkillRegistry();
await registry.loadFromDirectory('./skills');

const skill = registry.get('my-skill');
const allSkills = registry.list();
const taggedSkills = registry.list().filter((s) => s.tags.includes('automation'));
```

### 3. Planner (Router)

The planner selects the best skill for a given task.

**Scoring Criteria:**

- Tag matching (40% weight)
- Input shape compatibility (30% weight)
- Keyword matching in name/description (30% weight)

**Usage:**

```typescript
import { planTask, InMemorySkillRegistry } from '@trinity-os/skillkit';

const registry = new InMemorySkillRegistry();
await registry.loadFromDirectory('./skills');

const plan = planTask(registry, {
  taskText: 'Generate a report from data',
  tags: ['reporting', 'data'],
  inputShape: { data: [], format: 'pdf' },
  minConfidence: 0.5,
});

console.log(plan.skill); // Selected skill name
console.log(plan.confidence); // 0.0 - 1.0
console.log(plan.why); // Selection reasoning
```

### 4. Sandbox

The sandbox provides isolated, secure execution.

**Security Features:**

| Feature              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| Path Whitelisting    | Only specified paths can be accessed                 |
| Command Filtering    | Only allowed commands can execute                    |
| Resource Limits      | CPU, memory, file descriptor caps                    |
| Injection Prevention | Protection against path traversal, command injection |
| Dry Run Mode         | Simulate without actual writes                       |

**Default Limits:**

```typescript
{
  maxCpuTime: 30000,          // 30 seconds
  maxMemory: 268435456,       // 256 MB
  maxFileDescriptors: 1024,
  maxChildProcesses: 10,
  maxStackSize: 8388608,      // 8 MB
  maxOutputSize: 10485760     // 10 MB
}
```

**Sandbox API:**

```typescript
// File operations
const content = sandbox.readFile('./data.txt');
sandbox.writeFile('./output.txt', content);
sandbox.deletePath('./temp.txt');

// Command execution
const result = await sandbox.executeCommand('git', ['status'], {
  cwd: '/path/to/repo',
  timeout: 5000,
});

console.log(result.exitCode);
console.log(result.stdout);
console.log(result.stderr);
```

### 5. Validator

The validator ensures data integrity using JSON Schema.

**Validation Points:**

- Input data before execution
- Output data after execution
- Skill metadata on load

**Features:**

- Zod-based metadata validation
- JSON Schema 7 support
- Detailed error reporting
- Custom validation rules

### 6. Runner

The runner orchestrates skill execution.

**Responsibilities:**

- Load skill modules dynamically
- Validate inputs/outputs
- Manage sandbox lifecycle
- Handle retries on failure
- Generate audit logs
- Support dry-run mode

**Execution Flow:**

```
1. Create sandbox with permissions
2. Validate input against schema
3. Load skill module
4. Execute skill function (with retries)
5. Validate output against schema
6. Generate audit log
7. Return result
```

### 7. Audit Logger

The audit logger tracks all operations.

**Logged Information:**

- Skill name and version
- Input/output data
- File operations (read/write/delete)
- Command executions
- Validation results
- Environment details
- Execution duration
- Success/failure status

**Storage Format:** JSONL (JSON Lines)

**Example Entry:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-05T10:30:00.000Z",
  "skill": "example-skill",
  "version": "1.0.0",
  "input": { "key": "value" },
  "output": { "result": "success" },
  "dryRun": false,
  "applied": true,
  "duration": 1234,
  "environment": {
    "node": "v18.0.0",
    "os": "win32",
    "arch": "x64",
    "cwd": "/path/to/project"
  },
  "fileOps": [],
  "commands": [],
  "validations": [
    {
      "type": "input",
      "valid": true,
      "message": "Input is valid"
    }
  ]
}
```

## Execution Models

### Programmatic API

```typescript
import { InMemorySkillRegistry, SkillRunner } from '@trinity-os/skillkit';

// 1. Load skills
const registry = new InMemorySkillRegistry();
await registry.loadFromDirectory('./skills');

// 2. Get skill
const skill = registry.get('my-skill');

// 3. Create runner
const runner = new SkillRunner({
  cwd: process.cwd(),
  dryRun: false,
  audit: true,
  maxRetries: 2,
  timeout: 30000,
});

// 4. Execute
const result = await runner.run(skill, {
  input: 'data',
});

// 5. Handle result
if (result.success) {
  console.log('Success:', result.output);
  console.log('Duration:', result.duration, 'ms');
  console.log('Audit ID:', result.auditId);
} else {
  console.error('Failed:', result.error);
}
```

### CLI

```bash
# List available skills
tsk list-skills ./skills

# Run with input file
tsk run ./my-skill --input data.json

# Run with stdin
echo '{"key": "value"}' | tsk run ./my-skill --stdin

# Dry run
tsk run ./my-skill --input data.json --dry-run

# View audit statistics
tsk stats ./logs/audit

# Generate new skill
tsk gen-skill new-skill ./skills
```

## Skill Lifecycle

```
1. Development
   ├── Create SKILL.yaml
   ├── Define input/output schemas
   ├── Implement index.js
   └── Test locally

2. Registration
   ├── Place in skills directory
   ├── Registry scans and validates
   └── Skill becomes available

3. Discovery
   ├── List all skills
   ├── Filter by tags
   └── Plan with router

4. Execution
   ├── Validate input
   ├── Create sandbox
   ├── Run skill code
   ├── Validate output
   └── Generate audit log

5. Analysis
   ├── Review audit logs
   ├── Analyze statistics
   └── Debug issues
```

## Design Principles

### 1. Security by Default

- All file and command access is denied by default
- Explicit allowlists required for permissions
- Multiple layers of validation and sanitization
- Resource limits prevent DoS attacks

### 2. Explicit Over Implicit

- Skills declare all dependencies and permissions
- No hidden global state or side effects
- Clear input/output contracts
- Deterministic execution

### 3. Auditability

- Every operation is logged
- Complete execution trace
- Environment capture for reproducibility
- Easy analysis and debugging

### 4. Composability

- Skills are independent units
- Can express dependencies on other skills
- Clear interfaces enable chaining
- No tight coupling

### 5. Developer Experience

- Simple file-based structure
- Standard JSON Schema
- Familiar JavaScript/TypeScript
- Helpful CLI tools

## Use Cases

### Automation Workflows

Chain multiple skills to automate complex processes:

- Data ingestion → transformation → analysis → reporting
- Code generation → validation → testing → deployment

### Code Generation

Generate code with safety guardrails:

- Template rendering with validated inputs
- File writes restricted to output directories
- Automatic formatting and linting

### Data Processing

Process data with controlled access:

- Read from allowed input directories
- Transform according to schemas
- Write to designated output locations

### System Administration

Automate admin tasks safely:

- Command execution with whitelist
- Configuration management
- Deployment automation

### CI/CD Integration

Integrate into build pipelines:

- Run skills as build steps
- Audit trail for compliance
- Dry-run for validation

## Comparison with Other Tools

| Feature        | SkillKit         | Shell Scripts   | Task Runners      | Serverless     |
| -------------- | ---------------- | --------------- | ----------------- | -------------- |
| Sandboxing     | ✅ Built-in      | ❌ None         | ❌ None           | ✅ Platform    |
| Type Safety    | ✅ JSON Schema   | ❌ None         | ⚠️ Limited        | ⚠️ Varies      |
| Audit Logs     | ✅ Comprehensive | ❌ Manual       | ⚠️ Basic          | ✅ Platform    |
| Permissions    | ✅ Granular      | ❌ Full access  | ❌ Full access    | ✅ IAM         |
| Portability    | ✅ Node.js       | ⚠️ OS-dependent | ✅ Cross-platform | ❌ Vendor lock |
| Learning Curve | ⚠️ Medium        | ✅ Low          | ✅ Low            | ⚠️ High        |

## Performance Considerations

### Overhead

- Sandbox creation: ~10-50ms
- Input validation: ~1-5ms
- Output validation: ~1-5ms
- Audit logging: ~5-10ms (async)

### Optimization Tips

1. **Reuse sandboxes** for multiple executions (when safe)
2. **Cache skill modules** to avoid repeated imports
3. **Use streaming** for large file operations
4. **Disable audit** in development for faster iteration
5. **Set appropriate timeouts** based on expected duration

## Extensibility

### Custom Registry

Implement `SkillRegistry` interface for custom storage:

```typescript
class DatabaseSkillRegistry implements SkillRegistry {
  async get(name: string): Promise<Skill | undefined> {
    // Load from database
  }
  // ... implement other methods
}
```

### Custom Audit Logger

Extend `AuditLogger` for custom destinations:

```typescript
class CloudAuditLogger extends AuditLogger {
  async log(entry: AuditLog): Promise<void> {
    // Send to cloud storage
    await sendToS3(entry);
  }
}
```

### Skill Hooks

Skills can use lifecycle hooks (future feature):

```javascript
module.exports = {
  beforeRun: async (input, context) => {
    // Prepare resources
  },
  run: async (input, sandbox, context) => {
    // Main logic
  },
  afterRun: async (output, context) => {
    // Cleanup
  },
};
```

## Next Steps

- [Getting Started](./getting-started.md) - Quick start guide
- [Creating Skills](./skills.md) - Learn to build skills
- [API Reference](./api/README.md) - Detailed API docs
- [Security](./security.md) - Security model deep dive

## Contributing

SkillKit is open source! See our [Contributing Guide](../CONTRIBUTING.md) to get involved.

## License

SkillKit is [MIT licensed](../LICENSE).
