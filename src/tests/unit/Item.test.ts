import { describe, it, expect, beforeEach } from 'vitest';
import { Item } from '../../game/entities/Item';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { ItemType } from '../../game/types/ItemType';
import { Entity } from '../../game/entities/Entity';

describe('Item', () => {
  let testData: TestDataGenerator;
  let item: Item;
  let user: Entity;

  beforeEach(() => {
    testData = new TestDataGenerator();
    item = testData.createMockItem();
    user = testData.createMockEntity();
  });

  describe('基础属性测试', () => {
    it('应该正确初始化物品属性', () => {
      expect(item.getType()).toBeDefined();
      expect(item.getQuantity()).toBe(1);
      expect(item.getMaxStack()).toBeGreaterThan(0);
    });

    it('应该正确设置物品数量', () => {
      item.setQuantity(5);
      expect(item.getQuantity()).toBe(5);
    });

    it('不应该超过最大堆叠数量', () => {
      const maxStack = item.getMaxStack();
      item.setQuantity(maxStack + 10);
      expect(item.getQuantity()).toBe(maxStack);
    });
  });

  describe('堆叠系统测试', () => {
    it('应该正确堆叠物品', () => {
      const item2 = testData.createMockItem();
      item2.setType(item.getType());

      const success = item.stack(item2);
      expect(success).toBe(true);
      expect(item.getQuantity()).toBe(2);
    });

    it('不应该堆叠不同类型的物品', () => {
      const item2 = testData.createMockItem();
      item2.setType(ItemType.WEAPON); // 设置不同的类型

      const success = item.stack(item2);
      expect(success).toBe(false);
      expect(item.getQuantity()).toBe(1);
    });

    it('应该正确处理最大堆叠限制', () => {
      const maxStack = item.getMaxStack();
      item.setQuantity(maxStack);
      const item2 = testData.createMockItem();
      item2.setType(item.getType());

      const success = item.stack(item2);
      expect(success).toBe(false);
      expect(item.getQuantity()).toBe(maxStack);
    });
  });

  describe('使用效果测试', () => {
    it('应该正确使用消耗品', () => {
      const healingPotion = testData.createMockItem(ItemType.CONSUMABLE);
      const initialHealth = user.getState().health;
      user.takeDamage(50);

      healingPotion.use(user);
      expect(user.getState().health).toBeGreaterThan(initialHealth - 50);
    });

    it('应该正确应用装备效果', () => {
      const armor = testData.createMockItem(ItemType.ARMOR);
      const initialDefense = user.getState().defense;

      armor.equip(user);
      expect(user.getState().defense).toBeGreaterThan(initialDefense);
    });

    it('应该正确移除装备效果', () => {
      const armor = testData.createMockItem(ItemType.ARMOR);
      armor.equip(user);
      const withArmorDefense = user.getState().defense;

      armor.unequip(user);
      expect(user.getState().defense).toBeLessThan(withArmorDefense);
    });
  });

  describe('耐久度系统测试', () => {
    it('应该正确初始化耐久度', () => {
      const weapon = testData.createMockItem(ItemType.WEAPON);
      expect(weapon.getDurability()).toBe(weapon.getMaxDurability());
    });

    it('应该正确消耗耐久度', () => {
      const weapon = testData.createMockItem(ItemType.WEAPON);
      const initialDurability = weapon.getDurability();

      weapon.useDurability(10);
      expect(weapon.getDurability()).toBe(initialDurability - 10);
    });

    it('应该正确处理耐久度为0的情况', () => {
      const weapon = testData.createMockItem(ItemType.WEAPON);
      weapon.useDurability(weapon.getMaxDurability());

      expect(weapon.getDurability()).toBe(0);
      expect(weapon.isBroken()).toBe(true);
    });

    it('应该正确修复耐久度', () => {
      const weapon = testData.createMockItem(ItemType.WEAPON);
      weapon.useDurability(50);
      const damagedDurability = weapon.getDurability();

      weapon.repair(20);
      expect(weapon.getDurability()).toBe(damagedDurability + 20);
    });
  });
});