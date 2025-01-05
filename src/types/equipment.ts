export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'necklace';

export interface Equipment {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  icon: string;
  quality: number; // 1: 普通, 2: 优秀, 3: 稀有, 4: 史诗, 5: 传说
  enhanceLevel: number;
  attack?: number;
  defense?: number;
  hp?: number;
  mp?: number;
  critRate?: number;
  critDamage?: number;
  effects?: EquipmentEffect[];
}

export interface EquipmentEffect {
  type: 'passive' | 'active';
  name: string;
  description: string;
  trigger?: 'onHit' | 'onDamaged' | 'onKill' | 'onHeal';
  chance?: number;
  cooldown?: number;
  stats?: Partial<EquipmentStats>;
}

export interface EquipmentStats {
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  critRate: number;
  critDamage: number;
  elementalDamage?: {
    type: 'fire' | 'ice' | 'lightning' | 'poison';
    value: number;
  };
} 