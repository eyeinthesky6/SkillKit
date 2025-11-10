import { Command } from 'commander';

import { CommandMapper } from '../adapters/command-mapper';

/**
 * CLI command: tsk exec <intent>
 * 
 * Execute a command by intent (auto-discovers the right command)
 */

export function createExecCommand(): Command {
  const cmd = new Command('exec');
  
  cmd
    .description('Execute command by intent (e.g., lint, test, build)')
    .argument('<intent>', 'Command intent (lint, test, build, etc.)')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action(async (intent, options) => {
      console.log(`🔄 Executing: ${intent}\n`);
      
      const mapper = new CommandMapper(options.dir);
      const command = await mapper.getCommand(intent);
      
      if (!command) {
        console.log(`❌ No command found for intent: ${intent}`);
        console.log('\n💡 Run "tsk discover" to see available commands');
        process.exit(1);
      }
      
      console.log(`Running: ${command}\n`);
      
      const result = await mapper.execute(intent);
      
      if (result.stdout) console.log(result.stdout);
      if (result.stderr) console.error(result.stderr);
      
      if (result.exitCode !== 0) {
        console.log(`\n❌ Failed with exit code ${result.exitCode}`);
        process.exit(result.exitCode);
      }
      
      console.log('\n✅ Success');
    });
  
  return cmd;
}

