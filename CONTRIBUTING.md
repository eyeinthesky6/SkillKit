# Contributing to SkillKit

Thank you for your interest in contributing to SkillKit! We appreciate your time and effort in helping us improve this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** the project to your own machine
3. **Commit** changes to your own branch
4. **Push** your work back up to your fork
5. Submit a **Pull Request** so that we can review your changes

## Development Setup

1. Ensure you have the following installed:
   - Node.js (v18 or higher)
   - pnpm (v8 or higher)
   - Git

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the project:

   ```bash
   pnpm build
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

## Making Changes

1. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

2. Make your changes following the [code style](#code-style) guidelines.

3. Add tests for your changes.

4. Update documentation as needed.

5. Run the linter and tests:
   ```bash
   pnpm lint
   pnpm test
   ```

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations, and container parameters.
3. Increase the version numbers in any example files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Reporting Bugs

Bugs are tracked as [GitHub issues](https://github.com/eyeinthesky6/SkillKit/issues).

When reporting a bug, please include the following:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (OS, Node.js version, etc.)

## Feature Requests

Feature requests are welcome! Before submitting a feature request, please check if a similar feature has already been requested. When creating a feature request:

1. Use a clear and descriptive title
2. Describe the problem you're trying to solve
3. Explain why this feature would be useful to others
4. Include any alternative solutions you've considered

## Code Style

- Use TypeScript with strict mode enabled
- Follow the existing code style in the project
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Write tests for new features and bug fixes

## Testing

We use Vitest for testing. To run tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Documentation

Good documentation is crucial for any open-source project. When making changes:

1. Update relevant documentation
2. Add comments for public APIs
3. Include examples when adding new features
4. Keep the README up to date

## Community

Join our community to ask questions and discuss ideas:

- [GitHub Discussions](https://github.com/eyeinthesky6/SkillKit/discussions)
- [Discord Server](#) (coming soon)

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
