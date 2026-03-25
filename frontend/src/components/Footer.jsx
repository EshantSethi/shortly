import React from 'react';

function Footer() {
    return (
        <footer style={styles.footer}>
            <div style={styles.top}>
                <div style={styles.left}>
                    <div style={styles.brand}>Shortly</div>
                    <div style={styles.tagline}>A full-stack URL shortener with real-time analytics. Built as a portfolio project.</div>
                    <div style={styles.techPills}>
                        {['Java 21', 'Spring Boot', 'React', 'MySQL', 'Redis', 'REST API'].map(t => (
                            <span key={t} style={styles.pill}>{t}</span>
                        ))}
                    </div>
                </div>
                <div style={styles.right}>
                    <div style={styles.devLabel}>Developed by</div>
                    <div style={styles.devName}>Eshant Sethi</div>
                    <div style={styles.devRole}>BTech CSE · SRM Institute of Science and Technology · 2027</div>
                    <div style={styles.devLinks}>
                        <a href="mailto:eshantsethi012@gmail.com" style={{...styles.devLink, ...styles.emailLink}}>eshantsethi012@gmail.com</a>
                    </div>
                    <div style={styles.devLinks}>
                        <a href="https://github.com/EshantSethi" target="_blank" rel="noreferrer" style={styles.devLink}>GitHub</a>
                        <a href="https://www.linkedin.com/in/eshantsethi09548/" target="_blank" rel="noreferrer" style={styles.devLink}>LinkedIn</a>
                        <a href="https://github.com/EshantSethi/url-shortener" target="_blank" rel="noreferrer" style={styles.devLink}>Source Code</a>
                    </div>
                </div>
            </div>
            <div style={styles.bottom}>
                <div style={styles.copy}>2026 Eshant Sethi · Open source project</div>
                <div style={styles.stack}>Spring Boot · React · Redis · MySQL</div>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        background: 'rgba(0,0,0,0.4)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 40px 24px',
    },
    top: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '28px',
        gap: '40px',
        flexWrap: 'wrap',
    },
    left: { flex: 1, minWidth: '240px' },
    brand: { color: '#e94560', fontSize: '18px', fontWeight: '700', marginBottom: '10px' },
    tagline: { color: '#555', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' },
    techPills: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    pill: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '4px 12px',
        color: '#a8a8b3',
        fontSize: '11px',
        fontWeight: '500',
    },
    right: { minWidth: '280px' },
    devLabel: { color: '#555', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
    devName: { color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '4px' },
    devRole: { color: '#a8a8b3', fontSize: '12px', marginBottom: '14px', lineHeight: '1.5' },
    devLinks: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' },
    devLink: {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '7px',
        padding: '7px 14px',
        color: '#a8a8b3',
        fontSize: '12px',
        textDecoration: 'none',
        fontWeight: '500',
    },
    emailLink: {
        borderColor: 'rgba(233,69,96,0.3)',
        color: '#e94560',
        background: 'rgba(233,69,96,0.08)',
    },
    bottom: {
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
    },
    copy: { color: '#444', fontSize: '12px' },
    stack: { color: '#444', fontSize: '12px' },
};

export default Footer;
