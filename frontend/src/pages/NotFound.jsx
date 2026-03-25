import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.code}>404</div>
                <h1 style={styles.title}>Link not found</h1>
                <p style={styles.desc}>
                    This short link doesn't exist or has expired.
                </p>
                <Link to="/" style={styles.btn}>
                    Create a new short link
                </Link>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(-45deg, #0f3460, #16213e, #1a1a2e, #0d1b2a)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '440px',
        width: '100%',
    },
    code: {
        fontSize: '72px',
        fontWeight: '700',
        color: '#e94560',
        lineHeight: '1',
        marginBottom: '16px',
    },
    title: {
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '12px',
    },
    desc: {
        color: '#a8a8b3',
        fontSize: '14px',
        lineHeight: '1.6',
        marginBottom: '32px',
    },
    btn: {
        display: 'inline-block',
        background: 'linear-gradient(135deg, #e94560, #c73652)',
        color: '#ffffff',
        textDecoration: 'none',
        padding: '14px 28px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
    },
};

export default NotFound;