import { AchievementConfig } from '../achievements/Achievement'

// 战斗成就
export const COMBAT_ACHIEVEMENTS: { [key: string]: AchievementConfig } = {
  firstBlood: {
    id: 'firstBlood',
    name: '初次击杀',
    description: '击败第一个敌人',
    icon: 'achievement_first_blood',
    requirement: 1,
    rewards: {
      gold: 100,
      experience: 50
    }
  },
  warrior: {
    id: 'warrior',
    name: '战士',
    description: '击败100个敌人',
    icon: 'achievement_warrior',
    requirement: 100,
    rewards: {
      gold: 1000,
      experience: 500,
      skillPoints: 1
    }
  },
  legend: {
    id: 'legend',
    name: '传奇',
    description: '击败1000个敌人',
    icon: 'achievement_legend',
    requirement: 1000,
    rewards: {
      gold: 10000,
      experience: 5000,
      skillPoints: 3
    }
  }
}

// 收集成就
export const COLLECTION_ACHIEVEMENTS: { [key: string]: AchievementConfig } = {
  collector: {
    id: 'collector',
    name: '收藏家',
    description: '收集100个物品',
    icon: 'achievement_collector',
    requirement: 100,
    rewards: {
      gold: 500,
      experience: 200
    }
  },
  treasurer: {
    id: 'treasurer',
    name: '财务官',
    description: '累计获得10000金币',
    icon: 'achievement_treasurer',
    requirement: 10000,
    rewards: {
      experience: 1000,
      skillPoints: 1
    }
  }
}

// 探索成就
export const EXPLORATION_ACHIEVEMENTS: { [key: string]: AchievementConfig } = {
  explorer: {
    id: 'explorer',
    name: '探索者',
    description: '探索10个地图',
    icon: 'achievement_explorer',
    requirement: 10,
    rewards: {
      gold: 300,
      experience: 150
    }
  },
  adventurer: {
    id: 'adventurer',
    name: '冒险家',
    description: '探索50个地图',
    icon: 'achievement_adventurer',
    requirement: 50,
    rewards: {
      gold: 2000,
      experience: 1000,
      skillPoints: 2
    }
  }
}

// 技能成就
export const SKILL_ACHIEVEMENTS: { [key: string]: AchievementConfig } = {
  apprentice: {
    id: 'apprentice',
    name: '学徒',
    description: '学习第一个技能',
    icon: 'achievement_apprentice',
    requirement: 1,
    rewards: {
      experience: 100
    }
  },
  master: {
    id: 'master',
    name: '大师',
    description: '将一个技能升级到最高等级',
    icon: 'achievement_master',
    requirement: 1,
    rewards: {
      gold: 5000,
      experience: 2000,
      skillPoints: 2
    }
  }
}

// 合并所有成就
export const ALL_ACHIEVEMENTS: { [key: string]: AchievementConfig } = {
  ...COMBAT_ACHIEVEMENTS,
  ...COLLECTION_ACHIEVEMENTS,
  ...EXPLORATION_ACHIEVEMENTS,
  ...SKILL_ACHIEVEMENTS
} 