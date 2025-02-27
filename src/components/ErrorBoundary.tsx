import { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-400 bg-red-50 rounded my-4">
          <h2 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap text-sm">
            <summary className="cursor-pointer mb-2">Error details</summary>
            <p className="mb-1 font-medium">{this.state.error?.toString()}</p>
            <p className="font-mono bg-gray-100 p-2 rounded overflow-auto">
              {this.state.errorInfo?.componentStack}
            </p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
