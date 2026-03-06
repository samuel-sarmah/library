export default async function handler(req, res) {
    const { id } = req.query;

    const endpoint = `https://ll.thespacedevs.com/2.3.0/launches/${id}/?mode=detailed`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(endpoint, {
            signal: controller.signal,
        });
        clearTimeout(timeout);

        const data = await response.json();

        if (!response.ok) {
            console.error(`Upstream API error ${response.status}:`, data);
        }

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        return res.status(response.status).json(data);
    } catch (err) {
        if (err.name === 'AbortError') {
            console.error('Upstream API timed out for launch:', id);
            return res.status(504).json({ error: 'Upstream API timed out. Please try again.' });
        }
        console.error('Proxy error:', err);
        return res.status(502).json({ error: 'Failed to fetch from upstream API' });
    }
}
