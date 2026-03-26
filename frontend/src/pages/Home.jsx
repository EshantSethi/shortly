import { QRCodeCanvas as QRCode } from 'qrcode.react';
import React, { useState, useEffect } from 'react';
import { shortenUrl, getAllUrls } from '../services/api';
import BASE_URL from '../services/config';

const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

function isLinkExpired(link) {
    return link.expiresAt && link.expiresAt !== 'Never' && new Date(link.expiresAt) < new Date();
}

function Home() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [expiryDays, setExpiryDays] = useState(30);
    const [customCode, setCustomCode] = useState('');
    const [aliasError, setAliasError] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(false);
    const [recentLinks, setRecentLinks] = useState([]);
    const [totalUrls, setTotalUrls] = useState(0);
    const [totalClicks, setTotalClicks] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem('recentLinks');
        if (saved) setRecentLinks(JSON.parse(saved));
    }, []);

    useEffect(() => {
        getAllUrls().then(data => {
            setTotalUrls(data.length);
            setTotalClicks(data.reduce((sum, u) => sum + u.clickCount, 0));
        }).catch(() => {});
    }, [result]);

    const handleAliasChange = (e) => {
        const val = e.target.value;
        setCustomCode(val);
        if (val && !ALIAS_PATTERN.test(val)) {
            setAliasError('3–20 chars: letters, numbers, - or _ only');
        } else {
            setAliasError('');
        }
    };

    const handleShorten = async () => {
        if (!originalUrl) { setError('Please enter a URL'); return; }
        const trimmed = originalUrl.trim();
        const hasProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://');
        if (!hasProtocol && !trimmed.includes('.')) {
            setError('Please enter a valid URL (e.g. https://example.com)');
            return;
        }
        if (customCode && !ALIAS_PATTERN.test(customCode)) {
            setError('Fix the custom alias before shortening.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await shortenUrl(trimmed, expiryDays, customCode);
            setResult(data);
            const updated = [data, ...recentLinks].slice(0, 5);
            setRecentLinks(updated);
            localStorage.setItem('recentLinks', JSON.stringify(updated));
        } catch (err) {
            if (!err.response) {
                setError('Cannot reach the server. Make sure the backend is running.');
            } else if (err.response.status === 429) {
                setError('Too many requests. Please wait a moment and try again.');
            } else {
                setError(err.response.data?.error || 'Something went wrong. Please try again.');
            }
        }
        setLoading(false);
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        setToast(true);
        setTimeout(() => setToast(false), 2500);
    };

    const downloadQR = () => {
        const canvas = document.getElementById('qr-canvas-wrapper')?.querySelector('canvas');
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `shortly-qr-${result?.shortCode || 'code'}.png`;
        a.click();
    };

    return (
        <div style={styles.page}>
            {toast && (
                <div style={styles.toast}>
                    <div style={styles.toastDot}></div>
                    Copied to clipboard!
                </div>
            )}
            <div style={styles.hero}>
                <h1 className="hero-title" style={styles.heroTitle}>
                    Shorten. Share.<br />
                    <span style={styles.heroAccent}>Track everything.</span>
                </h1>
                <p style={styles.heroSub}>
                    Turn long URLs into powerful short links with real-time analytics
                </p>
            </div>
            <div className="home-card" style={styles.card}>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="https://paste-your-long-url-here.com"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                />
                <div style={styles.row}>
                    <label style={styles.label}>Expires in:</label>
                    <select style={styles.select} value={expiryDays}
                        onChange={(e) => setExpiryDays(Number(e.target.value))}>
                        <option value={7}>7 days</option>
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                        <option value={0}>Never</option>
                    </select>
                </div>
                <div style={{
                    ...styles.aliasRow,
                    borderColor: aliasError ? 'rgba(233,69,96,0.6)' : 'rgba(233,69,96,0.2)',
                }}>
                    <span style={styles.aliasPrefix}>shortly/</span>
                    <input
                        style={styles.aliasInput}
                        type="text"
                        placeholder="custom-alias (optional)"
                        value={customCode}
                        onChange={handleAliasChange}
                    />
                </div>
                {aliasError && <p style={styles.aliasHint}>{aliasError}</p>}
                {error && <p style={styles.error}>{error}</p>}
                <button
                    style={styles.button}
                    onMouseEnter={e => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(233,69,96,0.4)';
                    }}
                    onMouseLeave={e => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                    onClick={handleShorten}
                    disabled={loading}>
                    {loading ? 'Shortening...' : 'Shorten URL'}
                </button>
                {result && (
                    <div style={styles.result}>
                        <p style={styles.resultLabel}>Your short link is ready</p>
                        <div style={styles.resultRow}>
                            <a href={result.shortUrl} target="_blank"
                                rel="noreferrer" style={styles.resultLink}>
                                {result.shortUrl}
                            </a>
                            <button style={styles.copyBtn}
                                onClick={() => copyToClipboard(result.shortUrl)}>
                                Copy
                            </button>
                        </div>
                        <p style={styles.expiry}>
                            Expires: {result.expiresAt === 'Never' ? 'Never' :
                            new Date(result.expiresAt).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric'
                            })}
                        </p>
                        <div style={styles.qrSection}>
                            <p style={styles.qrLabel}>QR Code</p>
                            <div id="qr-canvas-wrapper" style={styles.qrBox}>
                                <QRCode
                                    value={result.shortUrl}
                                    size={120}
                                    bgColor="#ffffff"
                                    fgColor="#1a1a2e"
                                    level="H"
                                />
                            </div>
                            <div style={styles.qrActions}>
                                <p style={styles.qrHint}>Scan to open the link</p>
                                <button style={styles.qrDownloadBtn} onClick={downloadQR}>
                                    Download QR
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="stats-row" style={styles.statsRow}>
                <div style={styles.statBox}>
                    <div style={styles.statNum}>{totalUrls}</div>
                    <div style={styles.statLabel}>Links created</div>
                </div>
                <div style={styles.statBox}>
                    <div style={styles.statNum}>{totalClicks}</div>
                    <div style={styles.statLabel}>Total clicks</div>
                </div>
                <div style={styles.statBox}>
                    <div style={styles.statNum}>Redis</div>
                    <div style={styles.statLabel}>Powered cache</div>
                </div>
            </div>
            {recentLinks.length > 0 && (
                <div style={styles.recentBox}>
                    <p style={styles.recentTitle}>Recent links</p>
                    {recentLinks.map((link, i) => {
                        const expired = isLinkExpired(link);
                        return (
                            <div key={i} style={{
                                ...styles.recentRow,
                                opacity: expired ? 0.5 : 1,
                            }}>
                                <div style={styles.recentLeft}>
                                    <span style={styles.recentUrl}>
                                        {link.originalUrl.length > 40
                                            ? link.originalUrl.substring(0, 40) + '...'
                                            : link.originalUrl}
                                    </span>
                                    {expired && <span style={styles.expiredBadge}>Expired</span>}
                                </div>
                                <div style={styles.recentRight}>
                                    <a href={link.shortUrl} target="_blank"
                                        rel="noreferrer" style={styles.recentShort}>
                                        {link.shortUrl.replace(BASE_URL.replace('/api', ''), '')}
                                    </a>
                                    {!expired && (
                                        <button style={styles.recentCopy}
                                            onClick={() => copyToClipboard(link.shortUrl)}>
                                            Copy
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(-45deg, #0f3460, #16213e, #1a1a2e, #0d1b2a)',
        backgroundSize: '400% 400%',
        padding: '60px 20px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    qrSection: {
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.06)',
    },
    qrLabel: {
        color: '#a8a8b3',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '12px',
    },
    qrBox: {
        display: 'inline-block',
        padding: '10px',
        background: '#ffffff',
        borderRadius: '8px',
        marginBottom: '10px',
    },
    qrActions: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
    },
    qrHint: {
        color: '#555',
        fontSize: '11px',
        margin: 0,
    },
    qrDownloadBtn: {
        padding: '5px 12px',
        background: 'rgba(233,69,96,0.15)',
        border: '1px solid rgba(233,69,96,0.3)',
        borderRadius: '6px',
        color: '#e94560',
        fontSize: '11px',
        cursor: 'pointer',
        fontWeight: '500',
    },
    toast: {
        position: 'fixed',
        top: '80px',
        right: '24px',
        background: '#16213e',
        border: '1px solid rgba(233,69,96,0.3)',
        borderRadius: '10px',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '500',
        zIndex: 1000,
    },
    toastDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#4CAF50',
    },
    hero: {
        textAlign: 'center',
        marginBottom: '40px',
        maxWidth: '600px',
    },
    heroTitle: {
        color: '#ffffff',
        fontSize: '42px',
        fontWeight: '700',
        lineHeight: '1.2',
        marginBottom: '16px',
    },
    heroAccent: {
        color: '#e94560',
    },
    heroSub: {
        color: '#a8a8b3',
        fontSize: '16px',
        lineHeight: '1.6',
    },
    card: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '580px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        marginBottom: '32px',
        boxSizing: 'border-box',
    },
    input: {
        width: '100%',
        padding: '16px 18px',
        borderRadius: '12px',
        border: '1px solid rgba(233,69,96,0.2)',
        backgroundColor: 'rgba(15, 52, 96, 0.8)',
        color: '#ffffff',
        fontSize: '14px',
        marginBottom: '16px',
        boxSizing: 'border-box',
        outline: 'none',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
    },
    label: { color: '#a8a8b3', fontSize: '14px' },
    select: {
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(233,69,96,0.2)',
        backgroundColor: 'rgba(15, 52, 96, 0.8)',
        color: '#ffffff',
        fontSize: '14px',
    },
    button: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #e94560, #c73652)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    aliasRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        border: '1px solid rgba(233,69,96,0.2)',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'rgba(15, 52, 96, 0.8)',
    },
    aliasPrefix: {
        padding: '12px 14px',
        color: '#a8a8b3',
        fontSize: '13px',
        borderRight: '1px solid rgba(233,69,96,0.2)',
        whiteSpace: 'nowrap',
    },
    aliasInput: {
        flex: 1,
        padding: '12px 14px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#ffffff',
        fontSize: '13px',
        outline: 'none',
    },
    aliasHint: {
        color: '#e94560',
        fontSize: '11px',
        marginBottom: '12px',
        marginTop: '0',
    },
    error: { color: '#e94560', fontSize: '13px', marginBottom: '12px' },
    result: {
        marginTop: '24px',
        padding: '20px',
        background: 'rgba(15, 52, 96, 0.6)',
        borderRadius: '14px',
        border: '1px solid rgba(233,69,96,0.2)',
    },
    resultLabel: {
        color: '#a8a8b3',
        fontSize: '12px',
        marginBottom: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    resultRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    resultLink: { color: '#e94560', fontSize: '15px', fontWeight: '600', flex: 1, textDecoration: 'none' },
    copyBtn: {
        padding: '8px 18px',
        background: '#e94560',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
    },
    expiry: { color: '#a8a8b3', fontSize: '12px', marginTop: '10px' },
    statsRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
        width: '100%',
        maxWidth: '580px',
    },
    statBox: {
        flex: 1,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '18px',
        textAlign: 'center',
    },
    statNum: { color: '#e94560', fontSize: '20px', fontWeight: '700', marginBottom: '4px' },
    statLabel: { color: '#a8a8b3', fontSize: '11px' },
    recentBox: {
        width: '100%',
        maxWidth: '580px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '20px 24px',
    },
    recentTitle: {
        color: '#a8a8b3',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '12px',
    },
    recentRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    recentLeft: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 },
    recentUrl: { color: '#a8a8b3', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    expiredBadge: {
        fontSize: '10px',
        color: '#e94560',
        background: 'rgba(233,69,96,0.1)',
        border: '1px solid rgba(233,69,96,0.2)',
        borderRadius: '4px',
        padding: '1px 6px',
        whiteSpace: 'nowrap',
    },
    recentRight: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
    recentShort: { color: '#e94560', fontSize: '12px', fontWeight: '500', textDecoration: 'none' },
    recentCopy: {
        padding: '4px 10px',
        background: 'rgba(233,69,96,0.15)',
        color: '#e94560',
        border: '1px solid rgba(233,69,96,0.3)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '11px',
    },
};

export default Home;
