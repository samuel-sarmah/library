import { useState, useEffect } from 'react';
import Header from './Header';

const SNAPI_DIRECT = 'https://api.spaceflightnewsapi.net/v4/articles/';

async function fetchArticles(signal) {
    try {
        const r = await fetch('/api/news?limit=20', { signal });
        if (r.ok) return r.json();
    } catch { /* proxy unreachable, fall through */ }
    const r2 = await fetch(`${SNAPI_DIRECT}?limit=20`, { signal });
    if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
    return r2.json();
}

function ArticleSkeleton() {
    return (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-md overflow-hidden animate-pulse">
            <div className="h-44 bg-[#1a1a1a]" />
            <div className="p-4 space-y-2">
                <div className="h-4 bg-[#1a1a1a] rounded w-3/4" />
                <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
            </div>
        </div>
    );
}

function NewsFeed() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        fetchArticles(controller.signal)
            .then((data) => setArticles(data.results || []))
            .catch((err) => {
                if (err.name !== 'AbortError') setError('Failed to load news. Please try again later.');
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    return (
        <>
            <Header />
            <div className="min-h-screen px-6 py-10 max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Space News</h1>
                    <p className="text-gray-500 text-sm">Latest from the space industry</p>
                </div>

                {error && (
                    <div className="text-center py-16">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white text-sm hover:bg-[#222] transition-colors"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? Array.from({ length: 9 }).map((_, i) => <ArticleSkeleton key={i} />)
                        : articles.map((article) => (
                            <a
                                key={article.id}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-md overflow-hidden hover:border-[#444] transition-colors flex flex-col group"
                            >
                                {article.image_url ? (
                                    <img
                                        src={article.image_url}
                                        alt=""
                                        className="h-44 w-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="h-44 bg-[#111] flex items-center justify-center">
                                        <span className="text-4xl opacity-30">🚀</span>
                                    </div>
                                )}
                                <div className="p-4 flex flex-col gap-2 flex-1">
                                    <p className="text-white text-sm font-medium leading-snug group-hover:text-[#4da6ff] transition-colors line-clamp-3">
                                        {article.title}
                                    </p>
                                    {article.summary && (
                                        <p className="text-gray-500 text-xs line-clamp-2">{article.summary}</p>
                                    )}
                                    <div className="mt-auto flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-[#1a1a1a]">
                                        <span className="truncate font-medium text-gray-500">{article.news_site}</span>
                                        <span className="shrink-0 ml-2">
                                            {new Date(article.published_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))
                    }
                </div>
            </div>
        </>
    );
}

export default NewsFeed;
