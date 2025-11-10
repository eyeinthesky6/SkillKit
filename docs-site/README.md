# SkillKit Documentation Site

This is the Docusaurus documentation site for SkillKit.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm start

# Build for production
pnpm build

# Serve production build locally
pnpm serve
```

## From Project Root

```bash
# Start docs dev server
pnpm docs:dev

# Build docs
pnpm docs:build

# Serve built docs
pnpm docs:serve
```

## Structure

```
docs-site/
├── docs/              # Documentation markdown files
│   ├── intro.md      # Homepage
│   ├── getting-started.md
│   ├── workflows/    # Workflow documentation
│   ├── skills/       # Skills documentation
│   └── cli/          # CLI command reference
├── static/           # Static assets (images, favicons)
├── src/             # React components and custom CSS
├── docusaurus.config.ts  # Docusaurus configuration
└── sidebars.ts      # Sidebar navigation structure
```

## Deployment

The site can be deployed to:
- **GitHub Pages**: `pnpm deploy` (requires `gh-pages` package)
- **Vercel**: Connect GitHub repo, auto-deploys
- **Netlify**: Connect GitHub repo, auto-deploys
- Any static hosting service

## Documentation Sync

Documentation files are synced from `../docs/`. To update:

1. Edit files in `../docs/`
2. Copy to `docs-site/docs/` (or use symlinks)
3. Rebuild site: `pnpm build`

## Customization

- **Theme**: Edit `src/css/custom.css`
- **Navigation**: Edit `sidebars.ts`
- **Config**: Edit `docusaurus.config.ts`
- **Logo**: Replace `static/img/logo.svg`
