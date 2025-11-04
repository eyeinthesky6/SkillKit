# SkillKit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/trinity-os/skillkit/actions/workflows/ci.yml/badge.svg)](https://github.com/trinity-os/skillkit/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40trinity-os%2Fskillkit.svg)](https://badge.fury.io/js/%40trinity-os%2Fskillkit)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Discussions](https://img.shields.io/github/discussions/trinity-os/skillkit)](https://github.com/trinity-os/skillkit/discussions)
[![Docs](https://img.shields.io/badge/docs-docusaurus-blue)](https://eyeinthesky6.github.io/SkillKit/)
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/0000/badge)](https://bestpractices.coreinfrastructure.org/projects/0000)

A router-first, sandboxed skill runner with strong typing and audit trails. SkillKit enables developers to build, share, and run modular skills in a secure and scalable way.

## Features

- 🛡️ **Sandboxed Execution**: Run skills in isolated environments
- 🧩 **Modular Architecture**: Easily add or remove skills
- 🔍 **Type Safety**: Built with TypeScript for better developer experience
- 📊 **Audit Trails**: Track skill execution and changes
- 🚀 **High Performance**: Optimized for speed and efficiency

## Installation

```bash
# Using npm
npm install @trinity-os/skillkit

# Using yarn
yarn add @trinity-os/skillkit

# Using pnpm
pnpm add @trinity-os/skillkit
```

## Quick Start

```typescript
import { SkillRunner } from '@trinity-os/skillkit';

// Initialize the skill runner
const runner = new SkillRunner();

// Load skills
await runner.loadSkills();

// Execute a skill
const result = await runner.execute('example-skill', { input: 'Hello' });
console.log(result);
```

## Documentation

For full documentation, please visit [our documentation site](https://eyeinthesky6.github.io/SkillKit/).

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api.md)
- [Creating Skills](docs/creating-skills.md)
- [Security](docs/security.md)
- [Contributing](CONTRIBUTING.md)

## Community

- [GitHub Discussions](https://github.com/trinity-os/skillkit/discussions) - Ask questions and share ideas
- [Issues](https://github.com/trinity-os/skillkit/issues) - Report bugs or request features
- [Contributing Guide](CONTRIBUTING.md) - Contribute to the project

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all our contributors who have helped make this project better.
- Special thanks to our early adopters and beta testers.

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://github.com/sponsors/jai-thakur)]

## Contributors ✨

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/jai-thakur"><img src="https://avatars.githubusercontent.com/u/your-username?v=4" width="100px;" alt="Jai Thakur"/><br /><sub><b>Jai Thakur</b></sub></a><br />💻 🚇 🐛</td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
