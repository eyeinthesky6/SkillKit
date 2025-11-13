/**
 * Workflow Customization Merger
 * 
 * Preserves user customizations when upgrading workflow files.
 * Detects custom sections, comments, and modifications in existing files
 * and merges them into new template versions.
 */

import fs from 'fs-extra';

export interface Customization {
  type: 'section' | 'comment' | 'command' | 'custom-content';
  content: string;
  location: 'before' | 'after' | 'replace';
  marker?: string; // Section marker or identifier
}

export interface WorkflowComparison {
  existing: string;
  template: string;
  customizations: Customization[];
  hasCustomizations: boolean;
}

/**
 * Compare existing workflow with template to detect customizations
 */
export function detectCustomizations(
  existingContent: string,
  templateContent: string
): Customization[] {
  const customizations: Customization[] = [];
  
  // Split into lines for analysis
  const existingLines = existingContent.split('\n');
  const templateLines = templateContent.split('\n');
  
  // Find custom sections (sections not in template)
  const templateSections = extractSections(templateContent);
  const existingSections = extractSections(existingContent);
  
  // Find sections that exist in existing but not in template
  for (const [sectionName, sectionContent] of existingSections.entries()) {
    if (!templateSections.has(sectionName)) {
      customizations.push({
        type: 'section',
        content: sectionContent,
        location: 'after',
        marker: sectionName,
      });
    }
  }
  
  // Find custom comments (user-added comments)
  const customComments = findCustomComments(existingLines, templateLines);
  customizations.push(...customComments);
  
  // Find custom commands (commands not in template)
  const customCommands = findCustomCommands(existingLines, templateLines);
  customizations.push(...customCommands);
  
  // Find custom content blocks (marked with <!-- CUSTOM --> or similar)
  const customBlocks = findCustomBlocks(existingContent);
  customizations.push(...customBlocks);
  
  return customizations;
}

/**
 * Extract sections from markdown content
 */
function extractSections(content: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = content.split('\n');
  let currentSection: string | null = null;
  let currentContent: string[] = [];
  
  for (const line of lines) {
    // Match markdown headers (## or ###)
    const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.set(currentSection, currentContent.join('\n'));
      }
      // Start new section
      currentSection = headerMatch[2].trim();
      currentContent = [line];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection) {
    sections.set(currentSection, currentContent.join('\n'));
  }
  
  return sections;
}

/**
 * Find custom comments added by user
 */
function findCustomComments(
  existingLines: string[],
  templateLines: string[]
): Customization[] {
  const customizations: Customization[] = [];
  const templateCommentSet = new Set(
    templateLines
      .filter(line => line.trim().startsWith('<!--') || line.trim().startsWith('#'))
      .map(line => line.trim())
  );
  
  for (let i = 0; i < existingLines.length; i++) {
    const line = existingLines[i].trim();
    if ((line.startsWith('<!--') || line.startsWith('#')) && 
        !templateCommentSet.has(line) &&
        !line.includes('CUSTOM') && // Skip our markers
        !line.includes('AUTO-GENERATED')) {
      // Check if it's a meaningful comment (not just whitespace)
      if (line.length > 5) {
        customizations.push({
          type: 'comment',
          content: existingLines[i],
          location: 'after',
        });
      }
    }
  }
  
  return customizations;
}

/**
 * Find custom commands added by user
 */
function findCustomCommands(
  existingLines: string[],
  templateLines: string[]
): Customization[] {
  const customizations: Customization[] = [];
  const templateCommandSet = new Set(
    templateLines
      .filter(line => line.trim().startsWith('```') || 
                     (line.includes('tsk') || line.includes('npm') || line.includes('pnpm') || line.includes('poetry')))
      .map(line => line.trim().toLowerCase())
  );
  
  // Find code blocks with custom commands
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  
  for (let i = 0; i < existingLines.length; i++) {
    const line = existingLines[i];
    
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block - check if it's custom
        const blockContent = codeBlockLines.join('\n').toLowerCase();
        const isCustom = !templateCommandSet.has(blockContent.trim()) &&
                         codeBlockLines.some(l => 
                           l.includes('tsk') || l.includes('npm') || l.includes('pnpm') || l.includes('poetry')
                         );
        
        if (isCustom) {
          customizations.push({
            type: 'command',
            content: codeBlockLines.join('\n'),
            location: 'after',
          });
        }
        
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      codeBlockLines.push(line);
    }
  }
  
  return customizations;
}

