import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/extend-expect';
import DifficultyPanel from '../../components/DifficultyPanel';
import { Difficulty } from '../../config/balanceConfig';

describe('DifficultyPanel', () => {
  const mockOnClose = vi.fn();
  const mockOnDifficultyChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial difficulty', () => {
    render(
      <DifficultyPanel
        currentDifficulty={Difficulty.NORMAL}
        onDifficultyChange={mockOnDifficultyChange}
        onClose={mockOnClose}
      />
    );

    // 检查标题
    expect(screen.getByText('游戏难度')).toBeInTheDocument();

    // 检查所有难度选项
    expect(screen.getByText('简单')).toBeInTheDocument();
    expect(screen.getByText('普通')).toBeInTheDocument();
    expect(screen.getByText('困难')).toBeInTheDocument();
    expect(screen.getByText('专家')).toBeInTheDocument();

    // 检查当前选中的难度
    expect(screen.getByText('普通 难度详情')).toBeInTheDocument();
  });

  it('calls onDifficultyChange when selecting a different difficulty', () => {
    render(
      <DifficultyPanel
        currentDifficulty={Difficulty.NORMAL}
        onDifficultyChange={mockOnDifficultyChange}
        onClose={mockOnClose}
      />
    );

    // 点击困难难度
    fireEvent.click(screen.getByText('困难'));

    // 验证回调被调用
    expect(mockOnDifficultyChange).toHaveBeenCalledWith(Difficulty.HARD);
  });

  it('calls onClose when clicking close button', () => {
    render(
      <DifficultyPanel
        currentDifficulty={Difficulty.NORMAL}
        onDifficultyChange={mockOnDifficultyChange}
        onClose={mockOnClose}
      />
    );

    // 点击关闭按钮
    fireEvent.click(screen.getByText('✕'));

    // 验证回调被调用
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays correct difficulty descriptions', () => {
    render(
      <DifficultyPanel
        currentDifficulty={Difficulty.NORMAL}
        onDifficultyChange={mockOnDifficultyChange}
        onClose={mockOnClose}
      />
    );

    // 检查难度描述
    expect(screen.getByText('适合新手玩家，提供更轻松的游戏体验')).toBeInTheDocument();
    expect(screen.getByText('标准游戏体验，适合大多数玩家')).toBeInTheDocument();
    expect(screen.getByText('具有挑战性，需要较好的游戏技巧')).toBeInTheDocument();
    expect(screen.getByText('极具挑战性，只适合最有经验的玩家')).toBeInTheDocument();
  });

  it('displays correct difficulty stats', () => {
    render(
      <DifficultyPanel
        currentDifficulty={Difficulty.HARD}
        onDifficultyChange={mockOnDifficultyChange}
        onClose={mockOnClose}
      />
    );

    // 检查属性标签
    expect(screen.getByText('玩家属性')).toBeInTheDocument();
    expect(screen.getByText('敌人属性')).toBeInTheDocument();
    expect(screen.getByText('掉落倍率')).toBeInTheDocument();

    // 检查具体属性
    expect(screen.getByText('生命值:')).toBeInTheDocument();
    expect(screen.getByText('攻击力:')).toBeInTheDocument();
    expect(screen.getByText('防御力:')).toBeInTheDocument();
    expect(screen.getByText('经验值:')).toBeInTheDocument();
    expect(screen.getByText('金币:')).toBeInTheDocument();
  });

  it('closes panel when clicking confirm button', () => {
    render(
      <DifficultyPanel
        currentDifficulty={Difficulty.NORMAL}
        onDifficultyChange={mockOnDifficultyChange}
        onClose={mockOnClose}
      />
    );

    // 点击确定按钮
    fireEvent.click(screen.getByText('确定'));

    // 验证回调被调用
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 