import { Command } from 'commander';

/**
 * CLI command: tsk completion
 * 
 * Generate shell completion scripts for bash/zsh
 */

export function createCompletionCommand(): Command {
  const cmd = new Command('completion');
  
  cmd
    .description('Generate shell completion script')
    .option('-s, --shell <shell>', 'Shell type (bash, zsh, fish)', 'bash')
    .action(async (options) => {
      const shell = options.shell.toLowerCase();
      
      let script = '';
      
      if (shell === 'bash') {
        script = generateBashCompletion();
      } else if (shell === 'zsh') {
        script = generateZshCompletion();
      } else if (shell === 'fish') {
        script = generateFishCompletion();
      } else {
        console.error(`Unsupported shell: ${shell}`);
        console.error('Supported shells: bash, zsh, fish');
        process.exit(1);
      }
      
      console.log(script);
      console.log('');
      console.log('# To enable completion, add to your shell config:');
      
      if (shell === 'bash') {
        console.log('# Add to ~/.bashrc:');
        console.log('eval "$(tsk completion --shell bash)"');
      } else if (shell === 'zsh') {
        console.log('# Add to ~/.zshrc:');
        console.log('eval "$(tsk completion --shell zsh)"');
      } else if (shell === 'fish') {
        console.log('# Add to ~/.config/fish/config.fish:');
        console.log('tsk completion --shell fish | source');
      }
    });
  
  return cmd;
}

function generateBashCompletion(): string {
  return `
# tsk completion for bash

_tsk_completions() {
  local cur prev commands workflows
  
  commands="init discover exec diagnose suggest list-workflows explain workflow completion install list sync manage run stats gen-skill"
  workflows="lint typecheck test build format diagnose quality-gate deploy-prep quick-check pre-commit contracts-check"
  
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  
  case "\${prev}" in
    tsk)
      COMPREPLY=( $(compgen -W "\${commands}" -- \${cur}) )
      return 0
      ;;
    exec|explain)
      COMPREPLY=( $(compgen -W "\${workflows}" -- \${cur}) )
      return 0
      ;;
    --shell|-s)
      COMPREPLY=( $(compgen -W "bash zsh fish" -- \${cur}) )
      return 0
      ;;
    --dir|-d)
      COMPREPLY=( $(compgen -d -- \${cur}) )
      return 0
      ;;
  esac
  
  if [[ \${cur} == -* ]]; then
    COMPREPLY=( $(compgen -W "--help --version --dir --cursor --shell" -- \${cur}) )
  fi
}

complete -F _tsk_completions tsk
`.trim();
}

function generateZshCompletion(): string {
  return `
# tsk completion for zsh

#compdef tsk

_tsk() {
  local -a commands workflows
  
  commands=(
    'init:Initialize SkillKit in project'
    'discover:Discover project commands'
    'exec:Execute workflow'
    'diagnose:Run full diagnostics'
    'suggest:Get workflow suggestions'
    'list-workflows:List all workflows'
    'explain:Explain workflow adaptation'
    'workflow:Generate Cursor workflow commands'
    'completion:Generate shell completion'
    'install:Install skills from GitHub'
    'list:List installed skills'
    'sync:Generate/update AGENTS.md'
    'manage:Manage installed skills'
    'run:Run a skill'
    'stats:Show audit statistics'
    'gen-skill:Generate new skill scaffold'
  )
  
  workflows=(
    'lint:Run linter'
    'typecheck:Run type checker'
    'test:Run tests'
    'build:Build project'
    'format:Format code'
    'diagnose:Full diagnostics'
    'quality-gate:Pre-commit checks'
    'deploy-prep:Pre-deployment validation'
    'quick-check:Fast lint + typecheck'
    'pre-commit:Fast pre-commit checks'
    'contracts-check:Validate contracts'
  )
  
  case $words[2] in
    exec|explain)
      _describe 'workflow' workflows
      ;;
    *)
      _describe 'command' commands
      ;;
  esac
}

_tsk "$@"
`.trim();
}

function generateFishCompletion(): string {
  return `
# tsk completion for fish

# Commands
complete -c tsk -f -n "__fish_use_subcommand" -a "init" -d "Initialize SkillKit"
complete -c tsk -f -n "__fish_use_subcommand" -a "discover" -d "Discover commands"
complete -c tsk -f -n "__fish_use_subcommand" -a "exec" -d "Execute workflow"
complete -c tsk -f -n "__fish_use_subcommand" -a "diagnose" -d "Run diagnostics"
complete -c tsk -f -n "__fish_use_subcommand" -a "suggest" -d "Get suggestions"
complete -c tsk -f -n "__fish_use_subcommand" -a "list-workflows" -d "List workflows"
complete -c tsk -f -n "__fish_use_subcommand" -a "explain" -d "Explain workflow"
complete -c tsk -f -n "__fish_use_subcommand" -a "workflow" -d "Generate workflow commands"
complete -c tsk -f -n "__fish_use_subcommand" -a "completion" -d "Generate completion"
complete -c tsk -f -n "__fish_use_subcommand" -a "install" -d "Install skills from GitHub"
complete -c tsk -f -n "__fish_use_subcommand" -a "list" -d "List installed skills"
complete -c tsk -f -n "__fish_use_subcommand" -a "sync" -d "Generate AGENTS.md"
complete -c tsk -f -n "__fish_use_subcommand" -a "manage" -d "Manage installed skills"

# Workflows for exec
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "lint" -d "Run linter"
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "typecheck" -d "Type check"
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "test" -d "Run tests"
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "build" -d "Build project"
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "format" -d "Format code"
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "diagnose" -d "Full diagnostics"
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "quality-gate" -d "Quality checks"
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "deploy-prep" -d "Deploy validation"
complete -c tsk -f -n "__fish_seen_subcommand_from exec" -a "quick-check" -d "Fast checks"

# Workflows for explain
complete -c tsk -f -n "__fish_seen_subcommand_from explain" -a "lint typecheck test build format diagnose quality-gate deploy-prep quick-check"

# Options
complete -c tsk -l help -d "Show help"
complete -c tsk -l version -d "Show version"
complete -c tsk -l dir -d "Project directory"
complete -c tsk -l cursor -d "Setup Cursor integration"
complete -c tsk -l shell -d "Shell type" -a "bash zsh fish"
`.trim();
}

