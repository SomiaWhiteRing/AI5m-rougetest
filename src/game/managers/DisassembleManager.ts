import { Equipment } from '../../types/equipment';
import { Material, materials, disassembleRules } from '../../config/materialConfig';

export interface DisassembleResult {
  materials: {
    material: Material;
    quantity: number;
  }[];
}

export class DisassembleManager {
  // 预览分解结果
  public previewDisassemble(equipment: Equipment): DisassembleResult {
    const rule = disassembleRules[equipment.quality];
    if (!rule) {
      return { materials: [] };
    }

    const result: DisassembleResult = {
      materials: [],
    };

    rule.materials.forEach(({ id, minQuantity, maxQuantity }) => {
      const material = materials[id];
      if (material) {
        // 预览时使用平均值
        const averageQuantity = Math.floor((minQuantity + maxQuantity) / 2);
        result.materials.push({
          material,
          quantity: averageQuantity,
        });
      }
    });

    return result;
  }

  // 执行分解
  public disassemble(equipment: Equipment): DisassembleResult {
    const rule = disassembleRules[equipment.quality];
    if (!rule) {
      return { materials: [] };
    }

    const result: DisassembleResult = {
      materials: [],
    };

    rule.materials.forEach(({ id, minQuantity, maxQuantity, chance }) => {
      if (Math.random() < chance) {
        const material = materials[id];
        if (material) {
          const quantity = Math.floor(Math.random() * (maxQuantity - minQuantity + 1)) + minQuantity;
          result.materials.push({
            material,
            quantity,
          });
        }
      }
    });

    return result;
  }

  // 批量分解
  public batchDisassemble(equipments: Equipment[]): DisassembleResult {
    const results = equipments.map(equipment => this.disassemble(equipment));
    
    // 合并所有结果
    const mergedResult: DisassembleResult = {
      materials: [],
    };

    results.forEach(result => {
      result.materials.forEach(({ material, quantity }) => {
        const existingMaterial = mergedResult.materials.find(m => m.material.id === material.id);
        if (existingMaterial) {
          existingMaterial.quantity += quantity;
        } else {
          mergedResult.materials.push({ material, quantity });
        }
      });
    });

    return mergedResult;
  }

  // 预览批量分解
  public previewBatchDisassemble(equipments: Equipment[]): DisassembleResult {
    const results = equipments.map(equipment => this.previewDisassemble(equipment));
    
    // 合并所有预览结果
    const mergedResult: DisassembleResult = {
      materials: [],
    };

    results.forEach(result => {
      result.materials.forEach(({ material, quantity }) => {
        const existingMaterial = mergedResult.materials.find(m => m.material.id === material.id);
        if (existingMaterial) {
          existingMaterial.quantity += quantity;
        } else {
          mergedResult.materials.push({ material, quantity });
        }
      });
    });

    return mergedResult;
  }

  // 获取装备的分解价值
  public getDisassembleValue(equipment: Equipment): number {
    const result = this.previewDisassemble(equipment);
    return result.materials.reduce((total, { material, quantity }) => {
      // 根据材料品质计算价值
      const baseValue = Math.pow(10, material.quality - 1);
      return total + baseValue * quantity;
    }, 0);
  }

  // 获取批量分解的总价值
  public getBatchDisassembleValue(equipments: Equipment[]): number {
    return equipments.reduce((total, equipment) => {
      return total + this.getDisassembleValue(equipment);
    }, 0);
  }
} 