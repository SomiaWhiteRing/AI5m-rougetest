import { Scene } from 'phaser';
import { ItemType } from '../types/ItemType';
import { Effect } from '../effects/Effect';
import { Entity } from './Entity';

export interface ItemConfig {
  id: string;
  name: string;
  type: ItemType;
  maxStack: number;
  maxDurability: number;
  effects: Effect[];
}

export class Item extends Phaser.Physics.Arcade.Sprite {
  private config: ItemConfig;
  private quantity: number = 1;
  private durability: number;

  constructor(scene: Scene, x: number, y: number, config: ItemConfig) {
    super(scene, x, y, config.id);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.config = config;
    this.durability = config.maxDurability;
  }

  getConfig(): ItemConfig {
    return { ...this.config };
  }

  getType(): ItemType {
    return this.config.type;
  }

  setType(type: ItemType): void {
    this.config.type = type;
  }

  getQuantity(): number {
    return this.quantity;
  }

  setQuantity(amount: number): void {
    this.quantity = Math.min(amount, this.getMaxStack());
  }

  getMaxStack(): number {
    return this.config.maxStack;
  }

  stack(item: Item): boolean {
    if (item.getType() !== this.getType()) {
      return false;
    }

    if (this.quantity >= this.getMaxStack()) {
      return false;
    }

    const totalQuantity = this.quantity + item.getQuantity();
    if (totalQuantity <= this.getMaxStack()) {
      this.quantity = totalQuantity;
      item.setQuantity(0);
      return true;
    } else {
      const remaining = totalQuantity - this.getMaxStack();
      this.quantity = this.getMaxStack();
      item.setQuantity(remaining);
      return true;
    }
  }

  getDurability(): number {
    return this.durability;
  }

  getMaxDurability(): number {
    return this.config.maxDurability;
  }

  useDurability(amount: number): void {
    this.durability = Math.max(0, this.durability - amount);
  }

  repair(amount: number): void {
    this.durability = Math.min(this.config.maxDurability, this.durability + amount);
  }

  isBroken(): boolean {
    return this.durability <= 0;
  }

  use(target: Entity): void {
    if (this.isBroken()) {
      return;
    }

    switch (this.config.type) {
      case ItemType.CONSUMABLE:
        this.applyEffects(target);
        this.quantity--;
        break;
      case ItemType.WEAPON:
      case ItemType.ARMOR:
        this.equip(target);
        break;
    }
  }

  equip(target: Entity): void {
    if (this.isBroken()) {
      return;
    }

    this.applyEffects(target);
  }

  unequip(target: Entity): void {
    this.removeEffects(target);
  }

  private applyEffects(target: Entity): void {
    this.config.effects.forEach(effect => {
      target.addEffect(effect);
    });
  }

  private removeEffects(target: Entity): void {
    this.config.effects.forEach(effect => {
      target.removeEffect(effect.type);
    });
  }
}