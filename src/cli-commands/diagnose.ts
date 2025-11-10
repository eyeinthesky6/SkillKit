import { Command } from 'commander';

import { runDiagnostics } from '../workflow/executor';

/**
 * CLI command: tsk diagnose
 * 
 * Runs full diagnostics on current project:
 * - Discovers project commands
 * - Runs lint, typecheck, test, build
 * - Shows results
 */

export function createDiagnoseCommand(): Command {
  const cmd = new Command('diagnose');
  
  cmd
    .description('Run full diagnostics on current project')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .action(async (options) => {
      console.log('🔍 Running diagnostics...\n');
      
      const result = await runDiagnostics(options.dir);
      
      console.log('\n📊 Results:');
      console.log('─'.repeat(50));
      
      let passed = 0;
      let failed = 0;
      
      result.results.forEach(r => {
        const icon = r.success ? '✅' : '❌';
        console.log(`${icon} ${r.step}`);
        if (!r.success && r.output) {
          console.log(`   ${r.output.split('\n')[0]}`);
        }
        
        r.success ? passed++ : failed++;
      });
      
      console.log('─'.repeat(50));
      console.log(`Passed: ${passed} | Failed: ${failed}`);
      
      if (failed > 0) {
        console.log('\n💡 Run specific checks: tsk run lint, tsk run typecheck, etc.');
        process.exit(1);
      }
    });
  
  return cmd;
}

