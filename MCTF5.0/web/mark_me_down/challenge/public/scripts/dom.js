function requireElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing required element: ${id}`);
    }
    return element;
}
export const ui = {
    form: requireElement("render-form"),
    markdownInput: requireElement("markdown-input"),
    renderButton: requireElement("render-btn"),
    sampleButton: requireElement("sample-btn"),
    clearButton: requireElement("clear-btn"),
    statusDot: requireElement("status-dot"),
    statusText: requireElement("status-text"),
    pdfFrame: requireElement("pdf-frame"),
    placeholder: requireElement("preview-placeholder"),
    errorBox: requireElement("error-box"),
    downloadLink: requireElement("download-link"),
    resultInfo: requireElement("result-info"),
};
