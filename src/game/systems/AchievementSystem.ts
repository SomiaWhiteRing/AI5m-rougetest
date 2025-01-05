export enum AchievementType {
  // 战斗相关
  KILL_ENEMIES = 'kill_enemies',
  KILL_BOSS = 'kill_boss',
  DEAL_DAMAGE = 'deal_damage',
  TAKE_DAMAGE = 'take_damage',
  
  // 探索相关
  EXPLORE_ROOMS = 'explore_rooms',
  FIND_TREASURE = 'find_treasure',
  VISIT_SHOP = 'visit_shop',
  
  // 收集相关
  COLLECT_ITEMS = 'collect_items',
  COLLECT_GOLD = 'collect_gold',
  USE_POTIONS = 'use_potions',
  
  // 升级相关
  REACH_LEVEL = 'reach_level',
  UNLOCK_SKILLS = 'unlock_skills',
  UPGRADE_EQUIPMENT = 'upgrade_equipment',
  
  // 其他
  PLAY_TIME = 'play_time',
  SAVE_GAME = 'save_game',
  COMPLETE_GAME = 'complete_game'
}

export interface AchievementTier {
  threshold: number
  reward: {
    gold?: number
    experience?: number
    items?: string[]
  }
}

export interface Achievement {
  type: AchievementType
  name: string
  description: string
  icon: string
  tiers: AchievementTier[]
  hidden?: boolean
}

export interface AchievementProgress {
  type: AchievementType
  currentValue: number
  completedTiers: number[]
}

