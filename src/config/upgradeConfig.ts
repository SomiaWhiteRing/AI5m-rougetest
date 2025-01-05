import { Material } from './materialConfig';
import { Equipment } from '../types/equipment';

export interface UpgradeEffect {
  id: string;
  name: string;
  description: string;
  quality: number;
  stats: {
    attackMultiplier?: number;
    defenseMultiplier?: number;
    hpMultiplier?: number;
    mpMultiplier?: number;
    critRateBonus?: number;
    critDamageBonus?: number;
    elementalDamageBonus?: {
      type: 'fire' | 'ice' | 'lightning' | 'poison';
      value: number;
    };
  };
  specialEffect?: {
    type: 'passive' | 'active';
    name: string;
    description: string;
    trigger?: 'onHit' | 'onDamaged' | 'onKill' | 'onHeal';
    chance?: number;
    cooldown?: number;
  };
}

export interface UpgradeRecipe {
  materials: {
    id: string;
    quantity: number;
  }[];
  goldCost: number;
  successRate: number;
  failureProtection?: boolean; // 是否保护装备不会在失败时损坏
}

export interface UpgradeConfig {
  effect: UpgradeEffect;
  recipe: UpgradeRecipe;
  requirements: {
    quality: number;
    level?: number;
    enhanceLevel?: number;
  };
}

// 进阶效果配置
export const upgradeEffects: Record<string, UpgradeEffect> = {
  // 武器进阶
  dragonslayer: {
    id: 'dragonslayer',
    name: '屠龙者',
    description: '注入龙族的力量，大幅提升武器的攻击属性',
    quality: 4,
    stats: {
      attackMultiplier: 1.5,
      critRateBonus: 0.05,
      critDamageBonus: 0.2,
    },
    specialEffect: {
      type: 'passive',
      name: '龙之怒焰',
      description: '攻击时有20%几率造成额外的火焰伤害',
      trigger: 'onHit',
      chance: 0.2,
    },
  },
  soulreaper: {
    id: 'soulreaper',
    name: '灵魂收割者',
    description: '吸收灵魂的力量，提升武器的魔法属性',
    quality: 4,
    stats: {
      attackMultiplier: 1.3,
      mpMultiplier: 1.3,
      critDamageBonus: 0.3,
    },
    specialEffect: {
      type: 'active',
      name: '灵魂收割',
      description: '击杀敌人时有几率恢复生命值',
      trigger: 'onKill',
      chance: 0.3,
    },
  },
  // 防具进阶
  guardian: {
    id: 'guardian',
    name: '守护者',
    description: '注入守护之力，大幅提升防具的防御属性',
    quality: 4,
    stats: {
      defenseMultiplier: 1.5,
      hpMultiplier: 1.3,
    },
    specialEffect: {
      type: 'passive',
      name: '守护光环',
      description: '受到伤害时有20%几率减免部分伤害',
      trigger: 'onDamaged',
      chance: 0.2,
    },
  },
  lifebinder: {
    id: 'lifebinder',
    name: '生命缚誓者',
    description: '注入生命之力，提升防具的生存属性',
    quality: 4,
    stats: {
      hpMultiplier: 1.5,
      defenseMultiplier: 1.2,
    },
    specialEffect: {
      type: 'passive',
      name: '生命汲取',
      description: '攻击时有几率恢复生命值',
      trigger: 'onHit',
      chance: 0.15,
    },
  },
};

// 进阶配置
export const upgradeConfigs: Record<string, UpgradeConfig> = {
  dragonslayer: {
    effect: upgradeEffects.dragonslayer,
    recipe: {
      materials: [
        { id: 'legendaryEssence', quantity: 1 },
        { id: 'elementalCore', quantity: 5 },
        { id: 'ancientRelic', quantity: 3 },
      ],
      goldCost: 5000,
      successRate: 0.4,
      failureProtection: true,
    },
    requirements: {
      quality: 3,
      enhanceLevel: 5,
    },
  },
  soulreaper: {
    effect: upgradeEffects.soulreaper,
    recipe: {
      materials: [
        { id: 'legendaryEssence', quantity: 1 },
        { id: 'enchantedShard', quantity: 8 },
        { id: 'ancientRelic', quantity: 3 },
      ],
      goldCost: 5000,
      successRate: 0.4,
      failureProtection: true,
    },
    requirements: {
      quality: 3,
      enhanceLevel: 5,
    },
  },
  guardian: {
    effect: upgradeEffects.guardian,
    recipe: {
      materials: [
        { id: 'legendaryEssence', quantity: 1 },
        { id: 'elementalCore', quantity: 5 },
        { id: 'ancientRelic', quantity: 3 },
      ],
      goldCost: 5000,
      successRate: 0.4,
      failureProtection: true,
    },
    requirements: {
      quality: 3,
      enhanceLevel: 5,
    },
  },
  lifebinder: {
    effect: upgradeEffects.lifebinder,
    recipe: {
      materials: [
        { id: 'legendaryEssence', quantity: 1 },
        { id: 'enchantedShard', quantity: 8 },
        { id: 'ancientRelic', quantity: 3 },
      ],
      goldCost: 5000,
      successRate: 0.4,
      failureProtection: true,
    },
    requirements: {
      quality: 3,
      enhanceLevel: 5,
    },
  },
};

// 获取可用的进阶效果
export const getAvailableUpgrades = (equipment: Equipment): UpgradeConfig[] => {
  return Object.values(upgradeConfigs).filter(config => {
    // 检查品质要求
    if (equipment.quality < config.requirements.quality) {
      return false;
    }

    // 检查强化等级要求
    if (config.requirements.enhanceLevel && equipment.enhanceLevel < config.requirements.enhanceLevel) {
      return false;
    }

    // 根据装备类型筛选进阶效果
    if (equipment.slot === 'weapon') {
      return ['dragonslayer', 'soulreaper'].includes(config.effect.id);
    } else if (['armor', 'helmet', 'boots'].includes(equipment.slot)) {
      return ['guardian', 'lifebinder'].includes(config.effect.id);
    }

    return false;
  });
};

// 检查材料是否足够
export const hasEnoughMaterials = (
  recipe: UpgradeRecipe,
  materials: { material: Material; quantity: number }[]
): boolean => {
  return recipe.materials.every(required => {
    const available = materials.find(m => m.material.id === required.id);
    return available && available.quantity >= required.quantity;
  });
};

// 计算进阶成功率
export const calculateSuccessRate = (
  baseRate: number,
  quality: number
): number => {
  return Math.max(0.1, baseRate * Math.pow(0.9, quality - 1));
}; 