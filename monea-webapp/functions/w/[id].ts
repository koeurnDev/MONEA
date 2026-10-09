interface PagesFunctionContext {
    request: Request;
    params: { id: string };
    next(): Promise<Response>;
}

interface PublicWedding {
    id: string;
    groomName?: string | null;
    brideName?: string | null;
    date?: string | null;
    heroImage?: string | null;
    coverImageUrl?: string | null;
}

interface SocialImage {
    url: string;
    width?: number;
    height?: number;
}

const allowedImageHosts = new Set([
    "res.cloudinary.com",
    "ik.imagekit.io",
    "images.unsplash.com",
    "plus.unsplash.com",
]);

function cleanText(value: unknown, maxLength: number): string {
    if (typeof value !== "string") return "";
    const normalized = value
        .replace(/[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    return Array.from(normalized).slice(0, maxLength).join("");
}

function formatKhmerDate(date: Date): string {
    const weekdays = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
    const months = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    const khmerDigits = (value: number) => String(value).replace(/\d/g, (digit) => "០១២៣៤៥៦៧៨៩"[Number(digit)]);
    return `${weekdays[date.getDay()]} ${khmerDigits(date.getDate())} ${months[date.getMonth()]} ${khmerDigits(date.getFullYear())}`;
}

function getHeroImage(wedding: PublicWedding, origin: string): SocialImage {
    const fallback: SocialImage = { url: new URL("/logo.png", origin).href };
    const image = [wedding.heroImage, wedding.coverImageUrl]
        .find((candidate) => typeof candidate === "string" && candidate.length <= 2048);
    if (!image) return fallback;

    try {
        const imageUrl = new URL(image, origin);
        const isSameOrigin = imageUrl.origin === origin;
        const isAllowedHost = allowedImageHosts.has(imageUrl.hostname);
        const hasCredentials = Boolean(imageUrl.username || imageUrl.password);
        const hasUnexpectedPort = imageUrl.port !== "";
        const safeImage = imageUrl.protocol === "https:" &&
            (isSameOrigin || isAllowedHost) &&
            !hasCredentials &&
            !hasUnexpectedPort;
        if (!safeImage) return fallback;

        if (imageUrl.hostname === "res.cloudinary.com" && imageUrl.pathname.includes("/image/upload/")) {
            const marker = "/image/upload/";
            const uploadIndex = imageUrl.pathname.indexOf(marker);
            const transform = "c_fill,w_1200,h_630,g_auto,q_auto,f_auto";
            const transformStart = uploadIndex + marker.length;
            if (!imageUrl.pathname.slice(transformStart).startsWith(`${transform}/`)) {
                imageUrl.pathname = `${imageUrl.pathname.slice(0, transformStart)}${transform}/${imageUrl.pathname.slice(transformStart)}`;
            }
            return { url: imageUrl.href, width: 1200, height: 630 };
        }

        if (imageUrl.hostname === "images.unsplash.com" || imageUrl.hostname === "plus.unsplash.com") {
            imageUrl.searchParams.set("w", "1200");
            imageUrl.searchParams.set("h", "630");
            imageUrl.searchParams.set("fit", "crop");
            imageUrl.searchParams.set("auto", "format");
            imageUrl.searchParams.set("q", "80");
            return { url: imageUrl.href, width: 1200, height: 630 };
        }

        if (imageUrl.hostname === "ik.imagekit.io") {
            imageUrl.searchParams.set("tr", "w-1200,h-630,c-at_least,fo-auto");
            return { url: imageUrl.href, width: 1200, height: 630 };
        }

        return { url: imageUrl.href };
    } catch {
        return fallback;
    }
}

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]!);
}

function replaceMeta(html: string, key: string, value: string, property = false): string {
    const attribute = property ? "property" : "name";
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matcher = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}\\s*=\\s*["']${escapedKey}["'])[^>]*>`, "i");
    const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}">`;
    return matcher.test(html) ? html.replace(matcher, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
    const pageResponse = await context.next();
    const userAgent = context.request.headers.get("user-agent") || "";
    if (!/(bot|crawler|spider|facebookexternalhit|twitterbot|telegrambot|whatsapp|slackbot|discordbot|linkedinbot)/i.test(userAgent)) {
        return pageResponse;
    }

    const weddingId = context.params.id;
    if (!/^[\w-]{1,128}$/.test(weddingId)) return pageResponse;

    try {
        const apiUrl = `https://monea-api.seabkoeurn64.workers.dev/api/wedding/${encodeURIComponent(weddingId)}/seo`;
        const weddingResponse = await fetch(apiUrl, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(2500),
        });
        if (!weddingResponse.ok) return pageResponse;
        const contentType = weddingResponse.headers.get("content-type")
            ?.split(";")[0]
            .trim()
            .toLowerCase();
        if (contentType !== "application/json") {
            console.error("[SEO] Wedding metadata endpoint returned a non-JSON response");
            return pageResponse;
        }

        const wedding = await weddingResponse.json() as PublicWedding;
        if (!wedding || wedding.id !== weddingId) {
            console.error("[SEO] Wedding metadata endpoint returned an invalid wedding record");
            return pageResponse;
        }

        const origin = new URL(context.request.url).origin;
        const canonicalUrl = new URL(`/w/${encodeURIComponent(wedding.id)}`, origin).href;
        const names = [cleanText(wedding.groomName, 100), cleanText(wedding.brideName, 100)]
            .filter(Boolean)
            .join(" & ");
        const title = `${names || "ធៀបអញ្ជើញមង្គលការ"} | MONEA`;
        const parsedDate = typeof wedding.date === "string" ? new Date(wedding.date) : null;
        const date = parsedDate && Number.isFinite(parsedDate.getTime())
            ? formatKhmerDate(parsedDate)
            : "";
        const description = cleanText(
            `សូមគោរពអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍${names ? `របស់ ${names}` : ""}${date ? ` នៅថ្ងៃ ${date}` : ""}។`,
            300,
        );
        const image = getHeroImage(wedding, origin);

        let html = await pageResponse.text();
        html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
        html = replaceMeta(html, "description", description);
        html = replaceMeta(html, "og:title", title, true);
        html = replaceMeta(html, "og:description", description, true);
        html = replaceMeta(html, "og:url", canonicalUrl, true);
        html = replaceMeta(html, "og:image", image.url, true);
        html = replaceMeta(html, "og:image:secure_url", image.url, true);
        html = replaceMeta(html, "og:image:alt", names || "MONEA wedding invitation", true);
        if (image.width && image.height) {
            html = replaceMeta(html, "og:image:width", String(image.width), true);
            html = replaceMeta(html, "og:image:height", String(image.height), true);
        }
        html = replaceMeta(html, "twitter:title", title);
        html = replaceMeta(html, "twitter:description", description);
        html = replaceMeta(html, "twitter:image", image.url);
        html = replaceMeta(html, "twitter:image:alt", names || "MONEA wedding invitation");
        html = replaceMeta(html, "twitter:url", canonicalUrl);
        html = html.replace(
            /<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>/i,
            `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
        );
        html = html.replace(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");

        const headers = new Headers(pageResponse.headers);
        headers.delete("content-length");
        headers.delete("content-encoding");
        headers.delete("etag");
        headers.set("Cache-Control", "private, no-store");
        return new Response(html, {
            status: pageResponse.status,
            statusText: pageResponse.statusText,
            headers,
        });
    } catch (error) {
        console.error("[SEO] Unable to generate wedding metadata:", error);
        return pageResponse;
    }
}
