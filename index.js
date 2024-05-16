import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { parseArgs, styleText } from "node:util";

const argsOptions = { stream: { type: "boolean", default: false } };

const { values } = parseArgs({
  args: process.args,
  options: argsOptions,
  allowPositionals: true,
});

console.log(
  styleText(["blue", "bold"], "Starting server with the following options")
);
console.log("\n- stream:", values.stream);

const server = createServer();

const indexFilePath = join(import.meta.dirname, "public", "index.html");
const partialsPath = join(import.meta.dirname, "public", "partial.html");

server.on("request", async (_req, res) => {
  const indexHtml = await readFile(indexFilePath);
  res.write(indexHtml);

  if (values.stream) {
    const stream = createReadStream(partialsPath, { highWaterMark: 85 });

    for await (const chunk of stream) {
      await setTimeout(270);
      res.write(chunk);
    }
  } else {
    const partialHtml = await readFile(partialsPath);
    res.write(partialHtml);
  }
  return res.setHeader("Content-Type", "text/html").end();
});

const port = 3636;

server.listen({ port });

console.log(
  styleText(["green", "underline"], `\nServer listening on port ${port}`)
);
