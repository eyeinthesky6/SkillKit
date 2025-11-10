import { execSync } from 'child_process';
import * as os from 'os';

/**
 * Terminal-aware skill loader
 * Detects platform and shell to execute OpenSkills commands correctly
 */

export interface SkillLoadResult {
  success: boolean;
  content?: string;
  error?: string;
  command?: string;
}

/**
 * Detect the appropriate command to run OpenSkills based on platform and shell
 */
export function getSkillLoadCommand(skillName: string): string {
  const platform = os.platform();
  const shell = process.env['SHELL'] || process.env['TERM_PROGRAM'] || '';
  
  if (platform === 'win32') {
    // Windows platform
    const isGitBash = shell.toLowerCase().includes('bash');
    const isPowerShell = shell.toLowerCase().includes('powershell') || 
                         process.env['PSModulePath'] !== undefined;
    
    if (isGitBash) {
      // Git Bash on Windows - direct execution
      return `openskills read ${skillName}`;
    } else if (isPowerShell || !shell) {
      // PowerShell (default on Windows 10+)
      // Use bash -c to execute in bash context
      return `bash -c "openskills read ${skillName}"`;
    } else {
      // CMD or other shells - try WSL
      return `wsl openskills read ${skillName}`;
    }
  } else {
    // Mac/Linux - direct execution
    return `openskills read ${skillName}`;
  }
}

/**
 * Load a skill from OpenSkills with terminal awareness
 */
export function loadSkill(skillName: string, verbose = false): SkillLoadResult {
  try {
    const command = getSkillLoadCommand(skillName);
    
    if (verbose) {
      console.log(`[SkillKit] Platform: ${os.platform()}`);
      console.log(`[SkillKit] Shell: ${process.env['SHELL'] || process.env['TERM_PROGRAM'] || 'unknown'}`);
      console.log(`[SkillKit] Command: ${command}`);
    }
    
    const content = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large skills
    });
    
    return {
      success: true,
      content: content.trim(),
      command
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: err.message,
      command: getSkillLoadCommand(skillName)
    };
  }
}

/**
 * Check if OpenSkills is installed
 */
export function checkOpenSkills(): boolean {
  try {
    execSync('openskills --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * List all installed skills
 */
export function listSkills(): SkillLoadResult {
  try {
    const command = getSkillLoadCommand('list').replace(' read list', ' list');
    const content = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return {
      success: true,
      content: content.trim(),
      command
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Install Anthropic skills
 */
export function installAnthropicSkills(): SkillLoadResult {
  try {
    let command: string;
    const platform = os.platform();
    
    if (platform === 'win32') {
      const shell = process.env['SHELL'] || process.env['TERM_PROGRAM'] || '';
      const isGitBash = shell.toLowerCase().includes('bash');
      
      if (isGitBash) {
        command = 'openskills install anthropics/skills';
      } else {
        command = 'bash -c "openskills install anthropics/skills"';
      }
    } else {
      command = 'openskills install anthropics/skills';
    }
    
    const content = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return {
      success: true,
      content: content.trim(),
      command
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Sync AGENTS.md (OpenSkills part)
 */
export function syncOpenSkillsAgents(): SkillLoadResult {
  try {
    let command: string;
    const platform = os.platform();
    
    if (platform === 'win32') {
      const shell = process.env['SHELL'] || process.env['TERM_PROGRAM'] || '';
      const isGitBash = shell.toLowerCase().includes('bash');
      
      if (isGitBash) {
        command = 'openskills sync';
      } else {
        command = 'bash -c "openskills sync"';
      }
    } else {
      command = 'openskills sync';
    }
    
    const content = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return {
      success: true,
      content: content.trim(),
      command
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: err.message
    };
  }
}

