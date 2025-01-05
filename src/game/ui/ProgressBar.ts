import { UIComponent, UIStyle } from './UIComponent';

export interface ProgressBarStyle extends UIStyle {
  value: number;
  maxValue: number;
  minValue?: number;
  barColor?: string;
  barBackgroundColor?: string;
  showText?: boolean;
  textColor?: string;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
  textFormat?: (value: number, maxValue: number) => string;
  vertical?: boolean;
  rounded?: boolean;
  gradient?: boolean;
  gradientColors?: string[];
  animation?: boolean;
  animationDuration?: number;
}

export class ProgressBar extends UIComponent {
  declare protected _style: ProgressBarStyle;
  private _targetValue: number;
  private _currentValue: number;
  private _animationStartTime: number;
  private _animationStartValue: number;

  constructor(style: Partial<ProgressBarStyle> = {}) {
    // 设置默认样式
    const defaultStyle: ProgressBarStyle = {
      position: { x: 0, y: 0 },
      size: { width: 200, height: 20 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      backgroundColor: '#f0f0f0',
      borderColor: '#cccccc',
      borderWidth: 1,
      borderRadius: 4,
      opacity: 1,
      visible: true,
      zIndex: 0,
      value: 0,
      maxValue: 100,
      minValue: 0,
      barColor: '#4a90e2',
      barBackgroundColor: '#f0f0f0',
      showText: true,
      textColor: '#333333',
      font: 'Arial',
      fontSize: 12,
      fontWeight: 'normal',
      textFormat: (value, maxValue) => `${Math.round((value / maxValue) * 100)}%`,
      vertical: false,
      rounded: true,
      gradient: false,
      gradientColors: ['#4a90e2', '#357abd'],
      animation: true,
      animationDuration: 300,
      ...style,
    };

    super(defaultStyle);
    this._style = defaultStyle;
    this._targetValue = this._style.value;
    this._currentValue = this._style.value;
    this._animationStartTime = 0;
    this._animationStartValue = this._style.value;
  }

  // 渲染进度条
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
    this.roundRect(context, x, y, width, height, radius);
    context.fillStyle = this._style.barBackgroundColor || '#f0f0f0';
    context.fill();

    // 计算进度条宽度/高度
    const progress = Math.max(0, Math.min(1, (this._currentValue - (this._style.minValue || 0)) / (this._style.maxValue - (this._style.minValue || 0))));
    const progressSize = this._style.vertical ? height * progress : width * progress;

    // 绘制进度条
    context.beginPath();
    if (this._style.vertical) {
      this.roundRect(
        context,
        x,
        y + height - progressSize,
        width,
        progressSize,
        this._style.rounded ? radius : 0
      );
    } else {
      this.roundRect(
        context,
        x,
        y,
        progressSize,
        height,
        this._style.rounded ? radius : 0
      );
    }

    // 设置进度条颜色
    if (this._style.gradient && this._style.gradientColors) {
      const gradient = this._style.vertical
        ? context.createLinearGradient(x, y + height, x, y)
        : context.createLinearGradient(x, y, x + width, y);

      this._style.gradientColors.forEach((color, index) => {
        gradient.addColorStop(index / (this._style.gradientColors!.length - 1), color);
      });
      context.fillStyle = gradient;
    } else {
      context.fillStyle = this._style.barColor || '#4a90e2';
    }
    context.fill();

    // 绘制边框
    if (this._style.borderWidth && this._style.borderColor) {
      context.beginPath();
      this.roundRect(context, x, y, width, height, radius);
      context.lineWidth = this._style.borderWidth;
      context.strokeStyle = this._style.borderColor;
      context.stroke();
    }

    // 绘制文本
    if (this._style.showText) {
      const text = this._style.textFormat
        ? this._style.textFormat(this._currentValue, this._style.maxValue)
        : `${Math.round((this._currentValue / this._style.maxValue) * 100)}%`;

      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `${this._style.fontWeight} ${this._style.fontSize}px ${this._style.font}`;
      context.fillStyle = this._style.textColor || '#333333';
      context.fillText(text, x + width / 2, y + height / 2);
    }

    // 恢复上下文状态
    context.restore();

    // 渲染子组件
    for (const child of this._children) {
      child.render(context);
    }

    // 更新动画
    if (this._style.animation && this._currentValue !== this._targetValue) {
      this.updateAnimation();
      requestAnimationFrame(() => this.markDirty());
    }
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

  // 更新动画
  private updateAnimation(): void {
    if (this._animationStartTime === 0) {
      this._animationStartTime = performance.now();
      this._animationStartValue = this._currentValue;
    }

    const currentTime = performance.now();
    const elapsed = currentTime - this._animationStartTime;
    const duration = this._style.animationDuration || 300;

    if (elapsed >= duration) {
      this._currentValue = this._targetValue;
      this._animationStartTime = 0;
    } else {
      const progress = elapsed / duration;
      const easedProgress = this.easeInOutCubic(progress);
      this._currentValue = this._animationStartValue + (this._targetValue - this._animationStartValue) * easedProgress;
    }
  }

  // 缓动函数
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // 设置进度值
  setValue(value: number): void {
    const newValue = Math.max(this._style.minValue || 0, Math.min(this._style.maxValue, value));
    if (this._style.animation) {
      this._targetValue = newValue;
      if (this._animationStartTime === 0) {
        this.markDirty();
      }
    } else {
      this._currentValue = newValue;
      this._targetValue = newValue;
      this.markDirty();
    }
  }

  // 获取进度值
  getValue(): number {
    return this._currentValue;
  }

  // 设置最大值
  setMaxValue(maxValue: number): void {
    const newStyle: Partial<ProgressBarStyle> = { maxValue };
    this.setStyle(newStyle);
    this._targetValue = Math.min(this._targetValue, maxValue);
    this._currentValue = Math.min(this._currentValue, maxValue);
  }

  // 获取最大值
  getMaxValue(): number {
    return this._style.maxValue;
  }
}