import React from 'react';

interface StatusBarProps {
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  experience: number
  maxExperience: number
  level: number
}

const StatusBar: React.FC<StatusBarProps> = ({
  health,
  maxHealth,
  mana,
  maxMana,
  experience,
  maxExperience,
  level,
}) => {
  return (
    <div className="flex flex-col gap-2 bg-gray-800 bg-opacity-80 p-4 rounded-lg pointer-events-auto">
      {/* 等级 */}
      <div className="text-white text-lg font-bold">
        等级 {level}
      </div>

      {/* 生命值条 */}
      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 bg-red-500 transition-all duration-200"
          style={{ width: `${(health / maxHealth) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
          {Math.round(health)} / {maxHealth}
        </div>
      </div>

      {/* 魔法值条 */}
      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 bg-blue-500 transition-all duration-200"
          style={{ width: `${(mana / maxMana) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
          {Math.round(mana)} / {maxMana}
        </div>
      </div>

      {/* 经验值条 */}
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 bg-yellow-500 transition-all duration-200"
          style={{ width: `${(experience / maxExperience) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
          {Math.round((experience / maxExperience) * 100)}%
        </div>
      </div>
    </div>
  );
};

export default StatusBar;