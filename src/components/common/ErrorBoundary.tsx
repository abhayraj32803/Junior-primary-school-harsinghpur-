import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  parsedFirestoreError: {
    error?: string;
    operationType?: string;
    path?: string | null;
  } | null;
}

interface ComponentBase<P, S> {
  props: P;
  state: S;
  setState: (nextState: Partial<S>) => void;
}

const BaseErrorBoundaryComponent = React.Component as unknown as {
  new <P, S>(props: P): ComponentBase<P, S>;
};

export class ErrorBoundary extends BaseErrorBoundaryComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      parsedFirestoreError: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let parsedFirestoreError: ErrorBoundaryState['parsedFirestoreError'] = null;
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed === 'object' && ('operationType' in parsed || 'path' in parsed)) {
        parsedFirestoreError = parsed;
      }
    } catch {
      // Not a JSON-serialized FirestoreErrorInfo
    }

    return {
      hasError: true,
      error,
      parsedFirestoreError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      parsedFirestoreError: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isPermissionError =
        this.state.parsedFirestoreError?.error?.toLowerCase().includes('permission') ||
        this.state.error?.message?.toLowerCase().includes('permission');

      return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              {isPermissionError ? (
                <ShieldAlert className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {isPermissionError
                  ? 'डेटाबेस अनुमति त्रुटि (Database Access Denied)'
                  : 'कुछ तकनीकी समस्या आई है (Something went wrong)'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isPermissionError
                  ? 'आपका वर्तमान सत्र इस डेटा को पढ़ने या सहेजने के लिए अधिकृत नहीं है। कृपया अपने अधिकृत Google / स्कूल खाते से पुनः लॉगिन करें।'
                  : 'पोर्टल को लोड करने या डेटा सिंक करने में अस्थायी समस्या आई है। कृपया पृष्ठ को रीफ्रेश करें।'}
              </p>
            </div>

            {this.state.parsedFirestoreError && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-1 font-mono break-all">
                <div>
                  <span className="font-bold text-slate-900">Operation:</span>{' '}
                  {this.state.parsedFirestoreError.operationType || 'unknown'}
                </div>
                {this.state.parsedFirestoreError.path && (
                  <div>
                    <span className="font-bold text-slate-900">Path:</span>{' '}
                    {this.state.parsedFirestoreError.path}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>वापस जाएं (Try Again)</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पेज रीलोड करें (Reload)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
