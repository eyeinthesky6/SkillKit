# API Reference

Complete API documentation for SkillKit.

## Core Exports

```typescript
import {
  // Registry
  InMemorySkillRegistry,
  createSkillRegistry,

  // Runner
  SkillRunner,
  runSkill,

  // Planner
  planTask,
  findSkillsByTags,
  findSkillsByPattern,

  // Sandbox
  Sandbox,
  createSandbox,

  // Validator
  createValidator,

  // Audit
  AuditLogger,
  createAuditLog,

  // Types
  Skill,
  SkillRegistry,
  Plan,
  RunOptions,
  RunResult,
  AuditLog,
} from '@trinity-os/skillkit';
```

## Registry

### `InMemorySkillRegistry`

Manages a collection of skills in memory.

#### Constructor

```typescript
const registry = new InMemorySkillRegistry();
```

#### Methods

##### `get(name: string): Skill | undefined`

Get a skill by name.

```typescript
const skill = registry.get('my-skill');
if (skill) {
  console.log(skill.description);
}
```

##### `list(): Skill[]`

Get all registered skills.

```typescript
const allSkills = registry.list();
console.log(`Found ${allSkills.length} skills`);
```

##### `add(skill: Skill): void`

Register a skill.

```typescript
registry.add({
  name: 'custom-skill',
  version: '1.0.0',
  description: 'A custom skill',
  tags: ['custom'],
  inputs: { type: 'object', properties: {} },
  outputs: { type: 'object', properties: {} },
  allowedPaths: { read: [], write: [] },
  allowedCommands: [],
  steps: ['Do something'],
  retries: 1,
  dryRunSupported: true,
  dependencies: [],
});
```

##### `remove(name: string): void`

Unregister a skill.

```typescript
registry.remove('my-skill');
```

##### `has(name: string): boolean`

Check if a skill exists.

```typescript
if (registry.has('my-skill')) {
  console.log('Skill found');
}
```

##### `async loadFromDirectory(dir: string): Promise<void>`

Load skills from a directory (recursive).

```typescript
await registry.loadFromDirectory('./skills');
```

Discovers files matching:

- `SKILL.md`
- `SKILL.yaml`
- `SKILL.yml`

### `createSkillRegistry(): SkillRegistry`

Factory function to create a new registry.

```typescript
const registry = createSkillRegistry();
```

## Runner

### `SkillRunner`

Executes skills in a sandboxed environment.

#### Constructor

```typescript
const runner = new SkillRunner(options?: RunnerOptions);
```

**Options:**

```typescript
interface RunnerOptions {
  cwd?: string; // Working directory
  env?: NodeJS.ProcessEnv; // Environment variables
  dryRun?: boolean; // Simulate operations (default: false)
  audit?: boolean; // Generate audit logs (default: true)
  autoApply?: boolean; // Auto-apply changes (default: false)
  auditLogger?: AuditLogger; // Custom audit logger
  maxRetries?: number; // Retry attempts (default: 1)
  timeout?: number; // Timeout in ms (default: 30000)
}
```

**Example:**

```typescript
const runner = new SkillRunner({
  cwd: process.cwd(),
  dryRun: false,
  audit: true,
  maxRetries: 2,
  timeout: 60000,
});
```

#### Methods

##### `async run<T>(skill: Skill, input: unknown, context?: object): Promise<ExecutionResult<T>>`

Execute a skill.

```typescript
const result = await runner.run(skill, {
  message: 'Hello World',
});

if (result.success) {
  console.log('Output:', result.output);
  console.log('Duration:', result.duration, 'ms');
  console.log('Audit ID:', result.auditId);
} else {
  console.error('Error:', result.error);
}
```

**ExecutionResult:**

