<img src="https://github.com/kitojs/.github/blob/1461ad6c9d6eb7f952c3fbd3a6ed3c21dd78eebb/assets/kito-logo.png" width="200px" align="right" />

# Kito Plugins – Contribution Guide

Welcome to the Kito plugin contribution guide! Here you'll learn how to contribute to this repository correctly.

This is a **monorepo**, where each plugin resides in `packages/*`. A standardized structure is used to maintain consistency across all plugins.

You don’t need to contribute here to support the Kito ecosystem—you can create plugins independently. The difference is that the plugins in this repo are **“official” and essential**, under the `@kitojs` scope. Feel free to create your own plugins if you want!

---

## 📚 Guide

### Requirements

Ensure you have the following tools installed. We maintain a single toolchain, so alternatives will not be accepted.

* **Package Manager:** [pnpm](https://pnpm.io)
* **Runtime:** [Node.js](https://nodejs.org)
* **Linter and Formatter:** [Biome](https://biomejs.dev)

---

### Getting Started

1. Fork the repository and clone it locally:

```bash
git clone https://github.com/<user>/plugins # or ssh
cd plugins
```

2. Install dependencies and approve builds if prompted:

```bash
pnpm install
pnpm approve-builds
```

> Optional: Install the [Biome extension](https://biomejs.dev/guides/editors/first-party-extensions/) for your editor to speed up formatting and linting.

---

### Workflow

#### Branches

Branches follow the `type/name` format. The **type** can be:

* `feat`: New feature (e.g., a plugin)
* `fix`: Bug fix
* `chore`: Repository/configuration changes
* `docs`: Documentation updates
* `style`: Code formatting or lint fixes

The **name** should describe what the branch does.

#### Pull Requests

When your work is ready, open a pull request to merge into the `dev` branch. All development happens there before merging into `main`.

> Pull requests directly to `main` will be rejected.

---

### Creating a Plugin

Plugins must follow a **basic structure**. From the repo root, run:

```bash
pnpm new:plugin
```

Follow the interactive menu. Once generated, enter the plugin folder and run:

```bash
cd packages/plugin-name

pnpm install
pnpm approve-builds # if prompted

pnpm build
```

You may modify the folder structure, but keep the **minimum base** generated.

Don’t forget to add a **readme.md** consistent with other plugins. Review existing plugins for reference.

---

## 🔔 Reminders

* **Sync regularly:** Fetch the latest `dev` branch before starting work to avoid conflicts.
* **Respect formatting:** Run `pnpm fmt:fix` and `pnpm lint:fix` regularly and before committing.

> Alternatively, use the [Biome extension](https://biomejs.dev/guides/editors/first-party-extensions/) for automatic formatting on save.

---

## ❤️ Thanks

Thank you for contributing to the Kito ecosystem! Your support is highly appreciated.