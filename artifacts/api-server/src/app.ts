import express, { type Express } from "express";
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
      const indexHtml = await fs.readFile(indexPath, "utf8");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.type("html").send(indexHtml.replaceAll("__SITE_URL__", siteUrl));
    } catch (error) {
      req.log.error({ err: error }, "Failed to serve the frontend entrypoint");
      next(error);
    }
  });
}

export default app;
