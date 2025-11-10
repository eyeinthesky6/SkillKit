import { Command } from 'commander';

import { WorkflowRouter } from '../workflow/router';

/**
 * CLI command: tsk suggest
 * 
 * Get workflow suggestions based on project state
 */

export function createSuggestCommand(): Command {
  const cmd = new Command('suggest');
  
  cmd
    .description('Get workflow suggestions for current project')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action(async (options) => {
      console.log('💡 Analyzing project...\n');
      
      const router = new WorkflowRouter(options.dir);
      const suggestions = await router.suggest();
      
      if (suggestions.length === 0) {
        console.log('No suggestions available.');
        console.log('Run "tsk discover" to see available commands.');
        return;
      }
      
      console.log('Recommended workflows:\n');
      suggestions.forEach((s, i) => {
        console.log(`${i + 1}. ${s}`);
      });
      
      console.log('\n💡 Run with: tsk exec <workflow-name>');
    });
  
  return cmd;
}

