import { create } from 'zustand';
import { Equipment } from '../types/equipment';
import { Material } from '../types/material';
import { EnchantManager } from '../game/managers/EnchantManager';
import { UpgradeManager } from '../game/managers/UpgradeManager';

interface MaterialWithQuantity {
  material: Material;
  quantity: number;
}

interface PlayerStats {
  level: number;
  exp: number;
  gold: number;
  // ... 其他玩家属性
}

export interface GameState {
  player: PlayerStats;
  materials: MaterialWithQuantity[];
  enchantManager: EnchantManager;
  upgradeManager: UpgradeManager;
  pendingDrops: Equipment[];
  
  // 材料相关
  removeMaterials: (materials: { material: Material; quantity: number }[]) => void;
  getMaterialQuantity: (materialId: string) => number;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: {
    level: 1,
    exp: 0,
    gold: 0,
  },
  materials: [],
  enchantManager: new EnchantManager(),
  upgradeManager: new UpgradeManager(),
  pendingDrops: [],
  
  // 材料相关
  removeMaterials: (materials: { material: Material; quantity: number }[]) =>
    set((state) => {
      const newMaterials = [...state.materials];
      materials.forEach(({ material, quantity }) => {
        const existingStack = newMaterials.find((stack) => stack.material.id === material.id);
        if (existingStack) {
          existingStack.quantity = Math.max(0, existingStack.quantity - quantity);
          if (existingStack.quantity === 0) {
            const index = newMaterials.indexOf(existingStack);
            newMaterials.splice(index, 1);
          }
        }
      });
      return { materials: newMaterials };
    }),
    
  getMaterialQuantity: (materialId: string) =>
    get().materials.find((stack) => stack.material.id === materialId)?.quantity || 0,
})); 