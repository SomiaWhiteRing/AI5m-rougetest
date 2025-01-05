import { UIComponent, UIStyle } from './UIComponent';

export interface ListItemStyle extends UIStyle {
  text: string;
  icon?: string;
  selected?: boolean;
  hoverBackgroundColor?: string;
  selectedBackgroundColor?: string;
  textColor?: string;
  selectedTextColor?: string;
  iconSize?: number;
  iconColor?: string;
  selectedIconColor?: string;
}

export interface ListStyle extends UIStyle {
  items: ListItemStyle[];
  itemHeight?: number;
  itemSpacing?: number;
  multiSelect?: boolean;
  showScrollbar?: boolean;
  scrollbarWidth?: number;
  scrollbarColor?: string;
  scrollbarHoverColor?: string;
  scrollbarBackgroundColor?: string;
  hoverEnabled?: boolean;
  font?: string;
  fontSize?: number;
  fontWeight?: string;
}

export class List extends UIComponent {
  declare protected _style: ListStyle;
  private _selectedIndices: Set<number> = new Set();
  private _hoveredIndex: number = -1;
  private _scrollOffset: number = 0;
  private _isDraggingScrollbar: boolean = false;
  private _scrollbarGrabPosition: number = 0;
  private _lastMouseX: number = 0;
  private _lastMouseY: number = 0;

  constructor(style: Partial<ListStyle> = {}) {
    // 设置默认样式
    const defaultStyle: ListStyle = {
      position: { x: 0, y: 0 },
      size: { width: 200, height: 300 },
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderWidth: 1,
      borderRadius: 4,
      opacity: 1,
      visible: true,
      zIndex: 0,
      items: [],
      itemHeight: 30,
      itemSpacing: 2,
      multiSelect: false,
      showScrollbar: true,
      scrollbarWidth: 8,
      scrollbarColor: '#999999',
      scrollbarHoverColor: '#666666',
      scrollbarBackgroundColor: '#f0f0f0',
      hoverEnabled: true,
      font: 'Arial',
      fontSize: 14,
      fontWeight: 'normal',
      ...style,
    };

    super(defaultStyle);
    this._style = defaultStyle;
  }

  // 渲染列表
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
    context.fillStyle = this._style.backgroundColor || '#ffffff';
    context.fill();

    // 绘制边框
    if (this._style.borderWidth && this._style.borderColor) {
      context.lineWidth = this._style.borderWidth;
      context.strokeStyle = this._style.borderColor;
      context.stroke();
    }

    // 创建裁剪区域
    context.beginPath();
    this.roundRect(context, x, y, width, height, radius);
    context.clip();

    // 计算可见区域
    const contentHeight = this.getContentHeight();
    const viewportHeight = height - padding.top - padding.bottom;
    const maxScroll = Math.max(0, contentHeight - viewportHeight);
    this._scrollOffset = Math.max(0, Math.min(this._scrollOffset, maxScroll));

    // 计算可见项的范围
    const itemHeight = this._style.itemHeight || 30;
    const itemSpacing = this._style.itemSpacing || 2;
    const startIndex = Math.floor(this._scrollOffset / (itemHeight + itemSpacing));
    const endIndex = Math.min(
      this._style.items.length - 1,
      Math.ceil((this._scrollOffset + viewportHeight) / (itemHeight + itemSpacing))
    );

