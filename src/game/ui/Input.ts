import { UIComponent, UIStyle } from './UIComponent';

export interface InputStyle extends UIStyle {
  value: string;
  placeholder?: string;
  maxLength?: number;
  type?: 'text' | 'password' | 'number';
  textColor?: string;
  placeholderColor?: string;
  selectionColor?: string;
  cursorColor?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: CanvasTextAlign;
  readOnly?: boolean;
  focusedBorderColor?: string;
  focusedBackgroundColor?: string;
  errorBorderColor?: string;
  errorBackgroundColor?: string;
  pattern?: string;
  validation?: (value: string) => boolean;
  formatOnBlur?: (value: string) => string;
}

export class Input extends UIComponent {
  declare protected _style: InputStyle;
  private _isFocused: boolean = false;
  private _isValid: boolean = true;
  private _cursorPosition: number = 0;
  private _selectionStart: number = 0;
  private _selectionEnd: number = 0;
  private _cursorVisible: boolean = true;
  private _cursorBlinkInterval: number | null = null;
  private _composing: boolean = false;
  private _compositionText: string = '';

  constructor(style: Partial<InputStyle> = {}) {
    // 设置默认样式
    const defaultStyle: InputStyle = {
      position: { x: 0, y: 0 },
      size: { width: 200, height: 32 },
      padding: { top: 6, right: 8, bottom: 6, left: 8 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderWidth: 1,
      borderRadius: 4,
      opacity: 1,
      visible: true,
      zIndex: 0,
      value: '',
      placeholder: '',
      maxLength: 100,
      type: 'text',
      textColor: '#333333',
      placeholderColor: '#999999',
      selectionColor: 'rgba(51, 144, 255, 0.3)',
      cursorColor: '#333333',
      font: 'Arial',
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'left',
      readOnly: false,
      focusedBorderColor: '#3390ff',
      focusedBackgroundColor: '#ffffff',
      errorBorderColor: '#ff4d4f',
      errorBackgroundColor: '#fff2f0',
      ...style,
    };

    super(defaultStyle);
    this._style = defaultStyle;
  }

  // 渲染输入框
  render(context: CanvasRenderingContext2D): void {
    if (!this._style.visible) return;

    const { x, y } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const padding = this._style.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const radius = this._style.borderRadius || 0;

    // 保存当前上下文状态
    context.save();

    // 设置透明度
    context.globalAlpha = this._style.opacity || 1;

    // 绘制背景
    context.beginPath();
    this.roundRect(context, x, y, width, height, radius);
    if (!this._isValid) {
      context.fillStyle = this._style.errorBackgroundColor || '#fff2f0';
    } else if (this._isFocused) {
      context.fillStyle = this._style.focusedBackgroundColor || '#ffffff';
    } else {
      context.fillStyle = this._style.backgroundColor || '#ffffff';
    }
    context.fill();

    // 绘制边框
    if (this._style.borderWidth) {
      context.lineWidth = this._style.borderWidth;
      if (!this._isValid) {
        context.strokeStyle = this._style.errorBorderColor || '#ff4d4f';
      } else if (this._isFocused) {
        context.strokeStyle = this._style.focusedBorderColor || '#3390ff';
      } else {
        context.strokeStyle = this._style.borderColor || '#cccccc';
      }
      context.stroke();
    }

    // 设置文本样式
    context.textAlign = this._style.textAlign || 'left';
    context.textBaseline = 'middle';
    context.font = `${this._style.fontWeight} ${this._style.fontSize}px ${this._style.font}`;

    const text = this._composing ? this._style.value + this._compositionText : this._style.value;
    const displayText = this._style.type === 'password' ? '•'.repeat(text.length) : text;

    // 计算文本位置
    const textX = x + padding.left;
    const textY = y + height / 2;

    // 绘制选区
    if (this._isFocused && this._selectionStart !== this._selectionEnd) {
      const selectedText = displayText.slice(this._selectionStart, this._selectionEnd);
      const preText = displayText.slice(0, this._selectionStart);
      const selectionStart = textX + context.measureText(preText).width;
      const selectionWidth = context.measureText(selectedText).width;

      context.fillStyle = this._style.selectionColor || 'rgba(51, 144, 255, 0.3)';
      context.fillRect(selectionStart, y + padding.top, selectionWidth, height - padding.top - padding.bottom);
    }

    // 绘制文本
    if (text) {
      context.fillStyle = this._style.textColor || '#333333';
      context.fillText(displayText, textX, textY);
    } else if (this._style.placeholder && !this._isFocused) {
      context.fillStyle = this._style.placeholderColor || '#999999';
      context.fillText(this._style.placeholder, textX, textY);
    }

    // 绘制光标
    if (this._isFocused && this._cursorVisible && !this._composing) {
      const cursorText = displayText.slice(0, this._cursorPosition);
      const cursorX = textX + context.measureText(cursorText).width;
      context.beginPath();
      context.moveTo(cursorX, y + padding.top);
      context.lineTo(cursorX, y + height - padding.bottom);
      context.strokeStyle = this._style.cursorColor || '#333333';
      context.lineWidth = 1;
      context.stroke();
    }

    // 恢复上下文状态
    context.restore();
  }

  // 绘制圆角矩形
  private roundRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  // 处理获得焦点
  onFocus(): void {
    if (!this._style.visible || !this._isEnabled || this._style.readOnly) return;

    this._isFocused = true;
    this._cursorPosition = this._style.value.length;
    this._selectionStart = 0;
    this._selectionEnd = this._style.value.length;
    this.startCursorBlink();
    this.markDirty();
    this.emit('focus');
  }

  // 处理失去焦点
  onBlur(): void {
    this._isFocused = false;
    this._composing = false;
    this._compositionText = '';
    this.stopCursorBlink();

    // 执行格式化
    if (this._style.formatOnBlur) {
      const formattedValue = this._style.formatOnBlur(this._style.value);
      if (formattedValue !== this._style.value) {
        this.setValue(formattedValue);
      }
    }

    this.markDirty();
    this.emit('blur');
  }

  // 处理键盘输入
  onKeyDown(event: KeyboardEvent): void {
    if (!this._isFocused || !this._isEnabled || this._style.readOnly) return;

    const key = event.key;
    const ctrlKey = event.ctrlKey || event.metaKey;

    // 处理特殊键
    switch (key) {
      case 'Backspace':
        if (this._selectionStart !== this._selectionEnd) {
          this.deleteSelection();
        } else if (this._cursorPosition > 0) {
          const newValue = this._style.value.slice(0, this._cursorPosition - 1) +
            this._style.value.slice(this._cursorPosition);
          this.setValue(newValue);
          this._cursorPosition--;
          this._selectionStart = this._cursorPosition;
          this._selectionEnd = this._cursorPosition;
        }
        break;

      case 'Delete':
        if (this._selectionStart !== this._selectionEnd) {
          this.deleteSelection();
        } else if (this._cursorPosition < this._style.value.length) {
          const newValue = this._style.value.slice(0, this._cursorPosition) +
            this._style.value.slice(this._cursorPosition + 1);
          this.setValue(newValue);
        }
        break;

      case 'ArrowLeft':
        if (ctrlKey) {
          this._cursorPosition = this.findWordBoundary('left');
        } else {
          this._cursorPosition = Math.max(0, this._cursorPosition - 1);
        }
        if (!event.shiftKey) {
          this._selectionStart = this._cursorPosition;
          this._selectionEnd = this._cursorPosition;
        } else {
          this._selectionEnd = this._cursorPosition;
        }
        break;

      case 'ArrowRight':
        if (ctrlKey) {
          this._cursorPosition = this.findWordBoundary('right');
        } else {
          this._cursorPosition = Math.min(this._style.value.length, this._cursorPosition + 1);
        }
        if (!event.shiftKey) {
          this._selectionStart = this._cursorPosition;
          this._selectionEnd = this._cursorPosition;
        } else {
          this._selectionEnd = this._cursorPosition;
        }
        break;

      case 'Home':
        this._cursorPosition = 0;
        if (!event.shiftKey) {
          this._selectionStart = this._cursorPosition;
          this._selectionEnd = this._cursorPosition;
        } else {
          this._selectionEnd = this._cursorPosition;
        }
        break;

      case 'End':
        this._cursorPosition = this._style.value.length;
        if (!event.shiftKey) {
          this._selectionStart = this._cursorPosition;
          this._selectionEnd = this._cursorPosition;
        } else {
          this._selectionEnd = this._cursorPosition;
        }
        break;

      case 'a':
        if (ctrlKey) {
          this._selectionStart = 0;
          this._selectionEnd = this._style.value.length;
          this._cursorPosition = this._selectionEnd;
        }
        break;

      case 'c':
        if (ctrlKey && this._selectionStart !== this._selectionEnd) {
          const selectedText = this._style.value.slice(this._selectionStart, this._selectionEnd);
          navigator.clipboard.writeText(selectedText);
        }
        break;

      case 'x':
        if (ctrlKey && this._selectionStart !== this._selectionEnd) {
          const selectedText = this._style.value.slice(this._selectionStart, this._selectionEnd);
          navigator.clipboard.writeText(selectedText);
          this.deleteSelection();
        }
        break;

      case 'v':
        if (ctrlKey) {
          navigator.clipboard.readText().then(text => {
            this.insertText(text);
          });
        }
        break;

      default:
        if (key.length === 1 && !ctrlKey) {
          this.insertText(key);
        }
        break;
    }

    this.markDirty();
    event.preventDefault();
  }

  // 处理输入法编辑
  onCompositionStart(): void {
    this._composing = true;
    this.markDirty();
  }

  onCompositionUpdate(text: string): void {
    this._compositionText = text;
    this.markDirty();
  }

  onCompositionEnd(text: string): void {
    this._composing = false;
    this._compositionText = '';
    this.insertText(text);
    this.markDirty();
  }

  // 插入文本
  private insertText(text: string): void {
    if (this._selectionStart !== this._selectionEnd) {
      this.deleteSelection();
    }

    // 处理数字类型
    if (this._style.type === 'number') {
      const numericText = text.replace(/[^\d.-]/g, '');
      if (!numericText) return;
      const newValue = this._style.value.slice(0, this._cursorPosition) +
        numericText +
        this._style.value.slice(this._cursorPosition);
      if (!/^-?\d*\.?\d*$/.test(newValue)) return;
    }

    // 检查最大长度
    if (this._style.maxLength !== undefined &&
      this._style.value.length + text.length - (this._selectionEnd - this._selectionStart) > this._style.maxLength) {
      return;
    }

    const newValue = this._style.value.slice(0, this._cursorPosition) +
      text +
      this._style.value.slice(this._cursorPosition);

    this.setValue(newValue);
    this._cursorPosition += text.length;
    this._selectionStart = this._cursorPosition;
    this._selectionEnd = this._cursorPosition;
  }

  // 删除选中文本
  private deleteSelection(): void {
    const start = Math.min(this._selectionStart, this._selectionEnd);
    const end = Math.max(this._selectionStart, this._selectionEnd);
    const newValue = this._style.value.slice(0, start) + this._style.value.slice(end);
    this.setValue(newValue);
    this._cursorPosition = start;
    this._selectionStart = start;
    this._selectionEnd = start;
  }

  // 查找单词边界
  private findWordBoundary(direction: 'left' | 'right'): number {
    const text = this._style.value;
    let pos = this._cursorPosition;

    if (direction === 'left') {
      while (pos > 0 && /\s/.test(text[pos - 1])) pos--;
      while (pos > 0 && !/\s/.test(text[pos - 1])) pos--;
    } else {
      while (pos < text.length && /\s/.test(text[pos])) pos++;
      while (pos < text.length && !/\s/.test(text[pos])) pos++;
    }

    return pos;
  }

  // 开始光标闪烁
  private startCursorBlink(): void {
    this.stopCursorBlink();
    this._cursorVisible = true;
    this._cursorBlinkInterval = window.setInterval(() => {
      this._cursorVisible = !this._cursorVisible;
      this.markDirty();
    }, 530);
  }

  // 停止光标闪烁
  private stopCursorBlink(): void {
    if (this._cursorBlinkInterval !== null) {
      clearInterval(this._cursorBlinkInterval);
      this._cursorBlinkInterval = null;
    }
    this._cursorVisible = false;
  }

  // 设置值
  setValue(value: string): void {
    // 验证输入
    if (this._style.pattern && !new RegExp(this._style.pattern).test(value)) {
      this._isValid = false;
    } else if (this._style.validation && !this._style.validation(value)) {
      this._isValid = false;
    } else {
      this._isValid = true;
    }

    const newStyle: Partial<InputStyle> = { value };
    this.setStyle(newStyle);
    this.emit('change', { value });
  }

  // 获取值
  getValue(): string {
    return this._style.value;
  }

  // 获取验证状态
  isValid(): boolean {
    return this._isValid;
  }

  // 获取样式
  getStyle(): InputStyle {
    return this._style;
  }

  // 检查点是否在组件内
  containsPoint(x: number, y: number): boolean {
    const { x: componentX, y: componentY } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    return x >= componentX && x <= componentX + width &&
           y >= componentY && y <= componentY + height;
  }

  // 更新组件状态
  update(deltaTime: number): void {
    // 在这里可以添加动画更新等逻辑
  }

  // 销毁组件
  destroy(): void {
    this.stopCursorBlink();
    super.destroy();
  }
}