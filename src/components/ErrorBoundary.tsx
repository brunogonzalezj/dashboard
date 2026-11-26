import { Component, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props   { children: ReactNode }
interface State   { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <RefreshCw className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">Algo salió mal</p>
          <p className="text-sm text-gray-500 mt-1">{this.state.message}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => this.setState({ hasError: false, message: '' })}
        >
          Reintentar
        </button>
      </div>
    );
  }
}
