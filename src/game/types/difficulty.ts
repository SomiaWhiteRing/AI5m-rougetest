export enum Difficulty {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

export interface DifficultyMultipliers {
  base: number;
  playerHP: number;
  playerMP: number;
  playerAttack: number;
  playerDefense: number;
  enemyHP: number;
  enemyAttack: number;
  enemySpawnRate: number;
  commonMultiplier: number;
  rareMultiplier: number;
  legendaryMultiplier: number;
  skillCooldown: number;
  skillCost: number;
  shieldStrength: number;
  healAmount: number;
}

export type DifficultyMultiplierType = keyof DifficultyMultipliers; 