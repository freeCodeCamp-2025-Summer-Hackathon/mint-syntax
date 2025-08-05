import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    void _error;
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    if (import.meta.env.DEV) {
      console.log('Development mode error details:');
      console.log('Error:', error);
      console.log('Error Info:', errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='error-boundary-fallback'>
          <h1>Something went wrong.</h1>
          <p>
            We&apos;re sorry for the inconvenience. Please try refreshing the
            page.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
