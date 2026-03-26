import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleFeaturesClick = (e) => {
        e.preventDefault();
        setMenuOpen(false);
        if (location.pathname === '/') {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/');
            setTimeout(() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>Shortly</div>

            {/* Desktop links */}
            <div className="nav-desktop-links" style={styles.links}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                <a href="#features" onClick={handleFeaturesClick} style={styles.link}>Features</a>
            </div>

            {/* Hamburger button (mobile only) */}
            <button
                className="nav-hamburger"
                style={styles.hamburger}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
            >
                <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
                <span style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} />
                <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
            </button>

            {/* Mobile dropdown */}
            <div className={`nav-links${menuOpen ? ' open' : ''}`}>
                <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <a href="#features" onClick={handleFeaturesClick} style={styles.mobileLink}>Features</a>
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
    hamburger: {
        display: 'none',
        flexDirection: 'column',
        gap: '5px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
    },
    bar: {
        display: 'block',
        width: '22px',
        height: '2px',
        background: '#ffffff',
        borderRadius: '2px',
        transition: 'all 0.25s ease',
    },
    mobileLink: {
        color: '#a8a8b3',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '500',
    },
};

export default Navbar;
