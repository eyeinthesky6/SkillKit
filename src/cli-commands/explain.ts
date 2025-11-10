import { Command } from 'commander';

import { WorkflowAdapter } from '../intelligence/workflow-adapter';

/**
 * CLI command: tsk explain <workflow>
 * 
 * Explains what a workflow will do and WHY
 * Shows architecture-based adaptations
 */

export function createExplainCommand(): Command {
  const cmd = new Command('explain');
  
  cmd
    .description('Explain what a workflow will do and why')
    .argument('<workflow>', 'Workflow name (quality-gate, deploy-prep, etc.)')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action(async (workflow, options) => {
      console.log(`🔍 Analyzing project architecture...\n`);
      
      const adapter = new WorkflowAdapter(options.dir);
      const architecture = await adapter.initialize();
      
      // Show detected architecture
      console.log('📊 Project Architecture:\n');
      console.log(`Language: ${architecture.language}`);
      if (architecture.framework) {
        console.log(`Framework: ${architecture.framework}`);
      }
      
      if (Object.keys(architecture.patterns).length > 0) {
        console.log('\nPatterns Detected:');
        if (architecture.patterns.contractsFirst) {
          console.log(`  ✓ Contracts-First (${architecture.tools.validation})`);
        }
        if (architecture.patterns.typeFirst) {
          console.log(`  ✓ Type-First (strict TypeScript)`);
        }
        if (architecture.patterns.testDriven) {
          console.log(`  ✓ Test-Driven Development`);
        }
        if (architecture.patterns.domainDriven) {
          console.log(`  ✓ Domain-Driven Design`);
        }
      }
      
      if (architecture.tools.linting) {
        console.log(`\nLinting: ${architecture.tools.linting.tool} (${architecture.tools.linting.strictness} mode)`);
      }
      
      console.log('\n' + '─'.repeat(60));
      console.log(`\n🎯 Workflow: ${workflow}\n`);
      
      try {
        const adapted = await adapter.adapt(workflow);
        
        console.log(`Description: ${adapted.description}\n`);
        console.log('Steps that will be executed:\n');
        
        adapted.steps.forEach((step, i) => {
          console.log(`  ${i + 1}. ${step.name} (${step.intent})`);
        });
        
        console.log('\n💡 Reasoning:\n');
        console.log(adapted.reasoning);
        
      } catch (error: unknown) {
        const err = error as { message?: string };
        console.log(`❌ ${err.message || 'Unknown error'}`);
        console.log('\n💡 Available workflows: quality-gate, pre-commit, contracts-check, deploy-prep');
      }
    });
  
  return cmd;
}

