#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",

  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const ok = (s: string) => `${c.green}✔${c.reset} ${s}`;
const err = (s: string) => `${c.red}✖${c.reset} ${s}`;
const info = (s: string) => `${c.cyan}➜${c.reset} ${s}`;
const title = (s: string) => `${c.bold}${s}${c.reset}`;
const dim = (s: string) => `${c.dim}${s}${c.reset}`;

const rl = createInterface({ input: stdin, output: stdout });

async function ask(question: string, def?: string) {
  const q = def
    ? `${c.blue}?${c.reset} ${question} ${dim(`(${def})`)}: `
    : `${c.blue}?${c.reset} ${question}: `;

  const answer = (await rl.question(q)).trim();
  return answer || def || "";
}

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log();
  console.log(title("🧩 Create new Kito plugin"));
  console.log(dim("Interactive plugin generator\n"));

  const name = await ask("Plugin name (folder & package name)");
  if (!name) {
    console.error(err("Plugin name is required"));
    process.exit(1);
  }

  const scope = await ask("Package scope", "@kitojs");
  const description = await ask("Description", "Kito plugin");
  const author = await ask("Author", "");
  const license = await ask("License", "MIT");

  const packageName = `${scope}/${name}`;
  const pkgDir = join("packages", name);

  if (await exists(pkgDir)) {
    console.error(err(`packages/${name} already exists`));
    process.exit(1);
  }

  console.log();
  console.log(info(`Creating ${pkgDir}`));
  console.log(dim("────────────────────────────────"));

  await mkdir(join(pkgDir, "src"), { recursive: true });
  await mkdir(join(pkgDir, "tests"), { recursive: true });
  await mkdir(join(pkgDir, "examples"), { recursive: true });

  // package.json
  await writeFile(
    join(pkgDir, "package.json"),
    JSON.stringify(
      {
        name: packageName,
        version: "0.1.0",
        description,
        type: "module",
        main: "dist/index.js",
        types: "dist/index.d.ts",
        exports: {
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
          },
        },
        files: ["dist", "readme.md", "package.json"],
        scripts: {
          build: "tsdown",
          dev: "tsdown --watch",
          test: "vitest",
          "ex:run": "pnpm build && tsx",
        },
        keywords: ["kito", "plugin"],
        author,
        license,
        dependencies: {
          kitojs: "latest",
        },
        devDependencies: {
          tsdown: "latest",
          typescript: "latest",
          tsx: "latest",
          vitest: "latest",
        },
      },
      null,
      2,
    ),
  );

  // tsconfig.json
  await writeFile(
    join(pkgDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          declaration: true,
          outDir: "dist",
          skipLibCheck: true,
        },
        include: ["src"],
      },
      null,
      2,
    ),
  );

  // tsdown.config.ts
  await writeFile(
    join(pkgDir, "tsdown.config.ts"),
    `import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  outDir: "dist",
  minify: true,
  dts: true,
  tsconfig: "tsconfig.json",
});
`,
  );

  // vitest.config.ts
  await writeFile(
    join(pkgDir, "vitest.config.ts"),
    `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
`,
  );

  // src/index.ts
  await writeFile(
    join(pkgDir, "src/index.ts"),
    `import { middleware } from "kitojs";

export interface ${pascal(name)}Options {}

export const ${camel(name)} = (_options?: ${pascal(name)}Options) =>
  middleware(async (ctx, next) => {
    // plugin logic here
    await next();
  });
`,
  );

  // examples/basic.ts
  await writeFile(
    join(pkgDir, "examples/basic.ts"),
    `import { server } from "kitojs";
import { ${camel(name)} } from "../dist/index.mjs"; // plugin

const app = server();
app.use(${camel(name)}()); // global!

// per-route!
app.get("/", ${camel(name)}(), ({ res }) => res.send("hello world!"));

app.listen(3000, () => console.log("basic example listening on localhost:3000"));
`,
  );

  // .gitignore
  await writeFile(
    join(pkgDir, ".gitignore"),
    `node_modules
dist
`,
  );

  // .npmignore
  await writeFile(
    join(pkgDir, ".npmignore"),
    `examples
node_modules
src
tests
.gitignore
tsconfig.json
tsdown.config.ts
vitest.config.ts
  `,
  );

  // readme.md
  await writeFile(
    join(pkgDir, "readme.md"),
    `# ${packageName}

${description}

## Installation

\`\`\`bash
pnpm add ${packageName}
\`\`\`

## Usage

\`\`\`ts
import { ${camel(name)} } from "${packageName}";

app.use(${camel(name)}());
\`\`\`
`,
  );

  console.log();
  console.log(ok("Plugin created successfully"));
  console.log();
  console.log(title("Next steps"));
  console.log(dim(`  cd ${pkgDir}`));
  console.log(dim("  pnpm install"));
  console.log(dim("  pnpm build"));
  console.log();

  rl.close();
}

function camel(name: string) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function pascal(name: string) {
  const c = camel(name);
  return c.charAt(0).toUpperCase() + c.slice(1);
}

main().catch((e) => {
  console.error(err("Unexpected error"));
  console.error(e);
  process.exit(1);
});
