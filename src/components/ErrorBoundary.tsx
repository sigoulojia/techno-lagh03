import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-lined-paper text-[#18181B] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border-3 border-[#18181B] rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#18181B] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFD100] border-2 border-[#18181B] flex items-center justify-center mx-auto mb-5 shadow-[3px_3px_0px_#18181B]">
              <AlertTriangle className="w-8 h-8 text-[#E30613]" />
            </div>
            <span className="stamp-red text-xs inline-block mb-3">تنبيه تقني</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#18181B] mb-2">
              حدث خطأ غير متوقع أثناء تحميل الصفحة
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium mb-6 leading-relaxed">
              تم تسجيل الخطأ، يمكنك تحديث الصفحة أو العودة مباشرة إلى واجهة المتجر الرئيسية.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = window.location.origin + window.location.pathname;
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFD100] hover:bg-[#e6bd00] text-[#18181B] text-sm font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>العودة للرئيسية</span>
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#18181B] text-sm font-black border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
