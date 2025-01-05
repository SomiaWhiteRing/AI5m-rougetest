import { nanoid } from 'nanoid';
import { EventEmitter } from 'events';
import { Component } from './Component';
import { ComponentManager } from './ComponentManager';

export interface EntityStats {
  maxHealth: number;
  health: number;
  shield: number;
  maxShield: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  attack: number;
  defense: number;
  speed: number;
}

export class Entity extends EventEmitter {
  private _id: string;
  private _stats: EntityStats;
  private _effects: Map<string, any>;
  private _position: { x: number; y: number };
  private _direction: { x: number; y: number };
  private _isActive: boolean;
  private _componentManager: ComponentManager;

  constructor(initialStats: Partial<EntityStats> = {}) {
    super();
    this._id = nanoid();
    this._effects = new Map();
    this._position = { x: 0, y: 0 };
    this._direction = { x: 0, y: 0 };
    this._isActive = true;
    this._componentManager = new ComponentManager(this);

    // 初始化默认属性
    this._stats = {
      maxHealth: 100,
      health: 100,
      shield: 0,
      maxShield: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      attack: 10,
      defense: 5,
      speed: 5,
      ...initialStats,
    };
  }

  // ID访问器
  get id(): string {
    return this._id;
  }

  // 状态访问器
  get stats(): EntityStats {
    return { ...this._stats };
  }

  // 位置访问器
  get position() {
    return { ...this._position };
  }

  set position(newPosition: { x: number; y: number }) {
    this._position = { ...newPosition };
    this.emit('positionChanged', this._position);
  }

  // 方向访问器
  get direction() {
    return { ...this._direction };
  }

  set direction(newDirection: { x: number; y: number }) {
    this._direction = { ...newDirection };
    this.emit('directionChanged', this._direction);
  }

  // 组件管理方法
  addComponent<T extends Component>(component: T): T {
    return this._componentManager.addComponent(component);
  }

  removeComponent<T extends Component>(component: T): void {
    this._componentManager.removeComponent(component);
  }

  getComponent<T extends Component>(componentType: string): T | null {
    return this._componentManager.getComponent<T>(componentType);
  }

  getComponents<T extends Component>(componentType: string): T[] {
    return this._componentManager.getComponents<T>(componentType);
  }

  hasComponent(componentType: string): boolean {
    return this._componentManager.hasComponent(componentType);
  }

  // 生命值相关方法
  takeDamage(amount: number): number {
    const actualDamage = Math.max(1, amount - this._stats.defense);

    // 先扣除护盾
    if (this._stats.shield > 0) {
      if (this._stats.shield >= actualDamage) {
        this._stats.shield -= actualDamage;
        this.emit('shieldDamaged', { damage: actualDamage, remainingShield: this._stats.shield });
        return 0;
      } else {
        const remainingDamage = actualDamage - this._stats.shield;
        this._stats.shield = 0;
        this._stats.health = Math.max(0, this._stats.health - remainingDamage);
        this.emit('damaged', { damage: remainingDamage, remainingHealth: this._stats.health });
        return remainingDamage;
      }
    }

    // 直接扣除生命值
    this._stats.health = Math.max(0, this._stats.health - actualDamage);
    this.emit('damaged', { damage: actualDamage, remainingHealth: this._stats.health });

    if (this._stats.health <= 0) {
      this.emit('died');
    }

    return actualDamage;
  }

  heal(amount: number): number {
    const missingHealth = this._stats.maxHealth - this._stats.health;
    const actualHeal = Math.min(missingHealth, amount);
    this._stats.health += actualHeal;
    this.emit('healed', { amount: actualHeal, currentHealth: this._stats.health });
    return actualHeal;
  }

  addShield(amount: number): number {
    const remainingShieldSpace = this._stats.maxShield - this._stats.shield;
    const actualShield = Math.min(remainingShieldSpace, amount);
    this._stats.shield += actualShield;
    this.emit('shieldAdded', { amount: actualShield, currentShield: this._stats.shield });
    return actualShield;
  }

  // 经验值相关方法
  addExperience(amount: number): void {
    this._stats.experience += amount;
    while (this._stats.experience >= this._stats.experienceToNextLevel) {
      this.levelUp();
    }
    this.emit('experienceGained', { amount, currentExperience: this._stats.experience });
  }

  private levelUp(): void {
    this._stats.experience -= this._stats.experienceToNextLevel;
    this._stats.level += 1;
    this._stats.experienceToNextLevel = Math.floor(this._stats.experienceToNextLevel * 1.5);

    // 升级时属性提升
    this._stats.maxHealth += 20;
    this._stats.health = this._stats.maxHealth;
    this._stats.maxShield += 10;
    this._stats.shield = this._stats.maxShield;
    this._stats.attack += 5;
    this._stats.defense += 3;
    this._stats.speed += 1;

    this.emit('levelUp', { newLevel: this._stats.level, stats: this.stats });
  }

  // 效果系统
  addEffect(effectId: string, effect: any): void {
    this._effects.set(effectId, effect);
    this.emit('effectAdded', { effectId, effect });
  }

  removeEffect(effectId: string): void {
    if (this._effects.has(effectId)) {
      const effect = this._effects.get(effectId);
      this._effects.delete(effectId);
      this.emit('effectRemoved', { effectId, effect });
    }
  }

  hasEffect(effectId: string): boolean {
    return this._effects.has(effectId);
  }

  // 更新方法
  update(deltaTime: number): void {
    if (!this._isActive) return;

    // 更新组件
    this._componentManager.update(deltaTime);

    // 更新效果
    for (const [effectId, effect] of this._effects.entries()) {
      if (effect.update) {
        effect.update(deltaTime);
        if (effect.isExpired) {
          this.removeEffect(effectId);
        }
      }
    }
  }

  // 激活状态控制
  activate(): void {
    this._isActive = true;
    this._componentManager.enableAllComponents();
    this.emit('activated');
  }

  deactivate(): void {
    this._isActive = false;
    this._componentManager.disableAllComponents();
    this.emit('deactivated');
  }

  isActive(): boolean {
    return this._isActive;
  }
}