import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'overview',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'Workflows',
      items: [
        'workflows/introduction',
        'workflows/customization',
        'workflows/decision-tree',
      ],
    },
    {
      type: 'category',
      label: 'Skills',
      items: [
        'skills/introduction',
        'skills/creating-skills',
        'skills/marketplace',
      ],
    },
    {
      type: 'category',
      label: 'CLI Commands',
      items: [
        'cli/init',
        'cli/audit',
        'cli/skills',
        'cli/workflows',
      ],
    },
    {
      type: 'doc',
      id: 'security',
      label: 'Security',
    },
    {
      type: 'doc',
      id: 'roadmap',
      label: 'Roadmap',
    },
  ],
};

export default sidebars;

