/**
 * Workflow Adapter - Adapts workflows based on project architecture
 * 
 * Takes generic workflows and customizes them based on:
 * - Project architecture (contracts-first, DDD, etc.)
 * - Available tools (Zod, Prisma, etc.)
 * - Quality rules (ESLint strictness)
 * - Project conventions
 * 
 * This is the INTELLIGENCE that decides WHAT to check!
 */

import { ProjectAnalyzer, ProjectArchitecture } from './project-analyzer';
import { WorkflowStep } from '../workflow/executor';

export interface AdaptedWorkflow {
  name: string;
  description: string;
  steps: WorkflowStep[];
  reasoning: string;  // WHY these steps were chosen
}

export class WorkflowAdapter {
  private projectRoot: string;
  private architecture?: ProjectArchitecture;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Analyze project and cache architecture
   */
  async initialize(): Promise<ProjectArchitecture> {
    const analyzer = new ProjectAnalyzer(this.projectRoot);
    this.architecture = await analyzer.analyze();
    return this.architecture;
  }

  /**
   * Adapt workflow based on project architecture
   */
  async adapt(workflowName: string): Promise<AdaptedWorkflow> {
    if (!this.architecture) {
      await this.initialize();
    }

    const arch = this.architecture!;

    switch (workflowName) {
      case 'quality-gate':
        return this.adaptQualityGate(arch);
      
      case 'pre-commit':
        return this.adaptPreCommit(arch);
      
      case 'contracts-check':
        return this.adaptContractsCheck(arch);
      
      case 'deploy-prep':
        return this.adaptDeployPrep(arch);
      
      default:
        throw new Error(`Unknown workflow: ${workflowName}`);
    }
  }

  /**
   * Adapt quality-gate workflow
   */
  private adaptQualityGate(arch: ProjectArchitecture): AdaptedWorkflow {
    const steps: WorkflowStep[] = [];
    let reasoning = 'Quality gate adapted based on project architecture:\n';

    // Always format if available
    steps.push({ name: 'Format Code', intent: 'format' });
    reasoning += '- Format: Always run to maintain consistency\n';

    // Lint with appropriate strictness
    steps.push({ name: 'Lint', intent: 'lint' });
    if (arch.tools.linting?.strictness === 'strict') {
      reasoning += '- Lint: Strict ESLint config detected, enforcing all rules\n';
    } else {
      reasoning += '- Lint: Running standard linting\n';
    }

    // Contracts check if contracts-first architecture
    if (arch.patterns.contractsFirst) {
      steps.push({ name: 'Validate Contracts', intent: 'validate-contracts' });
      reasoning += `- Contracts: Contracts-first architecture detected (${arch.tools.validation}), validating schemas\n`;
    }

    // Type check if TypeScript
    if (arch.language === 'typescript') {
      steps.push({ name: 'Type Check', intent: 'typecheck' });
      if (arch.patterns.typeFirst) {
        reasoning += '- TypeCheck: Strict TypeScript config detected, enforcing types\n';
      } else {
        reasoning += '- TypeCheck: Standard type checking\n';
      }
    }

    // Tests - prioritize if TDD
    if (arch.structure.hasTests) {
      steps.push({ name: 'Run Tests', intent: 'test' });
      if (arch.patterns.testDriven) {
        reasoning += '- Tests: TDD pattern detected, tests are critical\n';
      } else {
        reasoning += '- Tests: Running test suite\n';
      }
    }

    return {
      name: 'quality-gate',
      description: 'Quality gate adapted for this project',
      steps,
      reasoning
    };
  }

