/**
 * Command Runner Skill
 * Safely executes shell commands and captures output
 */

module.exports = async function(input, sandbox, context) {
  const { command, args = [], cwd = '.', timeout = 30000 } = input;
  const { dryRun } = context;

  if (dryRun) {
    console.log(`[DRY RUN] Would execute: ${command} ${args.join(' ')}`);
    console.log(`[DRY RUN] Working directory: ${cwd}`);
    console.log(`[DRY RUN] Timeout: ${timeout}ms`);
    
    // Return simulated success
    return {
      exitCode: 0,
      stdout: `[DRY RUN] Simulated output for: ${command}`,
      stderr: '',
      duration: 100,
      success: true
    };
  }

  try {
    // Execute command through sandbox
    const result = await sandbox.executeCommand(command, args, {
      cwd,
      timeout
    });

    console.log(`Command executed: ${command}`);
    console.log(`Exit code: ${result.exitCode}`);
    console.log(`Duration: ${result.duration}ms`);

    return {
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      duration: result.duration,
      success: result.exitCode === 0
    };
  } catch (error) {
    // If command execution fails entirely, return error info
    throw new Error(`Command execution failed: ${error.message}`);
  }
};