export const ACHIEVEMENTS: Record<AchievementType, Achievement> = {
  [AchievementType.KILL_ENEMIES]: {
    type: AchievementType.KILL_ENEMIES,
    name: '猎手',
    description: '击败敌人',
    icon: '⚔️',
    tiers: [
      { threshold: 10, reward: { gold: 100, experience: 50 } },
      { threshold: 50, reward: { gold: 500, experience: 200 } },
      { threshold: 200, reward: { gold: 2000, experience: 1000 } }
    ]
  },
  [AchievementType.KILL_BOSS]: {
    type: AchievementType.KILL_BOSS,
    name: '屠龙者',
    description: '击败Boss',
    icon: '👑',
    tiers: [
      { threshold: 1, reward: { gold: 1000, experience: 500, items: ['rare_weapon'] } },
      { threshold: 5, reward: { gold: 5000, experience: 2000, items: ['legendary_weapon'] } }
    ]
  },
  [AchievementType.DEAL_DAMAGE]: {
    type: AchievementType.DEAL_DAMAGE,
    name: '战士',
    description: '造成伤害',
    icon: '🗡️',
    tiers: [
      { threshold: 1000, reward: { gold: 200, experience: 100 } },
      { threshold: 5000, reward: { gold: 1000, experience: 500 } },
      { threshold: 20000, reward: { gold: 4000, experience: 2000 } }
    ]
  },
  [AchievementType.TAKE_DAMAGE]: {
    type: AchievementType.TAKE_DAMAGE,
    name: '坚韧',
    description: '承受伤害',
    icon: '🛡️',
    tiers: [
      { threshold: 500, reward: { gold: 100, experience: 50 } },
      { threshold: 2000, reward: { gold: 500, experience: 250 } },
      { threshold: 10000, reward: { gold: 2000, experience: 1000 } }
    ]
  },
  [AchievementType.EXPLORE_ROOMS]: {
    type: AchievementType.EXPLORE_ROOMS,
    name: '探险家',
    description: '探索房间',
    icon: '🗺️',
    tiers: [
      { threshold: 10, reward: { gold: 200, experience: 100 } },
      { threshold: 50, reward: { gold: 1000, experience: 500 } },
      { threshold: 200, reward: { gold: 4000, experience: 2000 } }
    ]
  },
  [AchievementType.FIND_TREASURE]: {
    type: AchievementType.FIND_TREASURE,
    name: '寻宝者',
    description: '发现宝藏',
    icon: '💎',
    tiers: [
      { threshold: 5, reward: { gold: 500, experience: 200 } },
      { threshold: 20, reward: { gold: 2000, experience: 800 } },
      { threshold: 100, reward: { gold: 8000, experience: 3000 } }
    ]
  },
  [AchievementType.VISIT_SHOP]: {
    type: AchievementType.VISIT_SHOP,
    name: '顾客',
    description: '访问商店',
    icon: '🏪',
    tiers: [
      { threshold: 5, reward: { gold: 100, experience: 50 } },
      { threshold: 20, reward: { gold: 500, experience: 200 } },
      { threshold: 100, reward: { gold: 2000, experience: 800 } }
    ]
  },
  [AchievementType.COLLECT_ITEMS]: {
    type: AchievementType.COLLECT_ITEMS,
    name: '收藏家',
    description: '收集物品',
    icon: '🎒',
    tiers: [
      { threshold: 10, reward: { gold: 200, experience: 100 } },
      { threshold: 50, reward: { gold: 1000, experience: 500 } },
      { threshold: 200, reward: { gold: 4000, experience: 2000 } }
    ]
  },
  [AchievementType.COLLECT_GOLD]: {
    type: AchievementType.COLLECT_GOLD,
    name: '富豪',
    description: '收集金币',
    icon: '💰',
    tiers: [
      { threshold: 1000, reward: { experience: 100 } },
      { threshold: 5000, reward: { experience: 500 } },
      { threshold: 20000, reward: { experience: 2000 } }
    ]
  },
  [AchievementType.USE_POTIONS]: {
    type: AchievementType.USE_POTIONS,
    name: '炼金术士',
    description: '使用药水',
    icon: '🧪',
    tiers: [
      { threshold: 5, reward: { gold: 100, experience: 50 } },
      { threshold: 20, reward: { gold: 500, experience: 200 } },
      { threshold: 100, reward: { gold: 2000, experience: 800 } }
    ]
  },
  [AchievementType.REACH_LEVEL]: {
    type: AchievementType.REACH_LEVEL,
    name: '修炼者',
    description: '达到等级',
    icon: '📈',
    tiers: [
      { threshold: 10, reward: { gold: 1000, experience: 0 } },
      { threshold: 20, reward: { gold: 5000, experience: 0 } },
      { threshold: 50, reward: { gold: 20000, experience: 0 } }
    ]
  },
  [AchievementType.UNLOCK_SKILLS]: {
    type: AchievementType.UNLOCK_SKILLS,
    name: '技能大师',
    description: '解锁技能',
    icon: '✨',
    tiers: [
      { threshold: 3, reward: { gold: 500, experience: 200 } },
      { threshold: 10, reward: { gold: 2000, experience: 800 } },
      { threshold: 20, reward: { gold: 8000, experience: 3000 } }
    ]
  },
  [AchievementType.UPGRADE_EQUIPMENT]: {
    type: AchievementType.UPGRADE_EQUIPMENT,
    name: '铁匠',
    description: '升级装备',
    icon: '⚒️',
    tiers: [
      { threshold: 5, reward: { gold: 500, experience: 200 } },
      { threshold: 20, reward: { gold: 2000, experience: 800 } },
      { threshold: 50, reward: { gold: 8000, experience: 3000 } }
    ]
  },
  [AchievementType.PLAY_TIME]: {
    type: AchievementType.PLAY_TIME,
    name: '冒险时光',
    description: '游戏时间（小时）',
    icon: '⌛',
    tiers: [
      { threshold: 1, reward: { gold: 100, experience: 50 } },
      { threshold: 10, reward: { gold: 1000, experience: 500 } },
      { threshold: 100, reward: { gold: 10000, experience: 5000 } }
    ]
  },
  [AchievementType.SAVE_GAME]: {
    type: AchievementType.SAVE_GAME,
    name: '谨慎者',
    description: '保存游戏',
    icon: '💾',
    tiers: [
      { threshold: 1, reward: { gold: 100, experience: 50 } },
      { threshold: 10, reward: { gold: 500, experience: 200 } },
      { threshold: 50, reward: { gold: 2000, experience: 800 } }
    ]
  },
  [AchievementType.COMPLETE_GAME]: {
    type: AchievementType.COMPLETE_GAME,
    name: '英雄',
    description: '完成游戏',
    icon: '🏆',
    tiers: [
      { threshold: 1, reward: { gold: 10000, experience: 5000, items: ['hero_title'] } }
    ]
  }
}

