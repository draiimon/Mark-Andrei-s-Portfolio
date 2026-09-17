import express, { type Express, type ErrorRequestHandler } from "express";
import { EditorError } from "./lib/editor";
import { pool } from "@workspace/db";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "node:fs/promises";
import path from "node:path";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getSessionSecret } from "./lib/session";

const app: Express = express();

const buildIdentifier =
  process.env.RENDER_GIT_COMMIT?.trim() ||
  process.env.APP_COMMIT_SHA?.trim() ||
  process.env.GIT_COMMIT_SHA?.trim() ||
  "unknown";

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.set("trust proxy", 1);
app.use(cookieParser(getSessionSecret()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", commit: buildIdentifier });
});

// Render's default health probe uses HEAD /. Keep the root probe successful
// while the static frontend below continues to serve the actual page on GET /.
app.head("/", (_req, res) => {
  res.status(200).set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/html; charset=utf-8",
  }).end();
});

app.use("/api", router);

const apiErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (!req.path.startsWith("/api/")) return next(error);
  req.log.error({ err: error }, "API request failed");
  const status = error instanceof EditorError ? error.status
    : error.type === "entity.too.large" ? 413
    : error.type === "entity.parse.failed" ? 400
    : ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EACCES", "57P01", "53300"].includes(error.code) ? 503 : 500;
  const message = error instanceof EditorError ? error.message
    : status === 413 ? "File or request is too large. Images: 5 MB; resume: 10 MB."
    : status === 400 ? "Invalid JSON request."
    : status === 503 ? "Storage is temporarily unavailable. Please retry."
    : "The request could not be completed. Please retry; the server logged the error.";
  res.status(status).json({ error: message });
};
app.use(apiErrorHandler);

const staticRoot = process.env.STATIC_ROOT?.trim();
if (staticRoot) {
  const indexPath = path.join(staticRoot, "index.html");
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");

  const isBlockedProbePath = (requestPath: string) => {
    let decodedPath = requestPath;
    try {
      decodedPath = decodeURIComponent(requestPath);
    } catch {
      return true;
    }

    const segments = decodedPath.split("/").filter(Boolean);
    if (segments.some((segment) => segment.startsWith("."))) {
      return true;
    }

    const basename = segments.at(-1)?.toLowerCase() ?? "";
    return (
      basename.startsWith(".env") ||
      /^(?:config|settings|secrets|credentials|environment)(?:\.[a-z0-9_-]+)?$/i.test(basename)
    );
  };

  app.use((req, res, next) => {
    if (isBlockedProbePath(req.path)) {
      res.sendStatus(404);
      return;
    }
    next();
  });

  app.use(
    express.static(staticRoot, {
      index: false,
      setHeaders(res, filePath) {
        const relativePath = path.relative(staticRoot, filePath).split(path.sep).join("/");

        if (relativePath === "sw.js") {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (relativePath === "index.html") {
          res.setHeader("Cache-Control", "no-cache");
        } else if (
          relativePath.startsWith("assets/") &&
          /-[A-Za-z0-9]{8}\.(?:css|js|mjs|map|woff2?|ttf|eot)$/i.test(relativePath)
        ) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    }),
  );

  app.use(async (req, res, next) => {
    if (req.method !== "GET" || req.path === "/health" || req.path === "/api" || req.path.startsWith("/api/")) {
      next();
      return;
    }
    if (path.extname(req.path)) {
      next();
      return;
    }

    try {
      let indexHtml = await fs.readFile(indexPath, "utf8");
      if (pool) {
        try {
          const result = await pool.query('SELECT "socialImageUrl" FROM "Profile" ORDER BY "id" LIMIT 1');
          const image = result.rows[0]?.socialImageUrl;
          if (typeof image === "string" && image && (/^https?:\/\//i.test(image) || /^\/(?!\/)/.test(image))) {
            const absolute = image.startsWith("/") ? `${siteUrl}${image}` : image;
            const escaped = absolute.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
            indexHtml = indexHtml.replace(/(<meta (?:property="og:image(?::secure_url)?"|name="twitter:image") content=")[^"]*("\s*\/>)/g, `$1${escaped}$2`)
              .replace(/\s*<meta property="og:image:(?:type|width|height)"[^>]*>/g, "");
          }
        } catch (error) {
          req.log.error({ err: error }, "Could not load social preview metadata");
        }
      }
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.type("html").send(indexHtml.replaceAll("__SITE_URL__", siteUrl));
    } catch (error) {
      req.log.error({ err: error }, "Failed to serve the frontend entrypoint");
      next(error);
    }
  });
}

export default app;
