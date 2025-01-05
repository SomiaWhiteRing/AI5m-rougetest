import React from 'react';
import { Difficulty, DifficultyConfig, difficultyConfigs } from '../config/balanceConfig';

interface DifficultyPanelProps {
  currentDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onClose: () => void;
}

const DifficultyPanel: React.FC<DifficultyPanelProps> = ({
  currentDifficulty,
  onDifficultyChange,
  onClose,
}) => {
  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return 'text-green-400';
      case Difficulty.NORMAL:
        return 'text-blue-400';
      case Difficulty.HARD:
        return 'text-orange-400';
      case Difficulty.EXPERT:
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyName = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return '简单';
      case Difficulty.NORMAL:
        return '普通';
      case Difficulty.HARD:
        return '困难';
      case Difficulty.EXPERT:
        return '专家';
      default:
        return '未知';
    }
  };

  const getDifficultyDescription = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return '适合新手玩家，提供更轻松的游戏体验';
      case Difficulty.NORMAL:
        return '标准游戏体验，适合大多数玩家';
      case Difficulty.HARD:
        return '具有挑战性，需要较好的游戏技巧';
      case Difficulty.EXPERT:
        return '极具挑战性，只适合最有经验的玩家';
      default:
        return '';
    }
  };

  const renderMultiplier = (value: number) => {
    if (value === 1) return '100%';
    return value > 1 ? `+${((value - 1) * 100).toFixed(0)}%` : `-${((1 - value) * 100).toFixed(0)}%`;
  };

  const renderDifficultyStats = (config: DifficultyConfig) => {
    return (
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-400">玩家属性</div>
          <div className="text-gray-400">敌人属性</div>
          <div>
            <div>生命值: {renderMultiplier(config.playerStats.hpMultiplier)}</div>
            <div>魔法值: {renderMultiplier(config.playerStats.mpMultiplier)}</div>
            <div>攻击力: {renderMultiplier(config.playerStats.attackMultiplier)}</div>
            <div>防御力: {renderMultiplier(config.playerStats.defenseMultiplier)}</div>
            <div>经验值: {renderMultiplier(config.playerStats.expMultiplier)}</div>
            <div>金币: {renderMultiplier(config.playerStats.goldMultiplier)}</div>
          </div>
          <div>
            <div>生命值: {renderMultiplier(config.enemyStats.hpMultiplier)}</div>
            <div>攻击力: {renderMultiplier(config.enemyStats.attackMultiplier)}</div>
            <div>防御力: {renderMultiplier(config.enemyStats.defenseMultiplier)}</div>
            <div>经验值: {renderMultiplier(config.enemyStats.expMultiplier)}</div>
            <div>金币: {renderMultiplier(config.enemyStats.goldMultiplier)}</div>
            <div>刷新率: {renderMultiplier(config.enemyStats.spawnRateMultiplier)}</div>
          </div>
        </div>
        <div>
          <div className="text-gray-400 mb-1">掉落倍率</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div>普通: {renderMultiplier(config.dropRates.commonMultiplier)}</div>
              <div>优秀: {renderMultiplier(config.dropRates.uncommonMultiplier)}</div>
              <div>稀有: {renderMultiplier(config.dropRates.rareMultiplier)}</div>
            </div>
            <div>
              <div>史诗: {renderMultiplier(config.dropRates.epicMultiplier)}</div>
              <div>传说: {renderMultiplier(config.dropRates.legendaryMultiplier)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-white font-bold">游戏难度</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 flex gap-4">
          {/* 难度选项列表 */}
          <div className="w-1/3 space-y-4">
            {Object.values(Difficulty).map(difficulty => (
              <div
                key={difficulty}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  currentDifficulty === difficulty
                    ? 'bg-blue-900'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => onDifficultyChange(difficulty)}
              >
                <div className={`text-lg font-bold ${getDifficultyColor(difficulty)}`}>
                  {getDifficultyName(difficulty)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {getDifficultyDescription(difficulty)}
                </div>
              </div>
            ))}
          </div>

          {/* 难度详情 */}
          <div className="w-2/3 bg-gray-800 rounded-lg p-4">
            <div className={`text-lg font-bold ${getDifficultyColor(currentDifficulty)} mb-4`}>
              {getDifficultyName(currentDifficulty)} 难度详情
            </div>
            {renderDifficultyStats(difficultyConfigs[currentDifficulty])}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default DifficultyPanel; 