  /**
   * Adapt pre-commit workflow
   */
  private adaptPreCommit(arch: ProjectArchitecture): AdaptedWorkflow {
    const steps: WorkflowStep[] = [];
    let reasoning = 'Pre-commit checks adapted:\n';

    // Fast checks only
    steps.push({ name: 'Format', intent: 'format' });
    reasoning += '- Format: Quick auto-fix\n';

    steps.push({ name: 'Lint', intent: 'lint' });
    reasoning += '- Lint: Catch obvious errors\n';

    if (arch.language === 'typescript') {
      steps.push({ name: 'Type Check', intent: 'typecheck' });
      reasoning += '- TypeCheck: Fast syntax validation\n';
    }

    // Skip tests for pre-commit (too slow)
    reasoning += '- Tests: Skipped (run in quality-gate instead)\n';

    return {
      name: 'pre-commit',
      description: 'Fast pre-commit validation',
      steps,
      reasoning
    };
  }

  /**
   * Adapt contracts-check workflow (new!)
   */
  private adaptContractsCheck(arch: ProjectArchitecture): AdaptedWorkflow {
    const steps: WorkflowStep[] = [];
    let reasoning = 'Contracts validation adapted:\n';

    if (!arch.patterns.contractsFirst) {
      reasoning += '- No contracts-first architecture detected, skipping\n';
      return { name: 'contracts-check', description: 'No contracts to check', steps: [], reasoning };
    }

    // Validate schema files
    if (arch.tools.validation === 'zod') {
      steps.push({ name: 'Validate Zod Schemas', intent: 'validate-zod' });
      reasoning += '- Zod: Validating schema definitions\n';
    }

    // Check schema coverage
    steps.push({ name: 'Check Schema Coverage', intent: 'check-schema-coverage' });
    reasoning += '- Coverage: Ensuring all endpoints have schemas\n';

    // Validate contracts match implementation
    steps.push({ name: 'Contract Implementation Match', intent: 'validate-contract-impl' });
    reasoning += '- Implementation: Ensuring code matches contracts\n';

    return {
      name: 'contracts-check',
      description: 'Validate contracts-first architecture',
      steps,
      reasoning
    };
  }

  /**
   * Adapt deploy-prep workflow
   */
  private adaptDeployPrep(arch: ProjectArchitecture): AdaptedWorkflow {
    const steps: WorkflowStep[] = [];
    let reasoning = 'Deployment preparation adapted:\n';

    // All quality checks
    steps.push({ name: 'Format', intent: 'format' });
    steps.push({ name: 'Lint', intent: 'lint' });
    
    if (arch.language === 'typescript') {
      steps.push({ name: 'Type Check', intent: 'typecheck' });
    }

    if (arch.structure.hasTests) {
      steps.push({ name: 'Tests', intent: 'test' });
      reasoning += '- Tests: Full test suite required for deployment\n';
    }

    // Build
    steps.push({ name: 'Build', intent: 'build' });
    reasoning += '- Build: Validating production build\n';

    // Audit logs check if available
    if (arch.structure.hasAudit) {
      steps.push({ name: 'Check Audit Logs', intent: 'check-audit' });
      reasoning += '- Audit: Checking tracking logs are up-to-date\n';
    }

    // Security checks
    steps.push({ name: 'Security Audit', intent: 'security-audit' });
    reasoning += '- Security: Running dependency vulnerability scan\n';

    return {
      name: 'deploy-prep',
      description: 'Full deployment preparation',
      steps,
      reasoning
    };
  }

  /**
   * Get recommended workflows for this project
   */
  async recommendWorkflows(): Promise<string[]> {
    if (!this.architecture) {
      await this.initialize();
    }

    const arch = this.architecture!;
    const recommendations: string[] = [];

    // Always recommend quality-gate
    recommendations.push('quality-gate - Comprehensive quality checks');

    // Recommend contracts-check if contracts-first
    if (arch.patterns.contractsFirst) {
      recommendations.push('contracts-check - Validate schema definitions and coverage');
    }

    // Recommend pre-commit for fast feedback
    recommendations.push('pre-commit - Fast validation before committing');

    // Recommend deploy-prep if has build
    recommendations.push('deploy-prep - Full deployment validation');

    return recommendations;
  }
}

