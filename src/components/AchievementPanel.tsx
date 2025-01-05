import React, { useState } from 'react';
import { AchievementCategory, AchievementConfig, ACHIEVEMENTS } from '../config/achievements';
import { AchievementProgress, AchievementState } from '../game/managers/AchievementManager';

interface AchievementPanelProps {
  achievementState: AchievementState;
  onClose: () => void;
}

interface AchievementDisplay extends AchievementProgress {
  config: AchievementConfig;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({
  achievementState,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>(AchievementCategory.COMBAT);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.values(AchievementCategory);

  const getAchievementsByCategory = (category: AchievementCategory) => {
    return Object.entries(achievementState.progress)
      .filter(([id, progress]) => {
        const achievement = ACHIEVEMENTS[id];
        return achievement && achievement.category === category && (!searchTerm ||
          achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          achievement.description.toLowerCase().includes(searchTerm.toLowerCase()));
      })
      .map(([id, progress]) => ({
        ...progress,
        config: ACHIEVEMENTS[id],
      }));
  };

  const calculateCategoryProgress = (category: AchievementCategory) => {
    const achievements = getAchievementsByCategory(category);
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    return {
      unlocked,
      total: achievements.length,
      percentage: achievements.length > 0 ? (unlocked / achievements.length) * 100 : 0,
    };
  };

  const formatReward = (reward: AchievementConfig['reward']) => {
    const parts = [];
    if (reward.experience) parts.push(`${reward.experience} 经验`);
    if (reward.gold) parts.push(`${reward.gold} 金币`);
    if (reward.items) {
      parts.push(reward.items.map(item => `${item.type} x${item.count}`).join(', '));
    }
    if (reward.skills) parts.push(`技能: ${reward.skills.join(', ')}`);
    return parts.join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg w-3/4 h-3/4 p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">成就系统</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              进度: {achievementState.unlockedCount}/{achievementState.totalCount}
              ({((achievementState.unlockedCount / achievementState.totalCount) * 100).toFixed(1)}%)
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* 左侧分类列表 */}
          <div className="w-48 border-r border-gray-700 pr-4">
            {categories.map(category => {
              const progress = calculateCategoryProgress(category);
              return (
                <button
                  key={category}
                  className={`w-full text-left p-2 rounded mb-2 ${
                    selectedCategory === category
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-gray-400">
                    {progress.unlocked}/{progress.total}
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* 右侧成就列表 */}
          <div className="flex-1 pl-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="搜索成就..."
                className="w-full p-2 bg-gray-700 rounded"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-y-auto h-[calc(100%-6rem)]">
              {getAchievementsByCategory(selectedCategory).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`mb-4 p-4 rounded ${
                    achievement.isUnlocked
                      ? 'bg-green-800 bg-opacity-25'
                      : 'bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <img
                        src={`/assets/icons/${achievement.config.icon}.svg`}
                        alt={achievement.config.name}
                        className="w-8 h-8 mr-3"
                      />
                      <div>
                        <h3 className="font-bold">{achievement.config.name}</h3>
                        <p className="text-sm text-gray-400">
                          {achievement.config.description}
                        </p>
                      </div>
                    </div>
                    {achievement.isUnlocked && (
                      <div className="text-green-400">
                        ✓ 已完成
                        {achievement.unlockTime && (
                          <div className="text-xs text-gray-400">
                            {new Date(achievement.unlockTime).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!achievement.isUnlocked && (
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-600 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(achievement.current / achievement.config.requirement.target) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        进度: {achievement.current}/{achievement.config.requirement.target}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-sm">
                    <span className="text-yellow-400">奖励: </span>
                    {formatReward(achievement.config.reward)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;