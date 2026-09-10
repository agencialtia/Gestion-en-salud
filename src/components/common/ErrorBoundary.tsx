import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  key?: React.Key;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 rounded-2xl border border-rose-200 bg-rose-50/50 text-slate-800 space-y-4 max-w-2xl mx-auto my-6 shadow-sm">
          <div className="flex items-center gap-3 text-rose-600">
            <div className="p-2.5 bg-rose-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-900">
                {this.props.fallbackTitle || 'Ocurrió un problema al cargar esta sección'}
              </h2>
              <p className="text-xs text-rose-700">
                La vista no pudo inicializarse correctamente.
              </p>
            </div>
          </div>

          {this.state.error?.message && (
            <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs font-mono text-rose-800 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reintentar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Recargar Aplicación</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
