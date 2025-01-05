import { Equipment } from '../../types/equipment';
import { Material } from '../../config/materialConfig';
import {
  EnchantEffect,
  EnchantConfig,
  enchantConfigs,
  getAvailableEnchants,
  hasEnoughMaterials,
  calculateSuccessRate,
} from '../../config/enchantConfig';

export interface EnchantPreview {
  equipment: Equipment;
  effect: EnchantEffect;
  successRate: number;
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

export class EnchantManager {
  // 预览附魔效果
  public previewEnchant(
    equipment: Equipment,
    enchantId: string
  ): EnchantPreview | null {
    const config = enchantConfigs[enchantId];
    if (!config || !config.slots.includes(equipment.slot)) {
      return null;
    }

    const enchantCount = (equipment.effects || []).length;
    const successRate = calculateSuccessRate(config.recipe.successRate, enchantCount);

    // 计算附魔后的属性
    const newStats = { ...config.effect.stats };
    if (equipment.attack) newStats.attack = (newStats.attack || 0) + equipment.attack;
    if (equipment.defense) newStats.defense = (newStats.defense || 0) + equipment.defense;
    if (equipment.hp) newStats.hp = (newStats.hp || 0) + equipment.hp;
    if (equipment.mp) newStats.mp = (newStats.mp || 0) + equipment.mp;
    if (equipment.critRate) newStats.critRate = (newStats.critRate || 0) + equipment.critRate;
    if (equipment.critDamage) newStats.critDamage = (newStats.critDamage || 0) + equipment.critDamage;

    return {
      equipment,
      effect: config.effect,
      successRate,
      stats: newStats,
    };
  }

  // 执行附魔
  public enchant(
    equipment: Equipment,
    enchantId: string,
    materials: { material: Material; quantity: number }[]
  ): Equipment | null {
    const config = enchantConfigs[enchantId];
    if (!config || !config.slots.includes(equipment.slot)) {
      return null;
    }

    // 检查材料是否足够
    if (!hasEnoughMaterials(config.recipe, materials)) {
      return null;
    }

    const enchantCount = (equipment.effects || []).length;
    const successRate = calculateSuccessRate(config.recipe.successRate, enchantCount);

    // 判断是否成功
    const isSuccess = Math.random() < successRate;
    if (!isSuccess) {
      return null;
    }

    // 创建新的装备实例
    const newEquipment: Equipment = {
      ...equipment,
      attack: equipment.attack ? equipment.attack + (config.effect.stats.attack || 0) : equipment.attack,
      defense: equipment.defense ? equipment.defense + (config.effect.stats.defense || 0) : equipment.defense,
      hp: equipment.hp ? equipment.hp + (config.effect.stats.hp || 0) : equipment.hp,
      mp: equipment.mp ? equipment.mp + (config.effect.stats.mp || 0) : equipment.mp,
      critRate: equipment.critRate ? equipment.critRate + (config.effect.stats.critRate || 0) : equipment.critRate,
      critDamage: equipment.critDamage ? equipment.critDamage + (config.effect.stats.critDamage || 0) : equipment.critDamage,
      effects: [
        ...(equipment.effects || []),
        {
          type: config.effect.type === 'prefix' ? 'passive' : 'active',
          name: config.effect.name,
          description: config.effect.description,
          stats: config.effect.stats,
        },
      ],
    };

    // 如果有元素伤害，添加到效果中
    if (config.effect.stats.elementalDamage) {
      newEquipment.effects?.push({
        type: 'passive',
        name: `${config.effect.stats.elementalDamage.type}伤害`,
        description: `造成${config.effect.stats.elementalDamage.value}点${config.effect.stats.elementalDamage.type}伤害`,
        stats: {
          elementalDamage: config.effect.stats.elementalDamage,
        },
      });
    }

    return newEquipment;
  }

  // 获取可用的附魔效果
  public getAvailableEnchants(equipment: Equipment): EnchantConfig[] {
    return getAvailableEnchants(equipment.slot);
  }

  // 获取附魔所需的材料
  public getRequiredMaterials(enchantId: string): { id: string; quantity: number }[] {
    const config = enchantConfigs[enchantId];
    return config ? config.recipe.materials : [];
  }

  // 获取附魔成本
  public getEnchantCost(enchantId: string): number {
    const config = enchantConfigs[enchantId];
    return config ? config.recipe.goldCost : 0;
  }

  // 检查是否可以附魔
  public canEnchant(
    equipment: Equipment,
    enchantId: string,
    materials: { material: Material; quantity: number }[],
    gold: number
  ): boolean {
    const config = enchantConfigs[enchantId];
    if (!config || !config.slots.includes(equipment.slot)) {
      return false;
    }

    // 检查材料和金币是否足够
    return (
      hasEnoughMaterials(config.recipe, materials) &&
      gold >= config.recipe.goldCost
    );
  }
} 