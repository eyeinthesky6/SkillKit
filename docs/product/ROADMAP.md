# SkillKit Product Roadmap

**Version:** 2.0  
**Last Updated:** November 5, 2025  
**Status:** ✅ VALUE-PRIORITIZED

---

## 🎯 Vision

**SkillKit = OpenSkills++ with execution, workflows, and intelligence**

Install skills → Execute them → Orchestrate workflows → Adapt to environments

---

## 📅 4-Week Launch Plan

### Week 1: Package Management (Nov 5-11, 2025)

**Goal:** OpenSkills compatibility

**Commands to ship:**
```bash
tsk install anthropics/skills  # Interactive TUI
tsk list                        # Show installed
tsk sync                        # Generate AGENTS.md
tsk manage                      # Remove skills
```

---

### Week 2: Execution (Nov 12-18, 2025)

**Goal:** Make skills executable

**Commands to ship:**
```bash
tsk run pdf extract --input doc.pdf
tsk run xlsx create --json
```

---

### Week 3: Workflows (Nov 19-25, 2025)

**Goal:** Multi-step orchestration

**Commands to ship:**
```bash
tsk init --cursor              # Generate workflows
@BEGIN_SESSION.md              # In Cursor IDE
```

---

### Week 4: Intelligence (Nov 26-Dec 2, 2025)

**Goal:** Environment adaptation

**Commands to ship:**
```bash
tsk diagnose                   # Auto-detect and run
tsk exec quality-gate          # Adapt to project
```

---

See [BUILD_ORDER_CORRECTED.md](../BUILD_ORDER_CORRECTED.md) for detailed implementation plan.

