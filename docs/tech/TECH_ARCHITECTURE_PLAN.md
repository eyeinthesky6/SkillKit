# Technical Architecture Plan for Tiered SkillKit

## Overview

This document outlines the technical implementation to support SkillKit's tiered business model: Free → Pro → Professional. The architecture must enable feature gating, license validation, and seamless tier upgrades while maintaining backward compatibility.

## Core Architecture Principles

### 1. Feature Flags First
- All premium features controlled by runtime feature flags
- No code branching - single codebase with conditional execution
- Easy to enable/disable features per tier

### 2. License Validation
- Runtime license checking with grace periods
- Offline support (24h cache for connectivity issues)
- Minimal performance impact on core operations

### 3. Backward Compatibility
- Free tier always works without licenses
- Graceful degradation when premium features unavailable
- Clear upgrade messaging without blocking functionality

---

## Technical Implementation

### Phase 1: Feature Flags System ✅

#### Feature Flags Module
```typescript
// src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  // Always available
  SINGLE_LANGUAGE: true,
  BASIC_WORKFLOWS: true,
  STANDARD_COMMANDS: true,

  // Pro tier features
  MULTI_LANGUAGE: false,      // Set by license
  ADVANCED_WORKFLOWS: false,  // Set by license
  AGENT_ROLES: false,         // Set by license

  // Professional tier features
  INTEGRATED_TODO_TRACKER: false,  // Set by license
  TEAM_ANALYTICS: false,           // Set by license
  ADVANCED_INTEGRATIONS: false,    // Set by license
  WORKFLOW_AUTOMATION: false,      // Set by license
};

export function updateFeatureFlags(licenseTier: LicenseTier) {
  switch (licenseTier) {
    case 'FREE':
      // Default flags (already set)
      break;
    case 'PRO':
      FEATURE_FLAGS.MULTI_LANGUAGE = true;
      FEATURE_FLAGS.ADVANCED_WORKFLOWS = true;
      FEATURE_FLAGS.AGENT_ROLES = true;
      break;
    case 'PROFESSIONAL':
      // Include all Pro features
      updateFeatureFlags('PRO');
      FEATURE_FLAGS.INTEGRATED_TODO_TRACKER = true;
      FEATURE_FLAGS.TEAM_ANALYTICS = true;
      FEATURE_FLAGS.ADVANCED_INTEGRATIONS = true;
      FEATURE_FLAGS.WORKFLOW_AUTOMATION = true;
      break;
  }
}
```

#### Feature Gate Decorator
```typescript
// src/utils/feature-gate.ts
export function requireFeature(feature: keyof typeof FEATURE_FLAGS) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
      if (!FEATURE_FLAGS[feature]) {
        console.log(`⚠️ ${feature} requires SkillKit Pro or Professional.`);
        console.log(`Upgrade: https://skillkit.dev/pricing`);
        console.log(`Falling back to basic functionality...\n`);
        // Return basic version or skip
        return;
      }
      return originalMethod.apply(this, args);
    };
  };
}

// Usage
export class WorkflowGenerator {
  @requireFeature('MULTI_LANGUAGE')
  async generateMultiLanguageWorkflow() {
    // Multi-language logic here
  }

  async generateBasicWorkflow() {
    // Always available
  }
}
```

### Phase 2: License Validation System ✅

#### License Validator
```typescript
// src/auth/license-validator.ts
export type LicenseTier = 'FREE' | 'PRO' | 'PROFESSIONAL';

export interface LicenseInfo {
  tier: LicenseTier;
  validUntil: Date;
  features: string[];
  userId: string;
  organizationId?: string;
}

