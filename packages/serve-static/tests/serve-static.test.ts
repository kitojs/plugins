import path from "node:path";

import { test, expect } from "vitest";

import { server as createServer } from "kitojs";
import { serveStatic } from "../src";

const host = "0.0.0.0";
const port = 8088;

const root = path.resolve(import.meta.dirname, "./resources");

test("Can serve index.html from root", async () => {
  const app = createServer();

  app.use(serveStatic({ root }));

  const server = await app.listen({ host, port }, () => {
    console.log("this runs");
  });

  console.log(`this never runs??`);
});
