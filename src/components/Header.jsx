import { Link, useLocation } from 'react-router-dom';

function Header() {
    const { pathname } = useLocation();

    return (
        <header className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-6 py-3.5 sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                <Link to="/" className="flex items-center gap-2 no-underline group">
                    <div className="flex flex-col leading-none">
                        <span className="text-white font-bold text-sm tracking-wide group-hover:text-gray-200 transition-colors">
                            LaunchTracker
                        </span>
                        <span className="text-[10px] text-gray-600 tracking-wider uppercase">Mission Status</span>
                    </div>
                </Link>

                <nav className="flex items-center gap-3">
                    <Link
                        to="/news"
                        className={`no-underline px-3.5 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                            pathname === '/news'
                                ? 'border-[#4da6ff] text-[#4da6ff] bg-[#4da6ff]/10'
                                : 'border-[#2a2a2a] text-gray-300 hover:border-[#4da6ff] hover:text-[#4da6ff]'
                        }`}
                    >
                        News
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;
