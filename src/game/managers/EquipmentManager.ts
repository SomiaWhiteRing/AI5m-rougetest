import { ENHANCEMENT_CONFIG, EquipmentSlot, EQUIPMENT_SLOTS } from '../../config/equipment';
import { ItemConfig, ItemStats } from '../../config/items';
import { Entity } from '../entities/Entity';
import { ItemManager } from './ItemManager';

export interface EquippedItem {
  item: ItemConfig;
  enhancementLevel: number;
}

export class EquipmentManager {
  private equipment: Map<EquipmentSlot, EquippedItem | null>;
  private itemManager: ItemManager;
  private entity: Entity;

  constructor(itemManager: ItemManager, entity: Entity) {
    this.equipment = new Map();
    this.itemManager = itemManager;
    this.entity = entity;

    // 初始化装备槽
    Object.values(EquipmentSlot).forEach(slot => {
      this.equipment.set(slot, null);
    });
  }

  public equip(itemId: string, slot: EquipmentSlot): boolean {
    const item = this.itemManager.getInventory().get(itemId)?.item;
    if (!item) {
      console.error(`Item ${itemId} not found in inventory`);
      return false;
    }

    const slotConfig = EQUIPMENT_SLOTS[slot];
    if (!slotConfig.allowedTypes.includes(item.type)) {
      console.error(`Item type ${item.type} not allowed in slot ${slot}`);
      return false;
    }

    if (item.requiredLevel && this.entity.getLevel() < item.requiredLevel) {
      console.error(`Required level ${item.requiredLevel} not met`);
      return false;
    }

    // 卸下当前装备
    const currentEquipped = this.equipment.get(slot);
    if (currentEquipped) {
      this.unequip(slot);
    }

    // 从背包移除物品
    if (!this.itemManager.removeItem(itemId, 1)) {
      return false;
    }

    // 装备新物品
    this.equipment.set(slot, {
      item,
      enhancementLevel: 0
    });

    // 更新实体属性
    this.updateEntityStats();

    return true;
  }

  public unequip(slot: EquipmentSlot): boolean {
    const equipped = this.equipment.get(slot);
    if (!equipped) {
      return false;
    }

    // 将物品返回到背包
    if (!this.itemManager.addItem(equipped.item.id, 1)) {
      console.error('Failed to add unequipped item to inventory');
      return false;
    }

    // 移除装备
    this.equipment.set(slot, null);

    // 更新实体属性
    this.updateEntityStats();

    return true;
  }

  public enhance(slot: EquipmentSlot): boolean {
    const equipped = this.equipment.get(slot);
    if (!equipped) {
      return false;
    }

    const nextLevel = equipped.enhancementLevel + 1;
    const config = ENHANCEMENT_CONFIG[nextLevel - 1];
    if (!config) {
      console.error('Maximum enhancement level reached');
      return false;
    }

    const cost = Math.floor(equipped.item.value * config.costMultiplier);
    if (!this.entity.consumeMoney(cost)) {
      console.error('Not enough money for enhancement');
      return false;
    }

    if (Math.random() > config.successRate) {
      console.log('Enhancement failed');
      return false;
    }

    equipped.enhancementLevel = nextLevel;
    this.updateEntityStats();

    return true;
  }

  private updateEntityStats(): void {
    const totalStats: ItemStats = {
      attack: 0,
      defense: 0,
      hp: 0,
      mana: 0,
      speed: 0,
      critRate: 0,
      critDamage: 0
    };

    // 计算所有装备的属性总和
    this.equipment.forEach((equipped) => {
      if (equipped && equipped.item.stats) {
        const enhancementMultiplier = equipped.enhancementLevel > 0
          ? ENHANCEMENT_CONFIG[equipped.enhancementLevel - 1].statMultiplier
          : 1;

        Object.entries(equipped.item.stats).forEach(([stat, value]) => {
          const enhancedValue = value * enhancementMultiplier;
          totalStats[stat as keyof ItemStats] = 
            (totalStats[stat as keyof ItemStats] || 0) + enhancedValue;
        });
      }
    });

    // 更新实体属性
    this.entity.updateEquipmentStats(totalStats);
  }

  public getEquipment(): Map<EquipmentSlot, EquippedItem | null> {
    return new Map(this.equipment);
  }

  public getEquippedItem(slot: EquipmentSlot): EquippedItem | null {
    return this.equipment.get(slot) || null;
  }

  public clear(): void {
    this.equipment.forEach((_, slot) => {
      this.unequip(slot);
    });
  }

  public getEnhancementCost(slot: EquipmentSlot): number {
    const equipped = this.equipment.get(slot);
    if (!equipped) {
      return 0;
    }

    const nextLevel = equipped.enhancementLevel + 1;
    const config = ENHANCEMENT_CONFIG[nextLevel - 1];
    if (!config) {
      return 0;
    }

    return Math.floor(equipped.item.value * config.costMultiplier);
  }

  public getEnhancementChance(slot: EquipmentSlot): number {
    const equipped = this.equipment.get(slot);
    if (!equipped) {
      return 0;
    }

    const nextLevel = equipped.enhancementLevel + 1;
    const config = ENHANCEMENT_CONFIG[nextLevel - 1];
    if (!config) {
      return 0;
    }

    return config.successRate;
  }
} 