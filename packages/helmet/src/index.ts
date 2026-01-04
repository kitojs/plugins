import { middleware } from "kitojs";

export interface HelmetOptions {
  contentSecurityPolicy?: boolean | Record<string, string[] | string>;
  crossOriginEmbedderPolicy?:
    | boolean
    | { policy: "require-corp" | "credentialless" | "unsafe-none" };
  crossOriginOpenerPolicy?:
    | boolean
    | { policy: "same-origin" | "same-origin-allow-popups" | "unsafe-none" };
  crossOriginResourcePolicy?:
    | boolean
    | { policy: "same-origin" | "same-site" | "cross-origin" };
  dnsPrefetchControl?: boolean | { allow: boolean };
  frameguard?: boolean | { action: "deny" | "sameorigin" };
  hsts?:
    | boolean
    | { maxAge?: number; includeSubDomains?: boolean; preload?: boolean };
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?:
    | boolean
    | { permittedPolicies: "none" | "master-only" | "by-content-type" | "all" };
  referrerPolicy?: boolean | { policy: string | string[] };
  xssFilter?: boolean;
}

export const helmet = (options: HelmetOptions = {}) =>
  middleware(async (ctx, next) => {
    const { res } = ctx;

    // Content-Security-Policy
    if (options.contentSecurityPolicy !== false) {
      if (
        options.contentSecurityPolicy === true ||
        options.contentSecurityPolicy === undefined
      ) {
        res.header(
          "content-security-policy",
          "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests",
        );
      } else if (typeof options.contentSecurityPolicy === "object") {
        const directives = Object.entries(options.contentSecurityPolicy)
          .map(([key, value]) => {
            const val = Array.isArray(value) ? value.join(" ") : value;
            return `${key} ${val}`;
          })
          .join("; ");
        res.header("content-security-policy", directives);
      }
    }

    // Cross-Origin-Embedder-Policy
    if (options.crossOriginEmbedderPolicy !== false) {
      const policy =
        typeof options.crossOriginEmbedderPolicy === "object"
          ? options.crossOriginEmbedderPolicy.policy
          : "require-corp";
      res.header("cross-origin-embedder-policy", policy);
    }

    // Cross-Origin-Opener-Policy
    if (options.crossOriginOpenerPolicy !== false) {
      const policy =
        typeof options.crossOriginOpenerPolicy === "object"
          ? options.crossOriginOpenerPolicy.policy
          : "same-origin";
      res.header("cross-origin-opener-policy", policy);
    }

    // Cross-Origin-Resource-Policy
    if (options.crossOriginResourcePolicy !== false) {
      const policy =
        typeof options.crossOriginResourcePolicy === "object"
          ? options.crossOriginResourcePolicy.policy
          : "same-origin";
      res.header("cross-origin-resource-policy", policy);
    }

    // X-DNS-Prefetch-Control
    if (options.dnsPrefetchControl !== false) {
      const allow =
        typeof options.dnsPrefetchControl === "object"
          ? options.dnsPrefetchControl.allow
          : false;
      res.header("x-dns-prefetch-control", allow ? "on" : "off");
    }

    // X-Frame-Options
    if (options.frameguard !== false) {
      const action =
        typeof options.frameguard === "object"
          ? options.frameguard.action
          : "sameorigin";
      res.header("x-frame-options", action.toUpperCase());
    }

    // Strict-Transport-Security
    if (options.hsts !== false) {
      const opts =
        typeof options.hsts === "object"
          ? options.hsts
          : { maxAge: 15552000, includeSubDomains: true, preload: false };

      let header = `max-age=${opts.maxAge || 15552000}`;
      if (opts.includeSubDomains) header += "; includeSubDomains";
      if (opts.preload) header += "; preload";

      res.header("strict-transport-security", header);
    }

    // X-Download-Options
    if (options.ieNoOpen !== false) {
      res.header("x-download-options", "noopen");
    }

    // X-Content-Type-Options
    if (options.noSniff !== false) {
      res.header("x-content-type-options", "nosniff");
    }

    // Origin-Agent-Cluster
    if (options.originAgentCluster !== false) {
      res.header("origin-agent-cluster", "?1");
    }

    // X-Permitted-Cross-Domain-Policies
    if (options.permittedCrossDomainPolicies !== false) {
      const policy =
        typeof options.permittedCrossDomainPolicies === "object"
          ? options.permittedCrossDomainPolicies.permittedPolicies
          : "none";
      res.header("x-permitted-cross-domain-policies", policy);
    }

    // Referrer-Policy
    if (options.referrerPolicy !== false) {
      const policy =
        typeof options.referrerPolicy === "object"
          ? Array.isArray(options.referrerPolicy.policy)
            ? options.referrerPolicy.policy.join(", ")
            : options.referrerPolicy.policy
          : "no-referrer";
      res.header("referrer-policy", policy);
    }

    // X-XSS-Protection
    if (options.xssFilter !== false) {
      res.header("x-xss-protection", "0");
    }

    await next();
  });
