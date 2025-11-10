/**
 * CLI Command: sync
 * Generate/update AGENTS.md (unified: workflows + skills)
 */

import { Command } from 'commander';
import { buildAgentsMDWithOutput } from '../agents-builder.js';

export function createSyncCommand(): Command {
  return new Command('sync')
    .description('Generate/update unified AGENTS.md (workflows + skills)')
    .option('-d, --dir <directory>', 'Project directory', process.cwd())
    .action(async (options) => {
      try {
        await buildAgentsMDWithOutput(options.dir);
      } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
      }
    });
}

