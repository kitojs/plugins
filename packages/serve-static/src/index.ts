import type { Stats } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

import {
  middleware,
  type KitoContext,
  type KitoResponse,
  type SendFileOptions,
} from "kitojs";

export interface ServeStaticOptions {
  /**
   * Root directory path from which static files will be served.
   */
  root: string;

  /**
   * Optional list of file extension fallbacks.
   *
   * If specified, when a requested file is not found, this middleware
   * will try these file extensions, in order.
   *
   * Example: `['html', 'htm']`
   */
  extensions?: string[] | boolean;

  /**
   * If `true` (the default) this middleware will delegate unhandled
   * requests to the next middleware.
   *
   * If `false`, this middleware will abort the middleware stack and
   * return a 404 response.
   */
  fallthrough?: boolean;

  /**
   * If `true` (the default) this middleware will serve `index.html`
   * when a directory is requested.
   *
   * Alternatively, you may specify an array of index filenames, for
   * example `["index.html", "index.htm"]` and these will be tried
   * in the order they're provided.
   */
  index?: string[] | boolean;

  /**
   * If `true` (the default) when a directory is requested *without*
   * a trailing slash, this middleware will redirect to the same
   * path *with* a trailing slash.
   *
   * This works better in browsers when using relative paths.
   *
   * Redirecting to a canonical URL avoids serving the same resource
   * under two different URLs.
   */
  redirect?: boolean;

  /**
   * Optional function to set custom response headers.
   */
  setHeaders?: (
    res: KitoResponse,
    path: string,
    stat: Stats,
  ) => void | Promise<void>;
}

export const serveStatic = (
  options: ServeStaticOptions,
  sendFileOptions?: SendFileOptions,
) =>
  middleware(async (ctx, next) => {
    const { method } = ctx.req;

    const { root, fallthrough = true, redirect = true } = options;

    const indexFiles =
      typeof options.index === "boolean" && options.index === true
        ? ["index.html"]
        : options.index || [];

    const extensions =
      typeof options.extensions === "boolean" && options.extensions === true
        ? ["html", "htm"]
        : options.extensions || [];

    if (method !== "GET" && method !== "HEAD") {
      if (fallthrough) {
        return next();
      }

      return ctx.res
        .status(405)
        .header("Allow", "GET, HEAD")
        .send("Method Not Allowed");
    }

    const isRoot = ctx.req.url === "/";

    const hasTrailingSlash = !isRoot && ctx.req.url.endsWith("/");

    const baseURL = `http${ctx.req.secure ? "s" : ""}://${ctx.req.hostname}/`;

    const url = new URL(ctx.req.url.replace(/\/$/, ""), baseURL);

    const pathname = decodeURIComponent(url.pathname);

    // biome-ignore lint/suspicious/noControlCharactersInRegex: required for input sanitization
    if (/(^|\/)\.+(\/|$)|\\|[\x00-\x1f]/.test(pathname)) {
      return ctx.res.status(400).send("Bad Request");
    }

    const pathsToTry = isRoot ? [] : [path.join(root, pathname)];

    for (const indexFile of indexFiles) {
      pathsToTry.push(path.join(root, pathname, indexFile));
    }

    if (!isRoot && !hasTrailingSlash) {
      for (const extension of extensions) {
        pathsToTry.push(path.join(root, `${pathname}.${extension}`));
      }
    }

    for (const resourcePath of pathsToTry) {
      const stat = await fs.promises.stat(resourcePath).catch(() => null);

      if (stat) {
        if (stat.isDirectory()) {
          if (redirect && !hasTrailingSlash) {
            return ctx.res
              .status(301)
              .header("Location", `${url.pathname}/${url.search}`)
              .send("Moved Permanently");
          }
        } else if (stat.isFile()) {
          if (options.setHeaders) {
            await options.setHeaders(ctx.res, resourcePath, stat);
          }

          return ctx.res.sendFile(resourcePath, sendFileOptions);
        }
      }
    }

    if (fallthrough) {
      return next();
    }

    ctx.res.status(404).send("Not Found");
  });
