import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'SkillKit',
  tagline: 'Self-customizing workflow orchestration for AI-assisted development',
  favicon: 'img/favicon.ico',

  // Production URL
  url: 'https://skillkit.dev',
  baseUrl: '/',

  // GitHub pages deployment
  organizationName: 'trinity-os',
  projectName: 'skillkit',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/trinity-os/skillkit/tree/main/',
          routeBasePath: '/', // Serve docs at root
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'SkillKit',
      logo: {
        alt: 'SkillKit Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/trinity-os/skillkit',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started',
            },
            {
              label: 'Workflows',
              to: '/workflows',
            },
            {
              label: 'Skills',
              to: '/skills',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/trinity-os/skillkit/discussions',
            },
            {
              label: 'GitHub Issues',
              href: 'https://github.com/trinity-os/skillkit/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/trinity-os/skillkit',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@trinity-os/skillkit',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Trinity OS. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

