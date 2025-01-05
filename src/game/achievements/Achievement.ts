export interface AchievementConfig {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  rewards?: {
    gold?: number
    experience?: number
    skillPoints?: number
  }
}

export class Achievement {
  private config: AchievementConfig
  private progress: number = 0
  private completed: boolean = false
  private unlockDate?: Date

  constructor(config: AchievementConfig) {
    this.config = config
  }

  // 更新进度
  updateProgress(value: number): boolean {
    if (this.completed) return false

    this.progress = Math.min(this.config.requirement, this.progress + value)
    
    // 检查是否完成
    if (this.progress >= this.config.requirement && !this.completed) {
      this.complete()
      return true
    }

    return false
  }

  // 完成成就
  private complete(): void {
    this.completed = true
    this.unlockDate = new Date()
  }

  // 获取进度百分比
  getProgressPercentage(): number {
    return (this.progress / this.config.requirement) * 100
  }

  // 获取配置
  getConfig(): AchievementConfig {
    return this.config
  }

  // 获取当前进度
  getProgress(): number {
    return this.progress
  }

  // 获取目标进度
  getRequirement(): number {
    return this.config.requirement
  }

  // 检查是否完成
  isCompleted(): boolean {
    return this.completed
  }

  // 获取完成时间
  getUnlockDate(): Date | undefined {
    return this.unlockDate
  }

  // 获取奖励
  getRewards(): AchievementConfig['rewards'] | undefined {
    return this.config.rewards
  }

  // 重置进度
  reset(): void {
    this.progress = 0
    this.completed = false
    this.unlockDate = undefined
  }

  // 序列化
  serialize(): object {
    return {
      id: this.config.id,
      progress: this.progress,
      completed: this.completed,
      unlockDate: this.unlockDate?.toISOString()
    }
  }

  // 反序列化
  deserialize(data: any): void {
    if (data.progress !== undefined) {
      this.progress = data.progress
    }
    if (data.completed !== undefined) {
      this.completed = data.completed
    }
    if (data.unlockDate) {
      this.unlockDate = new Date(data.unlockDate)
    }
  }
} 