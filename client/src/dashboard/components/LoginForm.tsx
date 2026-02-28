import React, { useState } from 'react';
import { login } from '../api';

interface Props {
  onLogin: (user: { username: string; role: string }) => void;
}

export function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <form onSubmit={handleSubmit} style={styles.card} aria-label="Staff login">
        <h2 style={styles.title}>Staff Login</h2>
        <p style={styles.subtitle}>UK Lending Platform — Staff Dashboard</p>

        {error && <div role="alert" style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label htmlFor="login-username" style={styles.label}>Username</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="login-password" style={styles.label}>Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div style={styles.hint}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Demo accounts:</p>
          <p>branch.user / branch123</p>
          <p>underwriter / underwriter123</p>
          <p>compliance / compliance123</p>
          <p>executive / executive123</p>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)', padding: 20,
  },
  card: {
    background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
  },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'var(--color-text-light)', marginBottom: 24 },
  error: {
    background: '#fdecea', color: '#c62828', padding: '10px 14px',
    borderRadius: 6, fontSize: 13, marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)',
    borderRadius: 6, fontSize: 14, boxSizing: 'border-box' as const,
  },
  button: {
    width: '100%', padding: '12px', background: 'var(--color-primary)', color: '#fff',
    border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: 'pointer',
    marginTop: 8,
  },
  hint: {
    marginTop: 20, padding: 12, background: '#f8f9fa', borderRadius: 6,
    fontSize: 12, color: 'var(--color-text-light)', lineHeight: 1.6,
  },
};
