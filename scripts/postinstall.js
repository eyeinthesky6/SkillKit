#!/usr/bin/env node
/**
 * Post-install verification script
 * Runs after npm install to verify installation and check for common issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@trinity-os/skillkit';
const CLI_NAME = 'tsk';

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m',  // Yellow
    error: '\x1b[31m',    // Red
    reset: '\x1b[0m'
  };
  
  const icon = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗'
  };
  
  console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
}

function checkCLI() {
  try {
    const cliPath = path.join(__dirname, '..', 'dist', 'cli.js');
    if (!fs.existsSync(cliPath)) {
      log('CLI binary not found. Run: npm run build', 'warning');
      return false;
    }
    
    // Check if executable (Unix)
    if (process.platform !== 'win32') {
      const stats = fs.statSync(cliPath);
      if (!(stats.mode & parseInt('111', 8))) {
        log('CLI binary is not executable. Fixing...', 'warning');
        fs.chmodSync(cliPath, '755');
      }
    }
    
    log('CLI binary found', 'success');
    return true;
  } catch (error) {
    log(`CLI check failed: ${error.message}`, 'error');
    return false;
  }
}

function checkDependencies() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    const requiredDeps = [
      'commander',
      'chalk',
      'fs-extra',
      'inquirer',
      'ora'
    ];
    
    const missing = [];
    for (const dep of requiredDeps) {
      try {
        require.resolve(dep);
      } catch {
        missing.push(dep);
      }
    }
    
    if (missing.length > 0) {
      log(`Missing dependencies: ${missing.join(', ')}`, 'warning');
      log('Run: npm install', 'info');
      return false;
    }
    
    log('All dependencies installed', 'success');
    return true;
  } catch (error) {
    log(`Dependency check failed: ${error.message}`, 'error');
    return false;
  }
}

function checkNodeVersion() {
  try {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (major < 18) {
      log(`Node.js ${nodeVersion} is below minimum requirement (18.0.0)`, 'error');
      log('Please upgrade Node.js: https://nodejs.org/', 'info');
      return false;
    }
    
    log(`Node.js version: ${nodeVersion}`, 'success');
    return true;
  } catch (error) {
    log(`Node version check failed: ${error.message}`, 'error');
    return false;
  }
}

function checkOpenSkills() {
  try {
    execSync('openskills --version', { stdio: 'ignore' });
    log('OpenSkills is installed', 'success');
    return true;
  } catch {
    log('OpenSkills not found (optional)', 'warning');
    log('Install for Anthropic skills: npm install -g openskills', 'info');
    return true; // Not required, just optional
  }
}

function checkBuild() {
  try {
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      log('Build output not found. Run: npm run build', 'warning');
      return false;
    }
    
    const indexJs = path.join(distPath, 'index.js');
    const cliJs = path.join(distPath, 'cli.js');
    
    if (!fs.existsSync(indexJs) || !fs.existsSync(cliJs)) {
      log('Build incomplete. Run: npm run build', 'warning');
      return false;
    }
    
    log('Build output verified', 'success');
    return true;
  } catch (error) {
    log(`Build check failed: ${error.message}`, 'error');
    return false;
  }
}

function main() {
  log(`\nVerifying ${PACKAGE_NAME} installation...\n`, 'info');
  
  const checks = [
    { name: 'Node.js version', fn: checkNodeVersion },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Build output', fn: checkBuild },
    { name: 'CLI binary', fn: checkCLI },
    { name: 'OpenSkills (optional)', fn: checkOpenSkills }
  ];
  
  const results = checks.map(check => ({
    name: check.name,
    passed: check.fn()
  }));
  
  const failed = results.filter(r => !r.passed);
  const passed = results.filter(r => r.passed);
  
  console.log('\n' + '─'.repeat(60));
  log(`\nInstallation check complete: ${passed.length}/${results.length} passed\n`, 
      failed.length > 0 ? 'warning' : 'success');
  
  if (failed.length > 0) {
    log('Some checks failed. This may not prevent usage, but:', 'warning');
    failed.forEach(check => {
      log(`  • ${check.name}`, 'warning');
    });
    console.log('');
  }
  
  log('Next steps:', 'info');
  log('  1. Run: tsk --version', 'info');
  log('  2. Initialize in a project: tsk init --cursor', 'info');
  log('  3. See README.md for more information', 'info');
  console.log('');
}

// Only run if installed as a dependency (not in development)
if (require.main === module) {
  const isDev = process.env['npm_config_dev'] === 'true' || 
                process.env['SKILLKIT_DEV'] === 'true';
  
  if (!isDev) {
    main();
  }
}

module.exports = { main, checkCLI, checkDependencies, checkNodeVersion, checkOpenSkills, checkBuild };

