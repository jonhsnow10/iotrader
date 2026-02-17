import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.props.fallback) {
      return this.props.fallback;
    }
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A] p-6">
          <div className="max-w-md w-full p-6 bg-[#111111] border border-[#FF3B69]/30 rounded-lg">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FF3B69]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FF3B69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
              <p className="text-[#999999] text-sm leading-relaxed">An unexpected error occurred. Please refresh the page.</p>
              <button onClick={() => window.location.reload()} className="mt-2 px-6 py-2.5 bg-[#FFF800] text-black text-sm font-semibold rounded-lg hover:opacity-90">
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
