import { Entity } from '../entities/Entity';
import { EffectType } from '../types/effect';
import { EffectSystem } from '../systems/EffectSystem';
import { BalanceManager } from './BalanceManager';

export class CombatManager {
  private effectSystem: EffectSystem;
  private balanceManager: BalanceManager;

  constructor() {
    this.effectSystem = new EffectSystem();
    this.balanceManager = BalanceManager.getInstance();
  }

  processAttack(attacker: Entity, target: Entity): void {
    // 计算基础伤害
    const damage = this.calculateBaseDamage(attacker, target);

    // 计算暴击
    const { isCritical, finalDamage } = this.calculateCriticalDamage(damage, attacker);

    // 计算闪避
    if (this.calculateDodge(target)) {
      return;
    }

    // 应用伤害
    this.applyDamage(target, finalDamage);

    // 触发效果
    this.applyAttackEffects(attacker, target);
  }

  private calculateBaseDamage(attacker: Entity, target: Entity): number {
    const attackerState = attacker.getState();
    const targetState = target.getState();
    return this.balanceManager.calculateDamage(attackerState.attack, targetState.defense);
  }

  private calculateCriticalDamage(baseDamage: number, attacker: Entity): { isCritical: boolean; finalDamage: number } {
    const attackerState = attacker.getState();
    const { isCritical, damage } = this.balanceManager.calculateCriticalHit(
      attackerState.critChance,
      attackerState.critMultiplier
    );
    return {
      isCritical,
      finalDamage: baseDamage * damage
    };
  }

  private calculateDodge(target: Entity): boolean {
    const targetState = target.getState();
    return this.balanceManager.calculateDodge(targetState.dodgeChance);
  }

  private applyDamage(target: Entity, damage: number): void {
    target.takeDamage(damage);
  }

  private applyAttackEffects(attacker: Entity, target: Entity): void {
    const attackerState = attacker.getState();
    const targetState = target.getState();

    // 应用攻击者的效果
    attackerState.onHitEffects?.forEach(effect => {
      this.effectSystem.addEffect({
        ...effect,
        target: target
      });
    });

    // 应用防御者的效果
    targetState.onHitEffects?.forEach(effect => {
      this.effectSystem.addEffect({
        ...effect,
        target: attacker
      });
    });
  }

  update(deltaTime: number): void {
    this.effectSystem.update(deltaTime);
  }
} 