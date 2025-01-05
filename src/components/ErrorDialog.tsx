import React from 'react';
import { GameError, ErrorSeverity } from '../game/managers/ErrorManager';

interface ErrorDialogProps {
  error: GameError;
  onClose: () => void;
  onRetry?: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, onClose, onRetry }) => {
  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'text-yellow-400';
      case ErrorSeverity.MEDIUM:
        return 'text-orange-400';
      case ErrorSeverity.HIGH:
        return 'text-red-400';
      case ErrorSeverity.CRITICAL:
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityText = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return '轻微';
      case ErrorSeverity.MEDIUM:
        return '中等';
      case ErrorSeverity.HIGH:
        return '严重';
      case ErrorSeverity.CRITICAL:
        return '致命';
      default:
        return '未知';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white font-bold flex items-center">
            <span className={`mr-2 ${getSeverityColor(error.severity)}`}>
              [{getSeverityText(error.severity)}错误]
            </span>
            错误报告
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-gray-400 text-sm">错误ID</div>
            <div className="text-white">{error.id}</div>
          </div>

          <div>
            <div className="text-gray-400 text-sm">错误信息</div>
            <div className="text-white">{error.message}</div>
          </div>

          <div>
            <div className="text-gray-400 text-sm">发生时间</div>
            <div className="text-white">
              {new Date(error.timestamp).toLocaleString()}
            </div>
          </div>

          {error.context && (
            <div>
              <div className="text-gray-400 text-sm">错误上下文</div>
              <pre className="text-white text-sm bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(error.context, null, 2)}
              </pre>
            </div>
          )}

          {error.stack && (
            <div>
              <div className="text-gray-400 text-sm">堆栈跟踪</div>
              <pre className="text-white text-sm bg-gray-800 p-2 rounded overflow-x-auto max-h-40">
                {error.stack}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              重试
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDialog; 