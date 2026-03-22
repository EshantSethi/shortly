import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>
                🔗 Shortly
            </div>
            <div style={styles.links}>
                <Link to="/" style={styles.link}>Home</Link>
                <Link to="/dashboard" style={styles.link}>Dashboard</Link>
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
        backgroundColor: '#1a1a2e',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    brand: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#e94560',
        letterSpacing: '1px',
    },
    links: {
        display: 'flex',
        gap: '24px',
    },
    link: {
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '500',
    }
};

export default Navbar;