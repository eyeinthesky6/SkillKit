# Research Attributions - Context-Aware Pattern Detection

**Date:** 2025-11-13  
**Purpose:** Proper attribution to research papers and models that inspired the context-aware improvements

---

## 📚 Research Papers & Models

### 1. CodeT5: Identifier-aware Unified Pre-trained Encoder-Decoder Models for Code Understanding and Generation

**Authors:**
- Yue Wang
- Weishi Wang
- Shafiq Joty
- Steven C.H. Hoi

**Paper:** [arXiv:2109.00859](https://arxiv.org/abs/2109.00859)  
**Institution:** Salesforce Research  
**Year:** 2021

**Contribution to Our Work:**
- Context window analysis techniques for code understanding
- Pre-trained encoder-decoder model for code semantics
- Understanding of code structure and context

**How We Used It:**
- Implemented context window analysis (3-5 lines before/after)
- Used similar techniques for distinguishing comments from code
- Applied semantic understanding for better pattern detection

**Citation:**
```
@article{wang2021codet5,
  title={CodeT5: Identifier-aware Unified Pre-trained Encoder-Decoder Models for Code Understanding and Generation},
  author={Wang, Yue and Wang, Weishi and Joty, Shafiq and Hoi, Steven C.H.},
  journal={arXiv preprint arXiv:2109.00859},
  year={2021}
}
```

---

### 2. CodeBERT: A Pre-Trained Model for Programming and Natural Languages

**Authors:**
- Zhangyin Feng
- Daya Guo
- Duyu Tang
- Nan Duan
- Xiaocheng Feng
- Ming Gong
- Linjun Shou
- Bing Qin
- Ting Liu
- Daxin Jiang
- Ming Zhou

**Paper:** [arXiv:2002.08155](https://arxiv.org/abs/2002.08155)  
**Institution:** Microsoft Research  
**Year:** 2020

**Contribution to Our Work:**
- Pre-trained model for code semantics understanding
- Semantic understanding approach for pattern detection
- Better context understanding for code analysis

**How We Used It:**
- Confidence scoring system inspired by CodeBERT's semantic understanding
- Multi-indicator detection based on semantic patterns
- Context-aware adjustments for better accuracy

**Citation:**
```
@article{feng2020codebert,
  title={CodeBERT: A Pre-Trained Model for Programming and Natural Languages},
  author={Feng, Zhangyin and Guo, Daya and Tang, Duyu and Duan, Nan and Feng, Xiaocheng and Gong, Ming and Shou, Linjun and Qin, Bing and Liu, Ting and Jiang, Daxin and Zhou, Ming},
  journal={arXiv preprint arXiv:2002.08155},
  year={2020}
}
```

---

### 3. InferCode: Self-Supervised Learning of Code Representations by Predicting Subtrees

**Authors:**
- Nghi D. Q. Bui
- Yijun Yu
- Lingxiao Jiang

**Paper:** [arXiv:2012.07023](https://arxiv.org/abs/2012.07023)  
**Institution:** Monash University  
**Year:** 2020

**Contribution to Our Work:**
- Self-supervised learning for code representations
- AST-based code understanding
- Structural understanding techniques

**How We Used It:**
- Context analysis using structural understanding
- Better distinction between code structure and comments
- AST-based techniques for pattern detection (when AST available)

**Citation:**
```
@article{bui2020infercode,
  title={InferCode: Self-Supervised Learning of Code Representations by Predicting Subtrees},
  author={Bui, Nghi D. Q. and Yu, Yijun and Jiang, Lingxiao},
  journal={arXiv preprint arXiv:2012.07023},
  year={2020}
}
```

---

### 4. Code Comment Analysis for Functional Similarity Detection

**Paper:** [MDPI Mathematics 12(7):1073](https://www.mdpi.com/2227-7390/12/7/1073)  
**Journal:** MDPI Mathematics  
**Year:** 2024

**Contribution to Our Work:**
- Research on analyzing code comments to reveal functional similarities
- Comment analysis techniques for better code understanding
- Understanding of comment patterns and their meanings

**How We Used It:**
- Comment analysis techniques for distinguishing descriptive comments
- Better understanding of comment patterns
- Functional similarity detection in comments

---

### 5. CodeMirage: A Comprehensive Benchmark for AI-Generated Code Detection

**Paper:** [arXiv:2506.11059](https://arxiv.org/abs/2506.11059)  
**Year:** 2025

**Contribution to Our Work:**
- Comprehensive benchmark spanning 10 programming languages
- Outputs from 10 state-of-the-art LLMs
- Evaluation framework for AI-generated code detectors
- Common AI-generated code characteristics and patterns

**How We Used It:**
- Understanding common AI-generated code patterns
- Pattern detection based on benchmark findings
- Multi-language pattern support

**Citation:**
```
@article{codemirage2025,
  title={CodeMirage: A Comprehensive Benchmark for AI-Generated Code Detection},
  journal={arXiv preprint arXiv:2506.11059},
  year={2025}
}
```

---

### 6. ACW: AI Code Watermarking for Traceability

**Paper:** [arXiv:2402.07518](https://arxiv.org/abs/2402.07518)  
**Year:** 2024

**Contribution to Our Work:**
- Semantic-preserving code transformations
- Code pattern analysis without compromising functionality
- Traceability concepts for AI-generated code

**How We Used It:**
- Semantic-preserving transformation concepts inform context-aware analysis
- Better understanding of code patterns while preserving meaning
- Context-aware pattern detection without breaking code structure

**Citation:**
```
@article{acw2024,
  title={ACW: AI Code Watermarking for Traceability},
  journal={arXiv preprint arXiv:2402.07518},
  year={2024}
}
```

---

### 7. DroidCollection & DroidDetect: Machine-Generated Code Detection

**Paper:** [arXiv:2507.10583](https://arxiv.org/abs/2507.10583)  
**Year:** 2025

**Contribution to Our Work:**
- Extensive dataset (1M+ code samples across 7 languages)
- Encoder-only detectors with multi-task objectives
- Generalization and adversarial robustness techniques
- 43 coding models analyzed

**How We Used It:**
- Multi-task objective techniques inform our multi-indicator confidence scoring
- Generalization approaches help reduce false positives
- Multi-model analysis validates our pattern detection approach

**Citation:**
```
@article{droid2025,
  title={DroidCollection & DroidDetect: Machine-Generated Code Detection},
  journal={arXiv preprint arXiv:2507.10583},
  year={2025}
}
```

---

### 8. Detecting AI-Generated Code: Current Challenges and Future Directions

**Journal:** Frontiers in Computer Science  
**Paper:** [Frontiers in Computer Science](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2025.1549761/full)  
**Year:** 2025

**Contribution to Our Work:**
- Analysis of challenges in detecting AI-generated code
- Limitations of traditional plagiarism detection tools (MOSS, JPlag)
- Need for specialized approaches for AI-generated code
- Statistical and stylometric analysis techniques

**How We Used It:**
- Validates need for specialized code-focused detection (not just text detection)
- Informs our context-aware approach as a specialized solution
- Statistical analysis techniques inform confidence scoring

---

### 9. Codetector: Zero-Shot Detection Framework

**Paper:** [OpenReview](https://openreview.net/forum?id=ljhqiC4Api)  
**Year:** 2025

**Contribution to Our Work:**
- Zero-shot detection framework for AI-generated code
- Evaluation methodology across multiple LLMs
- Multi-model analysis techniques
- Addresses data leakage issues

**How We Used It:**
- Evaluation methodology informs our pattern testing approach
- Multi-model analysis validates pattern effectiveness
- Zero-shot concepts align with our pattern-based detection

---

### 10. Assessing AI Detectors in Identifying AI-Generated Code: Implications for Education

**Paper:** [ResearchGate](https://www.researchgate.net/publication/380873289_Assessing_AI_Detectors_in_Identifying_AI-Generated_Code_Implications_for_Education)  
**Journal:** International Journal for Educational Integrity  
**Year:** 2023

**Contribution to Our Work:**
- Assessment of AI detector effectiveness for code
- Reduced accuracy of text detectors when applied to code
- Need for specialized code-focused detection methods
- Educational context validation

**How We Used It:**
- Validates need for specialized code detection (not just adapting text detectors)
- Confirms our approach of code-specific pattern detection
- Educational context shows importance of accurate detection

---

### 11. Stylometric Analysis for Code Detection

**Technique:** Stylometric analysis (coding style and structure)  
**Research Area:** Code authorship and AI detection

**Contribution to Our Work:**
- Using coding style patterns to distinguish human vs AI-generated code
- Analysis of code structure and stylistic features
- Pattern-based detection using code characteristics

**How We Used It:**
- Context-aware keyword detection incorporates stylistic analysis
- Code structure analysis in context window
- Pattern co-occurrence (multiple indicators) similar to stylistic features

---

### 12. Statistical Analysis Techniques for AI Code Detection

**Technique:** Statistical analysis (perplexity, code metrics)  
**Research Area:** Quantifiable code aspects for AI detection

**Contribution to Our Work:**
- Language model perplexity analysis
- Stylometric features for detection
- Quantifiable aspects of code for pattern identification
- Multi-indicator statistical approaches

**How We Used It:**
- Confidence scoring uses multi-indicator statistical approach
- Pattern co-occurrence analysis (similar to statistical features)
- Quantifiable confidence scores (0-10 scale)

---

## 🙏 Acknowledgments

We thank the researchers and institutions for their contributions:

- **Salesforce Research** - CodeT5 research and code understanding techniques
- **Microsoft Research** - CodeBERT semantic understanding approach
- **Monash University** - InferCode structural understanding techniques
- **MDPI Mathematics** - Code comment analysis research
- **CodeMirage Research Team** - Comprehensive benchmark for AI-generated code detection
- **ACW Research Team** - Semantic-preserving code transformations
- **DroidCollection/DroidDetect Research Team** - Machine-generated code detection
- **Frontiers in Computer Science** - AI-generated code detection challenges analysis
- **Educational Integrity Research** - AI detector assessment and validation
- **Stylometric Analysis Researchers** - Coding style pattern detection
- **Statistical Analysis Researchers** - Code metrics and perplexity analysis

---

## 📄 License & Usage

This implementation uses techniques inspired by the research papers mentioned above. The code itself is original work, but the concepts and approaches are based on the research.

**Attribution Statement:**
- CodeT5 techniques: Based on Wang et al. (2021) - Salesforce Research
- CodeBERT techniques: Based on Feng et al. (2020) - Microsoft Research
- InferCode techniques: Based on Bui et al. (2020) - Monash University
- Comment analysis: Based on MDPI Mathematics (2024)
- CodeMirage patterns: Based on CodeMirage benchmark (2025)
- ACW concepts: Based on ACW watermarking research (2024)
- DroidCollection techniques: Based on DroidCollection/DroidDetect (2025)
- Detection challenges: Based on Frontiers in Computer Science (2025)
- Stylometric analysis: Based on research on coding style patterns
- Statistical analysis: Based on research on code metrics and perplexity

---

## 🔗 Links

### Core Research Papers:
- [CodeT5 Paper](https://arxiv.org/abs/2109.00859)
- [CodeBERT Paper](https://arxiv.org/abs/2002.08155)
- [InferCode Paper](https://arxiv.org/abs/2012.07023)
- [Code Comment Analysis Paper](https://www.mdpi.com/2227-7390/12/7/1073)

### AI-Generated Code Detection:
- [CodeMirage Benchmark](https://arxiv.org/abs/2506.11059)
- [ACW Watermarking](https://arxiv.org/abs/2402.07518)
- [DroidCollection/DroidDetect](https://arxiv.org/abs/2507.10583)
- [Frontiers: Detecting AI-Generated Code](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2025.1549761/full)
- [Codetector Framework](https://openreview.net/forum?id=ljhqiC4Api)
- [AI Detector Assessment](https://www.researchgate.net/publication/380873289_Assessing_AI_Detectors_in_Identifying_AI-Generated_Code_Implications_for_Education)

---

**Last Updated:** 2025-11-13

