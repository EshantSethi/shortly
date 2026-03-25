import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>Shortly</div>
            <div style={styles.links}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                <a href="#features" style={styles.link}>Features</a>
                <a href="https://github.com/EshantSethi/url-shortener" target="_blank" rel="noreferrer" style={styles.githubBtn}>GitHub</a>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    brand: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#e94560',
    },
    links: {
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
    },
    link: {
        color: '#a8a8b3',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
    },
    githubBtn: {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '7px 16px',
        fontSize: '13px',
        fontWeight: '600',
        textDecoration: 'none',
    },
};

export default Navbar;