    // 绘制列表项
    for (let i = startIndex; i <= endIndex; i++) {
      const item = this._style.items[i];
      const itemY = y + padding.top + i * (itemHeight + itemSpacing) - this._scrollOffset;

      // 绘制项背景
      context.beginPath();
      this.roundRect(
        context,
        x + padding.left,
        itemY,
        width - padding.left - padding.right - (this._style.showScrollbar ? this._style.scrollbarWidth! + 4 : 0),
        itemHeight,
        2
      );

      // 设置背景颜色
      if (this._selectedIndices.has(i)) {
        context.fillStyle = item.selectedBackgroundColor || '#e6f3ff';
      } else if (i === this._hoveredIndex && this._style.hoverEnabled) {
        context.fillStyle = item.hoverBackgroundColor || '#f5f5f5';
      } else {
        context.fillStyle = '#ffffff';
      }
      context.fill();

      // 绘制图标
      if (item.icon) {
        const iconSize = item.iconSize || 16;
        const iconY = itemY + (itemHeight - iconSize) / 2;
        // 这里应该添加图标绘制逻辑
        // 可以使用Image对象或SVG路径
      }

      // 绘制文本
      context.textAlign = 'left';
      context.textBaseline = 'middle';
      context.font = `${this._style.fontWeight} ${this._style.fontSize}px ${this._style.font}`;
      context.fillStyle = this._selectedIndices.has(i)
        ? item.selectedTextColor || '#1a73e8'
        : item.textColor || '#333333';

      const textX = x + padding.left + (item.icon ? (item.iconSize || 16) + 8 : 0) + 8;
      const textY = itemY + itemHeight / 2;
      context.fillText(item.text, textX, textY);
    }

    // 绘制滚动条
    if (this._style.showScrollbar && contentHeight > viewportHeight) {
      const scrollbarHeight = (viewportHeight / contentHeight) * viewportHeight;
      const scrollbarY = y + padding.top + (this._scrollOffset / contentHeight) * viewportHeight;

      // 绘制滚动条背景
      context.beginPath();
      this.roundRect(
        context,
        x + width - padding.right - this._style.scrollbarWidth!,
        y + padding.top,
        this._style.scrollbarWidth!,
        viewportHeight,
        this._style.scrollbarWidth! / 2
      );
      context.fillStyle = this._style.scrollbarBackgroundColor || '#f0f0f0';
      context.fill();

      // 绘制滚动条
      context.beginPath();
      this.roundRect(
        context,
        x + width - padding.right - this._style.scrollbarWidth!,
        scrollbarY,
        this._style.scrollbarWidth!,
        scrollbarHeight,
        this._style.scrollbarWidth! / 2
      );
      context.fillStyle = this._isDraggingScrollbar
        ? this._style.scrollbarHoverColor || '#666666'
        : this._style.scrollbarColor || '#999999';
      context.fill();
    }

    // 恢复上下文状态
    context.restore();

