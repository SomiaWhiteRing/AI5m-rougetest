import { UIComponent, UIStyle } from './UIComponent';

export interface ButtonStyle extends UIStyle {
  text: string;
  textColor?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
  hoverBackgroundColor?: string;
  pressedBackgroundColor?: string;
  disabledBackgroundColor?: string;
  hoverTextColor?: string;
  pressedTextColor?: string;
  disabledTextColor?: string;
}

export class Button extends UIComponent {
  declare protected _style: ButtonStyle;

  constructor(style: Partial<ButtonStyle> = {}) {
    // 设置默认样式
    const defaultStyle: ButtonStyle = {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      padding: { top: 8, right: 16, bottom: 8, left: 16 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      text: 'Button',
      backgroundColor: '#4a90e2',
      hoverBackgroundColor: '#357abd',
      pressedBackgroundColor: '#2a5f9e',
      disabledBackgroundColor: '#cccccc',
      textColor: '#ffffff',
      hoverTextColor: '#ffffff',
      pressedTextColor: '#ffffff',
      disabledTextColor: '#999999',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 4,
      opacity: 1,
      visible: true,
      zIndex: 0,
      font: 'Arial',
      fontSize: 16,
      fontWeight: 'normal',
      ...style,
    };

    super(defaultStyle);
    this._style = defaultStyle;
  }

  // 渲染按钮
  render(context: CanvasRenderingContext2D): void {
    if (!this._style.visible) return;

    const { x, y } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const radius = this._style.borderRadius || 0;

    // 保存当前上下文状态
    context.save();

    // 设置透明度
    context.globalAlpha = this._style.opacity || 1;

    // 绘制背景
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

    // 设置背景颜色
    if (!this._isEnabled) {
      context.fillStyle = this._style.disabledBackgroundColor || '#cccccc';
    } else if (this._isPressed) {
      context.fillStyle = this._style.pressedBackgroundColor || '#2a5f9e';
    } else if (this._isHovered) {
      context.fillStyle = this._style.hoverBackgroundColor || '#357abd';
    } else {
      context.fillStyle = this._style.backgroundColor || '#4a90e2';
    }
    context.fill();

    // 绘制边框
    if (this._style.borderWidth && this._style.borderColor) {
      context.lineWidth = this._style.borderWidth;
      context.strokeStyle = this._style.borderColor;
      context.stroke();
    }

    // 绘制文本
    const text = this._style.text;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `${this._style.fontWeight} ${this._style.fontSize}px ${this._style.font}`;

    // 设置文本颜色
    if (!this._isEnabled) {
      context.fillStyle = this._style.disabledTextColor || '#999999';
    } else if (this._isPressed) {
      context.fillStyle = this._style.pressedTextColor || '#ffffff';
    } else if (this._isHovered) {
      context.fillStyle = this._style.hoverTextColor || '#ffffff';
    } else {
      context.fillStyle = this._style.textColor || '#ffffff';
    }

    // 计算文本位置
    const textX = x + width / 2;
    const textY = y + height / 2;

    // 绘制文本
    context.fillText(text, textX, textY);

    // 恢复上下文状态
    context.restore();

    // 渲染子组件
    for (const child of this._children) {
      child.render(context);
    }
  }

  // 设置按钮文本
  setText(text: string): void {
    const newStyle: Partial<ButtonStyle> = { text };
    this.setStyle(newStyle);
  }

  // 获取按钮文本
  getText(): string {
    return this._style.text;
  }
}