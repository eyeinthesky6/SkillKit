import { Command } from 'commander';

import { CommandMapper } from '../adapters/command-mapper';

/**
 * CLI command: tsk discover
 * 
 * Shows all available commands in the project
 */

export function createDiscoverCommand(): Command {
  const cmd = new Command('discover');
  
  cmd
    .description('Discover all available commands in project')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action(async (options) => {
      console.log('🔍 Discovering project commands...\n');
      
      const mapper = new CommandMapper(options.dir);
      const mappings = await mapper.discover();
      
      if (mappings.length === 0) {
        console.log('No commands found. Is this a valid project?');
        return;
      }
      
      // Group by source
      const bySource: Record<string, typeof mappings> = {};
      mappings.forEach(m => {
        if (!bySource[m.source]) bySource[m.source] = [];
        bySource[m.source].push(m);
      });
      
      console.log('📋 Available commands:\n');
      
      Object.entries(bySource).forEach(([source, cmds]) => {
        console.log(`\n${source}:`);
        console.log('─'.repeat(60));
        cmds.forEach(cmd => {
          console.log(`  ${cmd.intent.padEnd(15)} → ${cmd.command}`);
        });
      });
      
      console.log('\n💡 Use these intents in workflows: lint, test, build, etc.');
    });
  
  return cmd;
}

