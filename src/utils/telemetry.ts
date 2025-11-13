/**
 * Telemetry and audit logging for SkillKit
 * 
 * Tracks skill usage, execution times, and outcomes
 */

import fs from 'fs-extra';
import path from 'path';

export interface SkillUsageEntry {
  skill: string;
  timestamp: string;
  repo: string;
  status: 'success' | 'failure';
  duration_ms: number;
  task?: string;
  error?: string;
  confidence?: number;
}

export interface PlanEntry {
  task: string;
  timestamp: string;
  selectedSkill: string;
  confidence: number;
  why: string;
  availableSkills: number;
  tags?: string[];
}

/**
 * Ensure audit log directory exists
 */
function ensureAuditDir(): string {
  const auditDir = path.join(process.cwd(), 'logs', 'audit');
  fs.ensureDirSync(auditDir);
  return auditDir;
}

/**
 * Log skill usage to audit file
 */
export async function logSkillUsage(entry: SkillUsageEntry): Promise<void> {
  const auditDir = ensureAuditDir();
  const usageFile = path.join(auditDir, 'skills-usage.jsonl');
  
  const line = JSON.stringify(entry);
  await fs.appendFile(usageFile, line + '\n', 'utf8');
}

/**
 * Log plan execution to audit file
 */
export async function logPlan(entry: PlanEntry): Promise<void> {
  const auditDir = ensureAuditDir();
  const planFile = path.join(auditDir, 'plan-history.jsonl');
  
  const line = JSON.stringify(entry);
  await fs.appendFile(planFile, line + '\n', 'utf8');
}

/**
 * Get skill usage statistics
 */
export async function getSkillStats(): Promise<{
  totalRuns: number;
  successCount: number;
  failureCount: number;
  avgDuration: number;
  bySkill: Map<string, { runs: number; failures: number; avgDuration: number }>;
  lastUsed: Map<string, string>;
}> {
  const auditDir = ensureAuditDir();
  const usageFile = path.join(auditDir, 'skills-usage.jsonl');
  
  if (!fs.existsSync(usageFile)) {
    return {
      totalRuns: 0,
      successCount: 0,
      failureCount: 0,
      avgDuration: 0,
      bySkill: new Map(),
      lastUsed: new Map(),
    };
  }
  
  const content = await fs.readFile(usageFile, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  
  let totalRuns = 0;
  let successCount = 0;
  let failureCount = 0;
  let totalDuration = 0;
  const bySkill = new Map<string, { runs: number; failures: number; totalDuration: number }>();
  const lastUsed = new Map<string, string>();
  
  for (const line of lines) {
    try {
      const entry: SkillUsageEntry = JSON.parse(line);
      totalRuns++;
      totalDuration += entry.duration_ms;
      
      if (entry.status === 'success') {
        successCount++;
      } else {
        failureCount++;
      }
      
      const skillStats = bySkill.get(entry.skill) || { runs: 0, failures: 0, totalDuration: 0 };
      skillStats.runs++;
      if (entry.status === 'failure') {
        skillStats.failures++;
      }
      skillStats.totalDuration += entry.duration_ms;
      bySkill.set(entry.skill, skillStats);
      
      // Track last used (most recent timestamp)
      const currentLast = lastUsed.get(entry.skill);
      if (!currentLast || entry.timestamp > currentLast) {
        lastUsed.set(entry.skill, entry.timestamp);
      }
    } catch {
      // Skip malformed lines
    }
  }
  
  // Calculate averages
  const avgDuration = totalRuns > 0 ? totalDuration / totalRuns : 0;
  const bySkillWithAvg = new Map<string, { runs: number; failures: number; avgDuration: number }>();
  
  for (const [skill, stats] of bySkill.entries()) {
    bySkillWithAvg.set(skill, {
      runs: stats.runs,
      failures: stats.failures,
      avgDuration: stats.runs > 0 ? stats.totalDuration / stats.runs : 0,
    });
  }
  
  return {
    totalRuns,
    successCount,
    failureCount,
    avgDuration,
    bySkill: bySkillWithAvg,
    lastUsed,
  };
}

