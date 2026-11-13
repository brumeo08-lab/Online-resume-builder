const crypto = require("crypto");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
    const SITE_ID = process.env.SITE_ID;

    if (!NETLIFY_TOKEN || !SITE_ID) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server missing Netlify credentials." })
        };
    }

    try {
        const { htmlContent } = JSON.parse(event.body);
        if (!htmlContent) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing HTML content." }) };
        }

        const digest = crypto.createHash("sha1").update(htmlContent).digest("hex");

        // 1. Initialize deploy
        const createRes = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NETLIFY_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ files: { "/index.html": digest } })
        });

        if (!createRes.ok) {
            throw new Error(`Netlify init failed: ${createRes.status}`);
        }

        const deployData = await createRes.json();

        // 2. Upload index.html if needed
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
                throw new Error(`Netlify upload failed: ${uploadRes.status}`);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ url: deployData.ssl_url || deployData.url })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