```typescript
interface ExecutionResult<T = unknown> {
  success: boolean; // Whether execution succeeded
  output?: T; // Output data (if successful)
  error?: string; // Error message (if failed)
  auditId?: string; // Audit log ID
  duration: number; // Execution time in ms
  dryRun: boolean; // Was this a dry run
  fileOps: FileOperation[]; // File operations performed
  commands: CommandExecution[]; // Commands executed
  validations: Validation[]; // Validation results
}
```

### `async runSkill<T>(skill: Skill, options: RunOptions): Promise<ExecutionResult<T>>`

Convenience function to run a skill.

```typescript
import { runSkill } from '@trinity-os/skillkit';

const result = await runSkill(skill, {
  input: { message: 'test' },
  dryRun: false,
  audit: true,
});
```

**RunOptions:**

```typescript
interface RunOptions {
  input: unknown; // Input data
  dryRun?: boolean; // Dry run mode
  audit?: boolean; // Generate audit log
  autoApply?: boolean; // Auto-apply changes
  context?: Record<string, unknown>; // Additional context
  skillPath?: string; // Path to skill directory
}
```

## Planner

### `planTask(registry: SkillRegistry, options: PlanOptions): Plan`

Select the best skill for a task.

```typescript
import { planTask, InMemorySkillRegistry } from '@trinity-os/skillkit';

const registry = new InMemorySkillRegistry();
await registry.loadFromDirectory('./skills');

const plan = planTask(registry, {
  taskText: 'Process JSON files',
  tags: ['json', 'processing'],
  inputShape: { files: [], options: {} },
  minConfidence: 0.5,
});

console.log('Selected skill:', plan.skill);
console.log('Confidence:', plan.confidence);
console.log('Reason:', plan.why);
```

**PlanOptions:**

```typescript
interface PlanOptions {
  taskText?: string; // Task description
  tags?: string[]; // Required tags
  inputShape?: Record<string, unknown>; // Expected input structure
  minConfidence?: number; // Minimum confidence (0-1, default: 0.5)
}
```

**Plan:**

```typescript
interface Plan {
  skill: string; // Selected skill name
  why: string; // Selection reasoning
  expectedOutputs: JSONSchema7; // Output schema
  confidence: number; // Confidence score (0-1)
  warnings?: string[]; // Any warnings
}
```

### `findSkillsByTags(registry: SkillRegistry, tags: string[], requireAll?: boolean): Skill[]`

Find skills by tags.

```typescript
// Skills with ANY of these tags
const skills = findSkillsByTags(registry, ['json', 'xml'], false);

// Skills with ALL of these tags
const skills = findSkillsByTags(registry, ['json', 'validation'], true);
```

### `findSkillsByPattern(registry: SkillRegistry, pattern: string): Skill[]`

Find skills using glob pattern (matches name or tags).

```typescript
// Find all json-related skills
const skills = findSkillsByPattern(registry, '*json*');

// Find all skills starting with 'api-'
const skills = findSkillsByPattern(registry, 'api-*');
```

## Sandbox

### `Sandbox`

Secure execution environment for skills.

#### Constructor

```typescript
const sandbox = new Sandbox(skill: Skill, options?: SandboxOptions);
```

Or use factory:

```typescript
const sandbox = createSandbox(skill, options);
```

**SandboxOptions:**

```typescript
interface SandboxOptions {
  cwd?: string; // Working directory
  env?: NodeJS.ProcessEnv; // Environment variables
  dryRun?: boolean; // Dry run mode
  limits?: ResourceLimits; // Resource limits
  timeout?: number; // Timeout in ms
  onFileOp?: (op, path, content?) => void; // File operation callback
  onCommand?: (cmd, args, cwd) => void; // Command callback
  onResourceLimit?: (limit, value) => void; // Limit exceeded callback
}
```

**ResourceLimits:**

```typescript
interface ResourceLimits {
  maxCpuTime?: number; // CPU time (ms, default: 30000)
  maxMemory?: number; // Memory (bytes, default: 256MB)
  maxFileDescriptors?: number; // File descriptors (default: 1024)
  maxChildProcesses?: number; // Child processes (default: 10)
  maxStackSize?: number; // Stack size (bytes, default: 8MB)
  maxOutputSize?: number; // Output size (bytes, default: 10MB)
}
```

