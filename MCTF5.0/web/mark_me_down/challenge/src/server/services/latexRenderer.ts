import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import type { RenderResponseBody } from "../types/render.js";
import { removeWorkdir } from "./workdirCleanup.js";

const execFileAsync = promisify(execFile);
const PDFLATEX_TIMEOUT_MS = 5_000;
const PDFLATEX_MAX_BUFFER_BYTES = 1024 * 1024;
const LOG_SNIPPET_MAX = 4_000;

interface ExecErrorWithOutput extends Error {
  stdout?: string | Buffer;
  stderr?: string | Buffer;
  code?: string | number;
  signal?: string;
}

function toLogSnippet(value: string | Buffer | undefined): string {
  if (value === undefined) {
    return "";
  }

  const text = Buffer.isBuffer(value) ? value.toString("utf8") : value;
  return text.length > LOG_SNIPPET_MAX ? `...[truncated]\n${text.slice(-LOG_SNIPPET_MAX)}` : text;
}

function readLogTail(logPath: string): string {
  if (!fs.existsSync(logPath)) {
    return "";
  }

  const raw = fs.readFileSync(logPath, "utf8");
  return raw.length > LOG_SNIPPET_MAX ? `...[truncated]\n${raw.slice(-LOG_SNIPPET_MAX)}` : raw;
}

function hasLikelyLatexError(logTail: string): boolean {
  if (!logTail) {
    return false;
  }

  return /!\s|Emergency stop|Fatal error|Undefined control sequence|LaTeX Error:/i.test(logTail);
}

// Remove all files in `workdir` except the generated PDF (default: "main.pdf").
function cleanupWorkdirExceptPdf(workdir: string, keepFilename = "main.pdf") {
  try {
    for (const file of fs.readdirSync(workdir)) {
      if (file !== keepFilename) {
        try {
          fs.unlinkSync(path.join(workdir, file));
        } catch {
          // Best-effort cleanup only.
        }
      }
    }
  } catch {
    // Best-effort: ignore errors listing the directory.
  }
}

export interface RenderLatexOptions {
  markdown: string;
  baseDir: string;
  renderUrlPrefix: string;
  retentionMs: number;
}

