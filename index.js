import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { parseArgs, styleText } from "node:util";

class Logger {
  #levels = {
    fatal: 5,
    error: 4,
    warn: 3,
    info: 2,
    debug: 1,
    trace: 0,
  };
  #logLevel = this.#levels.info;

  constructor(level) {
    this.#logLevel = this.#levels[level];
  }

  fatal(message) {
    if (this.#levels.fatal > this.#logLevel) return;
    console.log(styleText(["red", "bold"], message));
  }

  error(message) {
    if (this.#levels.error > this.#logLevel) return;
    console.log(styleText(["red"], message));
  }

  warn(message) {
    if (this.#levels.warn > this.#logLevel) return;
    console.log(styleText(["yellow"], message));
  }

  info(message) {
    if (this.#levels.info > this.#logLevel) return;
    console.log(styleText(["blue"], message));
  }

  debug(message) {
    if (this.#levels.debug > this.#logLevel) return;
    console.log(styleText(["gray"], message));
  }

  trace(message) {
    if (this.#levels.trace > this.#logLevel) return;
    console.log(styleText(["gray", "dim"], message));
  }
}

const logger = new Logger(process.env.LOG_LEVEL ?? "info");

const argsOptions = { stream: { type: "boolean", default: false } };

const { values } = parseArgs({
  args: process.args,
  options: argsOptions,
  allowPositionals: true,
});

logger.debug("Server initialized with the following options");
logger.debug(`- stream: ${values.stream}\n`);

const server = createServer();

const publicPath = join(import.meta.dirname, "public");
const indexFilePath = join(publicPath, "index.html");
const partialPath = join(publicPath, "partial.html");
const faviconPath = join(publicPath, "favicon.ico");

const indexHtml = await readFile(indexFilePath);
const partialHtml = await readFile(partialPath);
const favicon = await readFile(faviconPath);

server.on("request", async (req, res) => {
  logger.trace(`Request received for ${req.method} ${req.url}`);

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

const port = Number(process.env.PORT ?? 3636);

server.listen({ port });

logger.info(`Server running at http://localhost:${port}`);
logger.info("Press Ctrl+C to stop the server\n");