export class AchievementSystem {
  private static instance: AchievementSystem
  private progress: Map<AchievementType, AchievementProgress> = new Map()
  private listeners: ((type: AchievementType, progress: AchievementProgress) => void)[] = []

  private constructor() {
    this.loadProgress()
  }

  static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem()
    }
    return AchievementSystem.instance
  }

  private loadProgress() {
    try {
      const savedProgress = localStorage.getItem('achievements')
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress)
        Object.entries(parsed).forEach(([type, progress]) => {
          this.progress.set(type as AchievementType, progress as AchievementProgress)
        })
      }
    } catch (error) {
      console.error('加载成就进度失败:', error)
    }
  }

  private saveProgress() {
    try {
      const progressObj = Object.fromEntries(this.progress)
      localStorage.setItem('achievements', JSON.stringify(progressObj))
    } catch (error) {
      console.error('保存成就进度失败:', error)
    }
  }

  updateProgress(type: AchievementType, value: number) {
    let progress = this.progress.get(type)
    if (!progress) {
      progress = {
        type,
        currentValue: 0,
        completedTiers: []
      }
      this.progress.set(type, progress)
    }

    const oldValue = progress.currentValue
    progress.currentValue = value

    const achievement = ACHIEVEMENTS[type]
    if (achievement) {
      achievement.tiers.forEach((tier, index) => {
        if (value >= tier.threshold && oldValue < tier.threshold) {
          this.unlockTier(type, index)
        }
      })
    }

    this.notifyListeners(type, progress)
    this.saveProgress()
  }

  private unlockTier(type: AchievementType, tierIndex: number) {
    const progress = this.progress.get(type)
    if (!progress) return

    const achievement = ACHIEVEMENTS[type]
    if (!achievement) return

    const tier = achievement.tiers[tierIndex]
    if (!tier) return

    if (!progress.completedTiers.includes(tierIndex)) {
      progress.completedTiers.push(tierIndex)
      this.grantReward(tier.reward)
      this.notifyAchievement(achievement, tierIndex)
    }
  }

  private grantReward(reward: AchievementTier['reward']) {
    // 这里需要与游戏状态管理器集成
    console.log('获得成就奖励:', reward)
  }

  private notifyAchievement(achievement: Achievement, tierIndex: number) {
    // 这里需要与UI系统集成，显示成就解锁通知
    console.log(`解锁成就: ${achievement.name} (等级 ${tierIndex + 1})`)
  }

  addListener(callback: (type: AchievementType, progress: AchievementProgress) => void) {
    this.listeners.push(callback)
  }

  removeListener(callback: (type: AchievementType, progress: AchievementProgress) => void) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(type: AchievementType, progress: AchievementProgress) {
    this.listeners.forEach(listener => listener(type, progress))
  }

  getProgress(type: AchievementType): AchievementProgress | undefined {
    return this.progress.get(type)
  }

  getAchievement(type: AchievementType): Achievement | undefined {
    return ACHIEVEMENTS[type]
  }

  getAllProgress(): Map<AchievementType, AchievementProgress> {
    return new Map(this.progress)
  }

  resetProgress() {
    this.progress.clear()
    this.saveProgress()
  }
} 