export async function renderLatexToPdf(options: RenderLatexOptions): Promise<RenderResponseBody> {
  const id = randomUUID();
  const workdir = path.join(options.baseDir, id);
  const texFile = path.join(workdir, "main.tex");

  // Use a browser-like print profile so markdown output resembles Chromium/Puppeteer PDFs.
  const texContent = [
  "\\documentclass[11pt]{article}",
  "\\usepackage[T1]{fontenc}",
  "\\usepackage[utf8]{inputenc}",
  "\\usepackage[a4paper, top=1in, bottom=1in, left=1.1in, right=1.1in]{geometry}",
  "\\usepackage{lmodern}",
  "\\usepackage{microtype}",
  "\\usepackage{xcolor}",
  "\\usepackage[hidelinks]{hyperref}",
  "\\usepackage{parskip}",
  "\\usepackage{titlesec}",
  "\\usepackage{mdframed}",
  "\\usepackage{listings}",
  "\\usepackage{booktabs}",
  "\\usepackage{colortbl}",
  "\\usepackage{array}",
  "\\usepackage[hybrid, fencedCode, inlineCode, pipeTables, tableCaptions, footnotes,rawAttribute=false]{markdown}",
  "",
  // ── Colour palette (GitHub Markdown) ──────────────────────────────────
  "\\definecolor{ghtext}{HTML}{24292f}",
  "\\definecolor{ghsubtle}{HTML}{57606a}",
  "\\definecolor{ghborder}{HTML}{d0d7de}",
  "\\definecolor{ghcodebg}{HTML}{f6f8fa}",
  "\\definecolor{ghlink}{HTML}{0969da}",
  "",
  // ── Hyperlinks ─────────────────────────────────────────────────────────
  "\\hypersetup{colorlinks=true, urlcolor=ghlink, linkcolor=ghtext, citecolor=ghlink}",
  "",
  // ── Typography ─────────────────────────────────────────────────────────
  "\\renewcommand{\\familydefault}{\\sfdefault}",
  "\\setlength{\\parindent}{0pt}",
  "\\setlength{\\parskip}{0.65em}",
  "",
  // ── Inline-code command ────────────────────────────────────────────────
  "\\newcommand{\\ghcode}[1]{%",
  "  {\\setlength{\\fboxsep}{2.5pt}\\colorbox{ghcodebg}{\\texttt{\\small\\color{ghtext}\\strut #1}}}%",
  "}",
  "",
  // ── Heading sizes & bottom rules (H1 / H2 get a hairline rule) ─────────
  "\\titleformat{\\section}",
  "  {\\fontsize{22}{27}\\selectfont\\bfseries\\color{ghtext}}",
  "  {}{0em}{}",
  "  [{\\vspace{3pt}\\color{ghborder}\\leaders\\hrule height 0.5pt\\hfill\\kern0pt}]",
  "\\titlespacing*{\\section}{0pt}{28pt}{10pt}",
  "",
  "\\titleformat{\\subsection}",
  "  {\\fontsize{17}{21}\\selectfont\\bfseries\\color{ghtext}}",
  "  {}{0em}{}",
  "  [{\\vspace{3pt}\\color{ghborder}\\leaders\\hrule height 0.5pt\\hfill\\kern0pt}]",
  "\\titlespacing*{\\subsection}{0pt}{22pt}{8pt}",
  "",
  "\\titleformat{\\subsubsection}",
  "  {\\fontsize{14}{18}\\selectfont\\bfseries\\color{ghtext}}{}{0em}{}",
  "\\titlespacing*{\\subsubsection}{0pt}{18pt}{6pt}",
  "",
  "\\titleformat{\\paragraph}",
  "  {\\normalsize\\bfseries\\color{ghtext}}{}{0em}{}",
  "\\titlespacing*{\\paragraph}{0pt}{14pt}{4pt}",
  "",
  // ── Fenced / block code (listings) ────────────────────────────────────
  "\\lstset{",
  "  backgroundcolor=\\color{ghcodebg},",
  "  basicstyle=\\ttfamily\\small\\color{ghtext},",
  "  breaklines=true,",
  "  breakatwhitespace=false,",
  "  frame=single,",
  "  framerule=0.8pt,",
  "  rulecolor=\\color{ghborder},",
  "  xleftmargin=14pt,",
  "  xrightmargin=14pt,",
  "  framexleftmargin=10pt,",
  "  framexrightmargin=10pt,",
  "  aboveskip=12pt,",
  "  belowskip=12pt,",
  "  showstringspaces=false,",
  "  tabsize=2,",
  "}",
  "",
  // ── Blockquote (left border, muted text) ──────────────────────────────
  "\\mdfdefinestyle{ghquote}{",
  "  leftline=true, rightline=false, topline=false, bottomline=false,",
  "  linewidth=4pt, linecolor=ghborder,",
  "  backgroundcolor=white,",
  "  innerleftmargin=14pt, innerrightmargin=0pt,",
  "  innertopmargin=2pt, innerbottommargin=2pt,",
  "  skipabove=8pt, skipbelow=8pt,",
  "}",
  "",
  // ── Horizontal rule ────────────────────────────────────────────────────
  "\\newcommand{\\ghhr}{%",
  "  \\vspace{8pt}{\\color{ghborder}\\hrule height 1pt}\\vspace{8pt}%",
  "}",
  "",
  // ── Table styling (border + alternating is not done here; kept minimal) 
  "\\arrayrulecolor{ghborder}",
  "\\renewcommand{\\arraystretch}{1.3}",
  "",
  // ── Wire up markdown package renderers ────────────────────────────────
  "\\markdownSetup{renderers={",
  "  codeSpan        = {\\ghcode{#1}},",
  "  inputFencedCode = {\\lstinputlisting{#1}},",
  "  blockQuoteBegin = {\\begin{mdframed}[style=ghquote]\\color{ghsubtle}},",
  "  blockQuoteEnd   = {\\end{mdframed}},",
  "  horizontalRule  = {\\ghhr},",
  "  link            = {\\href{#3}{\\textcolor{ghlink}{#1}}},",
  "  image           = {\\begin{center}\\includegraphics[max width=\\linewidth]{#3}\\end{center}},",
  "}}",
  "",
  "\\begin{document}",
  "\\color{ghtext}",
  "\\begin{markdown}",
  options.markdown,
  "\\end{markdown}",
  "\\end{document}",
  "",
].join("\n");

  try {
    fs.mkdirSync(workdir);
    fs.writeFileSync(texFile, texContent, "utf8");
    let execError: ExecErrorWithOutput | null = null;

    try {
      await execFileAsync("pdflatex", ["-shell-escape", "-file-line-error", "-interaction=nonstopmode", "main.tex"], {
        cwd: workdir,
        timeout: PDFLATEX_TIMEOUT_MS,
        maxBuffer: PDFLATEX_MAX_BUFFER_BYTES,
        env: {
          ...process.env,
          openin_any: "p",
          openout_any: "p",
          TEXMFOUTPUT: workdir,
        },
      });
    } catch (error) {
      execError = error as ExecErrorWithOutput;
    }

    const pdfPath = path.join(workdir, "main.pdf");
    const logTail = readLogTail(path.join(workdir, "main.log"));

    if (execError && fs.existsSync(pdfPath)) {
      if (hasLikelyLatexError(logTail)) {
        console.warn("[renderer] pdflatex exited non-zero; PDF produced with possible LaTeX issues", {
          id,
          workdir,
          code: execError.code,
          signal: execError.signal,
          latexLogTail: logTail,
        });
      }
    }

    if (!fs.existsSync(pdfPath)) {
      if (execError) {
        console.error("[renderer] Markdown render failed", {
          id,
          workdir,
          message: execError?.message ?? "Unknown error",
          code: execError?.code,
          signal: execError?.signal,
          stderr: toLogSnippet(execError?.stderr),
          stdout: toLogSnippet(execError?.stdout),
          latexLogTail: logTail,
        });
      }
      throw new Error("Compilation failed");
    }
    // delete additional files generated by pdflatex, keeping only the PDF output
    cleanupWorkdirExceptPdf(workdir);


    
    return {
      pdfUrl: `${options.renderUrlPrefix}/${id}/main.pdf`,
      expiresInSeconds: Math.floor(options.retentionMs / 1000),
      clean_markdown: options.markdown,
    };
  } catch (error) {
    const err = error as Error;
    console.error("[renderer] Render aborted", {
      id,
      workdir,
      message: err?.message ?? "Unknown error",
    });

    removeWorkdir(workdir);
    throw error;
  }
}
