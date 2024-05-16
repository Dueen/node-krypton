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

const publicPath = join(import.meta.dirname, "public");
const indexFilePath = join(publicPath, "index.html");
const partialPath = join(publicPath, "partial.html");
const faviconPath = join(publicPath, "favicon.ico");

const indexHtml = await readFile(indexFilePath);
const partialHtml = await readFile(partialPath);
const favicon = await readFile(faviconPath);

server.on("request", async (req, res) => {
  console.log(
    styleText(["gray"], `Request received for ${req.method} ${req.url}`)
  );
  if (req.url === "/favicon.ico") return res.end(favicon);

  res.write(indexHtml);

  if (!values.stream) {
    return res.write(partialHtml).setHeader("Content-Type", "text/html").end();
  }

  const stream = createReadStream(partialPath, { highWaterMark: 85 });

  for await (const chunk of stream) {
    await setTimeout(270);
    res.write(chunk);
  }

  return res.end();
});

const port = 3636;

server.listen({ port });

console.log(
  styleText(["green", "underline"], `\nServer listening on port ${port}\n`)
);
