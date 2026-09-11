import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  toolTitle?: string;
  onClose?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[Cortex ErrorBoundary] Erro na ferramenta "${this.props.toolTitle || 'desconhecida'}":`,
      error,
      errorInfo
    );
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-bg-deep text-text-main p-8 gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-lg shrink-0">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <div className="text-center space-y-1.5 max-w-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-main">
              Erro na Ferramenta
            </h3>
            {this.props.toolTitle && (
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                {this.props.toolTitle}
              </p>
            )}
            <p className="text-[11px] text-text-dim/80 leading-relaxed font-medium mt-2">
              Ocorreu um erro inesperado ao renderizar esta ferramenta. As demais janelas do Cortex não foram afetadas.
            </p>
            {this.state.error?.message && (
              <p className="text-[10px] font-mono text-red-400/70 bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2 mt-2 break-all text-left">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-bg-deep font-black rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-primary/20"
            >
              <RefreshCw size={13} />
              Recarregar Ferramenta
            </button>
            {this.props.onClose && (
              <button
                onClick={this.props.onClose}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-border-subtle text-text-dim font-black rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                <X size={13} />
                Fechar
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
