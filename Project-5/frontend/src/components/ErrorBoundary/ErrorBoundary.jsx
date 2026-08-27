import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>⚠️</div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', maxWidth: '480px' }}>
            An unexpected error occurred while loading this page. Please try again.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
