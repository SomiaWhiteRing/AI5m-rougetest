import { Scene, GameObjects, Physics, Math as PhaserMath } from 'phaser';
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import { GameObject } from '../core/GameObject';

export interface EntityConfig {
  scene: Scene;
  x: number;
  y: number;
  texture: string;
  frame?: string | number;
}

export interface EntityState {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  speed: number;
  level: number;
  experience: number;
  effects: Map<string, Effect>;
}

export interface Effect {
  type: string;
  value: number;
  duration: number;
  startTime: number;
}

export class Entity extends GameObject {
  private entityId: string;
  protected entityState: EntityState;
  protected eventEmitter: EventEmitter;
  protected sprite: GameObjects.Sprite;
  protected body: Physics.Arcade.Body;

  constructor(config: EntityConfig) {
    super(config.scene, config.x, config.y);

    this.entityId = nanoid();
    this.eventEmitter = new EventEmitter();

    // 创建精灵
    this.sprite = new GameObjects.Sprite(this.scene, 0, 0, config.texture, config.frame);
    this.add(this.sprite);

    // 初始化状态
    this.entityState = {
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 50,
      speed: 100,
      level: 1,
      experience: 0,
      effects: new Map()
    };

    // 设置物理属性
    this.scene.physics.world.enable(this);
    this.body = this.body as Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.scene.add.existing(this);

    // 注册更新事件
    this.scene.events.on('update', this.update, this);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    this.updateEffects(time);
  }

  updateEffects(time: number): void {
    for (const [id, effect] of this.entityState.effects) {
      if (time - effect.startTime >= effect.duration) {
        this.removeEffect(id);
      }
    }
  }

  addEffect(effect: Effect): void {
    const id = nanoid();
    this.entityState.effects.set(id, effect);
    this.eventEmitter.emit('effectAdded', effect);
  }

  removeEffect(id: string): void {
    const effect = this.entityState.effects.get(id);
    if (effect) {
      this.entityState.effects.delete(id);
      this.eventEmitter.emit('effectRemoved', effect);
    }
  }

  takeDamage(amount: number): void {
    // 先扣除护盾
    if (this.entityState.shield > 0) {
      if (this.entityState.shield >= amount) {
        this.entityState.shield -= amount;
        amount = 0;
      } else {
        amount -= this.entityState.shield;
        this.entityState.shield = 0;
      }
    }

    // 扣除生命值
    if (amount > 0) {
      this.entityState.health = Math.max(0, this.entityState.health - amount);
      if (this.entityState.health === 0) {
        this.die();
      }
    }

    this.eventEmitter.emit('damaged', amount);
  }

  heal(amount: number): void {
    const oldHealth = this.entityState.health;
    this.entityState.health = Math.min(this.entityState.maxHealth, this.entityState.health + amount);
    const actualHeal = this.entityState.health - oldHealth;
    this.eventEmitter.emit('healed', actualHeal);
  }

  addShield(amount: number): void {
    const oldShield = this.entityState.shield;
    this.entityState.shield = Math.min(this.entityState.maxShield, this.entityState.shield + amount);
    const actualShield = this.entityState.shield - oldShield;
    this.eventEmitter.emit('shieldAdded', actualShield);
  }

  gainExperience(amount: number): void {
    this.entityState.experience += amount;
    this.checkLevelUp();
    this.eventEmitter.emit('experienceGained', amount);
  }

  protected checkLevelUp(): void {
    const expNeeded = this.getExpNeededForNextLevel();
    if (this.entityState.experience >= expNeeded) {
      this.levelUp();
    }
  }

  protected levelUp(): void {
    this.entityState.level++;
    this.entityState.experience -= this.getExpNeededForNextLevel();
    this.entityState.maxHealth += 10;
    this.entityState.health = this.entityState.maxHealth;
    this.entityState.maxShield += 5;
    this.eventEmitter.emit('levelUp', this.entityState.level);
  }

  protected getExpNeededForNextLevel(): number {
    return Math.floor(100 * Math.pow(1.5, this.entityState.level - 1));
  }

  protected die(): void {
    this.eventEmitter.emit('died');
    this.destroy();
  }

  getEntityId(): string {
    return this.entityId;
  }

  getEntityState(): EntityState {
    return { ...this.entityState };
  }

  getHealth(): number {
    return this.entityState.health;
  }

  getMaxHealth(): number {
    return this.entityState.maxHealth;
  }

  getShield(): number {
    return this.entityState.shield;
  }

  getMaxShield(): number {
    return this.entityState.maxShield;
  }

  getSpeed(): number {
    return this.entityState.speed;
  }

  getLevel(): number {
    return this.entityState.level;
  }

  getExperience(): number {
    return this.entityState.experience;
  }

  getEffects(): Map<string, Effect> {
    return new Map(this.entityState.effects);
  }

  onEntityEvent(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  offEntityEvent(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.off(event, listener);
    return this;
  }

  destroy(fromScene?: boolean): void {
    this.eventEmitter.removeAllListeners();
    this.scene.events.off('update', this.update, this);
    super.destroy(fromScene);
  }
} 