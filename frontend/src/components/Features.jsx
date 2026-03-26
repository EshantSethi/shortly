import React from 'react';

const features = [
    {
        icon: '⚡',
        title: 'Redis caching',
        desc: 'Popular links served from memory in under 10ms. Zero database hit on repeated clicks.',
    },
    {
        icon: '📊',
        title: 'Click analytics',
        desc: 'Track every click with timestamps. View bar charts on the analytics dashboard.',
    },
    {
        icon: '⏰',
        title: 'Link expiry',
        desc: 'Set links to expire in 7, 30, or 90 days. Expired links return a clean error.',
    },
    {
        icon: '🔗',
        title: 'Instant redirect',
        desc: 'HTTP 302 redirect returns in milliseconds. Seamless experience for every user.',
    },
    {
        icon: '📋',
        title: 'One-click copy',
        desc: 'Copy your short link instantly with a single click. No selecting, no manual copying.',
    },
    {
        icon: '🛡',
        title: 'REST API',
        desc: 'Full REST API backend with clean JSON responses. Easy to integrate with any client.',
    },
];

function Features() {
    return (
        <div id="features" style={styles.section}>
            <div style={styles.header}>
                <div style={styles.badge}>Features</div>
                <h2 style={styles.title}>Everything you need</h2>
                <p style={styles.sub}>Built with production-grade technologies used at scale</p>
            </div>
            <div style={styles.grid}>
                {features.map((f, i) => (
                    <div key={i} style={styles.card}>
                        <div style={styles.icon}>{f.icon}</div>
                        <div style={styles.cardTitle}>{f.title}</div>
                        <div style={styles.cardDesc}>{f.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    section: {
        padding: '60px 40px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    badge: {
        display: 'inline-block',
        background: 'rgba(233,69,96,0.1)',
        border: '1px solid rgba(233,69,96,0.2)',
        borderRadius: '20px',
        padding: '4px 14px',
        color: '#e94560',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '14px',
    },
    title: {
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '10px',
    },
    sub: {
        color: '#a8a8b3',
        fontSize: '14px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        maxWidth: '900px',
        margin: '0 auto',
    },
    card: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '24px',
        transition: 'border-color 0.2s',
    },
    icon: {
        fontSize: '24px',
        marginBottom: '12px',
    },
    cardTitle: {
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '8px',
    },
    cardDesc: {
        color: '#666',
        fontSize: '13px',
        lineHeight: '1.6',
    },
};

export default Features;
