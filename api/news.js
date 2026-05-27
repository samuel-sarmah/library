export default async function handler(req, res) {
    const { launch, limit = '20' } = req.query;

    const qs = launch
        ? `?launch=${encodeURIComponent(launch)}&limit=${limit}`
        : `?limit=${limit}`;

    const endpoint = `https://api.spaceflightnewsapi.net/v4/articles/${qs}`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeout);

        const data = await response.json();

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(response.status).json(data);
    } catch (err) {
        if (err.name === 'AbortError') {
            return res.status(504).json({ error: 'News API timed out. Please try again.' });
        }
        console.error('News proxy error:', err);
        return res.status(502).json({ error: 'Failed to fetch news' });
    }
}
