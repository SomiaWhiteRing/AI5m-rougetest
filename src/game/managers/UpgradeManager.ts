import { Equipment, EquipmentEffect, EquipmentStats } from '../../types/equipment';
import { Material } from '../../config/materialConfig';
import {
  UpgradeEffect,
  UpgradeConfig,
  upgradeConfigs,
  getAvailableUpgrades,
  hasEnoughMaterials,
  calculateSuccessRate,
} from '../../config/upgradeConfig';

export interface UpgradePreview {
  equipment: Equipment;
  effect: UpgradeEffect;
  successRate: number;
  stats: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    critRate?: number;
    critDamage?: number;
  };
}

export class UpgradeManager {
  // 预览进阶效果
  public previewUpgrade(
    equipment: Equipment,
    upgradeId: string
  ): UpgradePreview | null {
    const config = upgradeConfigs[upgradeId];
    if (!config) {
      return null;
    }

    const successRate = calculateSuccessRate(config.recipe.successRate, equipment.quality);

    // 计算进阶后的属性
    const newStats = {
      attack: equipment.attack
        ? Math.floor(equipment.attack * (config.effect.stats.attackMultiplier || 1))
        : undefined,
      defense: equipment.defense
        ? Math.floor(equipment.defense * (config.effect.stats.defenseMultiplier || 1))
        : undefined,
      hp: equipment.hp
        ? Math.floor(equipment.hp * (config.effect.stats.hpMultiplier || 1))
        : undefined,
      mp: equipment.mp
        ? Math.floor(equipment.mp * (config.effect.stats.mpMultiplier || 1))
        : undefined,
      critRate: equipment.critRate
        ? equipment.critRate + (config.effect.stats.critRateBonus || 0)
        : undefined,
      critDamage: equipment.critDamage
        ? equipment.critDamage + (config.effect.stats.critDamageBonus || 0)
        : undefined,
    };

    return {
      equipment,
      effect: config.effect,
      successRate,
      stats: newStats,
    };
  }

  // 执行进阶
  public upgrade(
    equipment: Equipment,
    upgradeId: string,
    materials: { material: Material; quantity: number }[]
  ): Equipment | null {
    const config = upgradeConfigs[upgradeId];
    if (!config) {
      return null;
    }

    // 检查材料是否足够
    if (!hasEnoughMaterials(config.recipe, materials)) {
      return null;
    }

    const successRate = calculateSuccessRate(config.recipe.successRate, equipment.quality);

    // 判断是否成功
    const isSuccess = Math.random() < successRate;
    if (!isSuccess && !config.recipe.failureProtection) {
      return null;
    }

    if (!isSuccess) {
      return equipment;
    }

    // 创建新的装备实例
    const newEquipment: Equipment = {
      ...equipment,
      quality: Math.min(5, equipment.quality + 1),
      attack: equipment.attack
        ? Math.floor(equipment.attack * (config.effect.stats.attackMultiplier || 1))
        : equipment.attack,
      defense: equipment.defense
        ? Math.floor(equipment.defense * (config.effect.stats.defenseMultiplier || 1))
        : equipment.defense,
      hp: equipment.hp
        ? Math.floor(equipment.hp * (config.effect.stats.hpMultiplier || 1))
        : equipment.hp,
      mp: equipment.mp
        ? Math.floor(equipment.mp * (config.effect.stats.mpMultiplier || 1))
        : equipment.mp,
      critRate: equipment.critRate
        ? equipment.critRate + (config.effect.stats.critRateBonus || 0)
        : equipment.critRate,
      critDamage: equipment.critDamage
        ? equipment.critDamage + (config.effect.stats.critDamageBonus || 0)
        : equipment.critDamage,
      effects: [
        ...(equipment.effects || []),
        {
          type: config.effect.specialEffect?.type || 'passive',
          name: config.effect.specialEffect?.name || config.effect.name,
          description: config.effect.specialEffect?.description || config.effect.description,
          trigger: config.effect.specialEffect?.trigger,
          chance: config.effect.specialEffect?.chance,
          cooldown: config.effect.specialEffect?.cooldown,
          stats: {
            attack: config.effect.stats.attackMultiplier ? equipment.attack : undefined,
            defense: config.effect.stats.defenseMultiplier ? equipment.defense : undefined,
            hp: config.effect.stats.hpMultiplier ? equipment.hp : undefined,
            mp: config.effect.stats.mpMultiplier ? equipment.mp : undefined,
            critRate: config.effect.stats.critRateBonus,
            critDamage: config.effect.stats.critDamageBonus,
            elementalDamage: config.effect.stats.elementalDamageBonus,
          },
        },
      ],
    };

    // 如果有元素伤害加成，添加到效果中
    if (config.effect.stats.elementalDamageBonus) {
      newEquipment.effects?.push({
        type: 'passive',
        name: `${config.effect.stats.elementalDamageBonus.type}伤害加成`,
        description: `增加${config.effect.stats.elementalDamageBonus.value}点${config.effect.stats.elementalDamageBonus.type}伤害`,
        stats: {
          elementalDamage: config.effect.stats.elementalDamageBonus,
        },
      });
    }

    return newEquipment;
  }

  // 获取可用的进阶效果
  public getAvailableUpgrades(equipment: Equipment): UpgradeConfig[] {
    return getAvailableUpgrades(equipment);
  }

  // 获取进阶所需的材料
  public getRequiredMaterials(upgradeId: string): { id: string; quantity: number }[] {
    const config = upgradeConfigs[upgradeId];
    return config ? config.recipe.materials : [];
  }

  // 获取进阶成本
  public getUpgradeCost(upgradeId: string): number {
    const config = upgradeConfigs[upgradeId];
    return config ? config.recipe.goldCost : 0;
  }

  // 检查是否可以进阶
  public canUpgrade(
    equipment: Equipment,
    upgradeId: string,
    materials: { material: Material; quantity: number }[],
    gold: number
  ): boolean {
    const config = upgradeConfigs[upgradeId];
    if (!config) {
      return false;
    }

    // 检查品质要求
    if (equipment.quality < config.requirements.quality) {
      return false;
    }

    // 检查强化等级要求
    if (config.requirements.enhanceLevel && equipment.enhanceLevel < config.requirements.enhanceLevel) {
      return false;
    }

    // 检查材料和金币是否足够
    return (
      hasEnoughMaterials(config.recipe, materials) &&
      gold >= config.recipe.goldCost
    );
  }
} 