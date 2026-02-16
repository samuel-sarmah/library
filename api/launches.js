export default async function handler(req, res) {
    const { type = 'upcoming', limit } = req.query;
    const effectiveLimit = limit || (type === 'previous' ? '30' : '100');

    if (!['upcoming', 'previous'].includes(type)) {
        return res.status(400).json({ error: 'Invalid launch type' });
    }

    const apiKey = process.env.SPACE_DEVS_API_KEY;
    if (!apiKey) {
        console.error('SPACE_DEVS_API_KEY environment variable is not set');
        return res.status(500).json({ error: 'API key not configured on server' });
    }

    const endpoint = `https://ll.thespacedevs.com/2.3.0/launches/${type}/?limit=${effectiveLimit}&mode=normal`;

    try {
        const response = await fetch(endpoint, {
            headers: { 'Authorization': `Token ${apiKey}` },
        });
        const data = await response.json();

        const normalizedData = {
            ...data,
            results: Array.isArray(data?.results)
                ? data.results.map((launch) => ({
                    ...launch,
                    window_open: launch.window_start || null,
                    window_close: launch.window_end || null,
                    liftoff_exact: launch.net || null,
                }))
                : data?.results,
        };

        if (!response.ok) {
            console.error(`Upstream API error ${response.status}:`, data);
        }

        // Previous launches rarely change — cache longer
        const maxAge = type === 'previous' ? 300 : 60;
        const staleWhileRevalidate = type === 'previous' ? 600 : 300;
        res.setHeader('Cache-Control', `s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
        return res.status(response.status).json(normalizedData);
    } catch (err) {
        console.error('Proxy error:', err);
        return res.status(502).json({ error: 'Failed to fetch from upstream API' });
    }
}