/**
 * Find custom content blocks marked by user
 */
function findCustomBlocks(content: string): Customization[] {
  const customizations: Customization[] = [];
  
  // Look for markers like <!-- CUSTOM START --> ... <!-- CUSTOM END -->
  const customBlockRegex = /<!--\s*CUSTOM\s+(?:START|BEGIN)\s*-->([\s\S]*?)<!--\s*CUSTOM\s+(?:END|STOP)\s*-->/gi;
  let match;
  
  while ((match = customBlockRegex.exec(content)) !== null) {
    customizations.push({
      type: 'custom-content',
      content: match[1].trim(),
      location: 'after',
      marker: 'CUSTOM',
    });
  }
  
  return customizations;
}

/**
 * Merge customizations into new template content
 */
export function mergeCustomizations(
  templateContent: string,
  customizations: Customization[]
): string {
  if (customizations.length === 0) {
    return templateContent;
  }
  
  let merged = templateContent;
  
  // Group customizations by type and location
  const sections = customizations.filter(c => c.type === 'section');
  const comments = customizations.filter(c => c.type === 'comment');
  const commands = customizations.filter(c => c.type === 'command');
  const customBlocks = customizations.filter(c => c.type === 'custom-content');
  
  // Add custom sections at the end (before any existing custom sections)
  if (sections.length > 0) {
    const sectionsContent = sections.map(s => s.content).join('\n\n');
    // Find the last ## section and add after it
    const lastSectionMatch = merged.match(/(##\s+[^\n]+\n[\s\S]*?)(?=\n##\s+|$)/g);
    if (lastSectionMatch) {
      const lastSection = lastSectionMatch[lastSectionMatch.length - 1];
      merged = merged.replace(lastSection, lastSection + '\n\n' + sectionsContent);
    } else {
      // No sections found, append at end
      merged += '\n\n' + sectionsContent;
    }
  }
  
  // Add custom commands (preserve order)
  if (commands.length > 0) {
    const commandsContent = commands.map(c => 
      '```bash\n' + c.content + '\n```'
    ).join('\n\n');
    // Add after last code block or at end
    const lastCodeBlock = merged.lastIndexOf('```');
    if (lastCodeBlock >= 0) {
      const afterLastBlock = merged.indexOf('\n', lastCodeBlock + 3);
      if (afterLastBlock >= 0) {
        merged = merged.substring(0, afterLastBlock) + 
                 '\n\n' + commandsContent + 
                 merged.substring(afterLastBlock);
      } else {
        merged += '\n\n' + commandsContent;
      }
    } else {
      merged += '\n\n' + commandsContent;
    }
  }
  
  // Add custom blocks (preserve markers)
  if (customBlocks.length > 0) {
    const blocksContent = customBlocks.map(c => 
      `<!-- CUSTOM START -->\n${c.content}\n<!-- CUSTOM END -->`
    ).join('\n\n');
    merged += '\n\n' + blocksContent;
  }
  
  // Add custom comments (at appropriate locations)
  if (comments.length > 0) {
    // Add comments after the title/header
    const titleMatch = merged.match(/^#\s+[^\n]+\n/);
    if (titleMatch) {
      const afterTitle = titleMatch.index! + titleMatch[0].length;
      const commentsText = comments.map(c => c.content).join('\n');
      merged = merged.substring(0, afterTitle) + 
               '\n' + commentsText + '\n' + 
               merged.substring(afterTitle);
    }
  }
  
  return merged;
}

/**
 * Compare existing workflow with template and return merge result
 */
export async function compareAndMerge(
  existingFilePath: string,
  templateContent: string
): Promise<WorkflowComparison> {
  let existingContent = '';
  let hasExisting = false;
  
  try {
    if (await fs.pathExists(existingFilePath)) {
      existingContent = await fs.readFile(existingFilePath, 'utf8');
      hasExisting = true;
    }
  } catch {
    // File doesn't exist or can't be read
  }
  
  if (!hasExisting) {
    return {
      existing: '',
      template: templateContent,
      customizations: [],
      hasCustomizations: false,
    };
  }
  
  // Detect customizations
  const customizations = detectCustomizations(existingContent, templateContent);
  
  return {
    existing: existingContent,
    template: templateContent,
    customizations,
    hasCustomizations: customizations.length > 0,
  };
}

