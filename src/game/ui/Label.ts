import { UIComponent, UIStyle } from './UIComponent';

export interface LabelStyle extends UIStyle {
  text: string;
  textColor?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  lineHeight?: number;
  wordWrap?: boolean;
  ellipsis?: boolean;
  maxLines?: number;
}

export class Label extends UIComponent {
  declare protected _style: LabelStyle;

  constructor(style: Partial<LabelStyle> = {}) {
    // 设置默认样式
    const defaultStyle: LabelStyle = {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 30 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      text: 'Label',
      textColor: '#000000',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 1,
      visible: true,
      zIndex: 0,
      font: 'Arial',
      fontSize: 14,
      fontWeight: 'normal',
      textAlign: 'left',
      textBaseline: 'top',
      lineHeight: 1.2,
      wordWrap: false,
      ellipsis: false,
      maxLines: 1,
      ...style,
    };

    super(defaultStyle);
    this._style = defaultStyle;
  }

  // 渲染标签
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
    if (this._style.backgroundColor !== 'transparent') {
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

      context.fillStyle = this._style.backgroundColor || 'transparent';
      context.fill();
    }

    // 绘制边框
    if (this._style.borderWidth && this._style.borderColor) {
      context.lineWidth = this._style.borderWidth;
      context.strokeStyle = this._style.borderColor;
      context.stroke();
    }

    // 设置文本样式
    context.textAlign = this._style.textAlign || 'left';
    context.textBaseline = this._style.textBaseline || 'top';
    context.font = `${this._style.fontWeight} ${this._style.fontSize}px ${this._style.font}`;
    context.fillStyle = this._style.textColor || '#000000';

    // 计算文本位置
    const textX = x + padding.left;
    const textY = y + padding.top;

    // 处理文本换行和省略
    if (this._style.wordWrap) {
      this.renderWrappedText(context, textX, textY);
    } else {
      this.renderSingleLineText(context, textX, textY);
    }

    // 恢复上下文状态
    context.restore();

    // 渲染子组件
    for (const child of this._children) {
      child.render(context);
    }
  }

  // 渲染单行文本
  private renderSingleLineText(context: CanvasRenderingContext2D, x: number, y: number): void {
    const text = this._style.text;
    const maxWidth = this._style.size.width - (this._style.padding?.left || 0) - (this._style.padding?.right || 0);

    if (this._style.ellipsis) {
      const metrics = context.measureText(text);
      if (metrics.width > maxWidth) {
        let ellipsisText = text;
        const ellipsis = '...';
        while (ellipsisText.length > 0 && context.measureText(ellipsisText + ellipsis).width > maxWidth) {
          ellipsisText = ellipsisText.slice(0, -1);
        }
        context.fillText(ellipsisText + ellipsis, x, y, maxWidth);
      } else {
        context.fillText(text, x, y, maxWidth);
      }
    } else {
      context.fillText(text, x, y, maxWidth);
    }
  }

  // 渲染多行文本
  private renderWrappedText(context: CanvasRenderingContext2D, x: number, y: number): void {
    const text = this._style.text;
    const maxWidth = this._style.size.width - (this._style.padding?.left || 0) - (this._style.padding?.right || 0);
    const lineHeight = (this._style.fontSize || 14) * (this._style.lineHeight || 1.2);
    const maxLines = this._style.maxLines || Infinity;

    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? ' ' : '') + words[i];
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // 限制行数并添加省略号
    if (this._style.ellipsis && lines.length > maxLines) {
      const lastLine = lines[maxLines - 1];
      let ellipsisLine = lastLine;
      const ellipsis = '...';
      while (ellipsisLine.length > 0 && context.measureText(ellipsisLine + ellipsis).width > maxWidth) {
        ellipsisLine = ellipsisLine.slice(0, -1);
      }
      lines[maxLines - 1] = ellipsisLine + ellipsis;
      lines.length = maxLines;
    }

    // 绘制文本行
    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      context.fillText(lines[i], x, y + i * lineHeight, maxWidth);
    }
  }

  // 设置标签文本
  setText(text: string): void {
    const newStyle: Partial<LabelStyle> = { text };
    this.setStyle(newStyle);
  }

  // 获取标签文本
  getText(): string {
    return this._style.text;
  }
}