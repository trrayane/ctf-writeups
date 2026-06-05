export interface RenderRequestBody {
  markdown?: unknown;
}

export interface RenderResponseBody {
  pdfUrl: string;
  expiresInSeconds: number;
  clean_markdown: string;
}
