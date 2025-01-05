import { Entity } from '../entities/Entity';
import { AchievementState } from './AchievementManager';
import { LevelState } from './LevelManager';

export interface PlayerSaveData {
  level: number;
  experience: number;
  gold: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  skills: string[];
  inventory: Array<{
    id: string;
    count: number;
  }>;
  equipment: Record<string, string>;
  position: {
    x: number;
    y: number;
  };
}

export interface GameSaveData {
  version: string;
  timestamp: number;
  player: PlayerSaveData;
  achievements: AchievementState;
  currentLevel?: LevelState;
  settings: {
    musicVolume: number;
    sfxVolume: number;
    isMusicMuted: boolean;
    isSfxMuted: boolean;
  };
}

export class SaveManager {
  private static readonly SAVE_VERSION = '1.0.0';
  private static readonly AUTO_SAVE_KEY = 'roguelike_autosave';
  private static readonly MAX_MANUAL_SAVES = 5;

  // 自动保存
  autoSave(
    player: Entity,
    achievements: AchievementState,
    currentLevel?: LevelState,
    settings?: any
  ): void {
    const saveData = this.createSaveData(player, achievements, currentLevel, settings);
    try {
      localStorage.setItem(SaveManager.AUTO_SAVE_KEY, JSON.stringify(saveData));
      console.log('自动保存成功');
    } catch (error) {
      console.error('自动保存失败:', error);
    }
  }

  // 手动保存
  manualSave(
    slot: number,
    player: Entity,
    achievements: AchievementState,
    currentLevel?: LevelState,
    settings?: any
  ): boolean {
    if (slot < 1 || slot > SaveManager.MAX_MANUAL_SAVES) {
      console.error('无效的存档槽位');
      return false;
    }

    const saveData = this.createSaveData(player, achievements, currentLevel, settings);
    const key = `roguelike_save_${slot}`;

    try {
      localStorage.setItem(key, JSON.stringify(saveData));
      console.log(`存档${slot}保存成功`);
      return true;
    } catch (error) {
      console.error(`存档${slot}保存失败:`, error);
      return false;
    }
  }

  // 加载自动存档
  loadAutoSave(): GameSaveData | null {
    try {
      const saveData = localStorage.getItem(SaveManager.AUTO_SAVE_KEY);
      if (!saveData) return null;

      const parsedData = JSON.parse(saveData) as GameSaveData;
      if (this.validateSaveData(parsedData)) {
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('加载自动存档失败:', error);
      return null;
    }
  }

  // 加载手动存档
  loadManualSave(slot: number): GameSaveData | null {
    if (slot < 1 || slot > SaveManager.MAX_MANUAL_SAVES) {
      console.error('无效的存档槽位');
      return null;
    }

    try {
      const saveData = localStorage.getItem(`roguelike_save_${slot}`);
      if (!saveData) return null;

      const parsedData = JSON.parse(saveData) as GameSaveData;
      if (this.validateSaveData(parsedData)) {
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error(`加载存档${slot}失败:`, error);
      return null;
    }
  }

  // 获取所有存档信息
  getAllSaves(): Array<{ slot: number; data: GameSaveData | null }> {
    const saves: Array<{ slot: number; data: GameSaveData | null }> = [];

    // 获取自动存档
    saves.push({
      slot: 0,
      data: this.loadAutoSave()
    });

    // 获取手动存档
    for (let i = 1; i <= SaveManager.MAX_MANUAL_SAVES; i++) {
      saves.push({
        slot: i,
        data: this.loadManualSave(i)
      });
    }

    return saves;
  }

  // 删除存档
  deleteSave(slot: number): boolean {
    if (slot < 0 || slot > SaveManager.MAX_MANUAL_SAVES) {
      console.error('无效的存档槽位');
      return false;
    }

    const key = slot === 0 ? SaveManager.AUTO_SAVE_KEY : `roguelike_save_${slot}`;
    try {
      localStorage.removeItem(key);
      console.log(`存档${slot}删除成功`);
      return true;
    } catch (error) {
      console.error(`存档${slot}删除失败:`, error);
      return false;
    }
  }

  // 创建存档数据
  private createSaveData(
    player: Entity,
    achievements: AchievementState,
    currentLevel?: LevelState,
    settings?: any
  ): GameSaveData {
    return {
      version: SaveManager.SAVE_VERSION,
      timestamp: Date.now(),
      player: {
        level: player.getLevel(),
        experience: player.getExperience(),
        gold: player.getGold(),
        hp: player.getHp(),
        maxHp: player.getMaxHp(),
        mana: player.getMana(),
        maxMana: player.getMaxMana(),
        skills: player.getSkills(),
        inventory: player.getInventory(),
        equipment: player.getEquipment(),
        position: {
          x: player.x,
          y: player.y
        }
      },
      achievements,
      currentLevel,
      settings: settings || {
        musicVolume: 0.5,
        sfxVolume: 0.5,
        isMusicMuted: false,
        isSfxMuted: false
      }
    };
  }

  // 验证存档数据
  private validateSaveData(data: GameSaveData): boolean {
    // 检查版本兼容性
    if (!data.version || data.version !== SaveManager.SAVE_VERSION) {
      console.error('存档版本不兼容');
      return false;
    }

    // 检查必要字段
    if (!data.player || !data.achievements || !data.timestamp) {
      console.error('存档数据不完整');
      return false;
    }

    // 检查玩家数据完整性
    const requiredPlayerFields = [
      'level',
      'experience',
      'gold',
      'hp',
      'maxHp',
      'mana',
      'maxMana',
      'skills',
      'inventory',
      'equipment',
      'position'
    ];

    for (const field of requiredPlayerFields) {
      if (!(field in data.player)) {
        console.error(`玩家数据缺少字段: ${field}`);
        return false;
      }
    }

    return true;
  }
} 