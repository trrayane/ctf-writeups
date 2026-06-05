import { requestRender, pickPdfUrl } from "./api.js";
import { SAMPLE_MARKDOWN } from "./constants.js";
import { ui } from "./dom.js";
import { disposePreview, resetPreview, showPreviewFromBlob, showPreviewFromUrl } from "./preview.js";
function setStatus(state, text) {
    ui.statusDot.dataset.state = state;
    ui.statusText.textContent = text;
}
function clearError() {
    ui.errorBox.hidden = true;
    ui.errorBox.textContent = "";
}
function showError(message) {
    ui.errorBox.hidden = false;
    ui.errorBox.textContent = message;
}
async function renderMarkdown() {
    const markdown = ui.markdownInput.value;
    if (!markdown.trim()) {
        setStatus("error", "Missing input");
        showError("Enter some markdown before rendering.");
        resetPreview();
        return;
    }
    clearError();
    setStatus("busy", "Rendering");
    ui.renderButton.disabled = true;
    ui.renderButton.textContent = "Rendering...";
    try {
        // Backend can respond with JSON metadata or directly with a PDF blob.
        const response = await requestRender(markdown);
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Rendering failed");
        }
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const payload = (await response.json());
            const pdfUrl = pickPdfUrl(payload);
            if (!pdfUrl) {
                throw new Error("Render server returned an invalid response");
            }
            showPreviewFromUrl(pdfUrl);
        }
        else {
            const blob = await response.blob();
            showPreviewFromBlob(blob);
        }
        setStatus("success", "Ready");
    }
    catch (error) {
        resetPreview();
        setStatus("error", "Failed");
        showError(error instanceof Error ? error.message : "Rendering failed");
    }
    finally {
        ui.renderButton.disabled = false;
        ui.renderButton.textContent = "Render Markdown";
    }
}
ui.form.addEventListener("submit", (event) => {
    event.preventDefault();
    void renderMarkdown();
});
ui.sampleButton.addEventListener("click", () => {
    ui.markdownInput.value = SAMPLE_MARKDOWN;
    ui.markdownInput.focus();
    setStatus("idle", "Idle");
    clearError();
});
ui.clearButton.addEventListener("click", () => {
    ui.markdownInput.value = "";
    ui.markdownInput.focus();
    setStatus("idle", "Idle");
    clearError();
    resetPreview();
});
ui.markdownInput.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        void renderMarkdown();
    }
});
window.addEventListener("beforeunload", () => {
    disposePreview();
});
