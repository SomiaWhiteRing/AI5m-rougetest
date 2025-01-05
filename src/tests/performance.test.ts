import { describe, it, expect, beforeEach } from 'vitest';
import { Scene } from 'phaser';
import { Player } from '../game/entities/Player';
import { Enemy } from '../game/entities/Enemy';
import { generateDungeon } from '../game/utils/dungeonGenerator';
import { ENEMY_CONFIGS } from '../game/types/enemy';
import { EffectSystem } from '../game/systems/EffectSystem';
import { CombatManager } from '../game/managers/CombatManager';
import { BalanceManager } from '../game/managers/BalanceManager';
import { EffectType } from '../game/types/effect';

class MockScene extends Scene {
  constructor() {
    super({ key: 'MockScene' });
  }
  create(data?: any) {
    // 实现create方法
    super.create(data);
  }
}

describe('Performance Tests', () => {
  let scene: Scene;
  let player: Player;
  let effectSystem: EffectSystem;
  let combatManager: CombatManager;
  let balanceManager: BalanceManager;

  beforeEach(() => {
    scene = new MockScene();
    player = new Player(scene, 0, 0);
    effectSystem = new EffectSystem();
    combatManager = new CombatManager();
    balanceManager = BalanceManager.getInstance();
  });

  describe('Dungeon Generation Performance', () => {
    it('should generate large dungeons efficiently', () => {
      const sizes = [50, 100, 200];
      const timeLimit = 1000; // 1秒

      sizes.forEach(size => {
        const startTime = performance.now();
        const dungeon = generateDungeon(size, size);
        const endTime = performance.now();
        const generationTime = endTime - startTime;

        expect(generationTime).toBeLessThan(timeLimit);
        expect(dungeon.length).toBe(size);
        expect(dungeon[0].length).toBe(size);
      });
    });

    it('should handle multiple rapid generations', () => {
      const iterations = 100;
      const size = 50;
      const timeLimit = 5000; // 5秒

      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        generateDungeon(size, size);
      }
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(timeLimit);
    });
  });

  describe('Combat System Performance', () => {
    it('should handle large scale combat efficiently', () => {
      const numEnemies = 1000;
      const enemies: Enemy[] = [];
      const timeLimit = 1000; // 1秒

      // 创建敌人
      const startTime = performance.now();
      for (let i = 0; i < numEnemies; i++) {
        enemies.push(new Enemy(scene, 0, 0, ENEMY_CONFIGS.slime));
      }

      // 模拟战斗
      enemies.forEach(enemy => {
        combatManager.processAttack(player, enemy);
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(timeLimit);
    });

    it('should handle rapid combat calculations', () => {
      const iterations = 10000;
      const timeLimit = 1000; // 1秒
      const enemy = new Enemy(scene, 0, 0, ENEMY_CONFIGS.slime);

      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        combatManager.processAttack(player, enemy);
      }
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(timeLimit);
    });
  });

  describe('Effect System Performance', () => {
    it('should handle multiple concurrent effects', () => {
      const numEffects = 1000;
      const duration = 1000;
      const timeLimit = 500; // 0.5秒

      const startTime = performance.now();
      for (let i = 0; i < numEffects; i++) {
        effectSystem.addEffect({
          type: EffectType.DAMAGE,
          value: 10,
          duration: duration,
          interval: 100,
          target: player
        });
      }

      // 模拟效果更新
      for (let time = 0; time < duration; time += 100) {
        effectSystem.update(time);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(timeLimit);
    });
  });

  describe('Balance System Performance', () => {
    it('should handle rapid balance calculations', () => {
      const iterations = 10000;
      const timeLimit = 500; // 0.5秒

      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        balanceManager.calculatePlayerHP(100);
        balanceManager.calculatePlayerAttack(50);
        balanceManager.calculateEnemyHP(200);
        balanceManager.calculateEnemyAttack(30);
        balanceManager.calculateDropRate(0.1, 'commonMultiplier');
      }
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(timeLimit);
    });
  });

  describe('Memory Usage', () => {
    it('should handle large object creation and destruction', () => {
      const iterations = 10000;
      const objects: any[] = [];

      // 记录初始内存使用
      const initialMemory = process.memoryUsage().heapUsed;

      // 创建大量对象
      for (let i = 0; i < iterations; i++) {
        objects.push(new Enemy(scene, 0, 0, ENEMY_CONFIGS.slime));
      }

      // 记录峰值内存使用
      const peakMemory = process.memoryUsage().heapUsed;

      // 清理对象
      objects.forEach(obj => obj.destroy());
      objects.length = 0;

      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }

      // 记录最终内存使用
      const finalMemory = process.memoryUsage().heapUsed;

      // 检查内存泄漏
      const memoryLeak = finalMemory - initialMemory;
      expect(memoryLeak).toBeLessThan(1024 * 1024); // 允许1MB的内存增长

      // 检查峰值内存使用
      const peakUsage = peakMemory - initialMemory;
      expect(peakUsage).toBeLessThan(100 * 1024 * 1024); // 允许100MB的峰值内存使用
    });
  });

  describe('Resource Loading', () => {
    it('should load resources efficiently', async () => {
      const timeLimit = 2000; // 2秒
      const startTime = performance.now();

      // 模拟资源加载
      await Promise.all([
        scene.load.image('player', 'assets/player.png'),
        scene.load.image('enemy', 'assets/enemy.png'),
        scene.load.image('item', 'assets/item.png'),
        scene.load.audio('bgm', 'assets/bgm.mp3'),
        scene.load.audio('effect', 'assets/effect.wav')
      ]);

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(timeLimit);
    });
  });
}); 