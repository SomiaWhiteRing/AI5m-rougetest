import { Entity, EntityState } from '../entities/Entity';
import { Item } from '../entities/Item';
import { Effect } from '../effects/Effect';
import * as pako from 'pako';
import * as CryptoJS from 'crypto-js';

export interface SaveData {
  version: string;
  name: string;
  player: EntityState;
  items: {
    type: string;
    quantity: number;
    durability?: number;
    effects?: Effect[];
  }[];
}

export class SaveSystem {
  private readonly CURRENT_VERSION = '1.0.0';
  private readonly MIN_COMPATIBLE_VERSION = '1.0.0';

  getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }

  createSave(name: string, player: Entity, items: Item[]): SaveData {
    return {
      version: this.CURRENT_VERSION,
      name,
      player: player.getState(),
      items: items.map(item => ({
        type: item.getType(),
        quantity: item.getQuantity(),
        durability: item.getDurability(),
        effects: item.getConfig().effects,
      })),
    };
  }

  saveToDisk(saveData: SaveData): void {
    try {
      const compressed = this.compressSave(saveData);
      localStorage.setItem(saveData.name, compressed);
    } catch (error) {
      console.error('Failed to save game:', error);
      throw new Error('Failed to save game');
    }
  }

  loadFromDisk(name: string): SaveData | null {
    try {
      const compressed = localStorage.getItem(name);
      if (!compressed) {
        return null;
      }

      const saveData = this.decompressSave(compressed);
      if (!this.isVersionCompatible(saveData.version)) {
        throw new Error('Incompatible save version');
      }

      if (saveData.version !== this.CURRENT_VERSION) {
        return this.upgradeSaveData(saveData);
      }

      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      throw new Error('Failed to load game');
    }
  }

  deleteSave(name: string): void {
    localStorage.removeItem(name);
  }

  compressSave(saveData: SaveData): string {
    const jsonString = JSON.stringify(saveData);
    const compressed = pako.deflate(jsonString, { to: 'string' });
    return btoa(compressed);
  }

  decompressSave(compressed: string): SaveData {
    const decompressed = pako.inflate(atob(compressed), { to: 'string' });
    return JSON.parse(decompressed);
  }

  encryptSave(saveData: SaveData, password: string): string {
    const jsonString = JSON.stringify(saveData);
    return CryptoJS.AES.encrypt(jsonString, password).toString();
  }

  decryptSave(encrypted: string, password: string): SaveData {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, password);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      if (!jsonString) {
        throw new Error('Invalid password');
      }
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Failed to decrypt save data');
    }
  }

  private isVersionCompatible(version: string): boolean {
    return version >= this.MIN_COMPATIBLE_VERSION;
  }

  private upgradeSaveData(saveData: SaveData): SaveData {
    // 实现版本升级逻辑
    const upgraded = { ...saveData };
    upgraded.version = this.CURRENT_VERSION;

    // 根据版本差异执行不同的升级操作
    switch (saveData.version) {
      case '1.0.0':
        // 当前版本无需升级
        break;
      default:
        throw new Error(`Unknown save version: ${saveData.version}`);
    }

    return upgraded;
  }
}