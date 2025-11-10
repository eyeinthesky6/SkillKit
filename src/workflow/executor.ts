import { CommandMapper } from '../adapters/command-mapper';

/**
 * Workflow Executor - Executes workflows with real-time command discovery
 * 
 * This is the REAL workflow engine. It:
 * 1. Discovers project commands on-the-fly
 * 2. Maps generic workflow steps to actual commands
 * 3. Executes in sequence
 * 4. Passes context between steps
 */

export interface WorkflowStep {
  name: string;
  intent: string;
  onSuccess?: string;
  onFailure?: string;
}

export interface WorkflowContext {
  projectRoot: string;
  data: Record<string, unknown>;
  results: Array<{
    step: string;
    output: string;
    success: boolean;
  }>;
}

export class WorkflowExecutor {
  private mapper: CommandMapper;
  private context: WorkflowContext;

  constructor(projectRoot: string) {
    this.mapper = new CommandMapper(projectRoot);
    this.context = {
      projectRoot,
      data: {},
      results: []
    };
  }

  /**
   * Execute a workflow
   */
  async execute(steps: WorkflowStep[]): Promise<WorkflowContext> {
    // Discover commands upfront
    await this.mapper.discover();

    for (const step of steps) {
      console.log(`\n🔄 Executing: ${step.name}`);
      
      try {
        const result = await this.mapper.execute(step.intent);
        
        this.context.results.push({
          step: step.name,
          output: result.stdout || result.stderr,
          success: result.exitCode === 0
        });

        if (result.exitCode === 0) {
          console.log(`✅ ${step.name} succeeded`);
          if (step.onSuccess) {
            this.context.data[step.onSuccess] = result.stdout;
          }
        } else {
          console.log(`❌ ${step.name} failed`);
          if (step.onFailure) {
            this.context.data[step.onFailure] = result.stderr;
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        console.log(`❌ ${step.name} error: ${err.message || 'Unknown error'}`);
        this.context.results.push({
          step: step.name,
          output: err.message || 'Unknown error',
          success: false
        });
      }
    }

    return this.context;
  }

  /**
   * Get available commands for this project
   */
  async getAvailableCommands(): Promise<string[]> {
    const mappings = await this.mapper.discover();
    return mappings.map(m => `${m.intent} → ${m.command} (${m.source})`);
  }
}

/**
 * Quick helpers for common workflows
 */

export async function runDiagnostics(projectRoot: string) {
  const executor = new WorkflowExecutor(projectRoot);
  
  return executor.execute([
    { name: 'Lint Check', intent: 'lint' },
    { name: 'Type Check', intent: 'typecheck' },
    { name: 'Run Tests', intent: 'test' },
    { name: 'Build', intent: 'build' }
  ]);
}

export async function runQualityGate(projectRoot: string) {
  const executor = new WorkflowExecutor(projectRoot);
  
  return executor.execute([
    { name: 'Format Code', intent: 'format' },
    { name: 'Lint', intent: 'lint' },
    { name: 'Type Check', intent: 'typecheck' },
    { name: 'Tests', intent: 'test' },
    { name: 'Build', intent: 'build' }
  ]);
}

