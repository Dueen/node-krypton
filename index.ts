import Fastify from "fastify";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { parseArgs, styleText } from "node:util";

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
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

app.get("/", () => {
  return { hello: "world" };
});

// @ts-expect-error
const indexFilePath = join(import.meta.dirname, "..", "public", "index.html");
// @ts-expect-error(1309) - We can use `await` in the top-level of a module here because of `--experimental-detect-module`
const indexHtml = await readFile(indexFilePath);

app.get("/streams", async function (_req, reply) {
  // @ts-expect-error
  const filePath = join(import.meta.dirname, "..", "public", "partial.html");
  const stream = createReadStream(filePath, {
    highWaterMark: 85,
  });

  reply.type("text/html");
  reply.raw.write(indexHtml);

  for await (const chunk of stream) {
    await setTimeout(270);
    reply.raw.write(chunk);
  }

  reply.raw.end();

  return reply;
});

// @ts-expect-error(1309) - We can use `await` in the top-level of a module here because of `--experimental-detect-module`
await app.listen({ port: PORT });

console.log(
  // @ts-expect-error(2345) - `styleText` also accepts an array of strings
  styleText(["green", "underline"], `Server listening on port ${PORT}`)
);
