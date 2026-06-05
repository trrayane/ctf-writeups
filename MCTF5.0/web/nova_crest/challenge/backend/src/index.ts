import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { initDB } from "./database/init.js";
import { qmongoModels } from "./database/models/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { persistProcessError } from "./services/error-log.service.js";
import { createApiRouter } from "./routers/index.js";
import { QMongo } from "./tools/QMongo/index.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");
const qmongo = new QMongo({ models: qmongoModels });

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

app.use("/api", createApiRouter(qmongo));

app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

process.on("unhandledRejection", (reason) => {
  persistProcessError("unhandled_rejection", reason, {
    event: "unhandledRejection",
  }).catch((persistError) => {
    console.error("Failed to persist unhandled rejection", persistError);
  });

  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  persistProcessError("uncaught_exception", error, {
    event: "uncaughtException",
  })
    .catch((persistError) => {
      console.error("Failed to persist uncaught exception", persistError);
    })
    .finally(() => {
      console.error("Uncaught exception:", error);
      process.exit(1);
    });
});

async function main() {
  const dbConnected = await initDB();

  if (!dbConnected) {
    console.error("Failed to connect to the database. Exiting.");
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });
}

main().catch((error) => {
  persistProcessError("startup_failure", error, {
    event: "main.catch",
  }).catch((persistError) => {
    console.error("Failed to persist startup failure", persistError);
  });

  console.error("Error starting the server:", error);
  process.exit(1);
});
