import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from '../../game/entities/Entity';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { EffectType } from '../../game/effects/EffectType';

describe('Entity', () => {
  let entity: Entity;
  let testData: TestDataGenerator;

  beforeEach(() => {
    testData = new TestDataGenerator();
    entity = testData.createMockEntity();
  });

  describe('基础属性测试', () => {
    it('应该正确初始化基础属性', () => {
      const state = entity.getState();
      expect(state.health).toBe(100);
      expect(state.maxHealth).toBe(100);
      expect(state.level).toBe(1);
    });

    it('应该正确更新属性', () => {
      entity.updateState({ health: 80 });
      expect(entity.getState().health).toBe(80);
    });

    it('不应该超过最大生命值', () => {
      entity.updateState({ health: 150 });
      expect(entity.getState().health).toBe(100);
    });
  });

  describe('战斗相关测试', () => {
    it('应该正确计算伤害', () => {
      const damage = 30;
      const initialHealth = entity.getState().health;
      entity.takeDamage(damage);
      expect(entity.getState().health).toBe(initialHealth - damage);
    });

    it('应该正确处理暴击伤害', () => {
      const damage = 30;
      const criticalMultiplier = 2;
      const initialHealth = entity.getState().health;
      entity.takeDamage(damage, true, criticalMultiplier);
      expect(entity.getState().health).toBe(initialHealth - damage * criticalMultiplier);
    });

    it('不应该有负数生命值', () => {
      entity.takeDamage(200);
      expect(entity.getState().health).toBe(0);
    });

    it('应该正确处理治疗', () => {
      entity.takeDamage(50);
      const beforeHeal = entity.getState().health;
      entity.heal(20);
      expect(entity.getState().health).toBe(beforeHeal + 20);
    });
  });

  describe('状态效果测试', () => {
    it('应该正确添加状态效果', () => {
      const effect = testData.createRandomEffect();
      entity.addEffect(effect);
      expect(entity.hasEffect(effect.type)).toBe(true);
    });

    it('应该正确移除状态效果', () => {
      const effect = testData.createRandomEffect();
      entity.addEffect(effect);
      entity.removeEffect(effect.type);
      expect(entity.hasEffect(effect.type)).toBe(false);
    });

    it('应该正确处理效果持续时间', () => {
      const effect = testData.createRandomEffect(1000); // 1秒持续时间
      entity.addEffect(effect);
      entity.updateEffects(2000); // 更新2秒
      expect(entity.hasEffect(effect.type)).toBe(false);
    });

    it('应该正确叠加相同类型的效果', () => {
      const effect1 = testData.createRandomEffect();
      const effect2 = testData.createRandomEffect();
      effect2.type = effect1.type;
      entity.addEffect(effect1);
      entity.addEffect(effect2);
      expect(entity.getEffects().length).toBe(1);
    });
  });

  describe('等级系统测试', () => {
    it('应该正确增加经验值', () => {
      const initialExp = entity.getState().experience || 0;
      entity.gainExperience(100);
      expect(entity.getState().experience).toBe(initialExp + 100);
    });

    it('应该正确处理升级', () => {
      const initialLevel = entity.getState().level;
      entity.gainExperience(1000);
      expect(entity.getState().level).toBeGreaterThan(initialLevel);
    });

    it('升级后应该重置经验值', () => {
      entity.gainExperience(1000);
      expect(entity.getState().experience).toBeLessThan(1000);
    });
  });

  describe('护盾系统测试', () => {
    it('应该正确添加护盾', () => {
      const shieldAmount = 50;
      entity.addShield(shieldAmount);
      expect(entity.getState().shield).toBe(shieldAmount);
    });

    it('护盾应该优先承受伤害', () => {
      const shieldAmount = 50;
      entity.addShield(shieldAmount);
      const damage = 30;
      entity.takeDamage(damage);
      expect(entity.getState().shield).toBe(shieldAmount - damage);
      expect(entity.getState().health).toBe(100);
    });

    it('护盾耗尽后伤害应该转移到生命值', () => {
      const shieldAmount = 30;
      entity.addShield(shieldAmount);
      const damage = 50;
      entity.takeDamage(damage);
      expect(entity.getState().shield).toBe(0);
      expect(entity.getState().health).toBe(80);
    });
  });
}); 