import { UIComponent, UIStyle } from './UIComponent';

export interface ScrollbarStyle extends UIStyle {
  value: number;
  maxValue: number;
  minValue?: number;
  orientation?: 'vertical' | 'horizontal';
  thumbSize?: number;
  thumbMinSize?: number;
  thumbColor?: string;
  thumbHoverColor?: string;
  thumbPressedColor?: string;
  trackColor?: string;
  showButtons?: boolean;
  buttonColor?: string;
  buttonHoverColor?: string;
  buttonPressedColor?: string;
  buttonSize?: number;
  stepSize?: number;
  pageSize?: number;
  smooth?: boolean;
  smoothDuration?: number;
}

export class Scrollbar extends UIComponent {
  declare protected _style: ScrollbarStyle;
  private _isDragging: boolean = false;
  private _dragOffset: number = 0;
  private _lastMouseX: number = 0;
  private _lastMouseY: number = 0;
  private _isHoveringThumb: boolean = false;
  private _isPressingThumb: boolean = false;
  private _isHoveringButtonStart: boolean = false;
  private _isPressingButtonStart: boolean = false;
  private _isHoveringButtonEnd: boolean = false;
  private _isPressingButtonEnd: boolean = false;
  private _autoScrollInterval: number | null = null;
  private _targetValue: number;
  private _currentValue: number;
  private _animationStartTime: number;
  private _animationStartValue: number;

