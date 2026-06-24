import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PulseIQ ErrorBoundary caught error]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-custom flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                An unexpected error occurred in PulseIQ. Please refresh the page to continue.
              </p>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 font-semibold">Technical Details</summary>
                  <pre className="mt-2 p-3 bg-slate-50 rounded-xl text-[10px] text-rose-600 overflow-auto max-h-32 font-mono">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="w-full py-3 px-6 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-md shadow-primary/15"
            >
              Reload PulseIQ
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
