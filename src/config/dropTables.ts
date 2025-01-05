import { Equipment, EquipmentSlot } from '../types/equipment';

export interface DropTable {
  id: string;
  name: string;
  drops: DropEntry[];
  guaranteedDrops?: DropEntry[];
  firstKillDrops?: DropEntry[];
  levelRequirement?: number;
}

export interface DropEntry {
  itemId: string;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
  chance: number;
  quality?: number;
}

// 基础装备模板
const equipmentTemplates: Record<string, Partial<Equipment>> = {
  woodenSword: {
    name: '木剑',
    description: '一把普通的木剑',
    slot: 'weapon',
    quality: 1,
    attack: 5,
  },
  leatherArmor: {
    name: '皮革护甲',
    description: '由动物皮革制成的护甲',
    slot: 'armor',
    quality: 1,
    defense: 3,
    hp: 10,
  },
  ironSword: {
    name: '铁剑',
    description: '一把普通的铁剑',
    slot: 'weapon',
    quality: 2,
    attack: 8,
  },
  chainMail: {
    name: '锁子甲',
    description: '由金属环相互连接而成的护甲',
    slot: 'armor',
    quality: 2,
    defense: 5,
    hp: 15,
  },
  magicRing: {
    name: '魔力戒指',
    description: '蕴含魔力的戒指',
    slot: 'ring',
    quality: 2,
    mp: 20,
    critRate: 0.02,
  },
  flameSword: {
    name: '烈焰之剑',
    description: '附带火焰魔法的剑',
    slot: 'weapon',
    quality: 3,
    attack: 12,
    critRate: 0.03,
    effects: [
      {
        type: 'passive',
        name: '烈焰',
        description: '攻击时有20%几率造成火焰伤害',
        trigger: 'onHit',
        chance: 0.2,
      },
    ],
  },
};

// 掉落表配置
export const dropTables: Record<string, DropTable> = {
  slime: {
    id: 'slime',
    name: '史莱姆',
    drops: [
      { itemId: 'woodenSword', weight: 100, minQuantity: 1, maxQuantity: 1, chance: 0.1 },
      { itemId: 'leatherArmor', weight: 100, minQuantity: 1, maxQuantity: 1, chance: 0.1 },
    ],
    guaranteedDrops: [
      { itemId: 'slimeGel', weight: 1, minQuantity: 1, maxQuantity: 3, chance: 1 },
    ],
  },
  goblin: {
    id: 'goblin',
    name: '哥布林',
    drops: [
      { itemId: 'ironSword', weight: 80, minQuantity: 1, maxQuantity: 1, chance: 0.08 },
      { itemId: 'chainMail', weight: 80, minQuantity: 1, maxQuantity: 1, chance: 0.08 },
      { itemId: 'magicRing', weight: 40, minQuantity: 1, maxQuantity: 1, chance: 0.04 },
    ],
    levelRequirement: 5,
  },
  fireElemental: {
    id: 'fireElemental',
    name: '火元素',
    drops: [
      { itemId: 'flameSword', weight: 50, minQuantity: 1, maxQuantity: 1, chance: 0.05 },
    ],
    firstKillDrops: [
      { itemId: 'flameSword', weight: 1, minQuantity: 1, maxQuantity: 1, chance: 1 },
    ],
    levelRequirement: 10,
  },
};

export const getEquipmentTemplate = (id: string): Partial<Equipment> | undefined => {
  return equipmentTemplates[id];
}; 