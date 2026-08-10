import xss from "xss";

const whiteList = {
    a: ["href", "target", "rel"],
    article: [],
    blockquote: ["style"],
    br: [],
    audio: ["controls"],
    code: [],
    del: [],
    div: ["style"],
    em: [],
    font: ["color"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
    h5: ["style"],
    h6: ["style"],
    hr: [],
    img: ["src", "alt", "width", "height"],
    li: ["style"],
    mark: ["style"],
    ol: [],
    p: ["style"],
    pre: [],
    source: ["src", "type"],
    s: [],
    span: ["style"],
    strong: [],
    sub: [],
    sup: [],
    table: ["style"],
    tbody: [],
    td: ["colspan", "rowspan", "style"],
    tfoot: [],
    th: ["colspan", "rowspan", "style"],
    thead: [],
    tr: [],
    u: [],
    ul: [],
    iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title"],
};

const safeStyleProperties = new Set(["background-color", "color", "font-size", "text-align", "vertical-align"]);

export function sanitizePostHtml(value) {
    return xss(typeof value === "string" ? value : "", {
        whiteList,
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script", "style", "svg"],
        onTagAttr(tag, name, value, isWhiteAttr) {
            if (name === "href" || name === "src") {
                if (value.startsWith("//")) return "";
                try {
                    const url = new URL(value, "https://example.invalid");
                    const allowedProtocols = tag === "a" ? ["http:", "https:", "mailto:"] : ["http:", "https:"];
                    if (!allowedProtocols.includes(url.protocol)) return "";
                    if (tag === "iframe" && !["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "youtube-nocookie.com"].includes(url.hostname)) {
                        return "";
                    }
                } catch {
                    return "";
                }
            }
            if (name === "target" && tag === "a") return "_blank";
            if (name === "rel" && tag === "a") return "noopener noreferrer";
            if (name === "style") {
                const safeStyles = value
                    .split(";")
                    .map((declaration) => declaration.trim())
                    .filter(Boolean)
                    .map((declaration) => {
                        const separator = declaration.indexOf(":");
                        if (separator < 1) return "";
                        const property = declaration.slice(0, separator).trim().toLowerCase();
                        const propertyValue = declaration.slice(separator + 1).trim();
                        if (!safeStyleProperties.has(property) || !propertyValue || /[{}<>;]/.test(propertyValue)) return "";
                        if (propertyValue.includes("url(") || /expression|javascript/i.test(propertyValue)) return "";
                        return `${property}: ${propertyValue}`;
                    })
                    .filter(Boolean);
                return safeStyles.length ? `style="${safeStyles.join("; ")}"` : "";
            }
            return isWhiteAttr ? undefined : "";
        },
    });
}
