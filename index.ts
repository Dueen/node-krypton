import Fastify from "fastify";
import { parseArgs } from "node:util";

import type { ParseArgsConfig } from "node:util";
declare const process: typeof globalThis.process & {
  args: string[];
};

const argsOptions = {
  port: { type: "string", default: "3000", short: "p" },
} satisfies ParseArgsConfig["options"];

const { values } = parseArgs({
  args: process.args,
  options: argsOptions,
  allowPositionals: true,
});

const PORT = Number(values.port);

const app = Fastify({
  logger: false,
});

app.get("/", () => {
  return { hello: "world" };
});

// @ts-expect-error(1309) - We can use `await` in the top-level of a module here because of `--experimental-detect-module`
await app.listen({ port: PORT });

console.log(`Server listening on port ${PORT}`);
