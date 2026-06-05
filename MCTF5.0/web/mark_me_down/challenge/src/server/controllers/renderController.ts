import type { RequestHandler } from "express";

import type { AppConfig } from "../config/env.js";
import { renderLatexToPdf } from "../services/latexRenderer.js";
import type { RenderRequestBody } from "../types/render.js";

const MAX_MARKDOWN_LENGTH = 4000;
const DISALLOWED_CONTROL_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const RAW_HTML_TAG_PATTERN = /<\/?[a-z][\w:-]*\b[^>]*>/i;
const LATEX_COMMAND_LINE_PATTERN = /\\+[a-zA-Z@]+/m;
const LATEX_BLOCK_PATTERN = /\\begin\{|\\end\{|\$\$|\\\[/;

function normalizeInput(str: string): string {
  return str.normalize("NFKC").normalize("NFC");
}

function isPureMarkdownInput(markdown: string): boolean {
  // Keep the payload text-only and markdown-like.
  if (DISALLOWED_CONTROL_CHARS.test(markdown)) {
    return false;
  }

  // Reject embedded HTML and obvious raw LaTeX commands/environments.
  if (RAW_HTML_TAG_PATTERN.test(markdown)) {
    return false;
  }

  if (LATEX_COMMAND_LINE_PATTERN.test(markdown) || LATEX_BLOCK_PATTERN.test(markdown)) {
    return false;
  }

  return true;
}

export function createRenderController(
  config: AppConfig,
): RequestHandler<unknown, unknown, RenderRequestBody> {
  return async (req, res) => {
    const markdown =
      typeof req.body?.markdown === "string" ? req.body.markdown : "";

    if (!markdown.trim()) {
      res.status(400).send("No markdown provided");
      return;
    }

    if (markdown.length > MAX_MARKDOWN_LENGTH) {
      res.status(413).send("Markdown payload too large");
      return;
    }

    if (!isPureMarkdownInput(markdown)) {
      res.status(400).send("Markdown isn't valid ... maybe");
      return;
    }

    try {
      const normalizedMarkdown = normalizeInput(markdown);

      const result = await renderLatexToPdf({
        markdown: normalizedMarkdown,
        baseDir: config.renderOutputDir,
        renderUrlPrefix: config.renderUrlPrefix,
        retentionMs: config.fileTtlMs,
      });

      res.json(result);
    } catch (error) {
      const renderError = error as Error;
      console.error("[controller] Render request failed", {
        message: renderError?.message ?? "Unknown error",
        markdownLength: markdown.length,
        route: req.originalUrl,
      });
      res.status(500).send("Rendering failed");
    }
  };
}
