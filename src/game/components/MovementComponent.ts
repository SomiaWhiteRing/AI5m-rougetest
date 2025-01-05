import { Component } from '../core/Component';
import { Entity } from '../core/Entity';

export interface MovementConfig {
  maxSpeed: number;
  acceleration: number;
  deceleration: number;
  rotationSpeed: number;
}

export class MovementComponent extends Component {
  private _velocity: { x: number; y: number };
  private _config: MovementConfig;
  private _targetPosition: { x: number; y: number } | null = null;
  private _isMoving: boolean = false;

  constructor(entity: Entity, config: Partial<MovementConfig> = {}) {
    super(entity);
    this._velocity = { x: 0, y: 0 };
    this._config = {
      maxSpeed: 200,
      acceleration: 800,
      deceleration: 800,
      rotationSpeed: 180,
      ...config,
    };
  }

  onInit(): void {
    // 初始化时不需要特殊处理
  }

  // 移动到指定位置
  moveTo(x: number, y: number): void {
    this._targetPosition = { x, y };
    this._isMoving = true;
    this.emit('moveStart', { target: this._targetPosition });
  }

  // 停止移动
  stop(): void {
    this._targetPosition = null;
    this._isMoving = false;
    this._velocity = { x: 0, y: 0 };
    this.emit('moveStopped');
  }

  // 设置速度
  setVelocity(x: number, y: number): void {
    this._velocity = { x, y };
    this.normalizeVelocity();
  }

  // 获取速度
  getVelocity(): { x: number; y: number } {
    return { ...this._velocity };
  }

  // 标准化速度向量
  private normalizeVelocity(): void {
    const speed = Math.sqrt(this._velocity.x * this._velocity.x + this._velocity.y * this._velocity.y);
    if (speed > this._config.maxSpeed) {
      const scale = this._config.maxSpeed / speed;
      this._velocity.x *= scale;
      this._velocity.y *= scale;
    }
  }

  // 更新移动
  protected onUpdate(deltaTime: number): void {
    if (!this._isMoving) return;

    const currentPosition = this.entity.position;

    if (this._targetPosition) {
      // 计算到目标的方向
      const dx = this._targetPosition.x - currentPosition.x;
      const dy = this._targetPosition.y - currentPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 如果已经足够接近目标，则停止移动
      if (distance < 1) {
        this.stop();
        return;
      }

      // 计算目标方向
      const direction = {
        x: dx / distance,
        y: dy / distance,
      };

      // 应用加速度
      this._velocity.x += direction.x * this._config.acceleration * deltaTime;
      this._velocity.y += direction.y * this._config.acceleration * deltaTime;

      // 确保不超过最大速度
      this.normalizeVelocity();
    }

    // 更新位置
    const newPosition = {
      x: currentPosition.x + this._velocity.x * deltaTime,
      y: currentPosition.y + this._velocity.y * deltaTime,
    };

    // 更新实体位置
    this.entity.position = newPosition;

    // 如果有速度，更新实体方向
    if (this._velocity.x !== 0 || this._velocity.y !== 0) {
      const angle = Math.atan2(this._velocity.y, this._velocity.x);
      this.entity.direction = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
    }

    // 发出移动事件
    this.emit('moving', {
      position: newPosition,
      velocity: this._velocity,
    });
  }

  // 应用力
  applyForce(x: number, y: number): void {
    this._velocity.x += x;
    this._velocity.y += y;
    this.normalizeVelocity();
  }

  // 获取移动状态
  isMoving(): boolean {
    return this._isMoving;
  }

  // 获取当前配置
  getConfig(): MovementConfig {
    return { ...this._config };
  }

  // 更新配置
  updateConfig(config: Partial<MovementConfig>): void {
    this._config = {
      ...this._config,
      ...config,
    };
  }
}