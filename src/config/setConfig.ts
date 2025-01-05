import { Equipment } from '../types/equipment';

export interface SetBonus {
  pieces: number;
  effects: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    critRate?: number;
    critDamage?: number;
    description: string;
  };
}

export interface EquipmentSet {
  id: string;
  name: string;
  description: string;
  pieces: string[]; // 装备ID列表
  bonuses: SetBonus[];
  quality: number;
}

// 套装配置
export const equipmentSets: Record<string, EquipmentSet> = {
  warrior: {
    id: 'warrior',
    name: '战士套装',
    description: '为战士打造的基础套装',
    pieces: ['ironSword', 'chainMail', 'ironHelmet', 'ironBoots'],
    quality: 2,
    bonuses: [
      {
        pieces: 2,
        effects: {
          attack: 5,
          defense: 3,
          description: '增加攻击力和防御力',
        },
      },
      {
        pieces: 4,
        effects: {
          attack: 10,
          defense: 8,
          hp: 50,
          critRate: 0.05,
          description: '大幅提升战斗能力',
        },
      },
    ],
  },
  mage: {
    id: 'mage',
    name: '法师套装',
    description: '蕴含魔力的神秘套装',
    pieces: ['flameSword', 'magicRobe', 'magicHat', 'magicBoots'],
    quality: 3,
    bonuses: [
      {
        pieces: 2,
        effects: {
          mp: 30,
          critRate: 0.03,
          description: '增加魔法值和暴击率',
        },
      },
      {
        pieces: 4,
        effects: {
          mp: 80,
          critRate: 0.08,
          critDamage: 0.2,
          description: '显著提升魔法伤害',
        },
      },
    ],
  },
};

// 获取装备所属的套装
export const getEquipmentSet = (equipment: Equipment): EquipmentSet | null => {
  return Object.values(equipmentSets).find(set => set.pieces.includes(equipment.id)) || null;
};

// 计算已装备的套装效果
export const calculateSetBonuses = (equippedItems: Equipment[]): Record<string, SetBonus[]> => {
  const setBonuses: Record<string, SetBonus[]> = {};
  const setPieceCounts: Record<string, number> = {};

  // 统计每个套装的装备数量
  equippedItems.forEach(item => {
    const set = getEquipmentSet(item);
    if (set) {
      setPieceCounts[set.id] = (setPieceCounts[set.id] || 0) + 1;
    }
  });

  // 计算激活的套装效果
  Object.entries(setPieceCounts).forEach(([setId, count]) => {
    const set = equipmentSets[setId];
    if (set) {
      const activeBonuses = set.bonuses.filter(bonus => count >= bonus.pieces);
      if (activeBonuses.length > 0) {
        setBonuses[setId] = activeBonuses;
      }
    }
  });

  return setBonuses;
}; 