export enum Difficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EXPERT = 'expert'
}

export interface DifficultyConfig {
  playerStats: {
    hpMultiplier: number;
    mpMultiplier: number;
    attackMultiplier: number;
    defenseMultiplier: number;
    expMultiplier: number;
    goldMultiplier: number;
  };
  enemyStats: {
    hpMultiplier: number;
    attackMultiplier: number;
    defenseMultiplier: number;
    expMultiplier: number;
    goldMultiplier: number;
    spawnRateMultiplier: number;
  };
  dropRates: {
    commonMultiplier: number;
    uncommonMultiplier: number;
    rareMultiplier: number;
    epicMultiplier: number;
    legendaryMultiplier: number;
  };
}

export const difficultyConfigs: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.EASY]: {
    playerStats: {
      hpMultiplier: 1.2,
      mpMultiplier: 1.2,
      attackMultiplier: 1.2,
      defenseMultiplier: 1.2,
      expMultiplier: 1.5,
      goldMultiplier: 1.5,
    },
    enemyStats: {
      hpMultiplier: 0.8,
      attackMultiplier: 0.8,
      defenseMultiplier: 0.8,
      expMultiplier: 1.2,
      goldMultiplier: 1.2,
      spawnRateMultiplier: 0.8,
    },
    dropRates: {
      commonMultiplier: 1.2,
      uncommonMultiplier: 1.2,
      rareMultiplier: 1.2,
      epicMultiplier: 1.2,
      legendaryMultiplier: 1.2,
    },
  },
  [Difficulty.NORMAL]: {
    playerStats: {
      hpMultiplier: 1.0,
      mpMultiplier: 1.0,
      attackMultiplier: 1.0,
      defenseMultiplier: 1.0,
      expMultiplier: 1.0,
      goldMultiplier: 1.0,
    },
    enemyStats: {
      hpMultiplier: 1.0,
      attackMultiplier: 1.0,
      defenseMultiplier: 1.0,
      expMultiplier: 1.0,
      goldMultiplier: 1.0,
      spawnRateMultiplier: 1.0,
    },
    dropRates: {
      commonMultiplier: 1.0,
      uncommonMultiplier: 1.0,
      rareMultiplier: 1.0,
      epicMultiplier: 1.0,
      legendaryMultiplier: 1.0,
    },
  },
  [Difficulty.HARD]: {
    playerStats: {
      hpMultiplier: 0.8,
      mpMultiplier: 0.8,
      attackMultiplier: 0.8,
      defenseMultiplier: 0.8,
      expMultiplier: 0.8,
      goldMultiplier: 0.8,
    },
    enemyStats: {
      hpMultiplier: 1.2,
      attackMultiplier: 1.2,
      defenseMultiplier: 1.2,
      expMultiplier: 1.5,
      goldMultiplier: 1.5,
      spawnRateMultiplier: 1.2,
    },
    dropRates: {
      commonMultiplier: 0.8,
      uncommonMultiplier: 0.8,
      rareMultiplier: 1.2,
      epicMultiplier: 1.2,
      legendaryMultiplier: 1.5,
    },
  },
  [Difficulty.EXPERT]: {
    playerStats: {
      hpMultiplier: 0.6,
      mpMultiplier: 0.6,
      attackMultiplier: 0.6,
      defenseMultiplier: 0.6,
      expMultiplier: 0.6,
      goldMultiplier: 0.6,
    },
    enemyStats: {
      hpMultiplier: 1.5,
      attackMultiplier: 1.5,
      defenseMultiplier: 1.5,
      expMultiplier: 2.0,
      goldMultiplier: 2.0,
      spawnRateMultiplier: 1.5,
    },
    dropRates: {
      commonMultiplier: 0.5,
      uncommonMultiplier: 0.8,
      rareMultiplier: 1.5,
      epicMultiplier: 2.0,
      legendaryMultiplier: 2.5,
    },
  },
};

// 经验值计算公式
export const calculateRequiredExp = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// 伤害计算公式
export const calculateDamage = (
  attackerAttack: number,
  defenderDefense: number,
  isCritical: boolean,
  criticalDamage: number = 1.5
): number => {
  const baseDamage = Math.max(1, attackerAttack - defenderDefense * 0.5);
  return isCritical ? Math.floor(baseDamage * criticalDamage) : Math.floor(baseDamage);
};

// 暴击率计算公式
export const calculateCriticalRate = (
  baseCritRate: number,
  critRateBonus: number = 0
): number => {
  return Math.min(0.8, baseCritRate + critRateBonus);
};

// 闪避率计算公式
export const calculateDodgeRate = (
  attackerLevel: number,
  defenderLevel: number,
  defenderDodge: number
): number => {
  const levelDiff = Math.max(-5, Math.min(5, defenderLevel - attackerLevel));
  return Math.min(0.5, defenderDodge + levelDiff * 0.02);
};

// 掉落率计算公式
export const calculateDropRate = (
  baseRate: number,
  playerLuck: number,
  difficultyMultiplier: number
): number => {
  return Math.min(1, baseRate * (1 + playerLuck * 0.01) * difficultyMultiplier);
};

// 金币掉落计算公式
export const calculateGoldDrop = (
  baseGold: number,
  level: number,
  difficultyMultiplier: number
): number => {
  return Math.floor(baseGold * (1 + (level - 1) * 0.1) * difficultyMultiplier);
};

// 经验值获取计算公式
export const calculateExpGain = (
  baseExp: number,
  playerLevel: number,
  enemyLevel: number,
  difficultyMultiplier: number
): number => {
  const levelDiff = enemyLevel - playerLevel;
  const levelMultiplier = Math.max(0.1, 1 + levelDiff * 0.1);
  return Math.floor(baseExp * levelMultiplier * difficultyMultiplier);
};

// 装备属性计算公式
export const calculateEquipmentStats = (
  baseStats: Record<string, number>,
  quality: number,
  level: number
): Record<string, number> => {
  const qualityMultiplier = 1 + (quality - 1) * 0.2;
  const levelMultiplier = 1 + (level - 1) * 0.1;
  const result: Record<string, number> = {};

  for (const [stat, value] of Object.entries(baseStats)) {
    result[stat] = Math.floor(value * qualityMultiplier * levelMultiplier);
  }

  return result;
};

// 技能冷却时间计算公式
export const calculateCooldown = (
  baseCooldown: number,
  cooldownReduction: number
): number => {
  return Math.max(0.5, baseCooldown * (1 - cooldownReduction));
};

// 技能消耗计算公式
export const calculateSkillCost = (
  baseCost: number,
  costReduction: number
): number => {
  return Math.max(1, Math.floor(baseCost * (1 - costReduction)));
};

// 技能伤害计算公式
export const calculateSkillDamage = (
  baseSkillDamage: number,
  attackerAttack: number,
  skillPower: number,
  elementalBonus: number = 0
): number => {
  return Math.floor(
    (baseSkillDamage + attackerAttack * skillPower) * (1 + elementalBonus)
  );
};

// 护盾强度计算公式
export const calculateShieldStrength = (
  baseShield: number,
  defenderDefense: number,
  shieldPower: number
): number => {
  return Math.floor(baseShield + defenderDefense * shieldPower);
};

// 治疗量计算公式
export const calculateHealing = (
  baseHealing: number,
  healerAttack: number,
  healingPower: number
): number => {
  return Math.floor(baseHealing + healerAttack * healingPower);
}; 