import { Effect, EffectType } from '../types/effect';
import { Entity } from '../entities/Entity';

interface ActiveEffect extends Effect {
  startTime: number;
  lastTickTime?: number;
}

export class EffectSystem {
  private activeEffects: Map<Entity, ActiveEffect[]>;

  constructor() {
    this.activeEffects = new Map();
  }

  addEffect(effect: Effect): void {
    const target = effect.target as Entity;
    if (!target) return;

    const activeEffect: ActiveEffect = {
      ...effect,
      startTime: Date.now()
    };

    if (!this.activeEffects.has(target)) {
      this.activeEffects.set(target, []);
    }

    const targetEffects = this.activeEffects.get(target)!;

    // 处理效果堆叠
    if (effect.stackable) {
      const existingEffect = targetEffects.find(e => e.type === effect.type);
      if (existingEffect) {
        if (existingEffect.currentStacks && existingEffect.maxStacks) {
          existingEffect.currentStacks = Math.min(
            existingEffect.currentStacks + 1,
            existingEffect.maxStacks
          );
          existingEffect.value = effect.value * existingEffect.currentStacks;
        }
      } else {
        targetEffects.push(activeEffect);
      }
    } else {
      // 如果效果不可堆叠，移除同类型的旧效果
      const index = targetEffects.findIndex(e => e.type === effect.type);
      if (index !== -1) {
        targetEffects[index] = activeEffect;
      } else {
        targetEffects.push(activeEffect);
      }
    }

    // 调用效果应用回调
    if (effect.onApply) {
      effect.onApply();
    }
  }

  removeEffect(target: Entity, effectType: EffectType): void {
    const effects = this.activeEffects.get(target);
    if (!effects) return;

    const index = effects.findIndex(effect => effect.type === effectType);
    if (index !== -1) {
      const effect = effects[index];
      if (effect.onRemove) {
        effect.onRemove();
      }
      effects.splice(index, 1);
    }

    if (effects.length === 0) {
      this.activeEffects.delete(target);
    }
  }

  update(deltaTime: number): void {
    const currentTime = Date.now();

    for (const [target, effects] of this.activeEffects.entries()) {
      const remainingEffects: ActiveEffect[] = [];

      for (const effect of effects) {
        // 检查效果是否过期
        if (currentTime - effect.startTime >= effect.duration) {
          if (effect.onRemove) {
            effect.onRemove();
          }
          continue;
        }

        // 处理间隔触发效果
        if (effect.interval && effect.onTick) {
          const lastTickTime = effect.lastTickTime || effect.startTime;
          if (currentTime - lastTickTime >= effect.interval) {
            effect.onTick();
            effect.lastTickTime = currentTime;
          }
        }

        remainingEffects.push(effect);
      }

      if (remainingEffects.length === 0) {
        this.activeEffects.delete(target);
      } else {
        this.activeEffects.set(target, remainingEffects);
      }
    }
  }

  getActiveEffects(target: Entity): ActiveEffect[] {
    return this.activeEffects.get(target) || [];
  }

  hasEffect(target: Entity, effectType: EffectType): boolean {
    const effects = this.activeEffects.get(target);
    return effects ? effects.some(effect => effect.type === effectType) : false;
  }

  clearEffects(target: Entity): void {
    const effects = this.activeEffects.get(target);
    if (effects) {
      effects.forEach(effect => {
        if (effect.onRemove) {
          effect.onRemove();
        }
      });
      this.activeEffects.delete(target);
    }
  }
} 