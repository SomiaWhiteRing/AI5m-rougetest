import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSystem } from '../../game/systems/CombatSystem';
import { Entity } from '../../game/entities/Entity';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { EffectType } from '../../game/effects/EffectType';

describe('CombatSystem', () => {
  let combatSystem: CombatSystem;
  let testData: TestDataGenerator;
  let attacker: Entity;
  let defender: Entity;

  beforeEach(() => {
    testData = new TestDataGenerator();
    attacker = testData.createMockEntity();
    defender = testData.createMockEntity();
    combatSystem = new CombatSystem();
  });

  describe('基础战斗测试', () => {
    it('应该正确计算基础伤害', () => {
      const initialHealth = defender.getState().health;
      combatSystem.processDamage(attacker, defender, 30);
      expect(defender.getState().health).toBeLessThan(initialHealth);
    });

    it('应该正确处理护盾伤害', () => {
      defender.addShield(20);
      const initialHealth = defender.getState().health;
      combatSystem.processDamage(attacker, defender, 30);
      expect(defender.getState().health).toBe(initialHealth - 10);
    });

    it('应该正确处理暴击伤害', () => {
      const initialHealth = defender.getState().health;
      combatSystem.processDamage(attacker, defender, 30, true, 2);
      expect(defender.getState().health).toBe(initialHealth - 60);
    });
  });

  describe('效果系统测试', () => {
    it('应该正确应用伤害效果', () => {
      const effect = testData.createRandomEffect();
      effect.type = EffectType.DAMAGE;
      effect.value = 10;
      
      attacker.addEffect(effect);
      const initialHealth = defender.getState().health;
      combatSystem.processEffects(attacker, defender);
      expect(defender.getState().health).toBeLessThan(initialHealth);
    });

    it('应该正确应用治疗效果', () => {
      defender.takeDamage(50);
      const effect = testData.createRandomEffect();
      effect.type = EffectType.HEAL;
      effect.value = 20;

      attacker.addEffect(effect);
      const initialHealth = defender.getState().health;
      combatSystem.processEffects(attacker, defender);
      expect(defender.getState().health).toBeGreaterThan(initialHealth);
    });

    it('应该正确应用护盾效果', () => {
      const effect = testData.createRandomEffect();
      effect.type = EffectType.SHIELD;
      effect.value = 30;

      attacker.addEffect(effect);
      const initialShield = defender.getState().shield;
      combatSystem.processEffects(attacker, defender);
      expect(defender.getState().shield).toBeGreaterThan(initialShield);
    });
  });

  describe('连击系统测试', () => {
    it('应该正确处理连击伤害', () => {
      const initialHealth = defender.getState().health;
      combatSystem.processCombo(attacker, defender, [20, 30, 40]);
      expect(defender.getState().health).toBe(initialHealth - 90);
    });

    it('应该在连击中正确处理护盾', () => {
      defender.addShield(50);
      const initialHealth = defender.getState().health;
      combatSystem.processCombo(attacker, defender, [20, 30, 40]);
      expect(defender.getState().shield).toBe(0);
      expect(defender.getState().health).toBe(initialHealth - 40);
    });
  });

  describe('状态效果测试', () => {
    it('应该正确应用持续伤害', () => {
      const effect = testData.createRandomEffect();
      effect.type = EffectType.POISON;
      effect.value = 5;
      
      defender.addEffect(effect);
      const initialHealth = defender.getState().health;
      combatSystem.processDotEffects(defender);
      expect(defender.getState().health).toBeLessThan(initialHealth);
    });

    it('应该正确应用持续治疗', () => {
      defender.takeDamage(50);
      const effect = testData.createRandomEffect();
      effect.type = EffectType.HEAL;
      effect.value = 5;

      defender.addEffect(effect);
      const initialHealth = defender.getState().health;
      combatSystem.processHotEffects(defender);
      expect(defender.getState().health).toBeGreaterThan(initialHealth);
    });
  });
}); 