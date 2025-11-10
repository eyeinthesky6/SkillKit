/**
 * File Processor Skill
 * Reads files, counts lines and words, generates summary report
 */

module.exports = async function(input, sandbox, context) {
  const { files, outputFile = './output/report.txt' } = input;
  const { dryRun } = context;

  // Process each file
  const fileDetails = [];
  let totalLines = 0;
  let totalWords = 0;

  for (const filePath of files) {
    try {
      if (dryRun) {
        console.log(`[DRY RUN] Would read file: ${filePath}`);
        // Simulate data for dry run
        fileDetails.push({
          path: filePath,
          lines: 10,
          words: 50
        });
        totalLines += 10;
        totalWords += 50;
      } else {
        // Read file content
        const content = sandbox.readFile(filePath, 'utf8');
        
        // Count lines
        const lines = content.split('\n').length;
        
        // Count words (simple whitespace-based)
        const words = content
          .split(/\s+/)
          .filter(word => word.length > 0)
          .length;
        
        fileDetails.push({
          path: filePath,
          lines,
          words
        });
        
        totalLines += lines;
        totalWords += words;
      }
    } catch (error) {
      throw new Error(`Failed to process file ${filePath}: ${error.message}`);
    }
  }

  // Generate report
  const report = [
    '=== File Processing Report ===',
    '',
    `Files processed: ${files.length}`,
    `Total lines: ${totalLines}`,
    `Total words: ${totalWords}`,
    '',
    '=== File Details ===',
    '',
    ...fileDetails.map(f => 
      `${f.path}\n  Lines: ${f.lines}\n  Words: ${f.words}`
    ),
    '',
    `Generated: ${new Date().toISOString()}`
  ].join('\n');

  if (dryRun) {
    console.log(`[DRY RUN] Would write report to: ${outputFile}`);
    console.log('Report preview:', report.substring(0, 200) + '...');
  } else {
    // Write report to file
    sandbox.writeFile(outputFile, report, 'utf8');
  }

  return {
    filesProcessed: files.length,
    totalLines,
    totalWords,
    reportPath: outputFile,
    fileDetails
  };
};

