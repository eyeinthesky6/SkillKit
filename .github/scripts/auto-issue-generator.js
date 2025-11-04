#!/usr/bin/env node

/**
 * Auto Issue Generator
 * 
 * This script reads from a roadmap.json file and creates GitHub issues
 * for each item that doesn't already have an associated issue.
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

// Configuration
const CONFIG = {
  owner: 'trinity-os',
  repo: 'skillkit',
  roadmapPath: path.join(__dirname, '../../docs/roadmap.json'),
  // These will be set from environment variables
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
  installationId: process.env.GITHUB_APP_INSTALLATION_ID,
};

// Initialize Octokit with GitHub App authentication
const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: CONFIG.appId,
    privateKey: CONFIG.privateKey,
    installationId: CONFIG.installationId,
  },
});

/**
 * Load the roadmap data from the JSON file
 */
async function loadRoadmap() {
  try {
    const data = await fs.promises.readFile(CONFIG.roadmapPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading roadmap file:', error);
    process.exit(1);
  }
}

/**
 * Check if an issue with the given title already exists
 */
async function issueExists(title) {
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner: CONFIG.owner,
      repo: CONFIG.repo,
      state: 'all',
      per_page: 100,
    });

    return issues.some(issue => issue.title === title);
  } catch (error) {
    console.error('Error checking for existing issues:', error);
    return false;
  }
}

/**
 * Create a new GitHub issue
 */
async function createIssue(issueData) {
  try {
    const { title, body, labels = [] } = issueData;
    
    // Check if issue already exists
    if (await issueExists(title)) {
      console.log(`Skipping existing issue: "${title}"`);
      return null;
    }

    // Create the issue
    const { data: issue } = await octokit.issues.create({
      owner: CONFIG.owner,
      repo: CONFIG.repo,
      title,
      body,
      labels: ['enhancement', 'roadmap', ...labels],
    });

    console.log(`Created issue #${issue.number}: "${title}"`);
    return issue;
  } catch (error) {
    console.error('Error creating issue:', error);
    return null;
  }
}

/**
 * Process the roadmap and create issues
 */
async function processRoadmap() {
  const roadmap = await loadRoadmap();
  const { milestones = [] } = roadmap;

  for (const milestone of milestones) {
    console.log(`\nProcessing milestone: ${milestone.title}`);
    
    for (const item of milestone.items) {
      const issueData = {
        title: item.title,
        body: `## ${item.title}\n\n${item.description || 'No description provided.'}\n\n` +
              `**Milestone**: ${milestone.title}\n` +
              `**Priority**: ${item.priority || 'Medium'}\n` +
              `**Estimated Effort**: ${item.effort || 'Not estimated'}\n\n` +
              `### Acceptance Criteria\n${(item.acceptanceCriteria || []).map(c => `- [ ] ${c}`).join('\n')}\n\n` +
              `*This issue was automatically generated from the project roadmap.*`,
        labels: item.labels || [],
      };

      await createIssue(issueData);
    }
  }
}

// Run the script
processRoadmap().catch(error => {
  console.error('Error in auto-issue-generator:', error);
  process.exit(1);
});
