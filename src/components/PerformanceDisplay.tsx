import React from 'react';
import { DynamicDifficultyManager } from '../game/managers/DynamicDifficultyManager';
import { formatNumber, formatDuration } from '../utils/formatters';

interface PerformanceDisplayProps {
  dynamicDifficultyManager: DynamicDifficultyManager;
}

const PerformanceDisplay: React.FC<PerformanceDisplayProps> = ({
  dynamicDifficultyManager
}) => {
  const stats = dynamicDifficultyManager.getPerformanceStats();
  const { metrics, currentPerformance, performanceHistory, difficulty } = stats;

  const renderPerformanceBar = (value: number) => {
    const percentage = Math.round(value * 100);
    const getColor = () => {
      if (value < 0.3) return 'bg-red-600';
      if (value < 0.5) return 'bg-orange-600';
      if (value < 0.8) return 'bg-blue-600';
      return 'bg-green-600';
    };

    return (
      <div className="h-2 bg-gray-700 rounded overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderPerformanceHistory = () => {
    const maxHeight = 40;
    const width = 4;
    const gap = 2;
    const totalWidth = performanceHistory.length * (width + gap);

    return (
      <div className="h-10 flex items-end space-x-0.5">
        {performanceHistory.map((value, index) => (
          <div
            key={index}
            className={`w-1 transition-all duration-300 ${
              value < 0.3
                ? 'bg-red-600'
                : value < 0.5
                ? 'bg-orange-600'
                : value < 0.8
                ? 'bg-blue-600'
                : 'bg-green-600'
            }`}
            style={{ height: `${Math.max(4, value * maxHeight)}px` }}
          />
        ))}
      </div>
    );
  };

  const renderMetricBar = (value: number, max: number) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="h-1 bg-gray-700 rounded overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-white font-bold">性能监控</h3>
        <div className="text-sm text-gray-400">
          {dynamicDifficultyManager.isEnabled() ? '动态难度：开启' : '动态难度：关闭'}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">当前表现</span>
            <span className="text-white">{Math.round(currentPerformance * 100)}%</span>
          </div>
          {renderPerformanceBar(currentPerformance)}
        </div>

        <div>
          <div className="text-sm text-gray-400 mb-1">历史表现</div>
          {renderPerformanceHistory()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">伤害输出</span>
              <span className="text-white">{formatNumber(metrics.damageDealt)}</span>
            </div>
            {renderMetricBar(metrics.damageDealt, metrics.damageDealt * 1.5)}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">承受伤害</span>
              <span className="text-white">{formatNumber(metrics.damageTaken)}</span>
            </div>
            {renderMetricBar(metrics.damageTaken, metrics.damageTaken * 1.5)}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">击杀数</span>
              <span className="text-white">{metrics.killCount}</span>
            </div>
            {renderMetricBar(metrics.killCount, metrics.killCount * 1.5)}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">任务完成</span>
              <span className="text-white">{metrics.completedQuests}</span>
            </div>
            {renderMetricBar(metrics.completedQuests, metrics.completedQuests * 1.5)}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">获得金币</span>
              <span className="text-white">{formatNumber(metrics.goldEarned)}</span>
            </div>
            {renderMetricBar(metrics.goldEarned, metrics.goldEarned * 1.5)}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">获得经验</span>
              <span className="text-white">{formatNumber(metrics.experienceGained)}</span>
            </div>
            {renderMetricBar(metrics.experienceGained, metrics.experienceGained * 1.5)}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">存活时间：</span>
            <span className="text-white">{formatDuration(metrics.timeAlive)}</span>
          </div>
          <div>
            <span className="text-gray-400">死亡次数：</span>
            <span className="text-white">{metrics.deathCount}</span>
          </div>
          <div>
            <span className="text-gray-400">平均任务时间：</span>
            <span className="text-white">
              {metrics.averageQuestTime > 0
                ? formatDuration(metrics.averageQuestTime)
                : '暂无数据'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">当前难度：</span>
            <span className="text-white">{difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDisplay; 