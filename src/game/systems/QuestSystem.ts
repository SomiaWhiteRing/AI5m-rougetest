export enum QuestType {
  KILL = 'kill',
  COLLECT = 'collect',
  EXPLORE = 'explore',
  TALK = 'talk',
  ESCORT = 'escort',
  DEFEND = 'defend'
}

export enum QuestStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface QuestObjective {
  type: QuestType
  target: string
  amount: number
  current: number
  description: string
}

export interface QuestReward {
  gold?: number
  experience?: number
  items?: string[]
  reputation?: number
}

export interface QuestRequirement {
  level?: number
  quests?: string[]
  reputation?: number
  items?: string[]
}

export interface Quest {
  id: string
  name: string
  description: string
  type: QuestType
  objectives: QuestObjective[]
  rewards: QuestReward
  requirements: QuestRequirement
  timeLimit?: number
  status: QuestStatus
  hidden?: boolean
}

export class QuestSystem {
  private static instance: QuestSystem
  private quests: Map<string, Quest> = new Map()
  private activeQuests: Set<string> = new Set()
  private completedQuests: Set<string> = new Set()
  private listeners: ((questId: string, quest: Quest) => void)[] = []

  private constructor() {
    this.loadProgress()
  }

  static getInstance(): QuestSystem {
    if (!QuestSystem.instance) {
      QuestSystem.instance = new QuestSystem()
    }
    return QuestSystem.instance
  }

  private loadProgress() {
    try {
      const savedQuests = localStorage.getItem('quests')
      if (savedQuests) {
        const { quests, active, completed } = JSON.parse(savedQuests)
        this.quests = new Map(Object.entries(quests))
        this.activeQuests = new Set(active)
        this.completedQuests = new Set(completed)
      }
    } catch (error) {
      console.error('加载任务进度失败:', error)
    }
  }

  private saveProgress() {
    try {
      const data = {
        quests: Object.fromEntries(this.quests),
        active: Array.from(this.activeQuests),
        completed: Array.from(this.completedQuests)
      }
      localStorage.setItem('quests', JSON.stringify(data))
    } catch (error) {
      console.error('保存任务进度失败:', error)
    }
  }

  addQuest(quest: Quest) {
    this.quests.set(quest.id, quest)
    this.notifyListeners(quest.id, quest)
    this.saveProgress()
  }

  activateQuest(questId: string): boolean {
    const quest = this.quests.get(questId)
    if (!quest || quest.status !== QuestStatus.AVAILABLE) return false

    if (!this.checkRequirements(quest)) return false

    quest.status = QuestStatus.ACTIVE
    this.activeQuests.add(questId)
    this.notifyListeners(questId, quest)
    this.saveProgress()
    return true
  }

  private checkRequirements(quest: Quest): boolean {
    // 这里需要与游戏状态管理器集成
    // 检查等级、声望、前置任务等要求
    return true
  }

  updateObjective(questId: string, objectiveIndex: number, progress: number) {
    const quest = this.quests.get(questId)
    if (!quest || quest.status !== QuestStatus.ACTIVE) return

    const objective = quest.objectives[objectiveIndex]
    if (!objective) return

    objective.current = Math.min(objective.amount, progress)

    if (this.checkQuestCompletion(quest)) {
      this.completeQuest(questId)
    }

    this.notifyListeners(questId, quest)
    this.saveProgress()
  }

  private checkQuestCompletion(quest: Quest): boolean {
    return quest.objectives.every(obj => obj.current >= obj.amount)
  }

  completeQuest(questId: string) {
    const quest = this.quests.get(questId)
    if (!quest || quest.status !== QuestStatus.ACTIVE) return

    quest.status = QuestStatus.COMPLETED
    this.activeQuests.delete(questId)
    this.completedQuests.add(questId)
    this.grantRewards(quest.rewards)
    this.notifyListeners(questId, quest)
    this.saveProgress()
  }

  failQuest(questId: string) {
    const quest = this.quests.get(questId)
    if (!quest || quest.status !== QuestStatus.ACTIVE) return

    quest.status = QuestStatus.FAILED
    this.activeQuests.delete(questId)
    this.notifyListeners(questId, quest)
    this.saveProgress()
  }

  private grantRewards(rewards: QuestReward) {
    // 这里需要与游戏状态管理器集成
    console.log('获得任务奖励:', rewards)
  }

  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId)
  }

  getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests)
      .map(id => this.quests.get(id))
      .filter((quest): quest is Quest => quest !== undefined)
  }

  getAvailableQuests(): Quest[] {
    return Array.from(this.quests.values())
      .filter(quest => quest.status === QuestStatus.AVAILABLE)
  }

  getCompletedQuests(): Quest[] {
    return Array.from(this.completedQuests)
      .map(id => this.quests.get(id))
      .filter((quest): quest is Quest => quest !== undefined)
  }

  addListener(callback: (questId: string, quest: Quest) => void) {
    this.listeners.push(callback)
  }

  removeListener(callback: (questId: string, quest: Quest) => void) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(questId: string, quest: Quest) {
    this.listeners.forEach(listener => listener(questId, quest))
  }

  resetProgress() {
    this.quests.clear()
    this.activeQuests.clear()
    this.completedQuests.clear()
    this.saveProgress()
  }
} 