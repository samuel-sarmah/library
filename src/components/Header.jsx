function Header() {
    const styles = {
        header: {
            backgroundColor: '#0a0a0a',
            borderBottom: '1px solid #222',
            padding: '16px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
            overflow: 'hidden',
        },
        container: {
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        logoIcon: {
            fontSize: '24px',
        },
        logoText: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '0.5px',
        },
        tagline: {
            fontSize: '13px',
            color: '#888888',
        },
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <div style={styles.logo}>
                    <span style={styles.logoText}>Mission Status</span>
                </div>
                <span style={styles.tagline}>Launch Tracker</span>
            </div>
        </header>
    );
}

export default Header;