    // 渲染子组件
    for (const child of this._children) {
      child.render(context);
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

  // 获取内容总高度
  private getContentHeight(): number {
    const itemHeight = this._style.itemHeight || 30;
    const itemSpacing = this._style.itemSpacing || 2;
    return this._style.items.length * (itemHeight + itemSpacing) - itemSpacing;
  }

  // 处理鼠标移动
  onMouseMove(x: number, y: number): void {
    if (!this._style.visible || !this._isEnabled) return;

    this._lastMouseX = x;
    this._lastMouseY = y;

    const { x: listX, y: listY } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const padding = this._style.padding || { top: 0, right: 0, bottom: 0, left: 0 };

    // 检查是否在滚动条区域
    if (this._style.showScrollbar) {
      const scrollbarX = listX + width - padding.right - this._style.scrollbarWidth!;
      if (x >= scrollbarX && x <= scrollbarX + this._style.scrollbarWidth!) {
        if (this._isDraggingScrollbar) {
          const contentHeight = this.getContentHeight();
          const viewportHeight = height - padding.top - padding.bottom;
          const scrollableHeight = viewportHeight - (viewportHeight * viewportHeight) / contentHeight;
          const scrollPosition = y - listY - padding.top - this._scrollbarGrabPosition;
          const scrollPercentage = Math.max(0, Math.min(1, scrollPosition / scrollableHeight));
          this._scrollOffset = scrollPercentage * (contentHeight - viewportHeight);
          this.markDirty();
        }
        return;
      }
    }

    // 计算悬停项
    if (this._style.hoverEnabled) {
      const localY = y - listY - padding.top + this._scrollOffset;
      const itemHeight = this._style.itemHeight || 30;
      const itemSpacing = this._style.itemSpacing || 2;
      const index = Math.floor(localY / (itemHeight + itemSpacing));

      if (
        index >= 0 &&
        index < this._style.items.length &&
        x >= listX + padding.left &&
        x <= listX + width - padding.right - (this._style.showScrollbar ? this._style.scrollbarWidth! + 4 : 0)
      ) {
        if (this._hoveredIndex !== index) {
          this._hoveredIndex = index;
          this.markDirty();
          this.emit('itemhover', { index, item: this._style.items[index] });
        }
      } else if (this._hoveredIndex !== -1) {
        this._hoveredIndex = -1;
        this.markDirty();
      }
    }

    super.onMouseMove(x, y);
  }

  // 处理鼠标按下
  onMouseDown(): void {
    if (!this._style.visible || !this._isEnabled) return;

    const { x, y } = this.getGlobalPosition();
    const { width, height } = this._style.size;
    const padding = this._style.padding || { top: 0, right: 0, bottom: 0, left: 0 };

    // 检查是否点击滚动条
    if (this._style.showScrollbar) {
      const scrollbarX = x + width - padding.right - this._style.scrollbarWidth!;
      const contentHeight = this.getContentHeight();
      const viewportHeight = height - padding.top - padding.bottom;
      const scrollbarHeight = (viewportHeight / contentHeight) * viewportHeight;
      const scrollbarY = y + padding.top + (this._scrollOffset / contentHeight) * viewportHeight;

      if (
        this._lastMouseX >= scrollbarX &&
        this._lastMouseX <= scrollbarX + this._style.scrollbarWidth! &&
        this._lastMouseY >= scrollbarY &&
        this._lastMouseY <= scrollbarY + scrollbarHeight
      ) {
        this._isDraggingScrollbar = true;
        this._scrollbarGrabPosition = this._lastMouseY - scrollbarY;
        return;
      }
    }

    // 处理项选择
    if (this._hoveredIndex !== -1) {
      if (this._style.multiSelect) {
        if (this._selectedIndices.has(this._hoveredIndex)) {
          this._selectedIndices.delete(this._hoveredIndex);
        } else {
          this._selectedIndices.add(this._hoveredIndex);
        }
      } else {
        this._selectedIndices.clear();
        this._selectedIndices.add(this._hoveredIndex);
      }
      this.markDirty();
      this.emit('itemselect', {
        index: this._hoveredIndex,
        item: this._style.items[this._hoveredIndex],
        selected: this._selectedIndices.has(this._hoveredIndex),
      });
    } else {
      if (!this._style.multiSelect) {
        this._selectedIndices.clear();
        this.markDirty();
      }
    }

    super.onMouseDown();
  }

  // 处理鼠标抬起
  onMouseUp(): void {
    if (this._isDraggingScrollbar) {
      this._isDraggingScrollbar = false;
      this.markDirty();
    }
    super.onMouseUp();
  }

  // 处理滚轮事件
  onWheel(deltaY: number): void {
    if (!this._style.visible || !this._isEnabled) return;

    const contentHeight = this.getContentHeight();
    const viewportHeight = this._style.size.height - (this._style.padding?.top || 0) - (this._style.padding?.bottom || 0);

    if (contentHeight > viewportHeight) {
      this._scrollOffset = Math.max(
        0,
        Math.min(
          this._scrollOffset + deltaY,
          contentHeight - viewportHeight
        )
      );
      this.markDirty();
    }
  }

  // 设置列表项
  setItems(items: ListItemStyle[]): void {
    const newStyle: Partial<ListStyle> = { items };
    this.setStyle(newStyle);
    this._selectedIndices.clear();
    this._hoveredIndex = -1;
    this._scrollOffset = 0;
  }

  // 获取列表项
  getItems(): ListItemStyle[] {
    return [...this._style.items];
  }

  // 获取选中项
  getSelectedItems(): ListItemStyle[] {
    return Array.from(this._selectedIndices).map(index => this._style.items[index]);
  }

  // 获取选中索引
  getSelectedIndices(): number[] {
    return Array.from(this._selectedIndices);
  }

  // 设置选中项
  setSelectedIndices(indices: number[]): void {
    this._selectedIndices.clear();
    indices.forEach(index => {
      if (index >= 0 && index < this._style.items.length) {
        this._selectedIndices.add(index);
      }
    });
    this.markDirty();
  }

  // 清除选中项
  clearSelection(): void {
    this._selectedIndices.clear();
    this.markDirty();
  }
}