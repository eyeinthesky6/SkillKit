import { Command } from 'commander';
import { buildAgentsMDWithOutput } from '../agents-builder.js';

export function createBuildAgentsCommand(): Command {
  const command = new Command('build-agents');
  
  command
    .description('Build unified AGENTS.md (workflows + skills catalog)')
    .option('-d, --dir <directory>', 'Project directory', process.cwd())
    .action(async (options: { dir: string }) => {
      try {
        await buildAgentsMDWithOutput(options.dir);
      } catch (error) {
        const err = error as Error;
        console.error('Failed to build AGENTS.md:', err.message);
        process.exit(1);
      }
    });
  
  return command;
}

