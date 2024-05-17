"use strict";

import { debuglog, styleText } from "node:util";

export default class Logger {
  #levels = {
    fatal: 5,
    error: 4,
    warn: 3,
    info: 2,
    debug: 1,
    trace: 0,
  };
  #logLevel;
  #log = debuglog("krypton");

  constructor(level) {
    this.#logLevel = this.#levels[level] ?? this.#levels.info;
  }

  fatal(msg, ...args) {
    if (this.#levels.fatal > this.#logLevel) return;
    this.#log(styleText(["red", "bold"], msg), ...args);
  }

  error(msg, ...args) {
    if (this.#levels.error > this.#logLevel) return;
    this.#log(styleText(["red"], msg), ...args);
  }

  warn(msg, ...args) {
    if (this.#levels.warn > this.#logLevel) return;
    this.#log(styleText(["yellow"], msg), ...args);
  }

  info(msg, ...args) {
    if (this.#levels.info > this.#logLevel) return;
    this.#log(styleText(["blue"], msg), ...args);
  }

  debug(msg, ...args) {
    if (this.#levels.debug > this.#logLevel) return;
    this.#log(styleText(["gray"], msg), ...args);
  }

  trace(msg, ...args) {
    if (this.#levels.trace > this.#logLevel) return;
    this.#log(styleText(["gray", "dim"], msg), ...args);
  }
}
