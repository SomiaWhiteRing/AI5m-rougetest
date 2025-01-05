import { Material } from './materialConfig';

export interface EnchantEffect {
  id: string;
  name: string;
  description: string;
  type: 'prefix' | 'suffix';
  quality: number;
  stats: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    critRate?: number;
    critDamage?: number;
    elementalDamage?: {
      type: 'fire' | 'ice' | 'lightning' | 'poison';
      value: number;
    };
  };
}

export interface EnchantRecipe {
  materials: {
    id: string;
    quantity: number;
  }[];
  goldCost: number;
  successRate: number;
}

export interface EnchantConfig {
  effect: EnchantEffect;
  recipe: EnchantRecipe;
  slots: ('weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'necklace')[];
}

// 附魔效果配置
export const enchantEffects: Record<string, EnchantEffect> = {
  // 前缀
  sharp: {
    id: 'sharp',
    name: '锋利的',
    description: '提高武器的攻击力',
    type: 'prefix',
    quality: 1,
    stats: {
      attack: 5,
    },
  },
  fierce: {
    id: 'fierce',
    name: '凶猛的',
    description: '大幅提高武器的攻击力',
    type: 'prefix',
    quality: 2,
    stats: {
      attack: 10,
      critRate: 0.03,
    },
  },
  blazing: {
    id: 'blazing',
    name: '炽热的',
    description: '附加火焰伤害',
    type: 'prefix',
    quality: 3,
    stats: {
      attack: 8,
      elementalDamage: {
        type: 'fire',
        value: 10,
      },
    },
  },
  // 后缀
  protection: {
    id: 'protection',
    name: '防护',
    description: '提高防御力',
    type: 'suffix',
    quality: 1,
    stats: {
      defense: 5,
    },
  },
  vitality: {
    id: 'vitality',
    name: '活力',
    description: '提高生命值',
    type: 'suffix',
    quality: 2,
    stats: {
      hp: 30,
      defense: 3,
    },
  },
  arcane: {
    id: 'arcane',
    name: '奥术',
    description: '提高魔法属性',
    type: 'suffix',
    quality: 3,
    stats: {
      mp: 20,
      critDamage: 0.1,
    },
  },
};

// 附魔配置
export const enchantConfigs: Record<string, EnchantConfig> = {
  sharp: {
    effect: enchantEffects.sharp,
    recipe: {
      materials: [
        { id: 'ironScrap', quantity: 5 },
        { id: 'magicDust', quantity: 2 },
      ],
      goldCost: 100,
      successRate: 0.9,
    },
    slots: ['weapon'],
  },
  fierce: {
    effect: enchantEffects.fierce,
    recipe: {
      materials: [
        { id: 'ironScrap', quantity: 8 },
        { id: 'magicDust', quantity: 4 },
        { id: 'enchantedShard', quantity: 1 },
      ],
      goldCost: 300,
      successRate: 0.7,
    },
    slots: ['weapon'],
  },
  blazing: {
    effect: enchantEffects.blazing,
    recipe: {
      materials: [
        { id: 'elementalCore', quantity: 1 },
        { id: 'enchantedShard', quantity: 2 },
        { id: 'magicDust', quantity: 6 },
      ],
      goldCost: 500,
      successRate: 0.5,
    },
    slots: ['weapon'],
  },
  protection: {
    effect: enchantEffects.protection,
    recipe: {
      materials: [
        { id: 'ironScrap', quantity: 5 },
        { id: 'magicDust', quantity: 2 },
      ],
      goldCost: 100,
      successRate: 0.9,
    },
    slots: ['armor', 'helmet', 'boots'],
  },
  vitality: {
    effect: enchantEffects.vitality,
    recipe: {
      materials: [
        { id: 'leatherScrap', quantity: 8 },
        { id: 'magicDust', quantity: 4 },
        { id: 'enchantedShard', quantity: 1 },
      ],
      goldCost: 300,
      successRate: 0.7,
    },
    slots: ['armor', 'helmet', 'boots', 'ring', 'necklace'],
  },
  arcane: {
    effect: enchantEffects.arcane,
    recipe: {
      materials: [
        { id: 'elementalCore', quantity: 1 },
        { id: 'enchantedShard', quantity: 2 },
        { id: 'magicDust', quantity: 6 },
      ],
      goldCost: 500,
      successRate: 0.5,
    },
    slots: ['ring', 'necklace'],
  },
};

// 获取可用的附魔效果
export const getAvailableEnchants = (slot: string): EnchantConfig[] => {
  return Object.values(enchantConfigs).filter(config => config.slots.includes(slot as any));
};

// 检查材料是否足够
export const hasEnoughMaterials = (
  recipe: EnchantRecipe,
  materials: { material: Material; quantity: number }[]
): boolean => {
  return recipe.materials.every(required => {
    const available = materials.find(m => m.material.id === required.id);
    return available && available.quantity >= required.quantity;
  });
};

// 计算附魔成功率
export const calculateSuccessRate = (
  baseRate: number,
  enchantCount: number
): number => {
  return Math.max(0.05, baseRate * Math.pow(0.8, enchantCount));
}; 