#### Methods

##### `readFile(filePath: string, encoding?: BufferEncoding): string | Buffer`

Read a file from the sandbox.

```typescript
// Read as string
const content = sandbox.readFile('./data.txt');

// Read as buffer
const buffer = sandbox.readFile('./image.png', null);

// Custom encoding
const content = sandbox.readFile('./file.txt', 'utf16le');
```

**Throws:** Error if path is not in `allowedPaths.read`

##### `writeFile(filePath: string, content: string, encoding?: BufferEncoding): void`

Write a file in the sandbox.

```typescript
sandbox.writeFile('./output.json', JSON.stringify(data, null, 2));
```

**Throws:** Error if path is not in `allowedPaths.write`

##### `deletePath(filePath: string): void`

Delete a file or directory.

```typescript
sandbox.deletePath('./temp.txt');
sandbox.deletePath('./temp-dir'); // Recursive
```

**Throws:** Error if path is not in `allowedPaths.write`

##### `async executeCommand(command: string, args?: string[], options?: CommandOptions): Promise<CommandResult>`

Execute a command in the sandbox.

```typescript
const result = await sandbox.executeCommand('git', ['status']);

console.log('Exit code:', result.exitCode);
console.log('Output:', result.stdout);
console.log('Errors:', result.stderr);
console.log('Duration:', result.duration, 'ms');
```

**CommandOptions:**

```typescript
interface CommandOptions {
  cwd?: string; // Working directory
  env?: NodeJS.ProcessEnv; // Environment variables
  input?: string; // Stdin input
  timeout?: number; // Command timeout
}
```

**CommandResult:**

```typescript
interface CommandResult {
  exitCode: number | null; // Exit code (null if killed)
  stdout: string; // Standard output
  stderr: string; // Standard error
  duration: number; // Duration in ms
}
```

**Throws:** Error if command is not in `allowedCommands`

##### `getFileOperations(): FileOperation[]`

Get list of file operations performed.

```typescript
const ops = sandbox.getFileOperations();
ops.forEach((op) => {
  console.log(`${op.type}: ${op.path}`);
});
```

##### `getCommandHistory(): CommandExecution[]`

Get list of commands executed.

```typescript
const commands = sandbox.getCommandHistory();
commands.forEach((cmd) => {
  console.log(`${cmd.command} ${cmd.args.join(' ')}`);
});
```

## Validator

### `createValidator(skill: Skill): Validator`

Create a validator for a skill.

```typescript
import { createValidator } from '@trinity-os/skillkit';

const validator = createValidator(skill);

// Validate input
const inputResult = validator.validateInput({ message: 'test' });
if (!inputResult.success) {
  console.error('Invalid input:', inputResult.error);
}

// Validate output
const outputResult = validator.validateOutput({ result: 'success' });
if (!outputResult.success) {
  console.error('Invalid output:', outputResult.error);
}
```

**Validator Methods:**

```typescript
interface Validator {
  validateInput(data: unknown): ValidationResult;
  validateOutput(data: unknown): ValidationResult;
}

interface ValidationResult {
  success: boolean;
  error?: string;
  details?: unknown;
}
```

## Audit

### `AuditLogger`

Logs skill executions to disk.

#### Constructor

```typescript
const logger = new AuditLogger(options?: AuditLoggerOptions);
```

**Options:**

```typescript
interface AuditLoggerOptions {
  logDir?: string; // Log directory (default: './logs/audit')
  format?: 'jsonl' | 'json'; // Log format (default: 'jsonl')
}
```

#### Methods

##### `async log(entry: AuditLog): Promise<void>`

Write an audit log entry.

