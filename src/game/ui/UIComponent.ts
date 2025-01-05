import { EventEmitter } from 'events';

export interface UIStyle {
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  visible?: boolean;
  zIndex?: number;
}

export abstract class UIComponent extends EventEmitter {
  protected _id: string;
  protected _parent: UIComponent | null;
  protected _children: UIComponent[];
  protected _style: UIStyle;
  protected _isDirty: boolean;
  protected _isHovered: boolean;
  protected _isPressed: boolean;
  protected _isEnabled: boolean;

  constructor(style: Partial<UIStyle> = {}) {
    super();
    this._id = Math.random().toString(36).substr(2, 9);
    this._parent = null;
    this._children = [];
    this._isDirty = true;
    this._isHovered = false;
    this._isPressed = false;
    this._isEnabled = true;

    // 默认样式
    this._style = {
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 1,
      visible: true,
      zIndex: 0,
      ...style,
    };
  }

  // ID访问器
  get id(): string {
    return this._id;
  }

  // 父组件访问器
  get parent(): UIComponent | null {
    return this._parent;
  }

  // 子组件访问器
  get children(): UIComponent[] {
    return [...this._children];
  }

  // 样式访问器
  get style(): UIStyle {
    return { ...this._style };
  }

  // 设置样式
  setStyle(style: Partial<UIStyle>): void {
    this._style = {
      ...this._style,
      ...style,
    };
    this.markDirty();
  }

  // 添加子组件
  addChild(child: UIComponent): void {
    if (child._parent) {
      child._parent.removeChild(child);
    }
    child._parent = this;
    this._children.push(child);
    this.markDirty();
  }

  // 移除子组件
  removeChild(child: UIComponent): void {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      child._parent = null;
      this._children.splice(index, 1);
      this.markDirty();
    }
  }

  // 移除所有子组件
  removeAllChildren(): void {
    for (const child of this._children) {
      child._parent = null;
    }
    this._children = [];
    this.markDirty();
  }

  // 标记需要重绘
  markDirty(): void {
    this._isDirty = true;
    if (this._parent) {
      this._parent.markDirty();
    }
  }

  // 清除重绘标记
  clearDirty(): void {
    this._isDirty = false;
    for (const child of this._children) {
      child.clearDirty();
    }
  }

  // 检查是否需要重绘
  isDirty(): boolean {
    if (this._isDirty) return true;
    for (const child of this._children) {
      if (child.isDirty()) return true;
    }
    return false;
  }

  // 获取全局位置
  getGlobalPosition(): { x: number; y: number } {
    let x = this._style.position.x;
    let y = this._style.position.y;
    let current = this._parent;

    while (current) {
      x += current._style.position.x;
      y += current._style.position.y;
      current = current._parent;
    }

    return { x, y };
  }

  // 检查点是否在组件内
  containsPoint(x: number, y: number): boolean {
    const globalPos = this.getGlobalPosition();
    return (
      x >= globalPos.x &&
      x <= globalPos.x + this._style.size.width &&
      y >= globalPos.y &&
      y <= globalPos.y + this._style.size.height
    );
  }

  // 处理鼠标进入
  onMouseEnter(): void {
    if (!this._isEnabled) return;
    this._isHovered = true;
    this.emit('mouseenter');
  }

  // 处理鼠标离开
  onMouseLeave(): void {
    if (!this._isEnabled) return;
    this._isHovered = false;
    this._isPressed = false;
    this.emit('mouseleave');
  }

  // 处理鼠标按下
  onMouseDown(): void {
    if (!this._isEnabled) return;
    this._isPressed = true;
    this.emit('mousedown');
  }

  // 处理鼠标抬起
  onMouseUp(): void {
    if (!this._isEnabled) return;
    if (this._isPressed) {
      this._isPressed = false;
      this.emit('click');
    }
    this.emit('mouseup');
  }

  // 处理鼠标移动
  onMouseMove(x: number, y: number): void {
    if (!this._isEnabled) return;
    this.emit('mousemove', { x, y });
  }

  // 启用组件
  enable(): void {
    this._isEnabled = true;
    this.emit('enabled');
  }

  // 禁用组件
  disable(): void {
    this._isEnabled = false;
    this._isHovered = false;
    this._isPressed = false;
    this.emit('disabled');
  }

  // 显示组件
  show(): void {
    this.setStyle({ visible: true });
    this.emit('show');
  }

  // 隐藏组件
  hide(): void {
    this.setStyle({ visible: false });
    this.emit('hide');
  }

  // 更新组件
  update(deltaTime: number): void {
    // 更新子组件
    for (const child of this._children) {
      child.update(deltaTime);
    }
  }

  // 渲染组件
  abstract render(context: CanvasRenderingContext2D): void;

  // 销毁组件
  destroy(): void {
    this.removeAllChildren();
    this.removeAllListeners();
    if (this._parent) {
      this._parent.removeChild(this);
    }
  }
}