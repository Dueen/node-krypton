"use strict";

import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { parseArgs } from "node:util";
import Logger from "./logger.js";

const logger = new Logger(process.env.LOG_LEVEL);

const argsOptions = { stream: { type: "boolean", default: false } };

const { values } = parseArgs({
  args: process.args,
  options: argsOptions,
  allowPositionals: true,
});

logger.debug("Server initialized with the following options");
logger.debug(`- stream: ${values.stream}\n`);

const publicPath = join(import.meta.dirname, "public");
const indexFilePath = join(publicPath, "index.html");
const partialPath = join(publicPath, "partial.html");
const faviconPath = join(publicPath, "favicon.ico");

const indexHtml = await readFile(indexFilePath);
const partialHtml = await readFile(partialPath);
const favicon = await readFile(faviconPath);

const server = createServer(async (req, res) => {
  logger.trace(`Request received for ${req.method} ${req.url}`);

  if (req.url === "/favicon.ico") return res.end(favicon);

  res.setHeader("Content-Type", "text/html");
  res.write(indexHtml);

  if (!values.stream) return res.end(partialHtml);

  const stream = createReadStream(partialPath, { highWaterMark: 85 });

  for await (const chunk of stream) {
    await setTimeout(270);
    res.write(chunk);
  }

  return res.end();
});

const port = Number(process.env.PORT ?? 3636);

server.listen({ port });

logger.info(`Server running at http://127.0.0.1:${port}`);
logger.info("Press Ctrl+C to stop the server\n");
