import process from "node:process";

import type { KitoRequest, KitoResponse } from "kitojs";
import { middleware } from "kitojs";

export interface LogInfo {
  method: string;
  url: string;
  status: number;
  duration: number;
  ip: string;
  userAgent?: string;
  contentLength?: string;
}

export interface LoggerOptions {
  format?: "json" | "text" | ((info: LogInfo) => string);
  stream?: { write: (str: string) => void };
  skip?: (req: KitoRequest, res: KitoResponse) => boolean;
}

const color = {
  green: (str: string) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str: string) => `\x1b[33m${str}\x1b[0m`,
  red: (str: string) => `\x1b[31m${str}\x1b[0m`,
  cyan: (str: string) => `\x1b[36m${str}\x1b[0m`,
  gray: (str: string) => `\x1b[90m${str}\x1b[0m`,
};

const statusColor = (status: number) => {
  if (status >= 500) return color.red(status.toString());
  if (status >= 400) return color.yellow(status.toString());
  if (status >= 300) return color.cyan(status.toString());
  if (status >= 200) return color.green(status.toString());

  return status.toString();
};

const defaultTextFormatter = (info: LogInfo) => {
  const method = info.method;
  const url = info.url;
  const status = statusColor(info.status);
  const duration = color.gray(`${info.duration.toFixed(2)}ms`);

  return `${method} ${url} ${status} - ${duration}\n`;
};

const defaultJsonFormatter = (info: LogInfo) => {
  return `${JSON.stringify(info)}\n`;
};

export const logger = (options: LoggerOptions = {}) => {
  const { format = "text", stream = process.stdout, skip } = options;

  const formatter =
    typeof format === "function"
      ? format
      : format === "json"
        ? defaultJsonFormatter
        : defaultTextFormatter;

  return middleware(async (ctx, next) => {
    const { req, res } = ctx;

    if (skip?.(req, res)) {
      return next();
    }

    const start = performance.now();
    let status = 200;

    const originalStatus = res.status;
    res.status = (code: number) => {
      status = code;
      return originalStatus.call(res, code);
    };

    const originalSendStatus = res.sendStatus;
    res.sendStatus = (code: number) => {
      status = code;
      originalSendStatus.call(res, code);
    };

    const originalRedirect = res.redirect;
    res.redirect = (url: string, code?: number) => {
      status = code || 302;
      originalRedirect.call(res, url, code);
    };

    try {
      await next();
    } finally {
      const duration = performance.now() - start;

      // @ts-expect-error
      if (res.state?.status) {
        // @ts-expect-error
        status = res.state.status;
      }

      const info: LogInfo = {
        method: req.method,
        url: req.url,
        status,
        duration,
        ip: req.ip,
        userAgent: req.header("user-agent"),
        contentLength: req.header("content-length"),
      };

      stream.write(formatter(info));
    }
  });
};
