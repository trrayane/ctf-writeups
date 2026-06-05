import { ROUTE_CANDIDATES } from "./constants.js";
export async function requestRender(markdown) {
    let lastNetworkError = null;
    for (const endpoint of ROUTE_CANDIDATES) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ markdown }),
            });
            if (response.status === 404) {
                continue;
            }
            return response;
        }
        catch (error) {
            lastNetworkError = error;
        }
    }
    if (lastNetworkError instanceof Error) {
        throw lastNetworkError;
    }
    throw new Error("Markdown render endpoint not found");
}
export function pickPdfUrl(payload) {
    if (!payload || typeof payload !== "object") {
        return "";
    }
    if (typeof payload.pdfUrl === "string" && payload.pdfUrl) {
        return payload.pdfUrl;
    }
    if (typeof payload.fileUrl === "string" && payload.fileUrl) {
        return payload.fileUrl;
    }
    if (typeof payload.url === "string" && payload.url) {
        return payload.url;
    }
    if (typeof payload.path === "string" && payload.path) {
        return payload.path;
    }
    if (typeof payload.id === "string" && payload.id) {
        return `/renders/${payload.id}/main.pdf`;
    }
    return "";
}
