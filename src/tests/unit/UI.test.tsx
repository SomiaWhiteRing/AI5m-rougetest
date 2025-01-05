import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthBar } from '../../components/HealthBar';
import { Inventory } from '../../components/Inventory';
import { Dialog } from '../../components/Dialog';
import { Button } from '../../components/Button';
import { TestDataGenerator } from '../utils/TestDataGenerator';
import { Entity } from '../../game/entities/Entity';
import { Item } from '../../game/entities/Item';
import { ItemType } from '../../game/types/ItemType';

describe('UI Components', () => {
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
  });

  describe('HealthBar', () => {
    it('应该正确显示生命值', () => {
      render(<HealthBar current={50} max={100} />);
      const healthBar = screen.getByRole('progressbar');
      expect(healthBar).toBeInTheDocument();
      expect(healthBar).toHaveStyle({ width: '50%' });
    });

    it('应该正确显示低生命值警告', () => {
      render(<HealthBar current={20} max={100} />);
      const healthBar = screen.getByRole('progressbar');
      expect(healthBar).toHaveClass('low-health');
    });

    it('应该正确显示生命值文本', () => {
      render(<HealthBar current={75} max={100} />);
      expect(screen.getByText('75/100')).toBeInTheDocument();
    });
  });

  describe('Inventory', () => {
    it('应该正确显示物品列表', () => {
      render(<Inventory items={items} onItemClick={() => {}} />);
      items.forEach(item => {
        expect(screen.getByText(item.getConfig().name)).toBeInTheDocument();
      });
    });

    it('应该正确处理物品点击', () => {
      const handleClick = vi.fn();
      render(<Inventory items={items} onItemClick={handleClick} />);

      fireEvent.click(screen.getByText(items[0].getConfig().name));
      expect(handleClick).toHaveBeenCalledWith(items[0]);
    });

    it('应该正确显示物品数量', () => {
      items[0].setQuantity(5);
      render(<Inventory items={items} onItemClick={() => {}} />);
      expect(screen.getByText('x5')).toBeInTheDocument();
    });

    it('应该正确显示物品耐久度', () => {
      items[0].useDurability(20);
      render(<Inventory items={items} onItemClick={() => {}} />);
      const durability = items[0].getDurability();
      const maxDurability = items[0].getMaxDurability();
      expect(screen.getByText(`${durability}/${maxDurability}`)).toBeInTheDocument();
    });
  });

  describe('Dialog', () => {
    it('应该正确显示对话内容', () => {
      const content = '这是一段测试对话';
      render(<Dialog content={content} onClose={() => {}} />);
      expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('应该正确处理关闭事件', () => {
      const handleClose = vi.fn();
      render(<Dialog content="测试对话" onClose={handleClose} />);

      fireEvent.click(screen.getByRole('button', { name: /关闭/i }));
      expect(handleClose).toHaveBeenCalled();
    });

    it('应该支持HTML内容', () => {
      const content = '<p>这是一段<strong>HTML</strong>内容</p>';
      render(<Dialog content={content} onClose={() => {}} />);
      expect(screen.getByText('HTML')).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    it('应该正确显示按钮文本', () => {
      render(<Button onClick={() => {}}>测试按钮</Button>);
      expect(screen.getByText('测试按钮')).toBeInTheDocument();
    });

    it('应该正确处理点击事件', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>测试按钮</Button>);

      fireEvent.click(screen.getByText('测试按钮'));
      expect(handleClick).toHaveBeenCalled();
    });

    it('应该正确处理禁用状态', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>测试按钮</Button>);

      fireEvent.click(screen.getByText('测试按钮'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('应该支持自定义样式', () => {
      render(<Button onClick={() => {}} className="custom-button">测试按钮</Button>);
      expect(screen.getByText('测试按钮')).toHaveClass('custom-button');
    });
  });
});