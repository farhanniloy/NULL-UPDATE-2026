const trustedImageHosts = new Set([
    "lh3.googleusercontent.com",
    "firebasestorage.googleapis.com",
    "plsn.com",
]);

export function getSafePostImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;

    const imageUrl = value.trim();
    if (imageUrl.startsWith("/") && !imageUrl.startsWith("//") && !imageUrl.includes("..")) {
        return imageUrl;
    }

    try {
        const parsed = new URL(imageUrl);
        if (parsed.protocol === "https:" && trustedImageHosts.has(parsed.hostname)) {
            return parsed.toString();
        }
    } catch {
        return null;
    }

    return null;
}
