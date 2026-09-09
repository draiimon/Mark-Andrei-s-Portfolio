process.env.NODE_ENV = "production";
process.env.PORT ||= "3000";
process.env.HOST ||= process.env.REPL_ID || process.env.REPLIT_DEPLOYMENT ? "0.0.0.0" : "127.0.0.1";
process.env.VIEW_COUNTER_IGNORED_IPS = [
  process.env.VIEW_COUNTER_IGNORED_IPS,
  "127.0.0.1",
  "::1",
].filter(Boolean).join(",");
await import("../artifacts/api-server/dist/index.mjs");
