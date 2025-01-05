import { UIComponent, UIStyle } from './UIComponent';

export interface PanelStyle extends UIStyle {
  title?: string;
  titleHeight?: number;
  titleBackgroundColor?: string;
  titleTextColor?: string;
  titleFont?: string;
  titleFontSize?: number;
  titleFontWeight?: string;
  draggable?: boolean;
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export class Panel extends UIComponent {
  declare protected _style: PanelStyle;
  private _isDragging: boolean = false;
  private _isResizing: boolean = false;
  private _dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private _resizeHandle: { width: number; height: number } = { width: 0, height: 0 };

  constructor(style: Partial<PanelStyle> = {}) {
    // 设置默认样式
    const defaultStyle: PanelStyle = {
      position: { x: 0, y: 0 },
      size: { width: 300, height: 200 },
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderWidth: 1,
      borderRadius: 4,
      opacity: 1,
      visible: true,
      zIndex: 0,
      title: 'Panel',
      titleHeight: 30,
      titleBackgroundColor: '#f5f5f5',
      titleTextColor: '#333333',
      titleFont: 'Arial',
      titleFontSize: 14,
      titleFontWeight: 'bold',
      draggable: true,
      resizable: true,
      minWidth: 100,
      minHeight: 100,
      maxWidth: Infinity,
      maxHeight: Infinity,
      shadow: true,
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      ...style,
    };

    super(defaultStyle);
    this._style = defaultStyle;
  }

  // 渲染面板
  render(context: CanvasRenderingContext2D): void {
    if (!this._style.visible) return;

    const { x, y } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const radius = this._style.borderRadius || 0;
    const titleHeight = this._style.titleHeight || 30;

    // 保存当前上下文状态
    context.save();

    // 设置透明度
    context.globalAlpha = this._style.opacity || 1;

    // 绘制阴影
    if (this._style.shadow) {
      context.shadowColor = this._style.shadowColor || 'rgba(0, 0, 0, 0.2)';
      context.shadowBlur = this._style.shadowBlur || 10;
      context.shadowOffsetX = this._style.shadowOffsetX || 0;
      context.shadowOffsetY = this._style.shadowOffsetY || 4;
    }

    // 绘制面板背景
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

    context.fillStyle = this._style.backgroundColor || '#ffffff';
    context.fill();

    // 清除阴影
    context.shadowColor = 'transparent';

    // 绘制边框
    if (this._style.borderWidth && this._style.borderColor) {
      context.lineWidth = this._style.borderWidth;
      context.strokeStyle = this._style.borderColor;
      context.stroke();
    }

    // 绘制标题栏背景
    if (this._style.title) {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + titleHeight);
      context.lineTo(x, y + titleHeight);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();

      context.fillStyle = this._style.titleBackgroundColor || '#f5f5f5';
      context.fill();

      // 绘制标题文本
      context.textAlign = 'left';
      context.textBaseline = 'middle';
      context.font = `${this._style.titleFontWeight} ${this._style.titleFontSize}px ${this._style.titleFont}`;
      context.fillStyle = this._style.titleTextColor || '#333333';
      context.fillText(
        this._style.title,
        x + (this._style.padding?.left || 8),
        y + titleHeight / 2
      );
    }

    // 绘制调整大小的手柄
    if (this._style.resizable) {
      const handleSize = 10;
      context.beginPath();
      context.moveTo(x + width - handleSize, y + height);
      context.lineTo(x + width, y + height - handleSize);
      context.lineTo(x + width, y + height);
      context.closePath();
      context.fillStyle = this._style.borderColor || '#cccccc';
      context.fill();
    }

    // 恢复上下文状态
    context.restore();

    // 渲染子组件
    for (const child of this._children) {
      child.render(context);
    }
  }

  // 处理鼠标事件
  handleMouseDown(event: MouseEvent): void {
    if (!this._style.visible || !this._isEnabled) return;

    const { x, y } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const titleHeight = this._style.titleHeight || 30;
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // 检查是否在标题栏区域
    if (
      this._style.draggable &&
      mouseX >= x &&
      mouseX <= x + width &&
      mouseY >= y &&
      mouseY <= y + titleHeight
    ) {
      this._isDragging = true;
      this._dragOffset = {
        x: mouseX - x,
        y: mouseY - y,
      };
      this.emit('dragstart');
    }

    // 检查是否在调整大小的手柄区域
    if (this._style.resizable) {
      const handleSize = 10;
      if (
        mouseX >= x + width - handleSize &&
        mouseX <= x + width &&
        mouseY >= y + height - handleSize &&
        mouseY <= y + height
      ) {
        this._isResizing = true;
        this._resizeHandle = {
          width: width - (mouseX - x),
          height: height - (mouseY - y),
        };
        this.emit('resizestart');
      }
    }

    super.onMouseDown();
  }

  // 处理鼠标移动事件
  handleMouseMove(event: MouseEvent): void {
    if (!this._style.visible || !this._isEnabled) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    if (this._isDragging) {
      const newX = mouseX - this._dragOffset.x;
      const newY = mouseY - this._dragOffset.y;

      this.setStyle({
        position: { x: newX, y: newY },
      });

      this.emit('drag', { x: newX, y: newY });
    }

    if (this._isResizing) {
      const newWidth = Math.max(
        Math.min(
          mouseX - this.getGlobalPosition().x + this._resizeHandle.width,
          this._style.maxWidth || Infinity
        ),
        this._style.minWidth || 100
      );

      const newHeight = Math.max(
        Math.min(
          mouseY - this.getGlobalPosition().y + this._resizeHandle.height,
          this._style.maxHeight || Infinity
        ),
        this._style.minHeight || 100
      );

      this.setStyle({
        size: { width: newWidth, height: newHeight },
      });

      this.emit('resize', { width: newWidth, height: newHeight });
    }

    super.onMouseMove(mouseX, mouseY);
  }

  // 处理鼠标抬起事件
  handleMouseUp(): void {
    if (this._isDragging) {
      this._isDragging = false;
      this.emit('dragend');
    }

    if (this._isResizing) {
      this._isResizing = false;
      this.emit('resizeend');
    }

    super.onMouseUp();
  }

  // 重写基类的鼠标事件处理方法
  onMouseDown(): void {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    super.onMouseDown();
  }

  onMouseMove(x: number, y: number): void {
    const event = new MouseEvent('mousemove', { clientX: x, clientY: y });
    this.handleMouseMove(event);
  }

  onMouseUp(): void {
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.handleMouseUp();
  }

  // 设置面板标题
  setTitle(title: string): void {
    const newStyle: Partial<PanelStyle> = { title };
    this.setStyle(newStyle);
  }

  // 获取面板标题
  getTitle(): string {
    return this._style.title || '';
  }
}