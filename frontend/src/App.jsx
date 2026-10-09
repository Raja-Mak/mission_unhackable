import { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/check-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to scan URL');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🛡️ Mission Unhackable</h1>
        <p style={styles.subtitle}>Threat Intelligence URL Authenticator</p>
      </header>

      <main style={styles.main}>
        <form onSubmit={handleScan} style={styles.form}>
          <input
            type="text"
            placeholder="Enter URL to analyze (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Scanning...' : 'Scan URL'}
          </button>
        </form>

        {error && <div style={styles.errorBox}>⚠️ Error: {error}</div>}

        {result && (
          <div style={styles.resultBox}>
            <h3>Scan Result:</h3>
            <p><strong>Status:</strong> {result.status}</p>
            {result.message && <p>{result.message}</p>}
            {result.stats && (
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderColor: '#22c55e' }}>
                  <span>Harmless</span>
                  <h2>{result.stats.harmless || 0}</h2>
                </div>
                <div style={{ ...styles.statCard, borderColor: '#ef4444' }}>
                  <span>Malicious</span>
                  <h2>{result.stats.malicious || 0}</h2>
                </div>
                <div style={{ ...styles.statCard, borderColor: '#eab308' }}>
                  <span>Suspicious</span>
                  <h2>{result.stats.suspicious || 0}</h2>
                </div>
                <div style={{ ...styles.statCard, borderColor: '#3b82f6' }}>
                  <span>Undetected</span>
                  <h2>{result.stats.undetected || 0}</h2>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'Inter, system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItem: 'center',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#38bdf8',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  main: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  form: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#fff',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
    borderRadius: '8px',
  },
  resultBox: {
    padding: '1.5rem',
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginTop: '1rem',
  },
  statCard: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    borderWidth: '2px',
    borderStyle: 'solid',
    textAlign: 'center',
  },
};

export default App;