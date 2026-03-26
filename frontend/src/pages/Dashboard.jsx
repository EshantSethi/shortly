import React, { useState, useEffect } from 'react';
import { getAllUrls, deleteUrl, getAnalytics } from '../services/api';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale,
    BarElement, LineElement, PointElement,
    Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function Dashboard() {
    const [urls, setUrls] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [urlData, analyticsData] = await Promise.all([getAllUrls(), getAnalytics()]);
            setUrls(urlData);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error('Fetch failed:', err);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteUrl(id);
            fetchAll();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setToast('Copied!');
        setTimeout(() => setToast(''), 2000);
    };

    const filteredUrls = urls.filter(url =>
        url.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
        url.shortCode.toLowerCase().includes(search.toLowerCase())
    );

    const baseUrl = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace('/api', '')
        : 'http://localhost:8080';

    const barData = {
        labels: urls.map(u => u.shortCode),
        datasets: [{ label: 'Total Clicks', data: urls.map(u => u.clickCount), backgroundColor: '#e94560', borderRadius: 6 }]
    };

    const lineData = {
        labels: analytics.map(a => a.day),
        datasets: [{
            label: 'Clicks per Day',
            data: analytics.map(a => a.count),
            borderColor: '#e94560',
            backgroundColor: 'rgba(233,69,96,0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#e94560',
            tension: 0.4,
            fill: true,
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, color: '#ffffff', font: { size: 15 } }
        },
        scales: {
            x: { ticks: { color: '#a8a8b3' }, grid: { color: '#ffffff10' } },
            y: { ticks: { color: '#a8a8b3' }, grid: { color: '#ffffff10' }, beginAtZero: true }
        }
    };

    return (
        <div style={styles.page}>
            {toast && <div style={styles.toast}>{toast}</div>}
            <div style={styles.container}>
                <h1 style={styles.title}>Dashboard</h1>
                <p style={styles.subtitle}>Track all your shortened URLs and their performance</p>

                {loading ? <p style={styles.loading}>Loading...</p> : (
                    <>
                        <div style={styles.statsRow}>
                            <div style={styles.statCard}>
                                <p style={styles.statNumber}>{urls.length}</p>
                                <p style={styles.statLabel}>Total URLs</p>
                            </div>
                            <div style={styles.statCard}>
                                <p style={styles.statNumber}>{urls.reduce((sum, u) => sum + u.clickCount, 0)}</p>
                                <p style={styles.statLabel}>Total Clicks</p>
                            </div>
                            <div style={styles.statCard}>
                                <p style={styles.statNumber}>
                                    {analytics.length > 0 ? analytics[analytics.length - 1].count : 0}
                                </p>
                                <p style={styles.statLabel}>Clicks Today</p>
                            </div>
                        </div>

                        <div style={styles.chartsRow}>
                            {urls.length > 0 && (
                                <div style={styles.chartBox}>
                                    <Bar data={barData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, display: true, text: 'Clicks per Short URL' } } }} />
                                </div>
                            )}
                            <div style={styles.chartBox}>
                                {analytics.length > 0 ? (
                                    <Line data={lineData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, display: true, text: 'Clicks — Last 7 Days' } } }} />
                                ) : (
                                    <p style={styles.noData}>No click data yet — share your links to see analytics here.</p>
                                )}
                            </div>
                        </div>

                        <div style={styles.tableBox}>
                            <input
                                style={styles.searchInput}
                                type="text"
                                placeholder="Search by URL or short code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Short Code</th>
                                        <th style={styles.th}>Original URL</th>
                                        <th style={styles.th}>Clicks</th>
                                        <th style={styles.th}>Expires</th>
                                        <th style={styles.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUrls.map(url => (
                                        <tr key={url.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <a
                                                        href={`${baseUrl}/api/r/${url.shortCode}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={styles.codeLink}>
                                                        {url.shortCode}
                                                    </a>
                                                    <button
                                                        style={styles.dashCopyBtn}
                                                        onClick={() => copyToClipboard(`${baseUrl}/api/r/${url.shortCode}`)}>
                                                        Copy
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ ...styles.td, ...styles.urlCell }}>{url.originalUrl}</td>
                                            <td style={{ ...styles.td, textAlign: 'center' }}>{url.clickCount}</td>
                                            <td style={styles.td}>
                                                {url.expiresAt ? new Date(url.expiresAt).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td style={styles.td}>
                                                <button style={styles.deleteBtn} onClick={() => handleDelete(url.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUrls.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#a8a8b3' }}>
                                                No results found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#0f3460', padding: '40px 20px' },
    container: { maxWidth: '960px', margin: '0 auto' },
    title: { color: '#ffffff', fontSize: '28px', marginBottom: '8px' },
    subtitle: { color: '#a8a8b3', fontSize: '14px', marginBottom: '32px' },
    loading: { color: '#a8a8b3', textAlign: 'center' },
    toast: {
        position: 'fixed', top: '80px', right: '24px',
        background: '#16213e', border: '1px solid rgba(233,69,96,0.3)',
        borderRadius: '10px', padding: '10px 18px',
        color: '#ffffff', fontSize: '13px', fontWeight: '500', zIndex: 1000,
    },
    statsRow: { display: 'flex', gap: '16px', marginBottom: '28px' },
    statCard: { backgroundColor: '#16213e', borderRadius: '12px', padding: '24px', flex: 1, textAlign: 'center' },
    statNumber: { color: '#e94560', fontSize: '36px', fontWeight: 'bold', margin: 0 },
    statLabel: { color: '#a8a8b3', fontSize: '13px', margin: '4px 0 0' },
    chartsRow: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
    chartBox: { backgroundColor: '#16213e', borderRadius: '12px', padding: '24px', flex: 1, minWidth: '280px' },
    noData: { color: '#a8a8b3', fontSize: '13px', textAlign: 'center', padding: '40px 0' },
    tableBox: { backgroundColor: '#16213e', borderRadius: '12px', padding: '24px', overflowX: 'auto' },
    searchInput: {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)', color: '#ffffff',
        fontSize: '13px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { color: '#a8a8b3', fontSize: '13px', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #ffffff15' },
    tr: { borderBottom: '1px solid #ffffff10' },
    td: { color: '#ffffff', fontSize: '13px', padding: '14px 16px' },
    urlCell: { maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    codeLink: { color: '#e94560', fontWeight: 'bold', textDecoration: 'none' },
    dashCopyBtn: {
        padding: '3px 8px', background: 'rgba(233,69,96,0.1)',
        border: '1px solid rgba(233,69,96,0.2)', borderRadius: '4px',
        color: '#e94560', fontSize: '10px', cursor: 'pointer',
    },
    deleteBtn: {
        padding: '4px 10px', background: 'rgba(233,69,96,0.1)',
        border: '1px solid rgba(233,69,96,0.2)', borderRadius: '6px',
        color: '#e94560', fontSize: '11px', cursor: 'pointer',
    },
};

export default Dashboard;
