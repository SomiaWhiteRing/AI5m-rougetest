import { nanoid } from 'nanoid';
import { Equipment } from '../../types/equipment';
import { DropTable, DropEntry, dropTables, getEquipmentTemplate } from '../../config/dropTables';

export class DropManager {
  private killedEnemies: Set<string> = new Set();
  private enemyKillCounts: Map<string, number> = new Map();

  constructor() {
    this.loadKillHistory();
  }

  private loadKillHistory() {
    try {
      const savedKillHistory = localStorage.getItem('killHistory');
      if (savedKillHistory) {
        const { killedEnemies, enemyKillCounts } = JSON.parse(savedKillHistory);
        this.killedEnemies = new Set(killedEnemies);
        this.enemyKillCounts = new Map(Object.entries(enemyKillCounts));
      }
    } catch (error) {
      console.error('Failed to load kill history:', error);
    }
  }

  private saveKillHistory() {
    try {
      const killHistory = {
        killedEnemies: Array.from(this.killedEnemies),
        enemyKillCounts: Object.fromEntries(this.enemyKillCounts),
      };
      localStorage.setItem('killHistory', JSON.stringify(killHistory));
    } catch (error) {
      console.error('Failed to save kill history:', error);
    }
  }

  public recordKill(enemyId: string) {
    const currentCount = this.enemyKillCounts.get(enemyId) || 0;
    this.enemyKillCounts.set(enemyId, currentCount + 1);
    this.killedEnemies.add(enemyId);
    this.saveKillHistory();
  }

  private isFirstKill(enemyId: string): boolean {
    return this.enemyKillCounts.get(enemyId) === 1;
  }

  private rollDrop(entry: DropEntry): boolean {
    return Math.random() < entry.chance;
  }

  private getRandomQuantity(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private createEquipment(templateId: string): Equipment | null {
    const template = getEquipmentTemplate(templateId);
    if (!template) {
      console.error(`Equipment template not found: ${templateId}`);
      return null;
    }

    return {
      id: nanoid(),
      enhanceLevel: 0,
      ...template,
    } as Equipment;
  }

  public generateDrops(enemyId: string, playerLevel: number): Equipment[] {
    const dropTable = dropTables[enemyId];
    if (!dropTable) {
      console.error(`Drop table not found for enemy: ${enemyId}`);
      return [];
    }

    // 检查等级需求
    if (dropTable.levelRequirement && playerLevel < dropTable.levelRequirement) {
      return [];
    }

    const drops: Equipment[] = [];

    // 处理首次击杀掉落
    if (this.isFirstKill(enemyId) && dropTable.firstKillDrops) {
      for (const entry of dropTable.firstKillDrops) {
        if (this.rollDrop(entry)) {
          const quantity = this.getRandomQuantity(entry.minQuantity, entry.maxQuantity);
          for (let i = 0; i < quantity; i++) {
            const equipment = this.createEquipment(entry.itemId);
            if (equipment) {
              drops.push(equipment);
            }
          }
        }
      }
    }

    // 处理保底掉落
    if (dropTable.guaranteedDrops) {
      for (const entry of dropTable.guaranteedDrops) {
        const quantity = this.getRandomQuantity(entry.minQuantity, entry.maxQuantity);
        for (let i = 0; i < quantity; i++) {
          const equipment = this.createEquipment(entry.itemId);
          if (equipment) {
            drops.push(equipment);
          }
        }
      }
    }

    // 处理随机掉落
    for (const entry of dropTable.drops) {
      if (this.rollDrop(entry)) {
        const quantity = this.getRandomQuantity(entry.minQuantity, entry.maxQuantity);
        for (let i = 0; i < quantity; i++) {
          const equipment = this.createEquipment(entry.itemId);
          if (equipment) {
            drops.push(equipment);
          }
        }
      }
    }

    return drops;
  }

  public getKillCount(enemyId: string): number {
    return this.enemyKillCounts.get(enemyId) || 0;
  }

  public hasKilled(enemyId: string): boolean {
    return this.killedEnemies.has(enemyId);
  }

  public clearHistory() {
    this.killedEnemies.clear();
    this.enemyKillCounts.clear();
    this.saveKillHistory();
  }
} 