import xss from "xss";

const whiteList = {
    a: ["href", "target", "rel"],
    blockquote: [],
    br: [],
    em: [],
    h1: [],
    h2: [],
    h3: [],
    img: ["src", "alt", "width", "height"],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    strong: [],
    u: [],
    ul: [],
};

export function sanitizePostHtml(value) {
    return xss(typeof value === "string" ? value : "", {
        whiteList,
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script", "style", "iframe", "svg"],
        onTagAttr(tag, name, value, isWhiteAttr) {
            if (name === "href" || name === "src") {
                if (value.startsWith("//")) return "";
                try {
                    const url = new URL(value, "https://example.invalid");
                    const allowedProtocols = tag === "a" ? ["http:", "https:", "mailto:"] : ["http:", "https:"];
                    if (!allowedProtocols.includes(url.protocol)) return "";
                } catch {
                    return "";
                }
            }
            if (name === "target" && tag === "a") return "_blank";
            if (name === "rel" && tag === "a") return "noopener noreferrer";
            return isWhiteAttr ? undefined : "";
        },
    });
}
