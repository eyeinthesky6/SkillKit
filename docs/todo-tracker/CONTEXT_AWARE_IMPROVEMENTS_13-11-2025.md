# Context-Aware Pattern Detection Improvements

**Date:** 2025-11-13  
**Purpose:** Improve detection patterns with context-aware analysis based on research

---

## 🔬 Research Findings

### Key Papers & Models:

1. **CodeT5: Identifier-aware Unified Pre-trained Encoder-Decoder Models for Code Understanding and Generation**
   - **Authors:** Yue Wang, Weishi Wang, Shafiq Joty, Steven C.H. Hoi
   - **Paper:** [arXiv:2109.00859](https://arxiv.org/abs/2109.00859)
   - **Institution:** Salesforce Research
   - **Year:** 2021
   - **Contribution:** Pre-trained encoder-decoder model for code understanding. Our implementation uses similar context window analysis techniques.

2. **CodeBERT: A Pre-Trained Model for Programming and Natural Languages**
   - **Authors:** Zhangyin Feng, Daya Guo, Duyu Tang, Nan Duan, Xiaocheng Feng, Ming Gong, Linjun Shou, Bing Qin, Ting Liu, Daxin Jiang, Ming Zhou
   - **Paper:** [arXiv:2002.08155](https://arxiv.org/abs/2002.08155)
   - **Institution:** Microsoft Research
   - **Year:** 2020
   - **Contribution:** Pre-trained model for code semantics understanding. Our confidence scoring system is inspired by CodeBERT's semantic understanding approach.

3. **InferCode: Self-Supervised Learning of Code Representations by Predicting Subtrees**
   - **Authors:** Nghi D. Q. Bui, Yijun Yu, Lingxiao Jiang
   - **Paper:** [arXiv:2012.07023](https://arxiv.org/abs/2012.07023)
   - **Institution:** Monash University
   - **Year:** 2020
   - **Contribution:** Self-supervised learning for code representations using AST subtrees. Our context analysis uses similar structural understanding techniques.

4. **Code Comment Analysis for Functional Similarity Detection**
   - **Paper:** [MDPI Mathematics 12(7):1073](https://www.mdpi.com/2227-7390/12/7/1073)
   - **Year:** 2024
   - **Contribution:** Research on analyzing code comments to reveal functional similarities. Our approach uses similar comment analysis techniques.

### Key Insights:

1. **Context Window Analysis**: Need to analyze surrounding lines, not just single line
2. **Semantic Understanding**: Distinguish between descriptive comments and lazy coding indicators
3. **Code Structure Analysis**: Use AST when available for better context
4. **Pattern Co-occurrence**: Multiple indicators together = higher confidence

---

## 🎯 Current Issues

### 1. COMMENTED_OUT_CODE Pattern
- **Problem**: Flags descriptive comments as commented-out code
- **Example**: `// Delete duplicates (keep first)` → FALSE POSITIVE
- **Solution**: Check if comment is followed by active code

### 2. Keyword Detection Without Context
- **Problem**: Keywords like "simple", "basic" match everywhere
- **Example**: `// Simple hash (for comparison)` → FALSE POSITIVE
- **Solution**: Check surrounding context and code structure

### 3. Missing Context Window
- **Problem**: Only checks single line, misses multi-line patterns
- **Solution**: Analyze 3-5 line context window

---

## ✅ Implementation Plan

### Phase 1: Context Window Analysis
- Analyze 3-5 lines before and after current line
- Check if comment is followed by active code
- Distinguish descriptive comments from lazy coding

### Phase 2: Semantic Pattern Matching
- Use co-occurrence of multiple indicators
- Higher confidence when multiple patterns match
- Lower confidence for isolated keywords

### Phase 3: AST-Enhanced Detection
- Use AST when available for better context
- Identify code structure vs comments
- Better distinction between commented code and descriptions

---

## 🔧 Implementation Details

### Context-Aware Comment Analysis

**Before (Current):**
```javascript
// Matches any comment with action verb
if (/\/\/\s*(Delete|Confirm|Select)/.test(line)) {
  // Flag as COMMENTED_OUT_CODE
}
```

**After (Improved):**
```javascript
// Check context: Is this comment followed by active code?
const nextLine = lines[index + 1]?.trim() || ''
const hasActiveCode = /^(?!\s*\/\/|\s*$)/.test(nextLine)

if (/\/\/\s*(Delete|Confirm|Select)/.test(line) && hasActiveCode) {
  // This is a descriptive comment, NOT commented-out code
  return false // Skip
}

// Only flag if comment contains code-like syntax AND no active code follows
if (/\/\/\s*(export|function|class|const|let|var|if|for|while)/.test(line) && !hasActiveCode) {
  // This is likely commented-out code
  return true
}
```

### Multi-Indicator Confidence Scoring

**Before (Current):**
```javascript
// Single keyword match = issue
if (/simple|basic/.test(line)) {
  flagIssue()
}
```

**After (Improved):**
```javascript
// Multiple indicators = higher confidence
let confidence = 0
if (/simple|basic/.test(line)) confidence += 1
if (/placeholder|stub|temporary/.test(line)) confidence += 1
if (/TODO|FIXME/.test(line)) confidence += 2
if (/not implemented|incomplete/.test(line)) confidence += 2

// Only flag if confidence >= threshold
if (confidence >= 2) {
  flagIssue()
}
```

### Context Window Analysis

**Implementation:**
```javascript
function analyzeContextWindow(lines, index, windowSize = 3) {
  const start = Math.max(0, index - windowSize)
  const end = Math.min(lines.length, index + windowSize + 1)
  const context = lines.slice(start, end)
  
  return {
    before: context.slice(0, windowSize),
    current: context[windowSize],
    after: context.slice(windowSize + 1),
    hasActiveCode: context.slice(windowSize + 1).some(line => 
      /^(?!\s*\/\/|\s*$|\s*\*)/.test(line.trim())
    ),
    isInCommentBlock: context.some(line => /\/\*/.test(line)),
    hasCodeStructure: context.some(line => 
      /(function|class|const|let|var|if|for|while|return|throw)/.test(line)
    )
  }
}
```

---

## 📊 Expected Improvements

### COMMENTED_OUT_CODE Pattern
- **Current Accuracy:** 0% (all false positives)
- **Expected Accuracy:** 80-90% (after context-aware improvements)

### Keyword Detection
- **Current:** Many false positives from isolated keywords
- **Expected:** Higher precision with context window and confidence scoring

### Overall Detection
- **Current:** ~30% accuracy (based on sample)
- **Expected:** 70-80% accuracy with context-aware improvements

---

## 🚀 Next Steps

1. Implement context window analysis function
2. Update COMMENTED_OUT_CODE pattern with context checking
3. Add confidence scoring for multi-indicator patterns
4. Enhance keyword detection with surrounding context
5. Test improvements on sample issues
6. Measure accuracy improvements

