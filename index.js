import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { parseArgs, styleText } from "node:util";

const argsOptions = {
  port: {
    type: "string",
    default: "3000",
    short: "p",
  },
};

const { values } = parseArgs({
  args: process.args,
  options: argsOptions,
  allowPositionals: true,
});

const PORT = Number(values.port);
const server = createServer();

const indexFilePath = join(import.meta.dirname, "public", "index.html");
const indexHtml = await readFile(indexFilePath);

server.on("request", async (_req, res) => {
  const partialsPath = join(import.meta.dirname, "public", "partial.html");
  const stream = createReadStream(partialsPath, { highWaterMark: 85 });

  res.setHeader("Content-Type", "text/html");
  res.write(indexHtml);

  for await (const chunk of stream) {
    await setTimeout(270);
    res.write(chunk);
  }

  return res.end();
});

server.listen({ port: PORT });

console.log(
  styleText(["green", "underline"], `Server listening on port ${PORT}`)
);
