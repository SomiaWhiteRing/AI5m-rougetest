import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SaveSystem } from '../../game/systems/SaveSystem';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { Entity } from '../../game/entities/Entity';
import { Item } from '../../game/entities/Item';
import { ItemType } from '../../game/types/ItemType';

describe('SaveSystem', () => {
  let saveSystem: SaveSystem;
  let testData: TestDataGenerator;
  let player: Entity;
  let items: Item[];

  beforeEach(() => {
    testData = new TestDataGenerator();
    player = testData.createMockEntity();
    items = [
      testData.createMockItem(ItemType.WEAPON),
      testData.createMockItem(ItemType.ARMOR),
      testData.createMockItem(ItemType.CONSUMABLE),
    ];
    saveSystem = new SaveSystem();
  });

  afterEach(() => {
    // 清理本地存储
    localStorage.clear();
  });

  describe('基础存档测试', () => {
    it('应该正确创建存档', () => {
      const saveData = saveSystem.createSave('test_save', player, items);
      expect(saveData).toBeDefined();
      expect(saveData.name).toBe('test_save');
      expect(saveData.player).toBeDefined();
      expect(saveData.items).toHaveLength(items.length);
    });

    it('应该正确加载存档', () => {
      const saveData = saveSystem.createSave('test_save', player, items);
      saveSystem.saveToDisk(saveData);

      const loadedData = saveSystem.loadFromDisk('test_save');
      expect(loadedData).toBeDefined();
      expect(loadedData.name).toBe(saveData.name);
      expect(loadedData.player.health).toBe(saveData.player.health);
      expect(loadedData.items).toHaveLength(saveData.items.length);
    });

    it('应该正确删除存档', () => {
      const saveData = saveSystem.createSave('test_save', player, items);
      saveSystem.saveToDisk(saveData);

      saveSystem.deleteSave('test_save');
      const loadedData = saveSystem.loadFromDisk('test_save');
      expect(loadedData).toBeNull();
    });
  });

  describe('存档数据完整性测试', () => {
    it('应该正确保存玩家状态', () => {
      player.takeDamage(30);
      player.gainExperience(100);
      player.addShield(20);

      const saveData = saveSystem.createSave('test_save', player, items);
      saveSystem.saveToDisk(saveData);

      const loadedData = saveSystem.loadFromDisk('test_save');
      expect(loadedData.player.health).toBe(player.getState().health);
      expect(loadedData.player.level).toBe(player.getState().level);
      expect(loadedData.player.shield).toBe(player.getState().shield);
    });

    it('应该正确保存物品状态', () => {
      items[0].useDurability(20);
      items[1].setQuantity(5);

      const saveData = saveSystem.createSave('test_save', player, items);
      saveSystem.saveToDisk(saveData);

      const loadedData = saveSystem.loadFromDisk('test_save');
      expect(loadedData.items[0].durability).toBe(items[0].getDurability());
      expect(loadedData.items[1].quantity).toBe(items[1].getQuantity());
    });

    it('应该正确保存效果状态', () => {
      const effect = testData.createRandomEffect();
      player.addEffect(effect);

      const saveData = saveSystem.createSave('test_save', player, items);
      saveSystem.saveToDisk(saveData);

      const loadedData = saveSystem.loadFromDisk('test_save');
      expect(loadedData.player.effects).toHaveLength(1);
      expect(loadedData.player.effects[0].type).toBe(effect.type);
    });
  });

  describe('存档版本控制测试', () => {
    it('应该正确处理版本升级', () => {
      const oldVersionData = {
        version: '1.0.0',
        name: 'test_save',
        player: player.getState(),
        items: items.map(item => ({
          type: item.getType(),
          quantity: item.getQuantity(),
        })),
      };

      localStorage.setItem('test_save', JSON.stringify(oldVersionData));
      const loadedData = saveSystem.loadFromDisk('test_save');
      expect(loadedData.version).toBe(saveSystem.getCurrentVersion());
    });

    it('应该拒绝加载不兼容的版本', () => {
      const incompatibleData = {
        version: '0.1.0',
        name: 'test_save',
        player: {},
        items: [],
      };

      localStorage.setItem('test_save', JSON.stringify(incompatibleData));
      expect(() => saveSystem.loadFromDisk('test_save')).toThrow();
    });
  });

  describe('存档压缩测试', () => {
    it('应该正确压缩和解压存档数据', () => {
      const saveData = saveSystem.createSave('test_save', player, items);
      const compressed = saveSystem.compressSave(saveData);
      expect(compressed.length).toBeLessThan(JSON.stringify(saveData).length);

      const decompressed = saveSystem.decompressSave(compressed);
      expect(decompressed).toEqual(saveData);
    });
  });

  describe('存档加密测试', () => {
    it('应该正确加密和解密存档数据', () => {
      const saveData = saveSystem.createSave('test_save', player, items);
      const encrypted = saveSystem.encryptSave(saveData, 'password');
      expect(encrypted).not.toEqual(JSON.stringify(saveData));

      const decrypted = saveSystem.decryptSave(encrypted, 'password');
      expect(decrypted).toEqual(saveData);
    });

    it('应该拒绝使用错误密码解密', () => {
      const saveData = saveSystem.createSave('test_save', player, items);
      const encrypted = saveSystem.encryptSave(saveData, 'password');

      expect(() => saveSystem.decryptSave(encrypted, 'wrong_password')).toThrow();
    });
  });
});