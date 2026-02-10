export default async function handler(req, res) {
    const { id } = req.query;

    const apiKey = process.env.SPACE_DEVS_API_KEY;
    if (!apiKey) {
        console.error('SPACE_DEVS_API_KEY environment variable is not set');
        return res.status(500).json({ error: 'API key not configured on server' });
    }

    const endpoint = `https://ll.thespacedevs.com/2.3.0/launches/${id}/?mode=detailed`;

    try {
        const response = await fetch(endpoint, {
            headers: { 'Authorization': `Token ${apiKey}` },
        });
        const data = await response.json();

        if (!response.ok) {
            console.error(`Upstream API error ${response.status}:`, data);
        }

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        return res.status(response.status).json(data);
    } catch (err) {
        console.error('Proxy error:', err);
        return res.status(502).json({ error: 'Failed to fetch from upstream API' });
    }
}
