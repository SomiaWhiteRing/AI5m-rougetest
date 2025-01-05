import { Scene } from 'phaser';
import { ErrorManager, ErrorSeverity } from './ErrorManager';

export interface SaveData {
  version: string;
  timestamp: number;
  player: {
    level: number;
    experience: number;
    gold: number;
    stats: {
      hp: number;
      mp: number;
      attack: number;
      defense: number;
      critRate: number;
      critDamage: number;
    };
    equipment: Record<string, any>;
    inventory: Array<any>;
    skills: Array<any>;
  };
  gameState: {
    currentScene: string;
    completedQuests: string[];
    unlockedAchievements: string[];
    discoveredLocations: string[];
    killCount: Record<string, number>;
    playTime: number;
  };
  settings: {
    soundVolume: number;
    musicVolume: number;
    particleEffects: boolean;
    screenShake: boolean;
    autoSave: boolean;
  };
}

export class PersistenceManager {
  private scene: Scene;
  private errorManager: ErrorManager;
  private autoSaveInterval: number = 5 * 60 * 1000; // 5分钟
  private maxSaveSlots: number = 10;
  private currentVersion: string = '1.0.0';
  private autoSaveTimer: number | null = null;

  constructor(scene: Scene, errorManager: ErrorManager) {
    this.scene = scene;
    this.errorManager = errorManager;
    this.initializeAutoSave();
  }

  private initializeAutoSave() {
    const settings = this.loadSettings();
    if (settings.autoSave) {
      this.startAutoSave();
    }
  }

  private startAutoSave() {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
    }
    this.autoSaveTimer = window.setInterval(() => {
      this.autoSave();
    }, this.autoSaveInterval);
  }

  private stopAutoSave() {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private async autoSave() {
    try {
      const saveData = this.createSaveData();
      await this.save('autosave', saveData);
      console.log('Auto save completed');
    } catch (error: any) {
      this.errorManager.handleError({
        id: 'autosave_error',
        message: '自动保存失败',
        severity: ErrorSeverity.LOW,
        timestamp: Date.now(),
        context: error
      });
    }
  }

  public async save(slot: string, data?: SaveData): Promise<void> {
    try {
      const saveData = data || this.createSaveData();
      const serializedData = JSON.stringify(saveData);
      const compressedData = await this.compressData(serializedData);
      
      localStorage.setItem(`save_${slot}`, compressedData);
      localStorage.setItem(`save_${slot}_meta`, JSON.stringify({
        timestamp: saveData.timestamp,
        version: saveData.version,
        playerLevel: saveData.player.level,
        playTime: saveData.gameState.playTime
      }));
    } catch (error: any) {
      throw new Error(`保存失败: ${error.message}`);
    }
  }

  public async load(slot: string): Promise<SaveData> {
    try {
      const compressedData = localStorage.getItem(`save_${slot}`);
      if (!compressedData) {
        throw new Error('存档不存在');
      }

      const serializedData = await this.decompressData(compressedData);
      let saveData = JSON.parse(serializedData) as SaveData;

      if (!this.validateSaveData(saveData)) {
        throw new Error('存档数据无效');
      }

      if (saveData.version !== this.currentVersion) {
        saveData = await this.migrateSaveData(saveData);
      }

      return saveData;
    } catch (error: any) {
      throw new Error(`加载失败: ${error.message}`);
    }
  }

  public async delete(slot: string): Promise<void> {
    try {
      localStorage.removeItem(`save_${slot}`);
      localStorage.removeItem(`save_${slot}_meta`);
    } catch (error: any) {
      throw new Error(`删除失败: ${error.message}`);
    }
  }

  public getSaveSlots(): Array<{
    slot: string;
    meta: {
      timestamp: number;
      version: string;
      playerLevel: number;
      playTime: number;
    };
  }> {
    const slots = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('save_') && key.endsWith('_meta')) {
        const slot = key.replace('save_', '').replace('_meta', '');
        const meta = JSON.parse(localStorage.getItem(key) || '{}');
        slots.push({ slot, meta });
      }
    }
    return slots.sort((a, b) => b.meta.timestamp - a.meta.timestamp);
  }

  private createSaveData(): SaveData {
    const gameRegistry = this.scene.game.registry;
    return {
      version: this.currentVersion,
      timestamp: Date.now(),
      player: {
        level: gameRegistry.get('playerLevel'),
        experience: gameRegistry.get('playerExperience'),
        gold: gameRegistry.get('playerGold'),
        stats: {
          hp: gameRegistry.get('playerHp'),
          mp: gameRegistry.get('playerMp'),
          attack: gameRegistry.get('playerAttack'),
          defense: gameRegistry.get('playerDefense'),
          critRate: gameRegistry.get('playerCritRate'),
          critDamage: gameRegistry.get('playerCritDamage'),
        },
        equipment: gameRegistry.get('playerEquipment'),
        inventory: gameRegistry.get('playerInventory'),
        skills: gameRegistry.get('playerSkills'),
      },
      gameState: {
        currentScene: this.scene.scene.key,
        completedQuests: gameRegistry.get('completedQuests'),
        unlockedAchievements: gameRegistry.get('unlockedAchievements'),
        discoveredLocations: gameRegistry.get('discoveredLocations'),
        killCount: gameRegistry.get('killCount'),
        playTime: gameRegistry.get('playTime'),
      },
      settings: this.loadSettings(),
    };
  }

  private validateSaveData(data: SaveData): boolean {
    // 基本结构验证
    if (!data || typeof data !== 'object') return false;
    if (!data.version || !data.timestamp) return false;
    if (!data.player || !data.gameState || !data.settings) return false;

    // 玩家数据验证
    const { player } = data;
    if (typeof player.level !== 'number' || player.level < 1) return false;
    if (typeof player.experience !== 'number' || player.experience < 0) return false;
    if (typeof player.gold !== 'number' || player.gold < 0) return false;

    // 游戏状态验证
    const { gameState } = data;
    if (!Array.isArray(gameState.completedQuests)) return false;
    if (!Array.isArray(gameState.unlockedAchievements)) return false;
    if (!Array.isArray(gameState.discoveredLocations)) return false;
    if (typeof gameState.playTime !== 'number' || gameState.playTime < 0) return false;

    return true;
  }

  private async migrateSaveData(data: SaveData): Promise<SaveData> {
    const oldVersion = data.version;
    const newVersion = this.currentVersion;

    // 版本迁移逻辑
    switch (oldVersion) {
      case '0.9.0':
        // 迁移到1.0.0
        data = await this.migrateTo100(data);
        break;
      // 添加更多版本迁移逻辑
    }

    data.version = newVersion;
    return data;
  }

  private async migrateTo100(data: SaveData): Promise<SaveData> {
    // 示例迁移逻辑
    if (!data.player.stats.critRate) {
      data.player.stats.critRate = 0.05;
    }
    if (!data.player.stats.critDamage) {
      data.player.stats.critDamage = 0.5;
    }
    return data;
  }

  private async compressData(data: string): Promise<string> {
    // 这里可以添加数据压缩逻辑
    // 示例：使用Base64编码
    return btoa(data);
  }

  private async decompressData(data: string): Promise<string> {
    // 这里可以添加数据解压逻辑
    // 示例：使用Base64解码
    return atob(data);
  }

  private loadSettings(): SaveData['settings'] {
    const defaultSettings = {
      soundVolume: 0.7,
      musicVolume: 0.5,
      particleEffects: true,
      screenShake: true,
      autoSave: true,
    };

    try {
      const savedSettings = localStorage.getItem('gameSettings');
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  public destroy() {
    this.stopAutoSave();
  }
} 