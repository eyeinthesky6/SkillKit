import { Command } from 'commander';
import { MultiLanguageAnalyzer } from '../intelligence/multi-language-analyzer';
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
      
      const analyzer = new MultiLanguageAnalyzer(options.dir);
      const project = await analyzer.analyze();
      const adapter = new WorkflowAdapter(project);
      
      // Show detected architecture
      console.log('📊 Project Architecture:\n');
      console.log(`Languages: ${project.languages.map(l => l.language).join(', ')}`);
      if (project.isMonorepo) {
        console.log(`Structure: Monorepo`);
      }
      
      for (const lang of project.languages) {
        console.log(`\n${lang.language.toUpperCase()} (${lang.rootPath}):`);
        if (lang.framework) {
          console.log(`  Framework: ${lang.framework}`);
        }
        if (lang.packageManager) {
          console.log(`  Package Manager: ${lang.packageManager}`);
        }
        if (lang.testFramework) {
          console.log(`  Test Framework: ${lang.testFramework}`);
        }
        if (lang.linter) {
          console.log(`  Linter: ${lang.linter}`);
        }
      }
      
      console.log('\n' + '─'.repeat(60));
      console.log(`\n🎯 Workflow: ${workflow}\n`);
      
      const mappings = adapter.generateCommandMappings();
      const rootMapping = mappings.get(options.dir) || mappings.values().next().value;
      
      if (rootMapping) {
        console.log('Commands that will be executed:\n');
        console.log(`  Install: ${rootMapping.install}`);
        console.log(`  Lint: ${rootMapping.lint}`);
        console.log(`  Test: ${rootMapping.test}`);
        console.log(`  Build: ${rootMapping.build}`);
      }
      
      console.log('\n💡 This workflow adapts to your project\'s detected languages and tools.');
    });
  
  return cmd;
}

