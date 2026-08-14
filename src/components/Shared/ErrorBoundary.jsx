import { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="min-h-screen pt-28 pb-16 section-padding bg-surface flex items-center">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-6xl font-bold text-emerald-brand/30">500</p>
            <h1 className="text-2xl font-bold text-deep-green mt-4">
              Something went wrong
            </h1>
            <p className="text-slate-600 mt-2 mb-8">
              An unexpected error occurred. Please refresh the page or return home.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Link to="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
