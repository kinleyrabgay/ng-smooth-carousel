# Contributing to nsc

Thank you for your interest in contributing to nsc! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Submitting Changes](#submitting-changes)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork to your local machine
3. Set up the development environment (see [Development Setup](#development-setup))
4. Create a new branch for your changes
5. Make your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or yarn
- Angular CLI

### Installation

1. Clone your forked repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nsc.git
   cd nsc
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Build the library:
   ```bash
   ng build nsc
   ```

4. Run the demo application:
   ```bash
   ng serve angular14-demo
   ```

## Submitting Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. Make your changes and commit them with clear, descriptive commit messages:
   ```bash
   git commit -m "Add feature: description of your feature"
   # or
   git commit -m "Fix: issue you've fixed"
   ```

3. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request against the `main` branch of the original repository

## Pull Request Guidelines

- Ensure your PR addresses a specific issue or adds a specific feature
- Include a clear description of the changes
- Include screenshots or GIFs for UI changes if applicable
- Make sure your code passes all tests
- Keep PRs focused on a single concern
- Follow the coding standards used throughout the project

## Coding Guidelines

- Follow Angular style guidelines
- Use TypeScript features appropriately
- Keep components and services focused on a single responsibility
- Write self-documenting code with clear variable and function names
- Add comments for complex logic
- Ensure accessibility standards are maintained

## Documentation

- Update the README.md if your changes require it
- Document new features or changes in behavior
- Update JSDoc comments for public API methods
- Consider adding examples for new features

## Issue Reporting

When reporting issues, please include:

1. A clear, descriptive title
2. A detailed description of the issue
3. Steps to reproduce the issue
4. Expected behavior
5. Actual behavior
6. Screenshots if applicable
7. Environment information:
   - Browser and version
   - Angular version
   - nsc version

## Feature Requests

For feature requests, please provide:

1. A clear, descriptive title
2. A detailed description of the proposed feature
3. Any relevant examples, mockups, or diagrams
4. Use cases for the feature

## License

By contributing to nsc, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to nsc! Your efforts help make this project better for everyone. 