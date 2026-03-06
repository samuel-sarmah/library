export default async function handler(req, res) {
    const { type = 'upcoming', limit } = req.query;
    const effectiveLimit = limit || (type === 'previous' ? '30' : '100');

    if (!['upcoming', 'previous'].includes(type)) {
        return res.status(400).json({ error: 'Invalid launch type' });
    }

    const endpoint = `https://ll.thespacedevs.com/2.3.0/launches/${type}/?limit=${effectiveLimit}&mode=detailed`;

    try {
        const response = await fetch(endpoint, {});
        const data = await response.json();

        const normalizeVideoUrls = (launch) => {
            const entries = [];

            const pushEntry = (item) => {
                if (!item) return;

                if (typeof item === 'string') {
                    entries.push({ url: item, title: 'Launch Stream' });
                    return;
                }

                if (typeof item === 'object') {
                    const url = item.url || item.uri || item.link;
                    if (typeof url === 'string' && url.trim()) {
                        entries.push({
                            ...item,
                            url,
                            title: item.title || item.name || 'Launch Stream',
                        });
                    }
                }
            };

            const listSources = [launch?.video_urls, launch?.vid_urls, launch?.vidURLs];
            listSources.forEach((source) => {
                if (Array.isArray(source)) {
                    source.forEach(pushEntry);
                }
            });

            const singleSources = [launch?.webcast_url, launch?.stream_url, launch?.video_url];
            singleSources.forEach(pushEntry);

            const unique = [];
            const seen = new Set();

            entries.forEach((item) => {
                const url = item.url?.trim();
                if (!url || !/^https?:\/\//i.test(url)) return;
                if (seen.has(url)) return;
                seen.add(url);
                unique.push({ ...item, url });
            });

            return unique;
        };

        const normalizedData = {
            ...data,
            results: Array.isArray(data?.results)
                ? data.results.map((launch) => ({
                    ...launch,
                    window_open: launch.window_start || null,
                    window_close: launch.window_end || null,
                    liftoff_exact: launch.net || null,
                    video_urls: normalizeVideoUrls(launch),
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
