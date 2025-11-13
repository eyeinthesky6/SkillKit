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

## 🙏 Acknowledgments

We thank the researchers and institutions for their contributions:

- **Salesforce Research** - CodeT5 research and code understanding techniques
- **Microsoft Research** - CodeBERT semantic understanding approach
- **Monash University** - InferCode structural understanding techniques
- **MDPI Mathematics** - Code comment analysis research

---

## 📄 License & Usage

This implementation uses techniques inspired by the research papers mentioned above. The code itself is original work, but the concepts and approaches are based on the research.

**Attribution Statement:**
- CodeT5 techniques: Based on Wang et al. (2021) - Salesforce Research
- CodeBERT techniques: Based on Feng et al. (2020) - Microsoft Research
- InferCode techniques: Based on Bui et al. (2020) - Monash University
- Comment analysis: Based on MDPI Mathematics (2024)

---

## 🔗 Links

- [CodeT5 Paper](https://arxiv.org/abs/2109.00859)
- [CodeBERT Paper](https://arxiv.org/abs/2002.08155)
- [InferCode Paper](https://arxiv.org/abs/2012.07023)
- [Code Comment Analysis Paper](https://www.mdpi.com/2227-7390/12/7/1073)

---

**Last Updated:** 2025-11-13

