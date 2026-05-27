import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SNAPI_DIRECT = 'https://api.spaceflightnewsapi.net/v4/articles/';

async function fetchArticles(signal) {
    try {
        const r = await fetch('/api/news?limit=5', { signal });
        if (r.ok) return r.json();
    } catch { /* proxy unreachable, fall through */ }
    const r2 = await fetch(`${SNAPI_DIRECT}?limit=5`, { signal });
    if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
    return r2.json();
}

function CardSkeleton() {
    return (
        <div className="shrink-0 w-56 bg-[#0d0d0d] border border-[#1a1a1a] rounded-md overflow-hidden animate-pulse">
            <div className="h-32 bg-[#1a1a1a]" />
            <div className="p-3 space-y-2">
                <div className="h-3 bg-[#1a1a1a] rounded w-full" />
                <div className="h-3 bg-[#1a1a1a] rounded w-3/4" />
                <div className="h-2 bg-[#1a1a1a] rounded w-1/2 mt-2" />
            </div>
        </div>
    );
}

function NewsHighlight() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        fetchArticles(controller.signal)
            .then((data) => setArticles(data.results || []))
            .catch(() => { /* silent fail */ })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, []);

    if (!loading && articles.length === 0) return null;

    return (
        <div className="mb-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4da6ff]" />
                    <span className="text-xs font-bold text-[#4da6ff] uppercase tracking-widest">Space News</span>
                </div>
                <button
                    className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                    onClick={() => navigate('/news')}
                >
                    See More <span aria-hidden>→</span>
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                    : articles.map((article) => (
                        <a
                            key={article.id}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 w-56 bg-[#0d0d0d] border border-[#1a1a1a] rounded-md overflow-hidden hover:border-[#444] transition-colors flex flex-col group"
                        >
                            {article.image_url ? (
                                <img
                                    src={article.image_url}
                                    alt=""
                                    className="h-32 w-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="h-32 bg-[#111] flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8 text-gray-700">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                            )}
                            <div className="p-3 flex flex-col gap-1.5 flex-1">
                                <p className="text-white text-xs font-medium leading-snug group-hover:text-[#4da6ff] transition-colors line-clamp-3">
                                    {article.title}
                                </p>
                                <div className="mt-auto flex items-center justify-between text-[10px] text-gray-600 pt-1.5 border-t border-[#1a1a1a]">
                                    <span className="truncate font-medium text-gray-500">{article.news_site}</span>
                                    <span className="shrink-0 ml-1">
                                        {new Date(article.published_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))
                }
            </div>
        </div>
    );
}

export default NewsHighlight;
