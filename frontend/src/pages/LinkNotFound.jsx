import React from 'react';
import { Link } from 'react-router-dom';

function LinkNotFound() {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.icon}>🔗</div>
                <h1 style={styles.title}>Link Not Found</h1>
                <p style={styles.message}>
                    This short link doesn't exist or has expired.
                </p>
                <Link to="/" style={styles.btn}>Create a new short link</Link>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#0f0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '48px 40px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
    },
    icon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    title: {
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '12px',
    },
    message: {
        color: '#a8a8b3',
        fontSize: '15px',
        lineHeight: '1.6',
        marginBottom: '28px',
    },
    btn: {
        display: 'inline-block',
        padding: '12px 28px',
        background: 'linear-gradient(135deg, #e94560, #c73652)',
        color: '#ffffff',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
    },
};

export default LinkNotFound;
