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

await app.listen({ port: PORT });

console.log(`Server listening on port ${PORT}`);
