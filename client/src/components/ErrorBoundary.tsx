import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div role="alert" style={styles.container}>
          <div style={styles.card}>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.message}>
              An unexpected error occurred. Your progress has been saved where possible.
            </p>
            {this.state.error && (
              <p style={styles.detail}>{this.state.error.message}</p>
            )}
            <div style={styles.actions}>
              <button onClick={this.handleRetry} style={styles.retryBtn}>
                Try again
              </button>
              <button onClick={() => window.location.href = '/'} style={styles.homeBtn}>
                Return to home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '50vh', padding: 20,
  },
  card: {
    background: '#fff', borderRadius: 12, padding: 32, maxWidth: 480,
    textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  title: { fontSize: 20, fontWeight: 700, color: '#c62828', marginBottom: 12 },
  message: { fontSize: 14, color: 'var(--color-text)', marginBottom: 8 },
  detail: { fontSize: 12, color: 'var(--color-text-light)', marginBottom: 20, fontFamily: 'monospace' },
  actions: { display: 'flex', gap: 12, justifyContent: 'center' },
  retryBtn: {
    background: 'var(--color-primary)', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    minHeight: 44,
  },
  homeBtn: {
    background: '#f0f0f0', color: 'var(--color-text)', border: 'none',
    padding: '10px 24px', borderRadius: 6, fontSize: 14, cursor: 'pointer',
    minHeight: 44,
  },
};
