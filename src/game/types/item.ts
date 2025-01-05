export interface ItemConfig {
  name: string
  description: string
  type: 'consumable' | 'equipment' | 'material'
  effect?: {
    health?: number
    damage?: number
    defense?: number
    speed?: number
  }
  stackable: boolean
  maxStack: number
  value: number
  icon: number
}

export const ITEM_CONFIGS: { [key: string]: ItemConfig } = {
  health_potion: {
    name: '生命药水',
    description: '恢复30点生命值',
    type: 'consumable',
    effect: {
      health: 30
    },
    stackable: true,
    maxStack: 99,
    value: 10,
    icon: 0
  },
  sword: {
    name: '铁剑',
    description: '增加10点攻击力',
    type: 'equipment',
    effect: {
      damage: 10
    },
    stackable: false,
    maxStack: 1,
    value: 50,
    icon: 1
  },
  shield: {
    name: '铁盾',
    description: '增加5点防御力',
    type: 'equipment',
    effect: {
      defense: 5
    },
    stackable: false,
    maxStack: 1,
    value: 40,
    icon: 2
  },
  speed_boots: {
    name: '疾风靴',
    description: '增加20点移动速度',
    type: 'equipment',
    effect: {
      speed: 20
    },
    stackable: false,
    maxStack: 1,
    value: 45,
    icon: 3
  }
} 