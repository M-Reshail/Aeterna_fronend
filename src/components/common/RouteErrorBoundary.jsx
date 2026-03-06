import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Something went wrong' };
  }

  componentDidCatch(error) {
    console.error('Route error boundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a]/80 p-6 text-center">
            <h2 className="text-lg font-semibold text-white mb-2">Page error</h2>
            <p className="text-sm text-slate-400 mb-4">{this.state.errorMessage}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#2a2a2a] text-slate-300"
              >
                Retry
              </button>
              <Link to="/error" className="px-3 py-1.5 text-xs rounded-lg border border-[#2a2a2a] text-slate-300">
                Error page
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

RouteErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RouteErrorBoundary;