  constructor(style: Partial<ScrollbarStyle> = {}) {
    // 设置默认样式
    const defaultStyle: ScrollbarStyle = {
      position: { x: 0, y: 0 },
      size: { width: 200, height: 12 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 6,
      opacity: 1,
      visible: true,
      zIndex: 0,
      value: 0,
      maxValue: 100,
      minValue: 0,
      orientation: 'horizontal',
      thumbSize: 30,
      thumbMinSize: 20,
      thumbColor: '#c1c1c1',
      thumbHoverColor: '#a8a8a8',
      thumbPressedColor: '#787878',
      trackColor: '#f0f0f0',
      showButtons: true,
      buttonColor: '#c1c1c1',
      buttonHoverColor: '#a8a8a8',
      buttonPressedColor: '#787878',
      buttonSize: 12,
      stepSize: 1,
      pageSize: 10,
      smooth: true,
      smoothDuration: 150,
      ...style,
    };

    super(defaultStyle);
    this._style = defaultStyle;
    this._targetValue = this._style.value;
    this._currentValue = this._style.value;
    this._animationStartTime = 0;
    this._animationStartValue = this._style.value;
  }

  // 渲染滚动条
  render(context: CanvasRenderingContext2D): void {
    if (!this._style.visible) return;

    const { x, y } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const isVertical = this._style.orientation === 'vertical';
    const trackStart = this._style.showButtons ? this._style.buttonSize! : 0;
    const trackEnd = this._style.showButtons ? (isVertical ? height - this._style.buttonSize! : width - this._style.buttonSize!) : (isVertical ? height : width);
    const trackLength = trackEnd - trackStart;

    // 保存当前上下文状态
    context.save();

    // 设置透明度
    context.globalAlpha = this._style.opacity || 1;

    // 绘制轨道
    context.beginPath();
    if (isVertical) {
      this.roundRect(context, x, y, width, height, this._style.borderRadius || 0);
    } else {
      this.roundRect(context, x, y, width, height, this._style.borderRadius || 0);
    }
    context.fillStyle = this._style.trackColor || '#f0f0f0';
    context.fill();

    // 计算滑块大小和位置
    const range = this._style.maxValue - (this._style.minValue || 0);
    const thumbSize = Math.max(
      this._style.thumbMinSize || 20,
      (trackLength * this._style.thumbSize!) / Math.max(range, trackLength)
    );
    const thumbPosition =
      trackStart +
      ((this._currentValue - (this._style.minValue || 0)) / range) * (trackLength - thumbSize);

    // 绘制滑块
    context.beginPath();
    if (isVertical) {
      this.roundRect(
        context,
        x,
        y + thumbPosition,
        width,
        thumbSize,
        this._style.borderRadius || 0
      );
    } else {
      this.roundRect(
        context,
        x + thumbPosition,
        y,
        thumbSize,
        height,
        this._style.borderRadius || 0
      );
    }

    // 设置滑块颜色
    if (this._isPressingThumb) {
      context.fillStyle = this._style.thumbPressedColor || '#787878';
    } else if (this._isHoveringThumb) {
      context.fillStyle = this._style.thumbHoverColor || '#a8a8a8';
    } else {
      context.fillStyle = this._style.thumbColor || '#c1c1c1';
    }
    context.fill();

    // 绘制按钮
    if (this._style.showButtons) {
      // 开始按钮
      context.beginPath();
      if (isVertical) {
        this.roundRect(
          context,
          x,
          y,
          width,
          this._style.buttonSize!,
          this._style.borderRadius || 0
        );
      } else {
        this.roundRect(
          context,
          x,
          y,
          this._style.buttonSize!,
          height,
          this._style.borderRadius || 0
        );
      }
      if (this._isPressingButtonStart) {
        context.fillStyle = this._style.buttonPressedColor || '#787878';
      } else if (this._isHoveringButtonStart) {
        context.fillStyle = this._style.buttonHoverColor || '#a8a8a8';
      } else {
        context.fillStyle = this._style.buttonColor || '#c1c1c1';
      }
      context.fill();

      // 结束按钮
      context.beginPath();
      if (isVertical) {
        this.roundRect(
          context,
          x,
          y + height - this._style.buttonSize!,
          width,
          this._style.buttonSize!,
          this._style.borderRadius || 0
        );
      } else {
        this.roundRect(
          context,
          x + width - this._style.buttonSize!,
          y,
          this._style.buttonSize!,
          height,
          this._style.borderRadius || 0
        );
      }
      if (this._isPressingButtonEnd) {
        context.fillStyle = this._style.buttonPressedColor || '#787878';
      } else if (this._isHoveringButtonEnd) {
        context.fillStyle = this._style.buttonHoverColor || '#a8a8a8';
      } else {
        context.fillStyle = this._style.buttonColor || '#c1c1c1';
      }
      context.fill();
    }

    // 恢复上下文状态
    context.restore();

    // 更新动画
    if (this._style.smooth && this._currentValue !== this._targetValue) {
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
    const duration = this._style.smoothDuration || 150;

    if (elapsed >= duration) {
      this._currentValue = this._targetValue;
      this._animationStartTime = 0;
    } else {
      const progress = elapsed / duration;
      const easedProgress = this.easeOutCubic(progress);
      this._currentValue = this._animationStartValue + (this._targetValue - this._animationStartValue) * easedProgress;
    }
  }

  // 缓动函数
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  // 处理鼠标移动
  onMouseMove(x: number, y: number): void {
    if (!this._style.visible || !this._isEnabled) return;

    this._lastMouseX = x;
    this._lastMouseY = y;

    const { x: scrollbarX, y: scrollbarY } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const isVertical = this._style.orientation === 'vertical';
    const trackStart = this._style.showButtons ? this._style.buttonSize! : 0;
    const trackEnd = this._style.showButtons
      ? (isVertical ? height - this._style.buttonSize! : width - this._style.buttonSize!)
      : (isVertical ? height : width);
    const trackLength = trackEnd - trackStart;

    // 处理拖动
    if (this._isDragging) {
      const mousePosition = isVertical ? y - scrollbarY : x - scrollbarX;
      const thumbSize = Math.max(
        this._style.thumbMinSize || 20,
        (trackLength * this._style.thumbSize!) / Math.max(this._style.maxValue - (this._style.minValue || 0), trackLength)
      );
      const position = mousePosition - this._dragOffset;
      const percentage = Math.max(0, Math.min(1, (position - trackStart) / (trackLength - thumbSize)));
      const value = (this._style.minValue || 0) + percentage * (this._style.maxValue - (this._style.minValue || 0));
      this.setValue(value);
      return;
    }

    // 检查滑块悬停
    const range = this._style.maxValue - (this._style.minValue || 0);
    const thumbSize = Math.max(
      this._style.thumbMinSize || 20,
      (trackLength * this._style.thumbSize!) / Math.max(range, trackLength)
    );
    const thumbPosition =
      trackStart +
      ((this._currentValue - (this._style.minValue || 0)) / range) * (trackLength - thumbSize);

    if (isVertical) {
      this._isHoveringThumb =
        x >= scrollbarX &&
        x <= scrollbarX + width &&
        y >= scrollbarY + thumbPosition &&
        y <= scrollbarY + thumbPosition + thumbSize;
    } else {
      this._isHoveringThumb =
        x >= scrollbarX + thumbPosition &&
        x <= scrollbarX + thumbPosition + thumbSize &&
        y >= scrollbarY &&
        y <= scrollbarY + height;
    }

    // 检查按钮悬停
    if (this._style.showButtons) {
      if (isVertical) {
        this._isHoveringButtonStart =
          x >= scrollbarX &&
          x <= scrollbarX + width &&
          y >= scrollbarY &&
          y <= scrollbarY + this._style.buttonSize!;

        this._isHoveringButtonEnd =
          x >= scrollbarX &&
          x <= scrollbarX + width &&
          y >= scrollbarY + height - this._style.buttonSize! &&
          y <= scrollbarY + height;
      } else {
        this._isHoveringButtonStart =
          x >= scrollbarX &&
          x <= scrollbarX + this._style.buttonSize! &&
          y >= scrollbarY &&
          y <= scrollbarY + height;

        this._isHoveringButtonEnd =
          x >= scrollbarX + width - this._style.buttonSize! &&
          x <= scrollbarX + width &&
          y >= scrollbarY &&
          y <= scrollbarY + height;
      }
    }

    this.markDirty();
    super.onMouseMove(x, y);
  }

  // 处理鼠标按下
  onMouseDown(): void {
    if (!this._style.visible || !this._isEnabled) return;

    const { x: scrollbarX, y: scrollbarY } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const isVertical = this._style.orientation === 'vertical';
    const trackStart = this._style.showButtons ? this._style.buttonSize! : 0;
    const trackEnd = this._style.showButtons
      ? (isVertical ? height - this._style.buttonSize! : width - this._style.buttonSize!)
      : (isVertical ? height : width);
    const trackLength = trackEnd - trackStart;

    // 处理滑块点击
    if (this._isHoveringThumb) {
      this._isDragging = true;
      this._isPressingThumb = true;
      const range = this._style.maxValue - (this._style.minValue || 0);
      const thumbSize = Math.max(
        this._style.thumbMinSize || 20,
        (trackLength * this._style.thumbSize!) / Math.max(range, trackLength)
      );
      const thumbPosition =
        trackStart +
        ((this._currentValue - (this._style.minValue || 0)) / range) * (trackLength - thumbSize);
      this._dragOffset = isVertical
        ? this._lastMouseY - scrollbarY - thumbPosition
        : this._lastMouseX - scrollbarX - thumbPosition;
    }
    // 处理按钮点击
    else if (this._style.showButtons) {
      if (this._isHoveringButtonStart) {
        this._isPressingButtonStart = true;
        this.startAutoScroll(-this._style.stepSize!);
      } else if (this._isHoveringButtonEnd) {
        this._isPressingButtonEnd = true;
        this.startAutoScroll(this._style.stepSize!);
      }
    }
    // 处理轨道点击
    else {
      const mousePosition = isVertical ? this._lastMouseY - scrollbarY : this._lastMouseX - scrollbarX;
      const thumbSize = Math.max(
        this._style.thumbMinSize || 20,
        (trackLength * this._style.thumbSize!) / Math.max(this._style.maxValue - (this._style.minValue || 0), trackLength)
      );
      const thumbPosition =
        trackStart +
        ((this._currentValue - (this._style.minValue || 0)) /
          (this._style.maxValue - (this._style.minValue || 0))) *
          (trackLength - thumbSize);

      if (mousePosition < thumbPosition) {
        this.setValue(this._currentValue - this._style.pageSize!);
      } else if (mousePosition > thumbPosition + thumbSize) {
        this.setValue(this._currentValue + this._style.pageSize!);
      }
    }

    this.markDirty();
    super.onMouseDown();
  }

  // 处理鼠标抬起
  onMouseUp(): void {
    this._isDragging = false;
    this._isPressingThumb = false;
    this._isPressingButtonStart = false;
    this._isPressingButtonEnd = false;
    this.stopAutoScroll();
    this.markDirty();
    super.onMouseUp();
  }

  // 开始自动滚动
  private startAutoScroll(step: number): void {
    this.stopAutoScroll();
    this._autoScrollInterval = window.setInterval(() => {
      this.setValue(this._currentValue + step);
    }, 100);
  }

  // 停止自动滚动
  private stopAutoScroll(): void {
    if (this._autoScrollInterval !== null) {
      clearInterval(this._autoScrollInterval);
      this._autoScrollInterval = null;
    }
  }

  // 设置值
  setValue(value: number): void {
    const newValue = Math.max(
      this._style.minValue || 0,
      Math.min(this._style.maxValue, value)
    );

    if (this._style.smooth) {
      this._targetValue = newValue;
      if (this._animationStartTime === 0) {
        this.markDirty();
      }
    } else {
      this._currentValue = newValue;
      this._targetValue = newValue;
      this.markDirty();
    }

    this.emit('change', { value: newValue });
  }

  // 获取值
  getValue(): number {
    return this._currentValue;
  }

  // 设置最大值
  setMaxValue(maxValue: number): void {
    const newStyle: Partial<ScrollbarStyle> = { maxValue };
    this.setStyle(newStyle);
    this._targetValue = Math.min(this._targetValue, maxValue);
    this._currentValue = Math.min(this._currentValue, maxValue);
  }

  // 获取最大值
  getMaxValue(): number {
    return this._style.maxValue;
  }

  // 销毁组件
  destroy(): void {
    this.stopAutoScroll();
    super.destroy();
  }
}