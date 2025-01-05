import { ItemConfig } from '../items/Item'

// 消耗品
export const CONSUMABLE_ITEMS: { [key: string]: ItemConfig } = {
  healthPotion: {
    id: 'healthPotion',
    name: '生命药水',
    description: '恢复30点生命值',
    type: 'consumable',
    rarity: 'common',
    stackable: true,
    maxStack: 99,
    value: 50,
    effects: {
      health: 30
    }
  },
  greaterHealthPotion: {
    id: 'greaterHealthPotion',
    name: '大生命药水',
    description: '恢复100点生命值',
    type: 'consumable',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 99,
    value: 150,
    effects: {
      health: 100
    }
  }
}

// 装备
export const EQUIPMENT_ITEMS: { [key: string]: ItemConfig } = {
  woodenSword: {
    id: 'woodenSword',
    name: '木剑',
    description: '增加5点攻击力',
    type: 'equipment',
    rarity: 'common',
    stackable: false,
    maxStack: 1,
    value: 100,
    effects: {
      damage: 5
    }
  },
  leatherArmor: {
    id: 'leatherArmor',
    name: '皮甲',
    description: '增加10点防御力',
    type: 'equipment',
    rarity: 'common',
    stackable: false,
    maxStack: 1,
    value: 120,
    effects: {
      defense: 10
    }
  },
  ironSword: {
    id: 'ironSword',
    name: '铁剑',
    description: '增加15点攻击力',
    type: 'equipment',
    rarity: 'uncommon',
    stackable: false,
    maxStack: 1,
    value: 300,
    effects: {
      damage: 15
    }
  },
  ironArmor: {
    id: 'ironArmor',
    name: '铁甲',
    description: '增加25点防御力',
    type: 'equipment',
    rarity: 'uncommon',
    stackable: false,
    maxStack: 1,
    value: 350,
    effects: {
      defense: 25
    }
  }
}

// 材料
export const MATERIAL_ITEMS: { [key: string]: ItemConfig } = {
  wood: {
    id: 'wood',
    name: '木材',
    description: '基础的制作材料',
    type: 'material',
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    value: 10
  },
  stone: {
    id: 'stone',
    name: '石头',
    description: '基础的制作材料',
    type: 'material',
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    value: 15
  },
  iron: {
    id: 'iron',
    name: '铁矿石',
    description: '用于制作装备的材料',
    type: 'material',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    value: 50
  }
}

// 合并所有物品
export const ALL_ITEMS: { [key: string]: ItemConfig } = {
  ...CONSUMABLE_ITEMS,
  ...EQUIPMENT_ITEMS,
  ...MATERIAL_ITEMS
} 