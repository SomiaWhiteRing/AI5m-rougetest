import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BalanceManager } from '../game/managers/BalanceManager';
import { Difficulty } from '../config/balanceConfig';

describe('BalanceManager', () => {
  let balanceManager: BalanceManager;

  beforeEach(() => {
    balanceManager = BalanceManager.getInstance();
  });

  afterEach(() => {
    balanceManager.destroy();
  });

  describe('Difficulty Management', () => {
    it('should start with NORMAL difficulty', () => {
      expect(balanceManager.getCurrentDifficulty()).toBe(Difficulty.NORMAL);
    });

    it('should change difficulty correctly', () => {
      balanceManager.setDifficulty(Difficulty.HARD);
      expect(balanceManager.getCurrentDifficulty()).toBe(Difficulty.HARD);
    });

    it('should emit difficultyChanged event', () => {
      return new Promise<void>((resolve) => {
        balanceManager.once('difficultyChanged', (difficulty) => {
          expect(difficulty).toBe(Difficulty.EXPERT);
          resolve();
        });
        balanceManager.setDifficulty(Difficulty.EXPERT);
      });
    });
  });

  describe('Player Stats Calculation', () => {
    it('should calculate player HP correctly', () => {
      balanceManager.setDifficulty(Difficulty.EASY);
      expect(balanceManager.calculatePlayerHP(100)).toBeGreaterThan(100);
    });

    it('should calculate player MP correctly', () => {
      balanceManager.setDifficulty(Difficulty.NORMAL);
      expect(balanceManager.calculatePlayerMP(100)).toBe(100);
    });

    it('should calculate player attack correctly', () => {
      balanceManager.setDifficulty(Difficulty.HARD);
      expect(balanceManager.calculatePlayerAttack(100)).toBeLessThan(100);
    });

    it('should calculate player defense correctly', () => {
      balanceManager.setDifficulty(Difficulty.EXPERT);
      expect(balanceManager.calculatePlayerDefense(100)).toBeLessThan(100);
    });
  });

  describe('Enemy Stats Calculation', () => {
    it('should calculate enemy HP correctly', () => {
      balanceManager.setDifficulty(Difficulty.HARD);
      expect(balanceManager.calculateEnemyHP(100)).toBeGreaterThan(100);
    });

    it('should calculate enemy attack correctly', () => {
      balanceManager.setDifficulty(Difficulty.EXPERT);
      expect(balanceManager.calculateEnemyAttack(100)).toBeGreaterThan(100);
    });

    it('should calculate enemy spawn rate correctly', () => {
      balanceManager.setDifficulty(Difficulty.NORMAL);
      expect(balanceManager.calculateEnemySpawnRate(1)).toBe(1);
    });
  });

  describe('Combat Calculations', () => {
    it('should calculate damage correctly', () => {
      balanceManager.setDifficulty(Difficulty.NORMAL);
      const damage = balanceManager.calculateDamage(100, 50, 100, true);
      expect(damage).toBeGreaterThan(0);
    });

    it('should calculate critical hits correctly', () => {
      const { isCritical, damage } = balanceManager.calculateCriticalHit(0.5, 1.5);
      expect(typeof isCritical).toBe('boolean');
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('should calculate dodge correctly', () => {
      const isDodged = balanceManager.calculateDodge(0.3);
      expect(typeof isDodged).toBe('boolean');
    });
  });

  describe('Skill Calculations', () => {
    it('should calculate skill cooldown correctly', () => {
      balanceManager.setDifficulty(Difficulty.EXPERT);
      expect(balanceManager.calculateSkillCooldown(10)).toBeGreaterThan(10);
    });

    it('should calculate skill cost correctly', () => {
      balanceManager.setDifficulty(Difficulty.EASY);
      expect(balanceManager.calculateSkillCost(10)).toBeLessThan(10);
    });
  });

  describe('Defense Calculations', () => {
    it('should calculate shield strength correctly', () => {
      balanceManager.setDifficulty(Difficulty.HARD);
      expect(balanceManager.calculateShieldStrength(100)).toBeLessThan(100);
    });

    it('should calculate heal amount correctly', () => {
      balanceManager.setDifficulty(Difficulty.EASY);
      expect(balanceManager.calculateHealAmount(100)).toBeGreaterThan(100);
    });
  });

  describe('Drop Rate Calculations', () => {
    it('should calculate drop rates correctly', () => {
      balanceManager.setDifficulty(Difficulty.EXPERT);
      expect(balanceManager.calculateDropRate(0.1, 'legendaryMultiplier')).toBeGreaterThan(0.1);
    });
  });

  describe('Singleton Pattern', () => {
    it('should maintain a single instance', () => {
      const instance1 = BalanceManager.getInstance();
      const instance2 = BalanceManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance after destroy', () => {
      const instance1 = BalanceManager.getInstance();
      instance1.destroy();
      const instance2 = BalanceManager.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });
}); 