import { ItemConfig, ItemType, ITEMS } from '../../config/items';
import { Entity } from '../entities/Entity';

export interface InventorySlot {
  item: ItemConfig;
  quantity: number;
}

export class ItemManager {
  private inventory: Map<string, InventorySlot>;
  private maxSlots: number;

  constructor(maxSlots: number = 20) {
    this.inventory = new Map();
    this.maxSlots = maxSlots;
  }

  public addItem(itemId: string, quantity: number = 1): boolean {
    const item = ITEMS[itemId];
    if (!item) {
      console.error(`Item ${itemId} not found`);
      return false;
    }

    if (this.inventory.size >= this.maxSlots && !this.inventory.has(itemId)) {
      console.error('Inventory is full');
      return false;
    }

    const existingSlot = this.inventory.get(itemId);
    if (existingSlot) {
      if (item.stackable && existingSlot.quantity < (item.maxStack || Infinity)) {
        const newQuantity = Math.min(
          existingSlot.quantity + quantity,
          item.maxStack || Infinity
        );
        this.inventory.set(itemId, {
          item,
          quantity: newQuantity
        });
        return true;
      } else if (!item.stackable) {
        console.error('Cannot stack non-stackable items');
        return false;
      }
    } else {
      this.inventory.set(itemId, {
        item,
        quantity
      });
      return true;
    }

    return false;
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    const slot = this.inventory.get(itemId);
    if (!slot || slot.quantity < quantity) {
      return false;
    }

    if (slot.quantity === quantity) {
      this.inventory.delete(itemId);
    } else {
      this.inventory.set(itemId, {
        item: slot.item,
        quantity: slot.quantity - quantity
      });
    }

    return true;
  }

  public useItem(itemId: string, target: Entity): boolean {
    const slot = this.inventory.get(itemId);
    if (!slot || slot.quantity < 1) {
      return false;
    }

    const item = slot.item;
    if (item.type === ItemType.CONSUMABLE && item.effects) {
      for (const effect of item.effects) {
        switch (effect.type) {
          case 'heal':
            target.heal(effect.value);
            break;
          case 'restoreMana':
            target.restoreMana(effect.value);
            break;
          default:
            console.warn(`Unknown effect type: ${effect.type}`);
            return false;
        }
      }

      this.removeItem(itemId, 1);
      return true;
    }

    return false;
  }

  public getInventory(): Map<string, InventorySlot> {
    return new Map(this.inventory);
  }

  public hasItem(itemId: string, quantity: number = 1): boolean {
    const slot = this.inventory.get(itemId);
    return slot ? slot.quantity >= quantity : false;
  }

  public getItemQuantity(itemId: string): number {
    const slot = this.inventory.get(itemId);
    return slot ? slot.quantity : 0;
  }

  public clear(): void {
    this.inventory.clear();
  }

  public getMaxSlots(): number {
    return this.maxSlots;
  }

  public getCurrentSlots(): number {
    return this.inventory.size;
  }

  public isFull(): boolean {
    return this.inventory.size >= this.maxSlots;
  }
} 