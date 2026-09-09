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
  res.json({ status: "ok" });
});
app.use("/api", router);

const staticRoot = process.env.STATIC_ROOT?.trim();
if (staticRoot) {
  const indexPath = path.join(staticRoot, "index.html");
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");

  app.use(
    express.static(staticRoot, {
      index: false,
      maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
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
      res.type("html").send(indexHtml.replaceAll("__SITE_URL__", siteUrl));
    } catch (error) {
      req.log.error({ err: error }, "Failed to serve the frontend entrypoint");
      next(error);
    }
  });
}

export default app;
