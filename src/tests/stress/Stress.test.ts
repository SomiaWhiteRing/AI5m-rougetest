import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { Entity } from '../../game/entities/Entity';
import { Item } from '../../game/entities/Item';
import { CombatSystem } from '../../game/systems/CombatSystem';
import { SaveSystem } from '../../game/systems/SaveSystem';
import { PerformanceMonitor } from '../../game/utils/PerformanceMonitor';
import { EffectType } from '../../game/effects/EffectType';
import { ItemType } from '../../game/types/ItemType';

describe('Stress Tests', () => {
  let testData: TestDataGenerator;
  let performanceMonitor: PerformanceMonitor;
  let combatSystem: CombatSystem;
  let saveSystem: SaveSystem;

  beforeEach(() => {
    testData = new TestDataGenerator();
    performanceMonitor = new PerformanceMonitor();
    combatSystem = new CombatSystem();
    saveSystem = new SaveSystem();
  });

  describe('大规模实体测试', () => {
    it('应该能处理大量实体的创建和销毁', () => {
      performanceMonitor.startTracking('entityCreation');

      const entityCount = 10000;
      const entities = Array.from(
        { length: entityCount },
        () => testData.createMockEntity()
      );

      performanceMonitor.endTracking('entityCreation');
      const stats = performanceMonitor.getStats('entityCreation');

      expect(entities.length).toBe(entityCount);
      expect(stats.averageTime).toBeLessThan(1000); // 创建时间应小于1秒
    });

    it('应该能处理大量实体的更新', () => {
      const entityCount = 1000;
      const entities = Array.from(
        { length: entityCount },
        () => testData.createMockEntity()
      );

      performanceMonitor.startTracking('entityUpdate');

      // 模拟100帧的更新
      for (let frame = 0; frame < 100; frame++) {
        entities.forEach(entity => {
          entity.updateEffects(Date.now());
          entity.takeDamage(1);
          entity.heal(1);
          entity.gainExperience(10);
        });
      }

      performanceMonitor.endTracking('entityUpdate');
      const stats = performanceMonitor.getStats('entityUpdate');

      expect(stats.averageTime / 100).toBeLessThan(16); // 每帧更新时间应小于16ms
    });

    it('应该能处理大量实体之间的战斗', () => {
      const entityCount = 1000;
      const entities = Array.from(
        { length: entityCount },
        () => testData.createMockEntity()
      );

      performanceMonitor.startTracking('combatUpdate');

      // 模拟大规模战斗
      for (let i = 0; i < entities.length - 1; i += 2) {
        combatSystem.processDamage(entities[i], entities[i + 1], 10);
        combatSystem.processEffects(entities[i], entities[i + 1]);
      }

      performanceMonitor.endTracking('combatUpdate');
      const stats = performanceMonitor.getStats('combatUpdate');

      expect(stats.totalTime).toBeLessThan(1000); // 战斗处理时间应小于1秒
    });
  });

  describe('复杂场景测试', () => {
    it('应该能处理复杂的效果组合', () => {
      const entity = testData.createMockEntity();
      const effects = Object.values(EffectType).map(type => ({
        type,
        value: 10,
        duration: 5000,
        startTime: Date.now(),
      }));

      performanceMonitor.startTracking('effectsProcessing');

      // 添加所有效果
      effects.forEach(effect => entity.addEffect(effect));

      // 模拟100帧的效果更新
      for (let frame = 0; frame < 100; frame++) {
        entity.updateEffects(Date.now() + frame * 16);
      }

      performanceMonitor.endTracking('effectsProcessing');
      const stats = performanceMonitor.getStats('effectsProcessing');

      expect(stats.averageTime / 100).toBeLessThan(1); // 每帧效果处理时间应小于1ms
    });

    it('应该能处理大量物品的操作', () => {
      const itemCount = 1000;
      const items = Array.from({ length: itemCount }, (_, i) =>
        testData.createMockItem(i % 2 === 0 ? ItemType.WEAPON : ItemType.ARMOR)
      );
      const entity = testData.createMockEntity();

      performanceMonitor.startTracking('itemProcessing');

      // 模拟物品操作
      items.forEach(item => {
        item.use(entity);
        item.equip(entity);
        item.unequip(entity);
        item.useDurability(10);
        item.repair(5);
      });

      performanceMonitor.endTracking('itemProcessing');
      const stats = performanceMonitor.getStats('itemProcessing');

      expect(stats.totalTime).toBeLessThan(1000); // 物品处理时间应小于1秒
    });
  });

  describe('长时间运行测试', () => {
    it('应该能稳定运行长时间的游戏循环', async () => {
      const entity = testData.createMockEntity();
      const startMemory = process.memoryUsage().heapUsed;
      let frameCount = 0;

      performanceMonitor.startTracking('gameLoop');

      // 模拟10秒的游戏循环
      const startTime = Date.now();
      while (Date.now() - startTime < 10000) {
        entity.updateEffects(Date.now());
        entity.takeDamage(1);
        entity.heal(1);
        entity.gainExperience(10);
        frameCount++;

        // 模拟帧时间
        await new Promise(resolve => setTimeout(resolve, 16));
      }

      performanceMonitor.endTracking('gameLoop');
      const endMemory = process.memoryUsage().heapUsed;
      const stats = performanceMonitor.getStats('gameLoop');

      expect(frameCount).toBeGreaterThan(500); // 应该至少运行500帧
      expect(endMemory - startMemory).toBeLessThan(10 * 1024 * 1024); // 内存增长应小于10MB
      expect(stats.averageTime / frameCount).toBeLessThan(16); // 平均帧时间应小于16ms
    });

    it('应该能处理长时间的存档操作', () => {
      const saveCount = 1000;
      const entity = testData.createMockEntity();
      const items = Array.from({ length: 10 }, () => testData.createMockItem());

      performanceMonitor.startTracking('savingLoop');

      // 模拟大量存档操作
      for (let i = 0; i < saveCount; i++) {
        const save = saveSystem.createSave(`test_${i}`, entity, items);
        saveSystem.saveToDisk(save);
        const loaded = saveSystem.loadFromDisk(`test_${i}`);
        expect(loaded).toBeDefined();
        saveSystem.deleteSave(`test_${i}`);
      }

      performanceMonitor.endTracking('savingLoop');
      const stats = performanceMonitor.getStats('savingLoop');

      expect(stats.totalTime).toBeLessThan(10000); // 存档操作总时间应小于10秒
    });
  });

  describe('并发操作测试', () => {
    it('应该能处理并发的战斗操作', async () => {
      const entityCount = 100;
      const entities = Array.from(
        { length: entityCount },
        () => testData.createMockEntity()
      );

      performanceMonitor.startTracking('concurrentCombat');

      // 模拟并发战斗
      const promises = [];
      for (let i = 0; i < entities.length - 1; i += 2) {
        promises.push(
          new Promise<void>(resolve => {
            combatSystem.processDamage(entities[i], entities[i + 1], 10);
            combatSystem.processEffects(entities[i], entities[i + 1]);
            resolve();
          })
        );
      }

      await Promise.all(promises);

      performanceMonitor.endTracking('concurrentCombat');
      const stats = performanceMonitor.getStats('concurrentCombat');

      expect(stats.totalTime).toBeLessThan(1000); // 并发战斗处理时间应小于1秒
    });

    it('应该能处理并发的存档操作', async () => {
      const saveCount = 100;
      const entity = testData.createMockEntity();
      const items = Array.from({ length: 10 }, () => testData.createMockItem());

      performanceMonitor.startTracking('concurrentSaving');

      // 模拟并发存档
      const promises = Array.from({ length: saveCount }, (_, i) =>
        new Promise<void>(resolve => {
          const save = saveSystem.createSave(`test_${i}`, entity, items);
          saveSystem.saveToDisk(save);
          const loaded = saveSystem.loadFromDisk(`test_${i}`);
          expect(loaded).toBeDefined();
          saveSystem.deleteSave(`test_${i}`);
          resolve();
        })
      );

      await Promise.all(promises);

      performanceMonitor.endTracking('concurrentSaving');
      const stats = performanceMonitor.getStats('concurrentSaving');

      expect(stats.totalTime).toBeLessThan(5000); // 并发存档操作时间应小于5秒
    });
  });
});