```typescript
await logger.log({
  id: 'uuid',
  timestamp: new Date().toISOString(),
  skill: 'my-skill',
  version: '1.0.0',
  input: {},
  output: {},
  dryRun: false,
  applied: true,
  duration: 1000,
  environment: {
    /* ... */
  },
  fileOps: [],
  commands: [],
  validations: [],
});
```

### `createAuditLog(skill: Skill, data: AuditData): AuditLog`

Create an audit log entry.

```typescript
const auditLog = createAuditLog(skill, {
  input: { message: 'test' },
  output: { result: 'success' },
  dryRun: false,
  applied: true,
  duration: 1234,
  fileOps: [],
  commands: [],
  validations: [],
});
```

**AuditLog:**

```typescript
interface AuditLog {
  id: string; // Unique ID
  timestamp: string; // ISO timestamp
  skill: string; // Skill name
  version: string; // Skill version
  input: unknown; // Input data
  output?: unknown; // Output data
  error?: string; // Error message
  dryRun: boolean; // Dry run flag
  applied: boolean; // Changes applied
  duration: number; // Duration in ms
  environment: {
    node: string; // Node version
    os: string; // OS platform
    arch: string; // Architecture
    cwd: string; // Working directory
  };
  fileOps: FileOperation[]; // File operations
  commands: CommandExecution[]; // Command executions
  validations: Validation[]; // Validation results
}
```

## Types

### `Skill`

```typescript
interface Skill {
  name: string; // Kebab-case name
  version: string; // Semantic version
  description: string; // Description (10-200 chars)
  tags: string[]; // Tags for filtering
  inputs: JSONSchema7; // Input schema
  outputs: JSONSchema7; // Output schema
  allowedPaths: {
    read: string[]; // Allowed read paths
    write: string[]; // Allowed write paths
  };
  allowedCommands: string[]; // Allowed commands
  steps: string[]; // Step descriptions
  retries: number; // Retry count (0-3)
  dryRunSupported: boolean; // Supports dry run
  dependencies: string[]; // Skill dependencies
  sourcePath?: string; // Source directory
}
```

### `SkillRegistry`

```typescript
interface SkillRegistry {
  get(name: string): Skill | undefined;
  list(): Skill[];
  add(skill: Skill): void;
  remove(name: string): void;
  has(name: string): boolean;
}
```

### `RunResult<T>`

```typescript
interface RunResult<T = unknown> {
  success: boolean;
  output?: T;
  error?: string;
  auditPath?: string;
  duration: number;
  dryRun: boolean;
}
```

## Examples

### Complete Usage Example

```typescript
import { InMemorySkillRegistry, SkillRunner, planTask } from '@trinity-os/skillkit';

async function main() {
  // 1. Load skills
  const registry = new InMemorySkillRegistry();
  await registry.loadFromDirectory('./skills');

  // 2. Find the right skill
  const plan = planTask(registry, {
    taskText: 'Process JSON data',
    tags: ['json'],
    minConfidence: 0.5,
  });

  console.log(`Using skill: ${plan.skill} (confidence: ${plan.confidence})`);

  // 3. Get the skill
  const skill = registry.get(plan.skill);
  if (!skill) throw new Error('Skill not found');

  // 4. Create runner
  const runner = new SkillRunner({
    dryRun: false,
    audit: true,
    maxRetries: 2,
  });

  // 5. Execute
  const result = await runner.run(skill, {
    data: { key: 'value' },
  });

  // 6. Handle result
  if (result.success) {
    console.log('Success!', result.output);
    console.log(`Took ${result.duration}ms`);
    console.log(`File ops: ${result.fileOps.length}`);
    console.log(`Commands: ${result.commands.length}`);
  } else {
    console.error('Failed:', result.error);
  }
}

main().catch(console.error);
```

## CLI Reference

See [Getting Started](../getting-started.md#cli-commands) for CLI documentation.

## Next Steps

- [Getting Started](../getting-started.md) - Quick start guide
- [Creating Skills](../skills.md) - Build your own skills
- [Security](../security.md) - Security best practices
