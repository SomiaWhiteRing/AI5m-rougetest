export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface ItemStats {
  attack?: number;
  defense?: number;
  hp?: number;
  mana?: number;
  speed?: number;
  critRate?: number;
  critDamage?: number;
}

export interface ConsumableEffect {
  type: string;
  value: number;
  duration?: number;
}

export interface ItemConfig {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  stackable: boolean;
  maxStack?: number;
  stats?: ItemStats;
  effects?: ConsumableEffect[];
  value: number;
  icon: string;
  requiredLevel?: number;
  questItem?: boolean;
}

export const ITEMS: Record<string, ItemConfig> = {
  // 武器
  woodenSword: {
    id: 'woodenSword',
    name: '木剑',
    description: '一把普通的木剑，适合新手使用',
    type: ItemType.WEAPON,
    rarity: ItemRarity.COMMON,
    level: 1,
    stackable: false,
    stats: {
      attack: 5
    },
    value: 10,
    icon: 'wooden_sword'
  },

  fireStaff: {
    id: 'fireStaff',
    name: '火焰法杖',
    description: '蕴含火焰魔力的法杖，可以释放火球',
    type: ItemType.WEAPON,
    rarity: ItemRarity.RARE,
    level: 5,
    stackable: false,
    stats: {
      attack: 15,
      mana: 20
    },
    value: 200,
    icon: 'fire_staff',
    requiredLevel: 5
  },

  // 护甲
  leatherArmor: {
    id: 'leatherArmor',
    name: '皮革护甲',
    description: '由动物皮革制成的轻便护甲',
    type: ItemType.ARMOR,
    rarity: ItemRarity.COMMON,
    level: 1,
    stackable: false,
    stats: {
      defense: 5,
      speed: 5
    },
    value: 50,
    icon: 'leather_armor'
  },

  iceArmor: {
    id: 'iceArmor',
    name: '冰霜护甲',
    description: '由永恒冰晶打造的护甲，提供强大的防护',
    type: ItemType.ARMOR,
    rarity: ItemRarity.EPIC,
    level: 7,
    stackable: false,
    stats: {
      defense: 20,
      hp: 50,
      mana: 30
    },
    value: 500,
    icon: 'ice_armor',
    requiredLevel: 7
  },

  // 饰品
  luckyCharm: {
    id: 'luckyCharm',
    name: '幸运护符',
    description: '增加暴击率的神秘护符',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.UNCOMMON,
    level: 1,
    stackable: false,
    stats: {
      critRate: 0.05,
      critDamage: 0.2
    },
    value: 100,
    icon: 'lucky_charm'
  },

  // 消耗品
  healthPotion: {
    id: 'healthPotion',
    name: '生命药水',
    description: '恢复生命值的魔法药水',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    level: 1,
    stackable: true,
    maxStack: 99,
    effects: [
      {
        type: 'heal',
        value: 50
      }
    ],
    value: 20,
    icon: 'health_potion'
  },

  manaPotion: {
    id: 'manaPotion',
    name: '魔法药水',
    description: '恢复魔法值的魔法药水',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    level: 1,
    stackable: true,
    maxStack: 99,
    effects: [
      {
        type: 'restoreMana',
        value: 30
      }
    ],
    value: 25,
    icon: 'mana_potion'
  },

  // 材料
  slimeGel: {
    id: 'slimeGel',
    name: '史莱姆凝胶',
    description: '从史莱姆身上收集的粘稠物质',
    type: ItemType.MATERIAL,
    rarity: ItemRarity.COMMON,
    level: 1,
    stackable: true,
    maxStack: 999,
    value: 5,
    icon: 'slime_gel'
  },

  fireEssence: {
    id: 'fireEssence',
    name: '火焰精华',
    description: '蕴含强大火焰能量的结晶',
    type: ItemType.MATERIAL,
    rarity: ItemRarity.RARE,
    level: 5,
    stackable: true,
    maxStack: 999,
    value: 100,
    icon: 'fire_essence'
  },

  // 任务物品
  guardianCore: {
    id: 'guardianCore',
    name: '守护者核心',
    description: '森林守护者的力量核心，散发着自然的能量',
    type: ItemType.QUEST,
    rarity: ItemRarity.LEGENDARY,
    level: 10,
    stackable: false,
    value: 1000,
    icon: 'guardian_core',
    questItem: true
  }
}; 