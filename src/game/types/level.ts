export interface LevelConfig {
  level: number
  experienceRequired: number
  healthBonus: number
  attackBonus: number
  defenseBonus: number
  skillUnlock?: string
}

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    experienceRequired: 0,
    healthBonus: 0,
    attackBonus: 0,
    defenseBonus: 0
  },
  2: {
    level: 2,
    experienceRequired: 100,
    healthBonus: 20,
    attackBonus: 2,
    defenseBonus: 1,
    skillUnlock: '冲刺'
  },
  3: {
    level: 3,
    experienceRequired: 300,
    healthBonus: 30,
    attackBonus: 3,
    defenseBonus: 2,
    skillUnlock: '旋风斩'
  },
  4: {
    level: 4,
    experienceRequired: 600,
    healthBonus: 40,
    attackBonus: 4,
    defenseBonus: 2
  },
  5: {
    level: 5,
    experienceRequired: 1000,
    healthBonus: 50,
    attackBonus: 5,
    defenseBonus: 3,
    skillUnlock: '火球术'
  },
  6: {
    level: 6,
    experienceRequired: 1500,
    healthBonus: 60,
    attackBonus: 6,
    defenseBonus: 3
  },
  7: {
    level: 7,
    experienceRequired: 2100,
    healthBonus: 70,
    attackBonus: 7,
    defenseBonus: 4,
    skillUnlock: '治疗术'
  },
  8: {
    level: 8,
    experienceRequired: 2800,
    healthBonus: 80,
    attackBonus: 8,
    defenseBonus: 4
  },
  9: {
    level: 9,
    experienceRequired: 3600,
    healthBonus: 90,
    attackBonus: 9,
    defenseBonus: 5,
    skillUnlock: '闪电链'
  },
  10: {
    level: 10,
    experienceRequired: 4500,
    healthBonus: 100,
    attackBonus: 10,
    defenseBonus: 5,
    skillUnlock: '终极技能'
  }
} 