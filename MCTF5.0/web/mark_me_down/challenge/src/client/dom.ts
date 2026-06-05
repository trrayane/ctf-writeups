export type StatusState = "idle" | "busy" | "success" | "error";

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }

  return element as T;
}

export const ui = {
  form: requireElement<HTMLFormElement>("render-form"),
  markdownInput: requireElement<HTMLTextAreaElement>("markdown-input"),
  renderButton: requireElement<HTMLButtonElement>("render-btn"),
  sampleButton: requireElement<HTMLButtonElement>("sample-btn"),
  clearButton: requireElement<HTMLButtonElement>("clear-btn"),
  statusDot: requireElement<HTMLSpanElement>("status-dot"),
  statusText: requireElement<HTMLSpanElement>("status-text"),
  pdfFrame: requireElement<HTMLIFrameElement>("pdf-frame"),
  placeholder: requireElement<HTMLParagraphElement>("preview-placeholder"),
  errorBox: requireElement<HTMLParagraphElement>("error-box"),
  downloadLink: requireElement<HTMLAnchorElement>("download-link"),
  resultInfo: requireElement<HTMLParagraphElement>("result-info"),
};
