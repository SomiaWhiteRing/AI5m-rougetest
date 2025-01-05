import { ItemType } from './items';

export enum EquipmentSlot {
  HEAD = 'head',
  CHEST = 'chest',
  LEGS = 'legs',
  FEET = 'feet',
  MAIN_HAND = 'mainHand',
  OFF_HAND = 'offHand',
  NECKLACE = 'necklace',
  RING_1 = 'ring1',
  RING_2 = 'ring2'
}

export interface EquipmentSlotConfig {
  id: EquipmentSlot;
  name: string;
  description: string;
  allowedTypes: ItemType[];
  icon: string;
}

export const EQUIPMENT_SLOTS: Record<EquipmentSlot, EquipmentSlotConfig> = {
  [EquipmentSlot.HEAD]: {
    id: EquipmentSlot.HEAD,
    name: '头部',
    description: '头部装备槽，可以装备头盔等防具',
    allowedTypes: [ItemType.ARMOR],
    icon: 'slot_head'
  },
  [EquipmentSlot.CHEST]: {
    id: EquipmentSlot.CHEST,
    name: '胸部',
    description: '胸部装备槽，可以装备胸甲等防具',
    allowedTypes: [ItemType.ARMOR],
    icon: 'slot_chest'
  },
  [EquipmentSlot.LEGS]: {
    id: EquipmentSlot.LEGS,
    name: '腿部',
    description: '腿部装备槽，可以装备护腿等防具',
    allowedTypes: [ItemType.ARMOR],
    icon: 'slot_legs'
  },
  [EquipmentSlot.FEET]: {
    id: EquipmentSlot.FEET,
    name: '脚部',
    description: '脚部装备槽，可以装备靴子等防具',
    allowedTypes: [ItemType.ARMOR],
    icon: 'slot_feet'
  },
  [EquipmentSlot.MAIN_HAND]: {
    id: EquipmentSlot.MAIN_HAND,
    name: '主手',
    description: '主手装备槽，可以装备武器',
    allowedTypes: [ItemType.WEAPON],
    icon: 'slot_main_hand'
  },
  [EquipmentSlot.OFF_HAND]: {
    id: EquipmentSlot.OFF_HAND,
    name: '副手',
    description: '副手装备槽，可以装备武器或防具',
    allowedTypes: [ItemType.WEAPON, ItemType.ARMOR],
    icon: 'slot_off_hand'
  },
  [EquipmentSlot.NECKLACE]: {
    id: EquipmentSlot.NECKLACE,
    name: '项链',
    description: '项链装备槽，可以装备饰品',
    allowedTypes: [ItemType.ACCESSORY],
    icon: 'slot_necklace'
  },
  [EquipmentSlot.RING_1]: {
    id: EquipmentSlot.RING_1,
    name: '戒指1',
    description: '戒指装备槽，可以装备饰品',
    allowedTypes: [ItemType.ACCESSORY],
    icon: 'slot_ring'
  },
  [EquipmentSlot.RING_2]: {
    id: EquipmentSlot.RING_2,
    name: '戒指2',
    description: '戒指装备槽，可以装备饰品',
    allowedTypes: [ItemType.ACCESSORY],
    icon: 'slot_ring'
  }
};

export interface EnhancementConfig {
  level: number;
  successRate: number;
  costMultiplier: number;
  statMultiplier: number;
}

export const ENHANCEMENT_CONFIG: EnhancementConfig[] = [
  { level: 1, successRate: 1.0, costMultiplier: 1.0, statMultiplier: 1.1 },
  { level: 2, successRate: 0.9, costMultiplier: 1.2, statMultiplier: 1.2 },
  { level: 3, successRate: 0.8, costMultiplier: 1.5, statMultiplier: 1.35 },
  { level: 4, successRate: 0.7, costMultiplier: 2.0, statMultiplier: 1.5 },
  { level: 5, successRate: 0.6, costMultiplier: 2.5, statMultiplier: 1.7 },
  { level: 6, successRate: 0.5, costMultiplier: 3.0, statMultiplier: 1.9 },
  { level: 7, successRate: 0.4, costMultiplier: 4.0, statMultiplier: 2.2 },
  { level: 8, successRate: 0.3, costMultiplier: 5.0, statMultiplier: 2.5 },
  { level: 9, successRate: 0.2, costMultiplier: 7.0, statMultiplier: 3.0 },
  { level: 10, successRate: 0.1, costMultiplier: 10.0, statMultiplier: 3.5 }
]; 