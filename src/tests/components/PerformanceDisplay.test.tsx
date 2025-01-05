import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/extend-expect';
import PerformanceDisplay from '../../components/PerformanceDisplay';
import { DynamicDifficultyManager } from '../../game/managers/DynamicDifficultyManager';
import { Difficulty } from '../../config/balanceConfig';

// 模拟 Scene
const mockScene = {
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  time: {
    addEvent: vi.fn(),
  },
} as any;

describe('PerformanceDisplay', () => {
  let dynamicDifficultyManager: DynamicDifficultyManager;

  beforeEach(() => {
    dynamicDifficultyManager = new DynamicDifficultyManager(mockScene);
    vi.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(
      <PerformanceDisplay
        dynamicDifficultyManager={dynamicDifficultyManager}
      />
    );

    // 检查标题和状态
    expect(screen.getByText('性能监控')).toBeInTheDocument();
    expect(screen.getByText('动态难度：关闭')).toBeInTheDocument();

    // 检查性能指标标签
    expect(screen.getByText('当前表现')).toBeInTheDocument();
    expect(screen.getByText('历史表现')).toBeInTheDocument();
    expect(screen.getByText('伤害输出')).toBeInTheDocument();
    expect(screen.getByText('承受伤害')).toBeInTheDocument();
    expect(screen.getByText('击杀数')).toBeInTheDocument();
    expect(screen.getByText('任务完成')).toBeInTheDocument();
    expect(screen.getByText('获得金币')).toBeInTheDocument();
    expect(screen.getByText('获得经验')).toBeInTheDocument();
  });

  it('displays correct performance metrics', () => {
    // 模拟性能数据
    vi.spyOn(dynamicDifficultyManager, 'getPerformanceStats').mockReturnValue({
      currentPerformance: 0.75,
      performanceHistory: [0.6, 0.65, 0.7, 0.75],
      metrics: {
        damageDealt: 1000,
        damageTaken: 500,
        killCount: 10,
        deathCount: 2,
        completedQuests: 5,
        averageQuestTime: 300,
        goldEarned: 1500,
        experienceGained: 2000,
        timeAlive: 3600,
      },
      difficulty: Difficulty.NORMAL,
    });

    render(
      <PerformanceDisplay
        dynamicDifficultyManager={dynamicDifficultyManager}
      />
    );

    // 检查性能分数
    expect(screen.getByText('75%')).toBeInTheDocument();

    // 检查统计数据
    expect(screen.getByText('1,000')).toBeInTheDocument(); // 伤害输出
    expect(screen.getByText('500')).toBeInTheDocument(); // 承受伤害
    expect(screen.getByText('10')).toBeInTheDocument(); // 击杀数
    expect(screen.getByText('5')).toBeInTheDocument(); // 任务完成
    expect(screen.getByText('1,500')).toBeInTheDocument(); // 获得金币
    expect(screen.getByText('2,000')).toBeInTheDocument(); // 获得经验
  });

  it('displays correct difficulty state', () => {
    // 启用动态难度
    dynamicDifficultyManager.enable();

    render(
      <PerformanceDisplay
        dynamicDifficultyManager={dynamicDifficultyManager}
      />
    );

    expect(screen.getByText('动态难度：开启')).toBeInTheDocument();
  });

  it('displays correct time formats', () => {
    vi.spyOn(dynamicDifficultyManager, 'getPerformanceStats').mockReturnValue({
      currentPerformance: 0.5,
      performanceHistory: [],
      metrics: {
        damageDealt: 0,
        damageTaken: 0,
        killCount: 0,
        deathCount: 0,
        completedQuests: 0,
        averageQuestTime: 0,
        goldEarned: 0,
        experienceGained: 0,
        timeAlive: 7200, // 2小时
      },
      difficulty: Difficulty.NORMAL,
    });

    render(
      <PerformanceDisplay
        dynamicDifficultyManager={dynamicDifficultyManager}
      />
    );

    expect(screen.getByText('2小时0分钟')).toBeInTheDocument();
  });

  it('displays correct performance colors', () => {
    // 测试不同性能水平的颜色
    const performanceLevels = [
      { value: 0.2, expectedClass: 'bg-red-600' },
      { value: 0.4, expectedClass: 'bg-orange-600' },
      { value: 0.7, expectedClass: 'bg-blue-600' },
      { value: 0.9, expectedClass: 'bg-green-600' },
    ];

    performanceLevels.forEach(({ value, expectedClass }) => {
      vi.spyOn(dynamicDifficultyManager, 'getPerformanceStats').mockReturnValue({
        currentPerformance: value,
        performanceHistory: [value],
        metrics: {
          damageDealt: 0,
          damageTaken: 0,
          killCount: 0,
          deathCount: 0,
          completedQuests: 0,
          averageQuestTime: 0,
          goldEarned: 0,
          experienceGained: 0,
          timeAlive: 0,
        },
        difficulty: Difficulty.NORMAL,
      });

      const { container } = render(
        <PerformanceDisplay
          dynamicDifficultyManager={dynamicDifficultyManager}
        />
      );

      expect(container.querySelector(`.${expectedClass}`)).toBeInTheDocument();
    });
  });
}); 