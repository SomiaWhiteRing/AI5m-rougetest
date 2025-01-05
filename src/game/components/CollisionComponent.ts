import { Component } from '../core/Component';
import { Entity } from '../core/Entity';

export interface CollisionShape {
  type: 'circle' | 'rectangle';
  width: number;
  height: number;
  offset?: { x: number; y: number };
}

export interface CollisionFilter {
  category: number;
  mask: number;
  group: number;
}

export class CollisionComponent extends Component {
  private _shape: CollisionShape;
  private _isTrigger: boolean;
  private _filter: CollisionFilter;
  private _collidingEntities: Set<Entity>;
  private _triggerEntities: Set<Entity>;

  constructor(
    entity: Entity,
    shape: CollisionShape,
    isTrigger: boolean = false,
    filter: CollisionFilter = { category: 1, mask: 0xFFFFFFFF, group: 0 }
  ) {
    super(entity);
    this._shape = {
      ...shape,
      offset: shape.offset || { x: 0, y: 0 },
    };
    this._isTrigger = isTrigger;
    this._filter = filter;
    this._collidingEntities = new Set();
    this._triggerEntities = new Set();
  }

  onInit(): void {
    // 初始化时不需要特殊处理
  }

  // 获取碰撞形状
  get shape(): CollisionShape {
    return { ...this._shape };
  }

  // 设置碰撞形状
  set shape(shape: CollisionShape) {
    this._shape = {
      ...shape,
      offset: shape.offset || { x: 0, y: 0 },
    };
    this.emit('shapeChanged', this._shape);
  }

  // 获取是否为触发器
  get isTrigger(): boolean {
    return this._isTrigger;
  }

  // 设置是否为触发器
  set isTrigger(value: boolean) {
    this._isTrigger = value;
    this.emit('triggerChanged', value);
  }

  // 获取碰撞过滤器
  get filter(): CollisionFilter {
    return { ...this._filter };
  }

  // 设置碰撞过滤器
  set filter(value: CollisionFilter) {
    this._filter = { ...value };
    this.emit('filterChanged', this._filter);
  }

  // 检查是否与另一个碰撞体发生碰撞
  checkCollision(other: CollisionComponent): boolean {
    // 首先检查过滤器
    if (!this.checkFilter(other)) {
      return false;
    }

    const thisPos = this.entity.position;
    const otherPos = other.entity.position;

    // 根据形状类型进行碰撞检测
    if (this._shape.type === 'circle' && other._shape.type === 'circle') {
      return this.checkCircleCollision(
        thisPos.x + this._shape.offset!.x,
        thisPos.y + this._shape.offset!.y,
        this._shape.width / 2,
        otherPos.x + other._shape.offset!.x,
        otherPos.y + other._shape.offset!.y,
        other._shape.width / 2
      );
    } else if (this._shape.type === 'rectangle' && other._shape.type === 'rectangle') {
      return this.checkRectangleCollision(
        thisPos.x + this._shape.offset!.x,
        thisPos.y + this._shape.offset!.y,
        this._shape.width,
        this._shape.height,
        otherPos.x + other._shape.offset!.x,
        otherPos.y + other._shape.offset!.y,
        other._shape.width,
        other._shape.height
      );
    } else {
      // 圆形和矩形的碰撞检测
      if (this._shape.type === 'circle') {
        return this.checkCircleRectangleCollision(
          thisPos.x + this._shape.offset!.x,
          thisPos.y + this._shape.offset!.y,
          this._shape.width / 2,
          otherPos.x + other._shape.offset!.x,
          otherPos.y + other._shape.offset!.y,
          other._shape.width,
          other._shape.height
        );
      } else {
        return this.checkCircleRectangleCollision(
          otherPos.x + other._shape.offset!.x,
          otherPos.y + other._shape.offset!.y,
          other._shape.width / 2,
          thisPos.x + this._shape.offset!.x,
          thisPos.y + this._shape.offset!.y,
          this._shape.width,
          this._shape.height
        );
      }
    }
  }

  // 处理碰撞开始
  onCollisionEnter(other: CollisionComponent): void {
    if (this._isTrigger || other.isTrigger) {
      if (!this._triggerEntities.has(other.entity)) {
        this._triggerEntities.add(other.entity);
        this.emit('triggerEnter', { entity: other.entity, component: other });
      }
    } else {
      if (!this._collidingEntities.has(other.entity)) {
        this._collidingEntities.add(other.entity);
        this.emit('collisionEnter', { entity: other.entity, component: other });
      }
    }
  }

  // 处理碰撞结束
  onCollisionExit(other: CollisionComponent): void {
    if (this._isTrigger || other.isTrigger) {
      if (this._triggerEntities.has(other.entity)) {
        this._triggerEntities.delete(other.entity);
        this.emit('triggerExit', { entity: other.entity, component: other });
      }
    } else {
      if (this._collidingEntities.has(other.entity)) {
        this._collidingEntities.delete(other.entity);
        this.emit('collisionExit', { entity: other.entity, component: other });
      }
    }
  }

  // 获取当前碰撞的实体
  getCollidingEntities(): Entity[] {
    return Array.from(this._collidingEntities);
  }

  // 获取当前触发的实体
  getTriggerEntities(): Entity[] {
    return Array.from(this._triggerEntities);
  }

  // 检查是否与实体发生碰撞
  isCollidingWith(entity: Entity): boolean {
    return this._collidingEntities.has(entity);
  }

  // 检查是否触发了实体
  isTriggering(entity: Entity): boolean {
    return this._triggerEntities.has(entity);
  }

  // 私有方法：检查过滤器
  private checkFilter(other: CollisionComponent): boolean {
    // 如果在同一组且组不为0，则根据组号的正负决定是否碰撞
    if (this._filter.group !== 0 && this._filter.group === other._filter.group) {
      return this._filter.group > 0;
    }

    // 检查类别和掩码
    return (
      (this._filter.category & other._filter.mask) !== 0 &&
      (other._filter.category & this._filter.mask) !== 0
    );
  }

  // 私有方法：检查圆形碰撞
  private checkCircleCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  }

  // 私有方法：检查矩形碰撞
  private checkRectangleCollision(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return (
      x1 < x2 + w2 &&
      x1 + w1 > x2 &&
      y1 < y2 + h2 &&
      y1 + h1 > y2
    );
  }

  // 私有方法：检查圆形和矩形的碰撞
  private checkCircleRectangleCollision(
    circleX: number,
    circleY: number,
    radius: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
  ): boolean {
    // 找到矩形上离圆心最近的点
    const closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    const closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

    // 计算圆心到最近点的距离
    const dx = circleX - closestX;
    const dy = circleY - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < radius;
  }
}