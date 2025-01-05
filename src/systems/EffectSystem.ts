import { Entity } from '../game/entities/Entity';

export enum EffectType {
  DAMAGE,
  HEAL,
  SHIELD,
  BURN,
  FREEZE,
  POISON,
}

export interface EffectConfig {
  type: EffectType;
  value: number;
  duration: number;
  interval?: number;
  source?: Entity;
}

export class Effect {
  private type: EffectType;
  private value: number;
  private duration: number;
  private interval: number;
  private source?: Entity;
  private target?: Entity;
  private lastTick: number = 0;

  constructor(config: EffectConfig) {
    this.type = config.type;
    this.value = config.value;
    this.duration = config.duration;
    this.interval = config.interval || 1000;
    this.source = config.source;
  }

  setTarget(target: Entity) {
    this.target = target;
  }

  update(time: number) {
    if (this.duration <= 0) return false;

    if (time - this.lastTick >= this.interval) {
      this.apply();
      this.lastTick = time;
      this.duration -= this.interval;
    }

    return this.duration > 0;
  }

  private apply() {
    if (!this.target) return;

    switch (this.type) {
      case EffectType.DAMAGE:
        this.target.takeDamage(this.value);
        break;
      case EffectType.HEAL:
        this.target.heal(this.value);
        break;
      case EffectType.SHIELD:
        this.target.addShield(this.value);
        break;
      case EffectType.BURN:
        this.target.takeDamage(this.value * 0.1);
        break;
      case EffectType.FREEZE:
        this.target.setSpeed(this.target.getSpeed() * 0.5);
        break;
      case EffectType.POISON:
        this.target.takeDamage(this.value * 0.05);
        break;
    }
  }

  getType(): EffectType {
    return this.type;
  }

  getValue(): number {
    return this.value;
  }

  getDuration(): number {
    return this.duration;
  }

  getSource(): Entity | undefined {
    return this.source;
  }
} 