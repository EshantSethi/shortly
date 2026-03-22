import React, { useState } from 'react';
import { shortenUrl } from '../services/api';

function Home() {
    const [originalUrl, setOriginalUrl] = useState('');
    const [expiryDays, setExpiryDays] = useState(30);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleShorten = async () => {
        if (!originalUrl) { setError('Please enter a URL'); return; }
        setLoading(true);
        setError('');
        try {
            const data = await shortenUrl(originalUrl, expiryDays);
            setResult(data);
        } catch (err) {
            setError('Something went wrong. Make sure your backend is running.');
        }
        setLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result.shortUrl);
        alert('Copied to clipboard!');
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Shorten Your URL</h1>
                <p style={styles.subtitle}>Paste a long URL and get a short link instantly</p>
                <input style={styles.input} type="text"
                    placeholder="https://your-long-url.com/goes/here"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)} />
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
                {error && <p style={styles.error}>{error}</p>}
                <button style={styles.button} onClick={handleShorten} disabled={loading}>
                    {loading ? 'Shortening...' : 'Shorten URL'}
                </button>
                {result && (
                    <div style={styles.result}>
                        <p style={styles.resultLabel}>Your short URL:</p>
                        <div style={styles.resultRow}>
                            <a href={result.shortUrl} target="_blank" rel="noreferrer" style={styles.resultLink}>
                                {result.shortUrl}
                            </a>
                            <button style={styles.copyBtn} onClick={copyToClipboard}>Copy</button>
                        </div>
                        <p style={styles.expiry}>
                            Expires: {result.expiresAt === 'Never' ? 'Never' : new Date(result.expiresAt).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#0f3460', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    card: { backgroundColor: '#16213e', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '560px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
    title: { color: '#ffffff', fontSize: '28px', marginBottom: '8px', textAlign: 'center' },
    subtitle: { color: '#a8a8b3', textAlign: 'center', marginBottom: '32px', fontSize: '14px' },
    input: { width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e9456020', backgroundColor: '#0f3460', color: '#ffffff', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' },
    row: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
    label: { color: '#a8a8b3', fontSize: '14px' },
    select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e9456020', backgroundColor: '#0f3460', color: '#ffffff', fontSize: '14px' },
    button: { width: '100%', padding: '14px', backgroundColor: '#e94560', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    error: { color: '#e94560', fontSize: '13px', marginBottom: '12px' },
    result: { marginTop: '24px', padding: '20px', backgroundColor: '#0f3460', borderRadius: '12px', border: '1px solid #e9456030' },
    resultLabel: { color: '#a8a8b3', fontSize: '13px', marginBottom: '8px' },
    resultRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    resultLink: { color: '#e94560', fontSize: '16px', fontWeight: 'bold', flex: 1 },
    copyBtn: { padding: '8px 16px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    expiry: { color: '#a8a8b3', fontSize: '12px', marginTop: '8px' },
};

export default Home;
