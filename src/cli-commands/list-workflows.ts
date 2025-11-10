import { Command } from 'commander';

import { WorkflowRouter } from '../workflow/router';

/**
 * CLI command: tsk list-workflows
 * 
 * Show all available workflows
 */

export function createListWorkflowsCommand(): Command {
  const cmd = new Command('list-workflows');
  
  cmd
    .description('List all available workflows')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action(async (options) => {
      console.log('📋 Available workflows:\n');
      
      const router = new WorkflowRouter(options.dir);
      const workflows = router.listWorkflows();
      
      // Group by type
      const micro = workflows.filter(w => w.steps.length === 1);
      const macro = workflows.filter(w => w.steps.length > 1);
      
      console.log('Micro-workflows (single task):');
      console.log('─'.repeat(60));
      micro.forEach(w => {
        console.log(`  ${w.name.padEnd(20)} ${w.description}`);
        console.log(`  Keywords: ${w.keywords.join(', ')}`);
        console.log('');
      });
      
      console.log('\nMacro-workflows (multi-step):');
      console.log('─'.repeat(60));
      macro.forEach(w => {
        console.log(`  ${w.name.padEnd(20)} ${w.description}`);
        console.log(`  Steps: ${w.steps.map(s => s.intent).join(' → ')}`);
        console.log(`  Keywords: ${w.keywords.join(', ')}`);
        console.log('');
      });
      
      console.log('💡 Run with: tsk exec <workflow-name>');
    });
  
  return cmd;
}

