/**
 * Workflow Router - Intelligently routes user intent to workflows
 * 
 * Takes natural language or task descriptions and routes to:
 * - Micro-workflows (single checks: lint, test, build)
 * - Macro-workflows (multi-step: diagnose, quality-gate, deploy-prep)
 * - Custom workflows (user-defined chains)
 */

import { CommandMapper } from '../adapters/command-mapper';
import { WorkflowExecutor, WorkflowStep } from './executor';

export interface WorkflowDefinition {
  name: string;
  description: string;
  keywords: string[];
  steps: WorkflowStep[];
  optional?: boolean; // Can be skipped if command not available
}

export class WorkflowRouter {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.registerBuiltInWorkflows();
  }

  /**
   * Register built-in micro-workflows
   */
  private registerBuiltInWorkflows() {
    // Micro-workflows (single task)
    this.register({
      name: 'lint',
      description: 'Run linter to check code quality',
      keywords: ['lint', 'linter', 'eslint', 'flake8', 'checkstyle'],
      steps: [{ name: 'Lint', intent: 'lint' }]
    });

    this.register({
      name: 'typecheck',
      description: 'Run type checker',
      keywords: ['type', 'typecheck', 'tsc', 'mypy'],
      steps: [{ name: 'Type Check', intent: 'typecheck' }],
      optional: true
    });

    this.register({
      name: 'test',
      description: 'Run test suite',
      keywords: ['test', 'tests', 'jest', 'pytest', 'junit'],
      steps: [{ name: 'Test', intent: 'test' }]
    });

    this.register({
      name: 'build',
      description: 'Build project',
      keywords: ['build', 'compile', 'bundle'],
      steps: [{ name: 'Build', intent: 'build' }]
    });

    this.register({
      name: 'format',
      description: 'Format code',
      keywords: ['format', 'prettier', 'black', 'gofmt'],
      steps: [{ name: 'Format', intent: 'format' }],
      optional: true
    });

    // Macro-workflows (multi-step)
    this.register({
      name: 'diagnose',
      description: 'Run full diagnostics (lint, typecheck, test, build)',
      keywords: ['diagnose', 'diagnostics', 'check', 'status', 'health'],
      steps: [
        { name: 'Lint', intent: 'lint' },
        { name: 'Type Check', intent: 'typecheck' },
        { name: 'Test', intent: 'test' },
        { name: 'Build', intent: 'build' }
      ]
    });

    this.register({
      name: 'quality-gate',
      description: 'Pre-commit quality checks (format, lint, test)',
      keywords: ['quality', 'pre-commit', 'check-all', 'validate'],
      steps: [
        { name: 'Format', intent: 'format' },
        { name: 'Lint', intent: 'lint' },
        { name: 'Type Check', intent: 'typecheck' },
        { name: 'Test', intent: 'test' }
      ]
    });

    this.register({
      name: 'deploy-prep',
      description: 'Pre-deployment checks (all checks + build)',
      keywords: ['deploy', 'deployment', 'release', 'ship', 'production'],
      steps: [
        { name: 'Format', intent: 'format' },
        { name: 'Lint', intent: 'lint' },
        { name: 'Type Check', intent: 'typecheck' },
        { name: 'Test', intent: 'test' },
        { name: 'Build', intent: 'build' }
      ]
    });

    this.register({
      name: 'quick-check',
      description: 'Quick validation (lint + typecheck only)',
      keywords: ['quick', 'fast', 'syntax'],
      steps: [
        { name: 'Lint', intent: 'lint' },
        { name: 'Type Check', intent: 'typecheck' }
      ]
    });
  }

  /**
   * Register a workflow
   */
  register(workflow: WorkflowDefinition) {
    this.workflows.set(workflow.name, workflow);
  }

  /**
   * Route user intent to workflow
   */
  async route(userIntent: string): Promise<WorkflowDefinition | null> {
    const intentLower = userIntent.toLowerCase();

    // Exact match
    if (this.workflows.has(intentLower)) {
      return this.workflows.get(intentLower)!;
    }

    // Keyword match
    for (const workflow of this.workflows.values()) {
      if (workflow.keywords.some(kw => intentLower.includes(kw))) {
        return workflow;
      }
    }

    // Fuzzy match on description
    for (const workflow of this.workflows.values()) {
      if (workflow.description.toLowerCase().includes(intentLower)) {
        return workflow;
      }
    }

    return null;
  }

  /**
   * Execute a workflow by name or intent
   */
  async execute(nameOrIntent: string): Promise<unknown> {
    const workflow = await this.route(nameOrIntent);
    
    if (!workflow) {
      throw new Error(`No workflow found for: ${nameOrIntent}`);
    }

    console.log(`\n🚀 Executing workflow: ${workflow.name}`);
    console.log(`   ${workflow.description}\n`);

    const executor = new WorkflowExecutor(this.projectRoot);
    
    // Filter out steps where command doesn't exist (optional workflows)
    const mapper = new CommandMapper(this.projectRoot);
    await mapper.discover();
    
    const availableSteps = [];
    for (const step of workflow.steps) {
      const command = await mapper.getCommand(step.intent);
      if (command) {
        availableSteps.push(step);
      } else if (!workflow.optional) {
        console.log(`⚠️  Skipping ${step.name} (command not found)`);
      }
    }

    return executor.execute(availableSteps);
  }

  /**
   * List all available workflows
   */
  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow suggestions based on project state
   */
  async suggest(): Promise<string[]> {
    const mapper = new CommandMapper(this.projectRoot);
    const mappings = await mapper.discover();
    
    const suggestions = [];
    
    // If has tests, suggest running them
    if (mappings.some(m => m.intent === 'test')) {
      suggestions.push('test - Run your test suite');
    }
    
    // If has lint, suggest quality check
    if (mappings.some(m => m.intent === 'lint')) {
      suggestions.push('quality-gate - Format, lint, test');
    }
    
    // Always suggest diagnose if has multiple checks
    if (mappings.length > 2) {
      suggestions.push('diagnose - Full health check');
    }
    
    // If has build, suggest deploy-prep
    if (mappings.some(m => m.intent === 'build')) {
      suggestions.push('deploy-prep - Ready for deployment');
    }
    
    return suggestions;
  }
}

