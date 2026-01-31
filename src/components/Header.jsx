function Header() {
    return (
        <header className="bg-[#0a0a0a] border-b border-[#222] px-6 py-4 sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                    <span className="text-lg font-semibold text-white tracking-wide">Mission Status</span>
                </div>
                <span className="text-[13px] text-gray-500">Launch Tracker</span>
            </div>
        </header>
    );
}

export default Header;
