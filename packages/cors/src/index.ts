import { middleware } from "kitojs";

export interface CorsOptions {
  origin?: string | string[] | ((origin: string) => boolean | Promise<boolean>);
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  optionsSuccessStatus?: number;
}

export const cors = (options: CorsOptions = {}) =>
  middleware(async (ctx, next) => {
    const { req, res } = ctx;
    const origin = req.header("origin");

    const defaults = {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus: 204,
    };

    const opts = { ...defaults, ...options };

    if (!origin) return next();

    let allowOrigin = "";
    if (opts.credentials && opts.origin === "*") {
      allowOrigin = origin;
    } else if (typeof opts.origin === "string") {
      allowOrigin = opts.origin;
    } else if (Array.isArray(opts.origin)) {
      if (opts.origin.includes(origin)) allowOrigin = origin;
    } else if (typeof opts.origin === "function") {
      if (await opts.origin(origin)) allowOrigin = origin;
    }

    if (allowOrigin) res.header("access-control-allow-origin", allowOrigin);
    if (opts.credentials)
      res.header("access-control-allow-credentials", "true");

    if (opts.exposedHeaders) {
      const exposed = Array.isArray(opts.exposedHeaders)
        ? opts.exposedHeaders.join(",")
        : opts.exposedHeaders;

      res.header("access-control-expose-headers", exposed);
    }

    if (req.method === "OPTIONS") {
      const methods = Array.isArray(opts.methods)
        ? opts.methods.join(",")
        : opts.methods;

      res.header("access-control-allow-methods", methods);

      if (opts.allowedHeaders) {
        const headers = Array.isArray(opts.allowedHeaders)
          ? opts.allowedHeaders.join(",")
          : opts.allowedHeaders;

        res.header("access-control-allow-headers", headers);
      } else {
        const requestHeaders = req.header("access-control-request-headers");
        if (requestHeaders)
          res.header("access-control-allow-headers", requestHeaders);
      }

      if (opts.maxAge)
        res.header("access-control-max-age", opts.maxAge.toString());

      res.header("content-length", "0");
      res.status(opts.optionsSuccessStatus);
      res.end();

      return;
    }

    await next();
  });
