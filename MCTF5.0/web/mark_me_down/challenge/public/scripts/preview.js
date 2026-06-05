import { ui } from "./dom.js";
let activeObjectUrl = "";
function appendTimestamp(url) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${Date.now()}`;
}
function normalizePdfUrl(url) {
    try {
        return new URL(url, window.location.href).toString();
    }
    catch {
        return url;
    }
}
function releaseObjectUrl() {
    if (!activeObjectUrl) {
        return;
    }
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = "";
}
function showResultInfo(text) {
    ui.resultInfo.hidden = false;
    ui.resultInfo.textContent = text;
}
export function resetPreview() {
    releaseObjectUrl();
    ui.pdfFrame.hidden = true;
    ui.pdfFrame.removeAttribute("src");
    ui.placeholder.hidden = false;
    ui.downloadLink.hidden = true;
    ui.downloadLink.removeAttribute("href");
    ui.resultInfo.hidden = true;
    ui.resultInfo.textContent = "";
}
export function showPreviewFromUrl(fileUrl) {
    releaseObjectUrl();
    const normalizedUrl = normalizePdfUrl(fileUrl);
    // Always preview via iframe; the image-based PNG preview path was removed.
    ui.pdfFrame.src = appendTimestamp(normalizedUrl);
    ui.pdfFrame.hidden = false;
    ui.placeholder.hidden = true;
    ui.downloadLink.hidden = false;
    ui.downloadLink.href = normalizedUrl;
    ui.downloadLink.download = "rendered.pdf";
    showResultInfo(`Render output: ${normalizedUrl}`);
}
export function showPreviewFromBlob(blob) {
    releaseObjectUrl();
    // Object URLs are used only when the server returns a raw PDF stream.
    activeObjectUrl = URL.createObjectURL(blob);
    ui.pdfFrame.src = activeObjectUrl;
    ui.pdfFrame.hidden = false;
    ui.placeholder.hidden = true;
    ui.downloadLink.hidden = false;
    ui.downloadLink.href = activeObjectUrl;
    ui.downloadLink.download = "rendered.pdf";
    showResultInfo("Render output: blob response");
}
export function disposePreview() {
    releaseObjectUrl();
}
