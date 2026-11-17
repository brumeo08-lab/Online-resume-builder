const crypto = require("crypto");

exports.handler = async (event) => {
    // Allow requests from your live Netlify URL (set via ALLOWED_ORIGIN) and localhost
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

        // Step 1: Create a brand-new Netlify site with a unique subdomain
        const uniqueSuffix = crypto.randomBytes(2).toString("hex");
        const siteName = `${slug || "portfolio"}-${uniqueSuffix}`.slice(0, 63);

        const siteRes = await fetch("https://api.netlify.com/api/v1/sites", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NETLIFY_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: siteName })
        });

        if (!siteRes.ok) {
            throw new Error(`Failed to create new site (status ${siteRes.status})`);
        }

        const newSite = await siteRes.json();
        const digest = crypto.createHash("sha1").update(htmlContent).digest("hex");

        // Step 2: Initialize deploy on the newly created site
        const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${newSite.id}/deploys`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NETLIFY_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ files: { "/index.html": digest } })
        });

        if (!deployRes.ok) {
            throw new Error(`Failed to initialize deploy (status ${deployRes.status})`);
        }

        const deployData = await deployRes.json();

        // Step 3: Upload index.html
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
            body: JSON.stringify({ url: newSite.ssl_url || newSite.url })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};