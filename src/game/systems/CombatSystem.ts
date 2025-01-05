import { Entity } from '../entities/Entity';
import { Effect } from '../effects/Effect';
import { EffectType } from '../effects/EffectType';

export class CombatSystem {
  processDamage(attacker: Entity, defender: Entity, amount: number, isCritical: boolean = false, criticalMultiplier: number = 1): void {
    const damage = isCritical ? amount * criticalMultiplier : amount;
    defender.takeDamage(damage, isCritical, criticalMultiplier);
  }

  processEffects(source: Entity, target: Entity): void {
    source.getEffects().forEach(effect => {
      switch (effect.type) {
        case EffectType.DAMAGE:
          target.takeDamage(effect.value);
          break;
        case EffectType.HEAL:
          target.heal(effect.value);
          break;
        case EffectType.SHIELD:
          target.addShield(effect.value);
          break;
        // 其他效果类型的处理...
      }
    });
  }

  processCombo(attacker: Entity, defender: Entity, damages: number[]): void {
    damages.forEach(damage => {
      this.processDamage(attacker, defender, damage);
    });
  }

  processDotEffects(target: Entity): void {
    target.getEffects().forEach(effect => {
      if (effect.type === EffectType.POISON || effect.type === EffectType.BURN) {
        target.takeDamage(effect.value);
      }
    });
  }

  processHotEffects(target: Entity): void {
    target.getEffects().forEach(effect => {
      if (effect.type === EffectType.HEAL) {
        target.heal(effect.value);
      }
    });
  }

  // 处理buff效果
  processBuffs(target: Entity): void {
    target.getEffects().forEach(effect => {
      switch (effect.type) {
        case EffectType.ATTACK_UP:
          // 增加攻击力
          break;
        case EffectType.DEFENSE_UP:
          // 增加防御力
          break;
        case EffectType.SPEED_UP:
          // 增加速度
          break;
      }
    });
  }

  // 处理debuff效果
  processDebuffs(target: Entity): void {
    target.getEffects().forEach(effect => {
      switch (effect.type) {
        case EffectType.ATTACK_DOWN:
          // 降低攻击力
          break;
        case EffectType.DEFENSE_DOWN:
          // 降低防御力
          break;
        case EffectType.SPEED_DOWN:
          // 降低速度
          break;
        case EffectType.STUN:
          // 眩晕效果
          break;
        case EffectType.FREEZE:
          // 冰冻效果
          break;
      }
    });
  }
} 