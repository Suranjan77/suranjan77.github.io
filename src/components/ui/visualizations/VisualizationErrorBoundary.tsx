'use client';
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  algorithmId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class VisualizationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Visualization error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
        }}>
          <h3 style={{ color: '#ef4444', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Visualization Error
          </h3>
          <p style={{ color: '#a1a1aa', marginBottom: '1rem', fontSize: '0.875rem' }}>
            This visualization encountered an error. Please try resetting or refreshing the page.
          </p>
          <button aria-label="Reset Visualization"
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: '1px solid #ef4444',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Reset Visualization
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
