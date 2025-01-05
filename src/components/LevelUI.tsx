import React, { useEffect, useState } from 'react';
import { LevelState } from '../game/managers/LevelManager';
import { LevelConfig } from '../config/levels';

interface LevelUIProps {
  levelState?: LevelState;
  levelConfig?: LevelConfig;
  onLevelStart?: () => void;
  onLevelExit?: () => void;
}

export const LevelUI: React.FC<LevelUIProps> = ({
  levelState,
  levelConfig,
  onLevelStart,
  onLevelExit
}) => {
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    if (!levelState?.timeRemaining) return;

    const timer = setInterval(() => {
      const minutes = Math.floor(levelState.timeRemaining! / 60000);
      const seconds = Math.floor((levelState.timeRemaining! % 60000) / 1000);
      setTimeDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [levelState?.timeRemaining]);

  if (!levelState || !levelConfig) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gray-800 bg-opacity-75 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{levelConfig.name}</h2>
            <p className="text-sm opacity-75">{levelConfig.description}</p>
          </div>
          {levelState.timeRemaining && (
            <div className="text-2xl font-mono">
              {timeDisplay}
            </div>
          )}
        </div>
      </div>

      {/* 目标列表 */}
      <div className="absolute top-24 left-4 bg-gray-800 bg-opacity-75 p-4 rounded-lg text-white">
        <h3 className="text-lg font-bold mb-2">目标</h3>
        <ul className="space-y-2">
          {levelState.objectives.map((objective, index) => (
            <li key={index} className="flex items-center">
              <div className="w-full">
                <div className="flex justify-between mb-1">
                  <span>{objective.description}</span>
                  <span>
                    {objective.current}/{objective.target}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${(objective.current / objective.target) * 100}%`
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 难度指示器 */}
      <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-75 px-3 py-1 rounded-full text-white">
        <div className="flex items-center space-x-1">
          <span>难度:</span>
          {Array.from({ length: levelConfig.difficulty }).map((_, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-500"
            />
          ))}
        </div>
      </div>

      {/* 退出按钮 */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <button
          onClick={onLevelExit}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          退出关卡
        </button>
      </div>

      {/* 关卡完成提示 */}
      {levelState.isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
          <div className="bg-gray-800 p-8 rounded-lg text-white text-center">
            <h2 className="text-2xl font-bold mb-4">关卡完成！</h2>
            <div className="space-y-2 mb-4">
              <p>经验值: +{levelConfig.reward.experience}</p>
              <p>金币: +{levelConfig.reward.gold}</p>
              {levelConfig.reward.items && (
                <div>
                  <p>获得物品:</p>
                  <ul>
                    {levelConfig.reward.items.map((item, index) => (
                      <li key={index}>
                        {item.type} x{item.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={onLevelExit}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
            >
              继续
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 