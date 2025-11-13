/**
 * Standardized report paths for SkillKit
 * 
 * All diagnostic reports and outputs should use these utilities
 * to ensure consistent organization in docs/skillkit/
 */

import fs from 'fs';
import path from 'path';

/**
 * Get the standard SkillKit reports directory
 * Default: docs/skillkit/
 * Can be overridden with SKILLKIT_REPORTS_DIR environment variable
 */
export function getReportsDir(projectRoot: string = process.cwd()): string {
  const customDir = process.env['SKILLKIT_REPORTS_DIR'];
  if (customDir) {
    return path.isAbsolute(customDir) ? customDir : path.join(projectRoot, customDir);
  }
  return path.join(projectRoot, 'docs', 'skillkit');
}

/**
 * Ensure reports directory exists
 */
export function ensureReportsDir(projectRoot: string = process.cwd()): string {
  const reportsDir = getReportsDir(projectRoot);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  return reportsDir;
}

/**
 * Get a report file path with timestamp
 * Format: {baseName}-{YYYY-MM-DD_HH-MM-SS}.{ext}
 */
export function getReportPath(
  baseName: string,
  ext: string = 'md',
  projectRoot: string = process.cwd()
): string {
  const reportsDir = ensureReportsDir(projectRoot);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  
  return path.join(reportsDir, `${baseName}-${timestamp}.${ext}`);
}

/**
 * Get a report file path with date only (for daily reports)
 * Format: {baseName}-{YYYY-MM-DD}.{ext}
 */
export function getDailyReportPath(
  baseName: string,
  ext: string = 'md',
  projectRoot: string = process.cwd()
): string {
  const reportsDir = ensureReportsDir(projectRoot);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateOnly = `${year}-${month}-${day}`;
  
  return path.join(reportsDir, `${baseName}-${dateOnly}.${ext}`);
}

/**
 * Get subdirectory for specific report types
 * e.g., docs/skillkit/diagnostics/, docs/skillkit/coverage/, etc.
 */
export function getReportSubdir(
  subdir: string,
  projectRoot: string = process.cwd()
): string {
  const reportsDir = ensureReportsDir(projectRoot);
  const subdirPath = path.join(reportsDir, subdir);
  if (!fs.existsSync(subdirPath)) {
    fs.mkdirSync(subdirPath, { recursive: true });
  }
  return subdirPath;
}

/**
 * Get relative path from project root for display
 */
export function getRelativeReportPath(
  filePath: string,
  projectRoot: string = process.cwd()
): string {
  return path.relative(projectRoot, filePath);
}