export class LicenseValidator {
  private static instance: LicenseValidator;
  private licenseCache: Map<string, LicenseInfo> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): LicenseValidator {
    if (!LicenseValidator.instance) {
      LicenseValidator.instance = new LicenseValidator();
    }
    return LicenseValidator.instance;
  }

  async validateLicense(): Promise<LicenseInfo> {
    // Check environment variables first
    const envLicense = process.env.SKILLKIT_LICENSE_KEY;
    if (envLicense) {
      return this.validateWithServer(envLicense);
    }

    // Check cached license
    const cached = this.getCachedLicense();
    if (cached) {
      return cached;
    }

    // Default to FREE tier
    return {
      tier: 'FREE',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      features: ['SINGLE_LANGUAGE', 'BASIC_WORKFLOWS', 'STANDARD_COMMANDS'],
      userId: 'anonymous'
    };
  }

  private async validateWithServer(licenseKey: string): Promise<LicenseInfo> {
    try {
      // Call license server API
      const response = await fetch(`${LICENSE_SERVER_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey })
      });

      if (!response.ok) {
        throw new Error('License validation failed');
      }

      const licenseData = await response.json();

      // Cache the result
      this.licenseCache.set(licenseKey, {
        ...licenseData,
        cachedAt: Date.now()
      });

      return licenseData;
    } catch (error) {
      // Network error - use cached license if available and not expired
      const cached = this.getCachedLicense();
      if (cached && cached.validUntil > new Date()) {
        console.log('⚠️ Using cached license (network unavailable)');
        return cached;
      }

      // Fall back to FREE tier
      console.log('⚠️ License validation failed, using FREE tier');
      return this.getFreeLicense();
    }
  }

  private getCachedLicense(): LicenseInfo | null {
    for (const [key, license] of this.licenseCache.entries()) {
      if (license.validUntil > new Date() &&
          (Date.now() - (license as any).cachedAt) < this.CACHE_DURATION) {
        return license;
      }
    }
    return null;
  }

  private getFreeLicense(): LicenseInfo {
    return {
      tier: 'FREE',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      features: ['SINGLE_LANGUAGE', 'BASIC_WORKFLOWS', 'STANDARD_COMMANDS'],
      userId: 'anonymous'
    };
  }
}
```

#### License Server API
```typescript
// License server routes
app.post('/api/v1/licenses/validate', async (req, res) => {
  const { licenseKey } = req.body;

  // Validate license key
  const license = await db.licenses.findOne({ key: licenseKey });
  if (!license) {
    return res.status(401).json({ error: 'Invalid license key' });
  }

  // Check expiration
  if (license.expiresAt < new Date()) {
    return res.status(401).json({ error: 'License expired' });
  }

  // Return license info
  res.json({
    tier: license.tier,
    validUntil: license.expiresAt,
    features: getFeaturesForTier(license.tier),
    userId: license.userId,
    organizationId: license.organizationId
  });
});

function getFeaturesForTier(tier: string): string[] {
  switch (tier) {
    case 'FREE':
      return ['SINGLE_LANGUAGE', 'BASIC_WORKFLOWS', 'STANDARD_COMMANDS'];
    case 'PRO':
      return ['MULTI_LANGUAGE', 'ADVANCED_WORKFLOWS', 'AGENT_ROLES'];
    case 'PROFESSIONAL':
      return ['INTEGRATED_TODO_TRACKER', 'TEAM_ANALYTICS', 'ADVANCED_INTEGRATIONS', 'WORKFLOW_AUTOMATION'];
    default:
      return [];
  }
}
```

### Phase 3: Workflow Filtering ✅

#### Tier-Based Workflow Access
```typescript
// src/cli-commands/workflow-gen.ts
const WORKFLOW_TIERS = {
  FREE: [
    'BEGIN_SESSION',
    'CONTINUE',
    'IMPLEMENT_FEATURE',
    'FIX_BUGS',
    'DEDUP',
    'DEPLOY_PREP',
    'SYSTEM_AUDIT',
    'SECURITY_AUDIT',
    'AUDIT_SKILLKIT',
    'META_CUSTOMIZE',
    'META_WORKFLOW_TEMPLATE',
    'HELP'
  ],
  PRO: [
    // All FREE workflows plus:
    'CHECK_DEPS',
    'CREATE_TESTS',
    'DOCUMENTATION_AUDIT',
    'FEATURE_FIX_STRATEGY',
    'FINAL_CHECK',
    'FIX_ALL',
    'TECH_DEBT_ANALYSIS',
    'TODO_EXECUTION'
  ],
  PROFESSIONAL: [
    // All PRO workflows (unlocked automatically)
    // Plus integrated features and advanced integrations
  ]
};

export async function getAvailableWorkflows(): Promise<string[]> {
  const license = await LicenseValidator.getInstance().validateLicense();
  return WORKFLOW_TIERS[license.tier] || WORKFLOW_TIERS.FREE;
}

export async function generateWorkflow(templateName: string): Promise<void> {
  const availableWorkflows = await getAvailableWorkflows();

  if (!availableWorkflows.includes(templateName)) {
    const license = await LicenseValidator.getInstance().validateLicense();
    console.log(`⚠️ ${templateName} requires ${getRequiredTier(templateName)} tier.`);
    console.log(`Current tier: ${license.tier}`);
    console.log(`Upgrade: https://skillkit.dev/pricing\n`);

    // Generate basic version if available
    const basicVersion = getBasicVersion(templateName);
    if (basicVersion) {
      console.log(`Generating basic version: ${basicVersion}`);
      return generateWorkflow(basicVersion);
    }

    throw new Error(`Workflow ${templateName} not available in ${license.tier} tier`);
  }

  // Generate the workflow...
}
```

### Phase 4: Usage Analytics & Limits ✅

#### Usage Tracker
```typescript
// src/analytics/usage-tracker.ts
export class UsageTracker {
  private static instance: UsageTracker;
  private usage: Map<string, number> = new Map();

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  trackFeatureUsage(feature: string, userId: string) {
    const key = `${userId}:${feature}`;
    const current = this.usage.get(key) || 0;
    this.usage.set(key, current + 1);

    // Send to analytics server (fire and forget)
    this.sendAnalytics(feature, userId).catch(() => {
      // Ignore analytics errors
    });
  }

  checkLimits(feature: string, userId: string): boolean {
    const license = LicenseValidator.getInstance().validateLicense();
    const limits = TIER_LIMITS[license.tier];

    if (!limits) return true; // No limits for this tier

    const key = `${userId}:${feature}`;
    const usage = this.usage.get(key) || 0;

    return usage < limits[feature];
  }

  private async sendAnalytics(feature: string, userId: string) {
    // Send anonymized analytics to license server
    await fetch(`${LICENSE_SERVER_URL}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature,
        userId: hash(userId), // Anonymize
        timestamp: Date.now(),
        version: getSkillKitVersion()
      })
    });
  }
}

const TIER_LIMITS = {
  FREE: {
    'workflow-generations': 10,  // per day
    'todo-tracker-runs': 5,      // per day
    'diagnostics-runs': 20       // per day
  },
  PRO: {
    'workflow-generations': 100, // per day
    'todo-tracker-runs': 50,     // per day
    'diagnostics-runs': 200      // per day
  },
  PROFESSIONAL: {
    // No limits for Professional tier
  }
};
```

### Phase 5: Integrated TODO Tracker (Professional Tier) ✅

#### Enhanced TODO Tracker Integration
```typescript
// src/integrations/todo-tracker.ts
export class IntegratedTodoTracker {
  @requireFeature('INTEGRATED_TODO_TRACKER')
  async analyzeCodebase(): Promise<TodoAnalysis> {
    // Full codebase analysis with ML-powered false positive reduction
    const results = await this.runAdvancedAnalysis();

    // Store results for analytics
    await this.storeAnalysisResults(results);

    // Generate insights
    const insights = await this.generateInsights(results);

    return {
      todos: results.todos,
      insights,
      trends: await this.calculateTrends(),
      recommendations: insights.recommendations
    };
  }

  private async runAdvancedAnalysis(): Promise<TodoResults> {
    // Use ML model to reduce false positives
    // Advanced pattern recognition
    // Context-aware analysis
    // Cross-file analysis
  }

  @requireFeature('TEAM_ANALYTICS')
  async generateTeamReport(): Promise<TeamAnalytics> {
    // Analyze team workflow patterns
    // Productivity metrics
    // Code quality trends
    // Bottleneck identification
  }
}
```

### Phase 6: Advanced Integrations (Professional Tier) ✅

#### Integration Manager
```typescript
// src/integrations/manager.ts
export class IntegrationManager {
  @requireFeature('ADVANCED_INTEGRATIONS')
  async setupGitHubIntegration(): Promise<void> {
    // GitHub webhook setup
    // PR comment integration
    // Status check integration
  }

  @requireFeature('ADVANCED_INTEGRATIONS')
  async setupSlackIntegration(): Promise<void> {
    // Slack notification setup
    // Workflow status updates
    // Team mentions
  }

  @requireFeature('WORKFLOW_AUTOMATION')
  async setupCIIntegration(): Promise<void> {
    // GitHub Actions integration
    // Auto-trigger workflows on events
    // Status reporting
  }
}
```

---

## Research: Smaller Tools Architecture Analysis

### ESLint Business Model
**Architecture:** Open source core, paid services
- **Free:** Core linting rules, basic CLI
- **Paid:** Premium rules, team management, integrations
- **Distribution:** npm package (free), eslint.com (paid)
- **Tech Stack:** Node.js, plugin architecture

### Prettier Business Model
**Architecture:** Free tool, paid services
- **Free:** Code formatting
- **Paid:** Prettier for enterprise (team management)
- **Distribution:** npm package
- **Tech Stack:** JavaScript, plugin system

### Renovate Business Model
**Architecture:** Open source + SaaS
- **Free:** Self-hosted, basic features
- **Paid:** Cloud service, advanced features
- **Distribution:** Docker (self-hosted), renovatebot.com (SaaS)
- **Tech Stack:** Node.js, GitHub integrations

### Code Quality SaaS Tools

#### DeepSource
- **Free:** Basic rules, GitHub integration
- **Paid:** Advanced rules, custom rules, team analytics
- **Architecture:** Cloud-first, webhook-based
- **Distribution:** Web app + GitHub integration

#### SonarCloud
- **Free:** Public repos, basic analysis
- **Paid:** Private repos, advanced rules, custom rules
- **Architecture:** Cloud analysis, webhook integration
- **Distribution:** Web dashboard + IDE integrations

### Key Architecture Patterns

#### 1. Plugin Architecture
```typescript
// Plugin system for extensibility
interface SkillKitPlugin {
  name: string;
  tier: LicenseTier;
  activate(): void;
  deactivate(): void;
}

// Load plugins based on license
export class PluginManager {
  loadPluginsForTier(tier: LicenseTier) {
    const plugins = PLUGIN_REGISTRY.filter(p => p.tier === 'FREE' || p.tier === tier);
    plugins.forEach(p => p.activate());
  }
}
```

#### 2. Webhook-Based Integrations
```typescript
// GitHub integration example
export class GitHubIntegration {
  @requireFeature('ADVANCED_INTEGRATIONS')
  setupWebhooks(repo: string) {
    // Setup webhook for PR events
    // Auto-run workflows on PR creation
    // Comment with results
  }
}
```

#### 3. SaaS API Design
```typescript
// REST API for SaaS features
app.post('/api/v1/workflows/run', authenticate, async (req, res) => {
  const { workflowName, params } = req.body;
  const license = await validateLicense(req.user.id);

  if (!FEATURE_FLAGS[workflowName]?.tiers.includes(license.tier)) {
    return res.status(403).json({ error: 'Feature not available in your tier' });
  }

  const result = await runWorkflow(workflowName, params);
  res.json(result);
});
```

#### 4. Feature Toggle System
```typescript
// Environment-based feature toggles
const FEATURES = {
  MULTI_LANGUAGE: process.env.FEATURE_MULTI_LANGUAGE === 'true',
  INTEGRATED_TODO: process.env.FEATURE_INTEGRATED_TODO === 'true',
  TEAM_ANALYTICS: process.env.FEATURE_TEAM_ANALYTICS === 'true'
};

// Runtime feature checking
export function hasFeature(feature: string): boolean {
  return FEATURES[feature] || false;
}
```

---

## Implementation Roadmap

### Q4 2025: Core Infrastructure ✅
- [x] Feature flags system
- [x] License validation
- [x] Basic tier separation
- [x] Free tier functionality

### Q1 2026: Pro Tier Launch
- [ ] Multi-language support
- [ ] Advanced workflows
- [ ] Agent role awareness
- [ ] License server MVP
- [ ] Web dashboard foundation
- [ ] **Dynamic Task Spawning** (Hephaestus-inspired)
- [ ] **Guardian Agent** foundation
- [ ] **Phase-Based Architecture**

### Q2 2026: Professional Tier Launch
- [ ] Integrated TODO tracker
- [ ] AI Error Analysis engine
- [ ] Team analytics
- [ ] Advanced integrations (GitHub, Slack)
- [ ] Workflow automation
- [ ] Reporting system
- [ ] **Task Board/Kanban** system
- [ ] **Multi-Agent Coordination**

### Q3 2026: Scale & Optimize
- [ ] Performance optimization
- [ ] Advanced caching
- [ ] Usage analytics
- [ ] Enterprise integrations (future)

---

## Scalability Considerations

### Database Design
```sql
-- License management
CREATE TABLE licenses (
  id UUID PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  tier VARCHAR(50),
  user_id UUID,
  organization_id UUID,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Feature usage tracking
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY,
  license_id UUID,
  feature VARCHAR(100),
  usage_count INTEGER,
  period_start DATE,
  period_end DATE
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  license_id UUID,
  event_type VARCHAR(100),
  event_data JSONB,
  timestamp TIMESTAMP
);
```

### Caching Strategy
```typescript
// Redis-based caching for license validation
export class LicenseCache {
  async getLicense(key: string): Promise<LicenseInfo | null> {
    const cached = await redis.get(`license:${key}`);
    return cached ? JSON.parse(cached) : null;
  }

  async setLicense(key: string, license: LicenseInfo, ttl = 3600) {
    await redis.setex(`license:${key}`, ttl, JSON.stringify(license));
  }
}
```

### Rate Limiting
```typescript
// API rate limiting for SaaS features
export class RateLimiter {
  async checkLimit(userId: string, endpoint: string): Promise<boolean> {
    const key = `ratelimit:${userId}:${endpoint}`;
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, 3600); // 1 hour window
    }

    const limit = getLimitForTier(userId, endpoint);
    return requests <= limit;
  }
}
```

---

## Security Considerations

### License Security
- JWT-based license tokens with expiration
- License key rotation support
- Tamper detection and revocation
- Offline grace periods

### Data Privacy
- Minimal data collection (anonymized analytics)
- GDPR compliance for EU users
- Data retention policies
- User data export/deletion

### API Security
- OAuth 2.0 for integrations
- API key management
- Request signing for webhooks
- Rate limiting and abuse prevention

---

## Migration Strategy

### Backward Compatibility
```typescript
// Version detection and migration
export class MigrationManager {
  async migrateFromVersion(oldVersion: string, newVersion: string) {
    // Handle breaking changes
    // Migrate user settings
    // Update license format if needed
  }
}
```

### Zero-Downtime Deployments
- Blue-green deployments for license server
- Database migration scripts
- Rollback procedures
- Feature flag rollouts

---

## Monitoring & Analytics

### System Metrics
```typescript
// Prometheus metrics
const licenseValidations = new Counter({
  name: 'skillkit_license_validations_total',
  help: 'Total license validations',
  labelNames: ['tier', 'result']
});

const featureUsage = new Counter({
  name: 'skillkit_feature_usage_total',
  help: 'Feature usage by tier',
  labelNames: ['feature', 'tier']
});
```

### Business Metrics
- Conversion rates (free → pro → professional)
- Feature adoption rates
- Churn analysis
- Revenue tracking

---

## Multi-IDE Architecture Extension

### **Universal IDE Adapter System**
```typescript
// Multi-IDE support foundation
export class UniversalIDEAdapter {
  private adapters: Map<string, IDEAdapter> = new Map();

  constructor() {
    this.adapters.set('cursor', new CursorAdapter());
    this.adapters.set('vscode', new VSCodeAdapter());
    this.adapters.set('windsurf', new WindsurfAdapter());
    this.adapters.set('jetbrains', new JetBrainsAdapter());
  }

  async detectAndSetup(): Promise<void> {
    const currentIDE = await this.detectIDE();
    const adapter = this.adapters.get(currentIDE);

    if (adapter) {
      await adapter.setupWorkflows(await this.getAvailableWorkflows());
      await adapter.setupRules(await this.getAvailableRules());
    }
  }

  private async detectIDE(): Promise<string> {
    // IDE detection logic
    if (process.env.CURSOR) return 'cursor';
    if (process.env.VSCODE_PID) return 'vscode';
    if (process.env.WINDSURF) return 'windsurf';
    // JetBrains detection via system properties
    return 'unknown';
  }
}
```

### **AI Assistant Orchestration**
```typescript
// Multi-AI assistant support
export class AIAssistantOrchestrator {
  private assistants: Map<string, AIAssistant> = new Map();

  constructor() {
    this.assistants.set('copilot', new CopilotAssistant());
    this.assistants.set('claude', new ClaudeAssistant());
    this.assistants.set('windsurf', new WindsurfAssistant());
  }

  async executeWorkflow(workflow: Workflow, context: EditorContext): Promise<void> {
    const availableAssistants = await this.detectAvailableAssistants();

    // Use the best available assistant for each step
    for (const step of workflow.steps) {
      const assistant = this.selectBestAssistant(step, availableAssistants);
      await assistant.executeStep(step, context);
    }
  }
}
```

## Hephaestus-Inspired Dynamic Orchestration Architecture

### **Dynamic Task Spawning Engine**
```typescript
export class DynamicTaskEngine {
  private taskQueue: TaskQueue;
  private phaseManager: PhaseManager;
  private guardianAgent: GuardianAgent;

  async executeWorkflow(workflow: Workflow): Promise<ExecutionResult> {
    // Initialize phases
    const phases = this.phaseManager.initializePhases(workflow);

    // Start with initial tasks
    await this.spawnInitialTasks(workflow, phases);

    // Main execution loop
    while (!(await this.isWorkflowComplete(workflow))) {
      // Get available tasks
      const availableTasks = await this.taskQueue.getAvailableTasks();

      // Guardian monitoring
      await this.guardianAgent.monitorExecution(availableTasks);

      // Execute tasks (potentially spawning new ones)
      for (const task of availableTasks) {
        const newTasks = await this.executeTaskWithSpawning(task);
        await this.handleSpawnedTasks(newTasks, phases);
      }

      // Update task board
      await this.updateTaskBoard();
    }

    return await this.compileExecutionResult(workflow);
  }

  private async executeTaskWithSpawning(task: Task): Promise<Task[]> {
    // Execute the task
    const result = await this.executeTask(task);

    // Check if task discovered new work
    const discoveries = await this.analyzeTaskOutput(result);

    // Spawn new tasks based on discoveries
    return await this.spawnTasksFromDiscoveries(discoveries, task.phase);
  }
}
```

### **Phase-Based Workflow Architecture**
```typescript
export enum PhaseType {
  ANALYSIS = 'analysis',
  IMPLEMENTATION = 'implementation',
  VALIDATION = 'validation'
}

export class PhaseManager {
  private phases: Map<PhaseType, Phase> = new Map();

  initializePhases(workflow: Workflow): Phase[] {
    return [
      new Phase(PhaseType.ANALYSIS, {
        canSpawn: [PhaseType.ANALYSIS, PhaseType.IMPLEMENTATION],
        guardianRules: this.getAnalysisRules()
      }),
      new Phase(PhaseType.IMPLEMENTATION, {
        canSpawn: [PhaseType.IMPLEMENTATION, PhaseType.VALIDATION],
        guardianRules: this.getImplementationRules()
      }),
      new Phase(PhaseType.VALIDATION, {
        canSpawn: [PhaseType.ANALYSIS, PhaseType.IMPLEMENTATION, PhaseType.VALIDATION],
        guardianRules: this.getValidationRules()
      })
    ];
  }
}

export class Phase {
  constructor(
    public type: PhaseType,
    public config: PhaseConfig
  ) {}

  async canSpawnTask(targetPhase: PhaseType, taskSpec: TaskSpec): Promise<boolean> {
    // Check if this phase can spawn tasks in target phase
    if (!this.config.canSpawn.includes(targetPhase)) {
      return false;
    }

    // Guardian validation
    return await this.validateTaskSpawn(taskSpec);
  }

  private async validateTaskSpawn(taskSpec: TaskSpec): Promise<boolean> {
    // Apply guardian rules
    for (const rule of this.config.guardianRules) {
      if (!(await rule.validate(taskSpec))) {
        return false;
      }
    }
    return true;
  }
}
```

### **Guardian Agent System**
```typescript
export class GuardianAgent {
  private trajectoryAnalyzer: TrajectoryAnalyzer;
  private qualityAssessor: QualityAssessor;
  private interventionEngine: InterventionEngine;

  async monitorExecution(tasks: Task[]): Promise<GuardianReport> {
    const trajectory = await this.trajectoryAnalyzer.analyzeTrajectory(tasks);
    const quality = await this.qualityAssessor.assessQuality(tasks);
    const drift = await this.detectDrift(trajectory);

    if (this.requiresIntervention(drift, quality)) {
      await this.interventionEngine.intervene(tasks, drift, quality);
    }

    return { trajectory, quality, drift, interventions: [] };
  }

  private async detectDrift(trajectory: Trajectory): Promise<DriftAnalysis> {
    const expectedPath = this.calculateExpectedTrajectory();
    const actualPath = trajectory.completedTasks;

    const driftScore = this.calculateDriftScore(expectedPath, actualPath);

    return {
      score: driftScore,
      severity: this.classifyDriftSeverity(driftScore),
      recommendations: await this.generateDriftRecommendations(driftScore)
    };
  }

  private requiresIntervention(drift: DriftAnalysis, quality: QualityAssessment): boolean {
    return drift.severity === 'high' || quality.score < 0.6;
  }
}
```

### **Task Board System**
```typescript
export class TaskBoard {
  private tasks: Map<string, Task> = new Map();
  private dependencies: Map<string, string[]> = new Map();
  private observers: TaskBoardObserver[] = [];

  async spawnTask(parentTaskId: string | null, taskSpec: TaskSpec): Promise<Task> {
    const task = await this.createTask(taskSpec);

    // Set up dependencies
    if (parentTaskId) {
      await this.addDependency(task.id, parentTaskId);
    }

    // Update board state
    await this.updateBoardState();

    // Notify observers
    await this.notifyObservers('task_spawned', task);

    return task;
  }

  async getBoardSnapshot(): Promise<BoardSnapshot> {
    return {
      tasks: Array.from(this.tasks.values()),
      dependencies: this.dependencies,
      status: await this.calculateBoardStatus(),
      blockedTasks: await this.identifyBlockedTasks(),
      availableTasks: await this.getAvailableTasks()
    };
  }

  private async updateBoardState(): Promise<void> {
    // Recalculate task statuses based on dependencies
    for (const [taskId, deps] of this.dependencies) {
      const task = this.tasks.get(taskId);
      if (task && await this.areDependenciesMet(deps)) {
        task.status = 'available';
      } else {
        task.status = 'blocked';
      }
    }
  }
}
```

### **Multi-Agent Coordination**
```typescript
export class MultiAgentCoordinator {
  private agents: Map<string, Agent> = new Map();
  private taskAssignments: Map<string, string> = new Map(); // taskId -> agentId

  async coordinateExecution(availableTasks: Task[]): Promise<ExecutionPlan> {
    const plan: ExecutionPlan = {
      assignments: [],
      parallelGroups: [],
      sequentialChains: []
    };

    // Group tasks by type and dependencies
    const taskGroups = await this.groupTasks(availableTasks);

    // Assign agents to task groups
    for (const group of taskGroups) {
      const suitableAgents = await this.findSuitableAgents(group);
      const assignments = await this.assignAgentsToGroup(suitableAgents, group);

      plan.assignments.push(...assignments);

      if (group.executionMode === 'parallel') {
        plan.parallelGroups.push(assignments);
      } else {
        plan.sequentialChains.push(assignments);
      }
    }

    return plan;
  }

  private async groupTasks(tasks: Task[]): Promise<TaskGroup[]> {
    // Group by dependencies, type, and resource requirements
    const groups: TaskGroup[] = [];

    for (const task of tasks) {
      const matchingGroup = groups.find(g => this.canJoinGroup(g, task));

      if (matchingGroup) {
        matchingGroup.tasks.push(task);
      } else {
        groups.push({
          tasks: [task],
          executionMode: await this.determineExecutionMode(task),
          resourceRequirements: await this.calculateRequirements(task)
        });
      }
    }

    return groups;
  }
}
```

## Conclusion

## AI Capabilities Architecture

### **AI Service Integration Layer**
```typescript
export class AIServiceIntegration {
  private aiProviders: Map<string, AIProvider> = new Map();
  private capabilityRegistry: Map<string, AICapability> = new Map();

  constructor() {
    // AI providers
    this.aiProviders.set('openai', new OpenAIProvider());
    this.aiProviders.set('anthropic', new AnthropicProvider());
    this.aiProviders.set('google', new GoogleAIProvider());

    // AI capabilities
    this.capabilityRegistry.set('error-analysis', {
      provider: 'anthropic',
      tier: 'PROFESSIONAL',
      endpoint: '/ai/error-analysis'
    });
    this.capabilityRegistry.set('code-review', {
      provider: 'openai',
      tier: 'ENTERPRISE',
      endpoint: '/ai/code-review'
    });
    this.capabilityRegistry.set('architecture-advisor', {
      provider: 'anthropic',
      tier: 'ENTERPRISE',
      endpoint: '/ai/architecture'
    });
  }

  async executeCapability(capabilityName: string, input: any): Promise<any> {
    const capability = this.capabilityRegistry.get(capabilityName);
    if (!capability) {
      throw new Error(`AI capability ${capabilityName} not found`);
    }

    // Check license tier
    await this.validateTierAccess(capability.tier);

    // Get AI provider
    const provider = this.aiProviders.get(capability.provider);
    if (!provider) {
      throw new Error(`AI provider ${capability.provider} not available`);
    }

    // Execute with provider
    return await provider.execute(capability.endpoint, input);
  }
}
```

### **AI Context & Learning Engine**
```typescript
export class AIContextEngine {
  async buildRichContext(task: AITask): Promise<AIContext> {
    return {
      codebase: await this.analyzeCodebase(task.project),
      user: await this.getUserProfile(task.userId),
      history: await this.getInteractionHistory(task.userId),
      realtime: await this.getRealtimeContext(),
      domain: await this.inferDomain(task.project)
    };
  }

  async learnFromInteraction(interaction: UserInteraction): Promise<void> {
    // Store interaction for learning
    await this.storeInteraction(interaction);

    // Update user preferences
    await this.updateUserModel(interaction);

    // Improve future suggestions
    await this.retrainModels(interaction);
  }
}
```

### **AI Quality & Safety Framework**
```typescript
export class AIQualityFramework {
  async validateAIOutput(output: any, capability: string): Promise<ValidationResult> {
    const quality = await this.assessQuality(output);
    const safety = await this.checkSafety(output);
    const relevance = await this.checkRelevance(output, capability);

    return {
      passed: quality.score > 0.8 && safety.safe && relevance.score > 0.7,
      quality,
      safety,
      relevance,
      recommendations: await this.generateRecommendations(output, { quality, safety, relevance })
    };
  }
}
```

## Conclusion

This technical architecture provides a solid foundation for SkillKit's evolution from Cursor-specific to universal AI workflow platform with comprehensive AI capabilities:

1. **Scalable Feature Gating** - Easy to add new tiers and features
2. **Robust License System** - Secure, performant validation across IDEs
3. **Multi-IDE Support** - Universal adapter system for all major IDEs
4. **AI Assistant Agnostic** - Works with Copilot, Claude, Windsurf, and others
5. **Advanced AI Integration** - Comprehensive AI capabilities for development intelligence
6. **Backward Compatibility** - Existing Cursor users unaffected
7. **Analytics Ready** - Built-in usage tracking and insights
8. **Integration Friendly** - Extensible plugin and webhook system
9. **AI Learning & Adaptation** - Continuous improvement through user interactions
10. **Quality & Safety** - Responsible AI implementation with validation

The architecture follows proven patterns from successful open source + SaaS tools while pioneering universal AI workflow orchestration and development intelligence across the entire development ecosystem.
