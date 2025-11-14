# SkillKit Documentation Structure

## 📁 Organization

### `/docs` (Root - User-Facing Documentation)
**Purpose:** Official SkillKit documentation for end users

**Files:**
- `getting-started.md` - Quick start guide
- `overview.md` - System architecture overview
- `skills.md` - How to create skills
- `security.md` - Security model
- `roadmap.json` - Public roadmap (versioned releases)
- `api/` - API reference documentation

**Audience:** SkillKit users and contributors

---

### `/docs/product` (Product Planning)
**Purpose:** Product strategy, roadmaps, feature planning

**Files:**
- `ROADMAP.md` - Product roadmap and implementation timeline
- `EXECUTION_PLAN.md` - Implementation timeline
- `WORKFLOW_INTEGRATION_STRATEGY.md` - Workflow system strategy
- `EVOLUTION_PLAN.md` - Long-term vision

**Audience:** Product team, stakeholders

---

### `/docs/audit` (Assessments & Analysis)
**Purpose:** Architecture reviews, system analysis, technical assessments

**Subfolders:**
- `architecture/` - System architecture analysis
  - `ECOSYSTEM_ANALYSIS.md` - Competitive analysis
  - `SYSTEM_INTEGRATION.md` - How systems integrate
  - `REALITY_CHECK.md` - Feasibility assessment
  - `RECOMMENDATION.md` - Technical recommendations
  - `ALIGNMENT_COMPLETE.md` - Architecture alignment review

**Audience:** Technical leads, architects

---

### `/docs/dev-conversations` (Development Sessions)
**Purpose:** AI-developer conversation logs, explanations, session summaries

**Files:**
- `EXECUTION_SYSTEM.md` - How execution system works
- `INTELLIGENCE_LAYER.md` - Intelligence layer explanation
- `V1.1_*.md` - Development session logs

**Audience:** Development team, AI context

---

### `/docs/AITracking` (Development Activity Log)
**Purpose:** Daily development activity tracking (per user rules)

**Format:** `AIAction_DD-MM-YYYY_task_name.md`

**Audience:** Project tracking, audit trail

---

### `/docs/SprintStatus` (Sprint Tracking)
**Purpose:** Sprint status and progress (per user rules)

**Format:** `Sprint Status-DD-MM-YYYY.md`

**Audience:** Project management

---

## 🎯 Quick Reference

**Need to:**
- Understand SkillKit? → `/docs/overview.md`
- Get started? → `/docs/getting-started.md`
- See roadmap? → `/docs/product/ROADMAP.md` or `/docs/roadmap.json`
- Review architecture? → `/docs/audit/architecture/`
- Check progress? → `/docs/AITracking/` or `/docs/SprintStatus/`
- Understand a conversation? → `/docs/dev-conversations/`

---

## 📋 Rules

1. **User docs** (`/docs/*.md`) = Clean, professional, stable
2. **Product docs** (`/docs/product/`) = Planning, strategy, roadmaps
3. **Audit docs** (`/docs/audit/`) = Analysis, assessments, reviews
4. **Dev conversations** (`/docs/dev-conversations/`) = Explanations, session logs
5. **Tracking docs** (`/docs/AITracking/`, `/docs/SprintStatus/`) = Activity logs

**Never mix:** User-facing docs with internal planning/conversations!


