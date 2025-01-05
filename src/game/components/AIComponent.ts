import { Component } from '../core/Component';
import { Entity } from '../core/Entity';
import { MovementComponent } from './MovementComponent';

export type AIState = 'idle' | 'patrol' | 'chase' | 'attack' | 'flee' | 'return';

export interface AIConfig {
  detectionRange: number;
  attackRange: number;
  patrolRadius: number;
  chaseSpeed: number;
  patrolSpeed: number;
  fleeThreshold: number;
  attackCooldown: number;
}

export class AIComponent extends Component {
  private _config: AIConfig;
  private _currentState: AIState;
  private _target: Entity | null;
  private _homePosition: { x: number; y: number };
  private _patrolTarget: { x: number; y: number } | null;
  private _lastAttackTime: number;
  private _movementComponent: MovementComponent | null;

  constructor(entity: Entity, config: Partial<AIConfig> = {}) {
    super(entity);

    this._config = {
      detectionRange: 200,
      attackRange: 50,
      patrolRadius: 100,
      chaseSpeed: 150,
      patrolSpeed: 80,
      fleeThreshold: 0.3,
      attackCooldown: 1,
      ...config,
    };

    this._currentState = 'idle';
    this._target = null;
    this._homePosition = { ...entity.position };
    this._patrolTarget = null;
    this._lastAttackTime = 0;
    this._movementComponent = null;
  }

  onInit(): void {
    // 获取移动组件
    this._movementComponent = this.entity.getComponent<MovementComponent>('MovementComponent');
    if (!this._movementComponent) {
      console.warn('AIComponent requires MovementComponent');
    }
  }

  // 更新AI状态
  protected onUpdate(deltaTime: number): void {
    if (!this._movementComponent) return;

    switch (this._currentState) {
      case 'idle':
        this.updateIdleState();
        break;
      case 'patrol':
        this.updatePatrolState();
        break;
      case 'chase':
        this.updateChaseState();
        break;
      case 'attack':
        this.updateAttackState(deltaTime);
        break;
      case 'flee':
        this.updateFleeState();
        break;
      case 'return':
        this.updateReturnState();
        break;
    }
  }

  // 设置目标
  setTarget(target: Entity | null): void {
    this._target = target;
    if (target) {
      this.changeState('chase');
    } else {
      this.changeState('return');
    }
  }

  // 改变状态
  private changeState(newState: AIState): void {
    if (this._currentState === newState) return;

    const oldState = this._currentState;
    this._currentState = newState;

    // 状态退出逻辑
    switch (oldState) {
      case 'patrol':
        this._patrolTarget = null;
        break;
      case 'chase':
      case 'attack':
        if (newState !== 'chase' && newState !== 'attack') {
          this._target = null;
        }
        break;
    }

    // 状态进入逻辑
    switch (newState) {
      case 'patrol':
        this.selectNewPatrolTarget();
        break;
      case 'return':
        this._movementComponent?.moveTo(this._homePosition.x, this._homePosition.y);
        break;
    }

    this.emit('stateChanged', { from: oldState, to: newState });
  }

  // 更新空闲状态
  private updateIdleState(): void {
    // 检查是否有目标在检测范围内
    if (this._target && this.isTargetInRange(this._config.detectionRange)) {
      this.changeState('chase');
      return;
    }

    // 随机开始巡逻
    if (Math.random() < 0.01) {
      this.changeState('patrol');
    }
  }

  // 更新巡逻状态
  private updatePatrolState(): void {
    if (!this._movementComponent) return;

    // 检查是否有目标在检测范围内
    if (this._target && this.isTargetInRange(this._config.detectionRange)) {
      this.changeState('chase');
      return;
    }

    // 如果没有巡逻目标或已到达目标点，选择新的巡逻点
    if (!this._patrolTarget || !this._movementComponent.isMoving()) {
      this.selectNewPatrolTarget();
    }
  }

  // 更新追击状态
  private updateChaseState(): void {
    if (!this._movementComponent || !this._target) return;

    // 检查目标是否在攻击范围内
    if (this.isTargetInRange(this._config.attackRange)) {
      this.changeState('attack');
      return;
    }

    // 检查目标是否超出检测范围
    if (!this.isTargetInRange(this._config.detectionRange * 1.5)) {
      this.changeState('return');
      return;
    }

    // 更新移动目标
    this._movementComponent.moveTo(this._target.position.x, this._target.position.y);
  }

  // 更新攻击状态
  private updateAttackState(deltaTime: number): void {
    if (!this._target) {
      this.changeState('return');
      return;
    }

    // 检查目标是否在攻击范围内
    if (!this.isTargetInRange(this._config.attackRange)) {
      this.changeState('chase');
      return;
    }

    // 检查攻击冷却
    if (this._lastAttackTime + this._config.attackCooldown <= deltaTime) {
      this.performAttack();
      this._lastAttackTime = deltaTime;
    }
  }

  // 更新逃跑状态
  private updateFleeState(): void {
    if (!this._movementComponent || !this._target) return;

    // 如果生命值恢复到阈值以上，返回追击状态
    if (this.entity.stats.health > this.entity.stats.maxHealth * this._config.fleeThreshold) {
      this.changeState('chase');
      return;
    }

    // 计算逃跑方向（远离目标）
    const dx = this.entity.position.x - this._target.position.x;
    const dy = this.entity.position.y - this._target.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const fleeX = this.entity.position.x + (dx / distance) * 100;
      const fleeY = this.entity.position.y + (dy / distance) * 100;
      this._movementComponent.moveTo(fleeX, fleeY);
    }
  }

  // 更新返回状态
  private updateReturnState(): void {
    if (!this._movementComponent) return;

    // 检查是否已返回家
    const dx = this.entity.position.x - this._homePosition.x;
    const dy = this.entity.position.y - this._homePosition.y;
    const distanceToHome = Math.sqrt(dx * dx + dy * dy);

    if (distanceToHome < 10) {
      this.changeState('idle');
      return;
    }

    // 继续移动向家的位置
    this._movementComponent.moveTo(this._homePosition.x, this._homePosition.y);
  }

  // 选择新的巡逻目标
  private selectNewPatrolTarget(): void {
    if (!this._movementComponent) return;

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * this._config.patrolRadius;

    this._patrolTarget = {
      x: this._homePosition.x + Math.cos(angle) * distance,
      y: this._homePosition.y + Math.sin(angle) * distance,
    };

    this._movementComponent.moveTo(this._patrolTarget.x, this._patrolTarget.y);
  }

  // 执行攻击
  private performAttack(): void {
    if (!this._target) return;

    // 发出攻击事件
    this.emit('attack', {
      target: this._target,
      damage: this.entity.stats.attack,
    });

    // 对目标造成伤害
    this._target.takeDamage(this.entity.stats.attack);
  }

  // 检查目标是否在指定范围内
  private isTargetInRange(range: number): boolean {
    if (!this._target) return false;

    const dx = this._target.position.x - this.entity.position.x;
    const dy = this._target.position.y - this.entity.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= range;
  }

  // 获取当前状态
  getCurrentState(): AIState {
    return this._currentState;
  }

  // 获取当前目标
  getCurrentTarget(): Entity | null {
    return this._target;
  }

  // 获取配置
  getConfig(): AIConfig {
    return { ...this._config };
  }

  // 更新配置
  updateConfig(config: Partial<AIConfig>): void {
    this._config = {
      ...this._config,
      ...config,
    };
  }

  // 设置家的位置
  setHomePosition(x: number, y: number): void {
    this._homePosition = { x, y };
  }
}