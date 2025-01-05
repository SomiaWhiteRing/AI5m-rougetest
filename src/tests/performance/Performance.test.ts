import { describe, it, expect, beforeEach } from 'vitest';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { Entity } from '../../game/entities/Entity';
import { Item } from '../../game/entities/Item';
import { ItemType } from '../../game/types/ItemType';
import { CombatSystem } from '../../game/systems/CombatSystem';
import { SaveSystem } from '../../game/systems/SaveSystem';
import { PerformanceMonitor } from '../../game/utils/PerformanceMonitor';

describe('Performance Tests', () => {
  let testData: TestDataGenerator;
  let performanceMonitor: PerformanceMonitor;
  let entities: Entity[];
  let items: Item[];
  let combatSystem: CombatSystem;
  let saveSystem: SaveSystem;

  beforeEach(() => {
    testData = new TestDataGenerator();
    performanceMonitor = new PerformanceMonitor();
    entities = Array.from({ length: 100 }, () => testData.createMockEntity());
    items = Array.from({ length: 100 }, () => testData.createMockItem());
    combatSystem = new CombatSystem();
    saveSystem = new SaveSystem();
  });

  describe('帧率测试', () => {
    it('应该在大量实体时保持稳定帧率', () => {
      performanceMonitor.startTracking('entityUpdate');

      // 模拟60帧的更新
      for (let frame = 0; frame < 60; frame++) {
        entities.forEach(entity => {
          entity.updateEffects(Date.now());
          entity.takeDamage(1);
          entity.heal(1);
        });
      }

      const stats = performanceMonitor.getStats('entityUpdate');
      expect(stats.averageTime).toBeLessThan(16); // 60fps = 16.67ms per frame
      expect(stats.maxTime).toBeLessThan(32); // 允许偶尔的帧率下降
    });

    it('应该在复杂战斗场景中保持稳定帧率', () => {
      performanceMonitor.startTracking('combatUpdate');

      // 模拟多个实体之间的战斗
      for (let frame = 0; frame < 60; frame++) {
        for (let i = 0; i < entities.length - 1; i += 2) {
          combatSystem.processDamage(entities[i], entities[i + 1], 10);
          combatSystem.processEffects(entities[i], entities[i + 1]);
        }
      }

      const stats = performanceMonitor.getStats('combatUpdate');
      expect(stats.averageTime).toBeLessThan(16);
      expect(stats.maxTime).toBeLessThan(32);
    });
  });

  describe('内存使用测试', () => {
    it('应该在创建大量实体时保持合理的内存使用', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const largeEntityCount = 1000;

      const largeEntities = Array.from(
        { length: largeEntityCount },
        () => testData.createMockEntity()
      );

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryPerEntity = (finalMemory - initialMemory) / largeEntityCount;

      expect(memoryPerEntity).toBeLessThan(1024); // 每个实体应小于1KB
      expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024); // 总内存增加应小于1MB
    });

    it('应该正确清理不再使用的资源', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // 创建和销毁大量实体
      for (let i = 0; i < 100; i++) {
        const tempEntities = Array.from(
          { length: 100 },
          () => testData.createMockEntity()
        );
        tempEntities.forEach(entity => entity.destroy());
      }

      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      expect(finalMemory).toBeLessThan(initialMemory * 1.1); // 允许10%的内存增长
    });
  });

  describe('加载时间测试', () => {
    it('应该快速加载大量数据', async () => {
      performanceMonitor.startTracking('dataLoading');

      // 创建大量存档数据
      const saves = Array.from({ length: 100 }, (_, i) => {
        return saveSystem.createSave(`test_${i}`, entities[0], items);
      });

      // 保存所有数据
      saves.forEach(save => saveSystem.saveToDisk(save));

      // 加载所有数据
      const loadStart = Date.now();
      saves.forEach(save => saveSystem.loadFromDisk(save.name));
      const loadTime = Date.now() - loadStart;

      expect(loadTime).toBeLessThan(1000); // 加载时间应小于1秒
    });

    it('应该高效处理资源加载', () => {
      performanceMonitor.startTracking('resourceLoading');

      // 模拟资源加载
      const resources = Array.from({ length: 100 }, (_, i) => {
        const item = testData.createMockItem(
          i % 2 === 0 ? ItemType.WEAPON : ItemType.ARMOR
        );
        return item;
      });

      const stats = performanceMonitor.getStats('resourceLoading');
      expect(stats.totalTime).toBeLessThan(100); // 资源加载时间应小于100ms
    });
  });

  describe('渲染性能测试', () => {
    it('应该高效处理大量实体的渲染', () => {
      performanceMonitor.startTracking('entityRendering');

      // 模拟渲染循环
      for (let frame = 0; frame < 60; frame++) {
        entities.forEach(entity => {
          // 模拟渲染操作
          entity.setPosition(
            Math.random() * 1000,
            Math.random() * 1000
          );
          entity.setRotation(Math.random() * Math.PI * 2);
        });
      }

      const stats = performanceMonitor.getStats('entityRendering');
      expect(stats.averageTime).toBeLessThan(8); // 渲染时间应小于8ms
    });

    it('应该高效处理粒子效果', () => {
      performanceMonitor.startTracking('particleRendering');

      // 模拟粒子效果
      for (let frame = 0; frame < 60; frame++) {
        entities.forEach(entity => {
          // 模拟粒子更新
          for (let i = 0; i < 100; i++) {
            const x = Math.cos(i) * 10;
            const y = Math.sin(i) * 10;
            // 在实体周围创建粒子效果
            entity.setPosition(entity.x + x, entity.y + y);
          }
        });
      }

      const stats = performanceMonitor.getStats('particleRendering');
      expect(stats.averageTime).toBeLessThan(16);
      expect(stats.maxTime).toBeLessThan(32);
    });
  });
});