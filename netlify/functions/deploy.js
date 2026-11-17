const crypto = require("crypto");

exports.handler = async (event) => {
    const origin = event.headers.origin || event.headers.Origin || "";
    const allowedOrigin = process.env.ALLOWED_ORIGIN || process.env.URL || "";
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isAllowed = isLocalhost || (allowedOrigin && origin === allowedOrigin);

    const corsHeaders = {
        "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: corsHeaders, body: "" };
    }

    if (!isAllowed) {
        return {
            statusCode: 403,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Forbidden: unauthorized request origin." })
        };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
    }

    const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
    if (!NETLIFY_TOKEN) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Server missing NETLIFY_TOKEN." })
        };
    }

    try {
        const { htmlContent, slug } = JSON.parse(event.body);
        if (!htmlContent) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Missing HTML content." })
            };
        }

        const authHeaders = {
            "Authorization": `Bearer ${NETLIFY_TOKEN}`,
            "Content-Type": "application/json"
        };

        const cleanSlug = (slug || "portfolio")
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 63) || "portfolio";

        // Step 1: Check if a site with this slug already exists on your Netlify account
        let targetSite = null;
        const listRes = await fetch("https://api.netlify.com/api/v1/sites?per_page=100", {
            headers: { "Authorization": `Bearer ${NETLIFY_TOKEN}` }
        });

        if (listRes.ok) {
            const existingSites = await listRes.json();
            targetSite = existingSites.find((site) => site.name === cleanSlug) || null;
        }

        // Step 2: Create the site only if it doesn't exist yet
        if (!targetSite) {
            let siteRes = await fetch("https://api.netlify.com/api/v1/sites", {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ name: cleanSlug })
            });

            // If that global subdomain is taken by another Netlify user, fall back to a unique suffix
            if (siteRes.status === 422) {
                const uniqueSuffix = crypto.randomBytes(2).toString("hex");
                const fallbackName = `${cleanSlug.slice(0, 58)}-${uniqueSuffix}`;
                siteRes = await fetch("https://api.netlify.com/api/v1/sites", {
                    method: "POST",
                    headers: authHeaders,
                    body: JSON.stringify({ name: fallbackName })
                });
            }

            if (!siteRes.ok) {
                throw new Error(`Failed to create site (status ${siteRes.status})`);
            }

            targetSite = await siteRes.json();
        }

        // Step 3: Deploy (or re-deploy) index.html to targetSite
        const digest = crypto.createHash("sha1").update(htmlContent).digest("hex");

        const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${targetSite.id}/deploys`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ files: { "/index.html": digest } })
        });

        if (!deployRes.ok) {
            throw new Error(`Failed to initialize deploy (status ${deployRes.status})`);
        }

        const deployData = await deployRes.json();

        // Step 4: Upload index.html if content changed
        if (Array.isArray(deployData.required) && deployData.required.includes(digest)) {
            const uploadRes = await fetch(
                `https://api.netlify.com/api/v1/deploys/${deployData.id}/files/index.html`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${NETLIFY_TOKEN}`,
                        "Content-Type": "application/octet-stream"
                    },
                    body: htmlContent
                }
            );

            if (!uploadRes.ok) {
                throw new Error(`Failed to upload index.html (status ${uploadRes.status})`);
            }
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                url: targetSite.ssl_url || targetSite.url,
                updated: Boolean(listRes.ok)
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};