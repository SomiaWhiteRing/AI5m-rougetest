import { Difficulty, DifficultyMultipliers, DifficultyMultiplierType } from '../types/difficulty';

export class BalanceManager {
  private static instance: BalanceManager;
  private currentDifficulty: Difficulty;

  private constructor() {
    this.currentDifficulty = Difficulty.NORMAL;
  }

  static getInstance(): BalanceManager {
    if (!BalanceManager.instance) {
      BalanceManager.instance = new BalanceManager();
    }
    return BalanceManager.instance;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.currentDifficulty = difficulty;
  }

  getCurrentDifficulty(): Difficulty {
    return this.currentDifficulty;
  }

  calculateDamage(attack: number, defense: number): number {
    const difficultyMultiplier = this.getDifficultyMultiplier();
    const baseDamage = Math.max(1, attack - defense * 0.5);
    return Math.round(baseDamage * difficultyMultiplier);
  }

  calculateCriticalHit(critChance: number, critMultiplier: number): { isCritical: boolean; damage: number } {
    const isCritical = Math.random() < critChance;
    return {
      isCritical,
      damage: isCritical ? critMultiplier : 1
    };
  }

  calculateDodge(dodgeChance: number): boolean {
    return Math.random() < dodgeChance;
  }

  calculatePlayerHP(baseHP: number): number {
    const multiplier = this.getDifficultyMultiplier('playerHP');
    return Math.round(baseHP * multiplier);
  }

  calculatePlayerMP(baseMP: number): number {
    const multiplier = this.getDifficultyMultiplier('playerMP');
    return Math.round(baseMP * multiplier);
  }

  calculatePlayerAttack(baseAttack: number): number {
    const multiplier = this.getDifficultyMultiplier('playerAttack');
    return Math.round(baseAttack * multiplier);
  }

  calculatePlayerDefense(baseDefense: number): number {
    const multiplier = this.getDifficultyMultiplier('playerDefense');
    return Math.round(baseDefense * multiplier);
  }

  calculateEnemyHP(baseHP: number): number {
    const multiplier = this.getDifficultyMultiplier('enemyHP');
    return Math.round(baseHP * multiplier);
  }

  calculateEnemyAttack(baseAttack: number): number {
    const multiplier = this.getDifficultyMultiplier('enemyAttack');
    return Math.round(baseAttack * multiplier);
  }

  calculateEnemySpawnRate(baseRate: number): number {
    const multiplier = this.getDifficultyMultiplier('enemySpawnRate');
    return baseRate * multiplier;
  }

  calculateDropRate(baseRate: number, type: 'commonMultiplier' | 'rareMultiplier' | 'legendaryMultiplier'): number {
    const multiplier = this.getDifficultyMultiplier(type);
    return baseRate * multiplier;
  }

  calculateSkillCooldown(baseCooldown: number): number {
    const multiplier = this.getDifficultyMultiplier('skillCooldown');
    return baseCooldown * multiplier;
  }

  calculateSkillCost(baseCost: number): number {
    const multiplier = this.getDifficultyMultiplier('skillCost');
    return Math.round(baseCost * multiplier);
  }

  calculateShieldStrength(baseStrength: number): number {
    const multiplier = this.getDifficultyMultiplier('shieldStrength');
    return Math.round(baseStrength * multiplier);
  }

  calculateHealAmount(baseAmount: number): number {
    const multiplier = this.getDifficultyMultiplier('healAmount');
    return Math.round(baseAmount * multiplier);
  }

  private getDifficultyMultiplier(type?: DifficultyMultiplierType): number {
    const multipliers: Record<Difficulty, DifficultyMultipliers> = {
      [Difficulty.EASY]: {
        base: 0.8,
        playerHP: 1.2,
        playerMP: 1.2,
        playerAttack: 1.2,
        playerDefense: 1.2,
        enemyHP: 0.8,
        enemyAttack: 0.8,
        enemySpawnRate: 0.8,
        commonMultiplier: 1.2,
        rareMultiplier: 1.1,
        legendaryMultiplier: 1.0,
        skillCooldown: 0.8,
        skillCost: 0.8,
        shieldStrength: 1.2,
        healAmount: 1.2
      },
      [Difficulty.NORMAL]: {
        base: 1.0,
        playerHP: 1.0,
        playerMP: 1.0,
        playerAttack: 1.0,
        playerDefense: 1.0,
        enemyHP: 1.0,
        enemyAttack: 1.0,
        enemySpawnRate: 1.0,
        commonMultiplier: 1.0,
        rareMultiplier: 1.0,
        legendaryMultiplier: 1.0,
        skillCooldown: 1.0,
        skillCost: 1.0,
        shieldStrength: 1.0,
        healAmount: 1.0
      },
      [Difficulty.HARD]: {
        base: 1.2,
        playerHP: 0.8,
        playerMP: 0.8,
        playerAttack: 0.8,
        playerDefense: 0.8,
        enemyHP: 1.2,
        enemyAttack: 1.2,
        enemySpawnRate: 1.2,
        commonMultiplier: 0.8,
        rareMultiplier: 0.9,
        legendaryMultiplier: 1.0,
        skillCooldown: 1.2,
        skillCost: 1.2,
        shieldStrength: 0.8,
        healAmount: 0.8
      },
      [Difficulty.EXPERT]: {
        base: 1.5,
        playerHP: 0.6,
        playerMP: 0.6,
        playerAttack: 0.6,
        playerDefense: 0.6,
        enemyHP: 1.5,
        enemyAttack: 1.5,
        enemySpawnRate: 1.5,
        commonMultiplier: 0.6,
        rareMultiplier: 0.8,
        legendaryMultiplier: 1.0,
        skillCooldown: 1.5,
        skillCost: 1.5,
        shieldStrength: 0.6,
        healAmount: 0.6
      }
    };

    const difficultyMultipliers = multipliers[this.currentDifficulty];
    return type ? difficultyMultipliers[type] : difficultyMultipliers.base;
  }

  destroy(): void {
    BalanceManager.instance = null as any;
  }
} 