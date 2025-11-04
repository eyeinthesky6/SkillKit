import { minimatch } from 'minimatch';

import { Skill, SkillRegistry, Plan } from '../types';

/**
 * Options for planning
 */
export interface PlanOptions {
  /** Task description */
  taskText?: string;
  /** Tags to filter skills */
  tags?: string[];
  /** Expected input shape */
  inputShape?: Record<string, unknown>;
  /** Minimum confidence threshold (0-1) */
  minConfidence?: number;
}

/**
 * Default plan options
 */
const DEFAULT_PLAN_OPTIONS: Required<PlanOptions> = {
  taskText: '',
  tags: [],
  inputShape: {},
  minConfidence: 0.5,
};

/**
 * Plan the execution of skills based on the task
 */
export function planTask(registry: SkillRegistry, options: PlanOptions = {}): Plan {
  const {
    taskText = '',
    tags = [],
    inputShape = {},
    minConfidence = 0.5,
  } = { ...DEFAULT_PLAN_OPTIONS, ...options };

  const skills = registry.list();

  if (skills.length === 0) {
    throw new Error('No skills available');
  }

  // Score each skill based on the task and tags
  const scoredSkills = skills
    .map((skill) => ({
      skill,
      score: scoreSkill(skill, { taskText, tags, inputShape }),
    }))
    .filter(({ score }) => score.total >= minConfidence)
    .sort((a, b) => b.score.total - a.score.total);

  if (scoredSkills.length === 0) {
    throw new Error(
      `No suitable skill found for task: ${taskText || 'No description'}${
        tags.length > 0 ? `\nTags: ${tags.join(', ')}` : ''
      }`,
    );
  }

  const { skill, score } = scoredSkills[0];
  const reasons = [];

  if (score.tagMatch > 0) {
    const matchedTags = tags.filter((tag) =>
      skill.tags.some((skillTag) => skillTag.toLowerCase() === tag.toLowerCase()),
    );
    reasons.push(`Matched tags: ${matchedTags.join(', ')}`);
  }

  if (score.inputMatch) {
    reasons.push('Input shape matches expected schema');
  }

  if (score.keywordMatch > 0) {
    reasons.push(`Matched ${score.keywordMatch} keywords in name/description`);
  }

  return {
    skill: skill.name,
    why: reasons.length > 0 ? reasons.join('; ') : 'Best available match',
    expectedOutputs: skill.outputs,
    confidence: Math.min(1, Math.max(0, score.total)), // Ensure between 0 and 1
    warnings: score.warnings,
  };
}

/**
 * Score a skill based on how well it matches the task
 */
function scoreSkill(
  skill: Skill,
  { taskText, tags = [], inputShape = {} }: Omit<Required<PlanOptions>, 'minConfidence'>,
): {
  total: number;
  tagMatch: number;
  inputMatch: boolean;
  keywordMatch: number;
  warnings?: string[];
} {
  const score = 0;
  const warnings: string[] = [];

  // 1. Tag matching (exact match, case-insensitive)
  const tagMatch = tags.filter((tag) =>
    skill.tags.some((skillTag) => skillTag.toLowerCase() === tag.toLowerCase()),
  ).length;

  // 2. Input shape matching
  let inputMatch = true;
  if (
    inputShape &&
    skill.inputs &&
    typeof skill.inputs === 'object' &&
    'properties' in skill.inputs
  ) {
    const requiredProps = Object.entries(skill.inputs.properties || {})
      .filter(([_, schema]) => {
        if (typeof schema !== 'object' || schema === null) return false;
        const s = schema as { type?: string | string[] | { type: string }; required?: boolean };
        return Array.isArray(s.type) ? s.type.includes('required') : s.required === true;
      })
      .map(([name]) => name);

    const missingProps = requiredProps.filter((prop) => !(prop in inputShape));

    if (missingProps.length > 0) {
      inputMatch = false;
      warnings.push(`Missing required input properties: ${missingProps.join(', ')}`);
    }

    // Check for extra properties if additionalProperties is false
    if (skill.inputs.additionalProperties === false) {
      const extraProps = Object.keys(inputShape).filter(
        (key) => !(key in (skill.inputs.properties || {})),
      );

      if (extraProps.length > 0) {
        warnings.push(`Unexpected input properties: ${extraProps.join(', ')}`);
      }
    }
  }

  // 3. Keyword matching in name and description
  const keywords = taskText.toLowerCase().split(/\s+/).filter(Boolean);
  const skillText = `${skill.name} ${skill.description}`.toLowerCase();

  const keywordMatch = keywords.filter((keyword) => skillText.includes(keyword)).length;

  // Calculate total score with weights
  const weights = {
    tag: 0.4, // Tags are most important
    input: 0.3, // Input matching is important
    keyword: 0.3, // Keywords are least important
  };

  const tagScore = Math.min(1, tagMatch / Math.max(1, tags.length)) * weights.tag;
  const inputScore = (inputMatch ? 1 : 0) * weights.input;
  const keywordScore = Math.min(1, keywordMatch / Math.max(1, keywords.length)) * weights.keyword;

  const total = tagScore + inputScore + keywordScore;

  return {
    total,
    tagMatch: tagScore,
    inputMatch,
    keywordMatch: keywordScore,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Find skills by tags
 */
export function findSkillsByTags(
  registry: SkillRegistry,
  tags: string[],
  requireAll = false,
): Skill[] {
  if (!tags || tags.length === 0) {
    return [];
  }

  return registry.list().filter((skill) => {
    const skillTags = new Set(skill.tags.map((t) => t.toLowerCase()));
    const searchTags = new Set(tags.map((t) => t.toLowerCase()));

    if (requireAll) {
      return Array.from(searchTags).every((tag) => skillTags.has(tag));
    }

    return Array.from(searchTags).some((tag) => skillTags.has(tag));
  });
}

/**
 * Find skills by glob pattern
 */
export function findSkillsByPattern(registry: SkillRegistry, pattern: string): Skill[] {
  return registry
    .list()
    .filter(
      (skill) =>
        minimatch(skill.name, pattern) || skill.tags.some((tag) => minimatch(tag, pattern)),
    );
}
