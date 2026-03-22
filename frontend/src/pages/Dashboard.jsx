import React, { useState, useEffect } from 'react';
import { getAllUrls } from '../services/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUrls(); }, []);

    const fetchUrls = async () => {
        try {
            const data = await getAllUrls();
            setUrls(data);
        } catch (err) {
            console.error('Error fetching URLs:', err);
        }
        setLoading(false);
    };

    const chartData = {
        labels: urls.map(u => u.shortCode),
        datasets: [{ label: 'Clicks', data: urls.map(u => u.clickCount), backgroundColor: '#e94560', borderRadius: 6 }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Clicks per Short URL', color: '#ffffff', font: { size: 16 } }
        },
        scales: {
            x: { ticks: { color: '#a8a8b3' }, grid: { color: '#ffffff10' } },
            y: { ticks: { color: '#a8a8b3' }, grid: { color: '#ffffff10' } }
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.title}>Dashboard</h1>
                <p style={styles.subtitle}>Track all your shortened URLs and their clicks</p>
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
                        </div>
                        {urls.length > 0 && (
                            <div style={styles.chartBox}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        )}
                        <div style={styles.tableBox}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Short Code</th>
                                        <th style={styles.th}>Original URL</th>
                                        <th style={styles.th}>Clicks</th>
                                        <th style={styles.th}>Expires</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {urls.map(url => (
                                        <tr key={url.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <a href={`http://localhost:8080/api/r/${url.shortCode}`} target="_blank" rel="noreferrer" style={styles.codeLink}>
                                                    {url.shortCode}
                                                </a>
                                            </td>
                                            <td style={{...styles.td, ...styles.urlCell}}>{url.originalUrl}</td>
                                            <td style={{...styles.td, textAlign: 'center'}}>{url.clickCount}</td>
                                            <td style={styles.td}>{url.expiresAt ? new Date(url.expiresAt).toLocaleDateString() : 'Never'}</td>
                                        </tr>
                                    ))}
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
    container: { maxWidth: '900px', margin: '0 auto' },
    title: { color: '#ffffff', fontSize: '28px', marginBottom: '8px' },
    subtitle: { color: '#a8a8b3', fontSize: '14px', marginBottom: '32px' },
    loading: { color: '#a8a8b3', textAlign: 'center' },
    statsRow: { display: 'flex', gap: '16px', marginBottom: '32px' },
    statCard: { backgroundColor: '#16213e', borderRadius: '12px', padding: '24px', flex: 1, textAlign: 'center' },
    statNumber: { color: '#e94560', fontSize: '36px', fontWeight: 'bold', margin: 0 },
    statLabel: { color: '#a8a8b3', fontSize: '13px', margin: '4px 0 0' },
    chartBox: { backgroundColor: '#16213e', borderRadius: '12px', padding: '24px', marginBottom: '32px' },
    tableBox: { backgroundColor: '#16213e', borderRadius: '12px', padding: '24px', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { color: '#a8a8b3', fontSize: '13px', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #ffffff15' },
    tr: { borderBottom: '1px solid #ffffff10' },
    td: { color: '#ffffff', fontSize: '13px', padding: '14px 16px' },
    urlCell: { maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    codeLink: { color: '#e94560', fontWeight: 'bold', textDecoration: 'none' },
};

export default Dashboard;
