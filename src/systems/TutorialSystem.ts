export interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // 目标元素的选择器
  position?: 'top' | 'right' | 'bottom' | 'left'
  condition?: () => boolean // 完成条件
  required?: boolean // 是否必须完成
  nextDelay?: number // 下一步延迟时间
}

export interface TutorialSection {
  id: string
  title: string
  steps: TutorialStep[]
  condition?: () => boolean // 触发条件
  completed?: boolean
}

export class TutorialSystem {
  private static instance: TutorialSystem
  private readonly STORAGE_KEY = 'roguelike_tutorial'
  private sections: TutorialSection[] = []
  private currentSection: TutorialSection | null = null
  private currentStep: TutorialStep | null = null
  private completedSections: Set<string> = new Set()
  private listeners: ((step: TutorialStep | null) => void)[] = []

  private constructor() {
    this.loadProgress()
    this.initializeTutorials()
  }

  static getInstance(): TutorialSystem {
    if (!TutorialSystem.instance) {
      TutorialSystem.instance = new TutorialSystem()
    }
    return TutorialSystem.instance
  }

  private initializeTutorials() {
    this.sections = [
      {
        id: 'basic_movement',
        title: '基础移动',
        steps: [
          {
            id: 'movement_intro',
            title: '移动控制',
            description: '使用方向键或WASD控制角色移动',
            required: true
          },
          {
            id: 'movement_practice',
            title: '移动练习',
            description: '尝试移动到房间的另一端',
            condition: () => true, // TODO: 检查玩家是否移动到目标位置
            required: true
          }
        ],
        condition: () => true // 游戏开始时触发
      },
      {
        id: 'basic_combat',
        title: '基础战斗',
        steps: [
          {
            id: 'attack_intro',
            title: '攻击方式',
            description: '按空格键进行基础攻击',
            required: true
          },
          {
            id: 'enemy_intro',
            title: '敌人介绍',
            description: '靠近敌人时会自动进入战斗状态',
            target: '.enemy',
            position: 'top',
            required: true
          }
        ],
        condition: () => true // 遇到第一个敌人时触发
      },
      {
        id: 'items_inventory',
        title: '物品和背包',
        steps: [
          {
            id: 'pickup_item',
            title: '拾取物品',
            description: '靠近物品并按E键拾取',
            target: '.item',
            position: 'bottom',
            required: true
          },
          {
            id: 'open_inventory',
            title: '打开背包',
            description: '按I键打开背包界面',
            required: true
          }
        ],
        condition: () => true // 遇到第一个物品时触发
      },
      {
        id: 'skills_abilities',
        title: '技能和能力',
        steps: [
          {
            id: 'skill_unlock',
            title: '解锁技能',
            description: '升级后可以解锁新的技能',
            target: '.skill-bar',
            position: 'bottom',
            required: true
          },
          {
            id: 'skill_use',
            title: '使用技能',
            description: '使用数字键1-4使用技能',
            required: true
          }
        ],
        condition: () => true // 达到2级时触发
      }
    ]
  }

  private loadProgress() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (saved) {
        this.completedSections = new Set(JSON.parse(saved))
      }
    } catch (error) {
      console.error('加载教程进度失败:', error)
    }
  }

  private saveProgress() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(Array.from(this.completedSections))
      )
    } catch (error) {
      console.error('保存教程进度失败:', error)
    }
  }

  checkTriggers() {
    if (this.currentSection) return

    for (const section of this.sections) {
      if (
        !this.completedSections.has(section.id) &&
        (!section.condition || section.condition())
      ) {
        this.startSection(section)
        break
      }
    }
  }

  private startSection(section: TutorialSection) {
    this.currentSection = section
    this.showNextStep()
  }

  private showNextStep() {
    if (!this.currentSection) return

    const currentIndex = this.currentStep
      ? this.currentSection.steps.findIndex(step => step.id === this.currentStep?.id)
      : -1

    const nextStep = this.currentSection.steps[currentIndex + 1]
    if (nextStep) {
      this.showStep(nextStep)
    } else {
      this.completeSection()
    }
  }

  private showStep(step: TutorialStep) {
    this.currentStep = step
    this.notifyListeners(step)

    if (step.nextDelay) {
      setTimeout(() => this.showNextStep(), step.nextDelay)
    }
  }

  private completeSection() {
    if (this.currentSection) {
      this.completedSections.add(this.currentSection.id)
      this.saveProgress()
    }
    this.currentSection = null
    this.currentStep = null
    this.notifyListeners(null)
    this.checkTriggers()
  }

  completeStep() {
    if (!this.currentStep?.required || this.currentStep.condition?.()) {
      this.showNextStep()
    }
  }

  skipTutorial() {
    this.sections.forEach(section => {
      this.completedSections.add(section.id)
    })
    this.currentSection = null
    this.currentStep = null
    this.notifyListeners(null)
    this.saveProgress()
  }

  resetProgress() {
    this.completedSections.clear()
    this.currentSection = null
    this.currentStep = null
    this.notifyListeners(null)
    this.saveProgress()
  }

  getCurrentStep(): TutorialStep | null {
    return this.currentStep
  }

  addListener(callback: (step: TutorialStep | null) => void) {
    this.listeners.push(callback)
  }

  removeListener(callback: (step: TutorialStep | null) => void) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(step: TutorialStep | null) {
    this.listeners.forEach(listener => listener(step))
  }
} 