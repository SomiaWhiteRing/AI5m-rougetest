export interface Material {
  id: string;
  name: string;
  description: string;
  icon: string;
  quality: number;
  stackable: boolean;
  maxStack: number;
  value: number;
  type: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'metal' | 'cloth' | 'leather' | 'gem' | 'magical' | 'other';
}

export interface MaterialRecipe {
  id: string;
  name: string;
  description: string;
  materials: {
    material: Material;
    quantity: number;
  }[];
  result: {
    material: Material;
    quantity: number;
  };
  goldCost: number;
  successRate: number;
  unlockLevel: number;
}

export interface MaterialEffect {
  id: string;
  name: string;
  description: string;
  type: 'buff' | 'debuff' | 'special';
  duration: number;
  stats: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    critRate?: number;
    critDamage?: number;
  };
} 