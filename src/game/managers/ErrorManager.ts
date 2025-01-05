import { Scene } from 'phaser';
import { Root, createRoot } from 'react-dom/client';
import React from 'react';
import ErrorDialog from '../../components/ErrorDialog';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface GameError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  context?: any;
  stack?: string;
}

export class ErrorManager {
  private scene: Scene;
  private errors: GameError[] = [];
  private maxErrors: number = 100;
  private errorHandlers: Map<ErrorSeverity, ((error: GameError) => void)[]> = new Map();
  private boundHandleError: (event: ErrorEvent | PromiseRejectionEvent) => void;
  private errorDialogContainer: HTMLDivElement | null = null;
  private errorDialogRoot: Root | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.boundHandleError = this.handleGlobalError.bind(this);
    this.initializeErrorHandling();
    this.createErrorDialogContainer();
  }

  private createErrorDialogContainer() {
    this.errorDialogContainer = document.createElement('div');
    this.errorDialogContainer.id = 'error-dialog-container';
    document.body.appendChild(this.errorDialogContainer);
    this.errorDialogRoot = createRoot(this.errorDialogContainer);
  }

  private initializeErrorHandling() {
    // 监听全局错误
    window.addEventListener('error', this.boundHandleError);

    // 监听未捕获的Promise错误
    window.addEventListener('unhandledrejection', this.boundHandleError);

    // 监听Phaser场景错误
    this.scene.events.on('error', (error: Error) => {
      this.handleError({
        id: this.generateErrorId(),
        message: error.message,
        severity: ErrorSeverity.MEDIUM,
        timestamp: Date.now(),
        stack: error.stack,
        context: {
          scene: this.scene.scene.key
        }
      });
    });
  }

  private handleGlobalError(event: ErrorEvent | PromiseRejectionEvent) {
    if (event instanceof ErrorEvent) {
      this.handleError({
        id: this.generateErrorId(),
        message: event.message,
        severity: ErrorSeverity.HIGH,
        timestamp: Date.now(),
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    } else {
      this.handleError({
        id: this.generateErrorId(),
        message: event.reason?.message || 'Unhandled Promise rejection',
        severity: ErrorSeverity.HIGH,
        timestamp: Date.now(),
        stack: event.reason?.stack,
        context: {
          reason: event.reason
        }
      });
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public handleError(error: GameError) {
    // 添加错误到列表
    this.errors.push(error);

    // 如果超过最大错误数，移除最旧的错误
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 调用对应严重程度的错误处理器
    const handlers = this.errorHandlers.get(error.severity) || [];
    handlers.forEach(handler => handler(error));

    // 记录错误到控制台
    console.error(`[${error.severity.toUpperCase()}] ${error.message}`, {
      id: error.id,
      timestamp: new Date(error.timestamp).toISOString(),
      context: error.context,
      stack: error.stack
    });

    // 对于严重错误，可能需要特殊处理
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
      this.handleCriticalError(error);
    }

    // 保存错误到本地存储
    this.saveErrorsToStorage();
  }

  private handleCriticalError(error: GameError) {
    // 显示错误UI
    this.scene.scene.pause();
    this.showErrorDialog(error);
  }

  private showErrorDialog(error: GameError) {
    if (this.errorDialogRoot) {
      this.errorDialogRoot.render(
        React.createElement(ErrorDialog, {
          error,
          onClose: () => {
            this.hideErrorDialog();
            if (error.severity === ErrorSeverity.CRITICAL) {
              this.attemptRecovery();
            } else {
              this.scene.scene.resume();
            }
          },
          onRetry: error.severity === ErrorSeverity.CRITICAL ? () => this.attemptRecovery() : undefined
        })
      );
    }
  }

  private hideErrorDialog() {
    if (this.errorDialogRoot) {
      this.errorDialogRoot.render(null);
    }
  }

  private attemptRecovery() {
    try {
      // 保存当前游戏状态
      this.scene.game.registry.set('lastError', {
        timestamp: Date.now(),
        scene: this.scene.scene.key
      });

      // 重启场景
      this.scene.scene.restart();
    } catch (e) {
      // 如果恢复失败，返回主菜单
      this.scene.scene.start('MainMenu');
    }
  }

  public addErrorHandler(severity: ErrorSeverity, handler: (error: GameError) => void) {
    const handlers = this.errorHandlers.get(severity) || [];
    handlers.push(handler);
    this.errorHandlers.set(severity, handlers);
  }

  public removeErrorHandler(severity: ErrorSeverity, handler: (error: GameError) => void) {
    const handlers = this.errorHandlers.get(severity) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      this.errorHandlers.set(severity, handlers);
    }
  }

  public getErrors(severity?: ErrorSeverity): GameError[] {
    if (severity) {
      return this.errors.filter(error => error.severity === severity);
    }
    return [...this.errors];
  }

  public clearErrors(severity?: ErrorSeverity) {
    if (severity) {
      this.errors = this.errors.filter(error => error.severity !== severity);
    } else {
      this.errors = [];
    }
    this.saveErrorsToStorage();
  }

  private saveErrorsToStorage() {
    try {
      localStorage.setItem('gameErrors', JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Failed to save errors to storage:', e);
    }
  }

  private loadErrorsFromStorage() {
    try {
      const savedErrors = localStorage.getItem('gameErrors');
      if (savedErrors) {
        this.errors = JSON.parse(savedErrors);
      }
    } catch (e) {
      console.warn('Failed to load errors from storage:', e);
    }
  }

  public destroy() {
    // 移除事件监听器
    window.removeEventListener('error', this.boundHandleError);
    window.removeEventListener('unhandledrejection', this.boundHandleError);
    this.scene.events.off('error');

    // 清空错误处理器
    this.errorHandlers.clear();

    // 移除错误对话框容器
    if (this.errorDialogContainer) {
      document.body.removeChild(this.errorDialogContainer);
      this.errorDialogContainer = null;
      this.errorDialogRoot = null;
    }
  }
} 