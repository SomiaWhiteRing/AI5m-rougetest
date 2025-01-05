interface AchievementReward {
  type: 'gold' | 'skill_point' | 'item' | 'boots'
  value: number | string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (state: any) => boolean
  reward?: AchievementReward
  progress?: {
    current: number
    required: number
  }
  unlocked: boolean
  unlockDate?: number
}

interface AchievementData {
  id: string
  name: string
  description: string
  icon: string
  condition: (state: any) => boolean
  reward?: AchievementReward
  progress?: {
    current: number
    required: number
  }
}

export class AchievementSystem {
  private static instance: AchievementSystem
  private achievements: Map<string, Achievement> = new Map()
  private unlockedAchievements: Set<string> = new Set()
  private readonly STORAGE_KEY = 'roguelike_achievements'

  private constructor() {
    this.loadAchievements()
    this.loadUnlockedAchievements()
  }

  static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem()
    }
    return AchievementSystem.instance
  }

  private loadAchievements() {
    // 初始化成就列表
    this.registerAchievement({
      id: 'first_kill',
      name: '初次击杀',
      description: '击败第一个敌人',
      icon: 'first_kill',
      condition: (state: any) => state.stats.kills > 0,
      reward: {
        type: 'gold',
        value: 100
      }
    })

    this.registerAchievement({
      id: 'level_10',
      name: '初露锋芒',
      description: '达到10级',
      icon: 'level_10',
      condition: (state: any) => state.player.level >= 10,
      reward: {
        type: 'skill_point',
        value: 1
      }
    })

    this.registerAchievement({
      id: 'kill_100',
      name: '百人斩',
      description: '击败100个敌人',
      icon: 'kill_100',
      condition: (state: any) => state.stats.kills >= 100,
      progress: {
        current: 0,
        required: 100
      },
      reward: {
        type: 'gold',
        value: 1000
      }
    })

    this.registerAchievement({
      id: 'no_damage',
      name: '完美主义者',
      description: '在不受到伤害的情况下完成一个地下城',
      icon: 'no_damage',
      condition: (state: any) => state.currentRun?.damageTaken === 0 && state.currentRun?.completed,
      reward: {
        type: 'item',
        value: 'perfect_shield'
      }
    })

    this.registerAchievement({
      id: 'speed_run',
      name: '速通大师',
      description: '在10分钟内完成一个地下城',
      icon: 'speed_run',
      condition: (state: any) => state.currentRun?.time <= 600000 && state.currentRun?.completed,
      reward: {
        type: 'boots',
        value: 'swift_boots'
      }
    })
  }

  private loadUnlockedAchievements() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        this.unlockedAchievements = new Set(data)
      }
    } catch (error) {
      console.error('加载成就数据失败:', error)
    }
  }

  private saveUnlockedAchievements() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(Array.from(this.unlockedAchievements))
      )
    } catch (error) {
      console.error('保存成就数据失败:', error)
    }
  }

  registerAchievement(achievement: Achievement) {
    this.achievements.set(achievement.id, {
      ...achievement,
      unlocked: this.unlockedAchievements.has(achievement.id)
    })
  }

  checkAchievements(gameState: any) {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(gameState)) {
        this.unlockAchievement(achievement.id)
      }

      // 更新进度
      if (achievement.progress) {
        const current = this.calculateProgress(achievement, gameState)
        achievement.progress.current = current
      }
    })
  }

  private calculateProgress(achievement: Achievement, gameState: any): number {
    // 根据不同成就类型计算进度
    switch (achievement.id) {
      case 'kill_100':
        return gameState.stats.kills
      // 添加其他成就的进度计算
      default:
        return 0
    }
  }

  unlockAchievement(achievementId: string) {
    const achievement = this.achievements.get(achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockDate = Date.now()
      this.unlockedAchievements.add(achievementId)
      this.saveUnlockedAchievements()

      // 触发成就解锁事件
      this.onAchievementUnlocked(achievement)

      // 发放奖励
      if (achievement.reward) {
        this.grantReward(achievement.reward)
      }
    }
  }

  private onAchievementUnlocked(achievement: Achievement) {
    // 显示成就解锁通知
    console.log(`🏆 解锁成就: ${achievement.name}`)
    // TODO: 显示UI通知
  }

  private grantReward(reward: Achievement['reward']) {
    if (!reward) return

    // TODO: 实现奖励发放逻辑
    console.log(`发放奖励: ${reward.type} x ${reward.value}`)
  }

  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.get(achievementId)
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values())
  }

  getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked)
  }

  getProgress(): {
    total: number
    unlocked: number
    percentage: number
  } {
    const total = this.achievements.size
    const unlocked = this.unlockedAchievements.size
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100)
    }
  }

  resetAchievements() {
    this.unlockedAchievements.clear()
    this.achievements.forEach(achievement => {
      achievement.unlocked = false
      achievement.unlockDate = undefined
      if (achievement.progress) {
        achievement.progress.current = 0
      }
    })
    this.saveUnlockedAchievements()
  }
} 