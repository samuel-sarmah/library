const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing image url query parameter' });
    }

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return res.status(400).json({ error: 'Invalid image url' });
    }

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
        return res.status(400).json({ error: 'Unsupported image protocol' });
    }

    try {
        const response = await fetch(parsed.toString(), {
            headers: {
                'User-Agent': 'LaunchTracker-ImageProxy/1.0',
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch image upstream' });
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const arrayBuffer = await response.arrayBuffer();
        const body = Buffer.from(arrayBuffer);

        // Cache aggressively at the edge to reduce repeat fetches on deployment.
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
        return res.status(200).send(body);
    } catch (err) {
        console.error('Image proxy error:', err);
        return res.status(502).json({ error: 'Unable to proxy image' });
    }
}