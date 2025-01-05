import React from 'react'
import { SkillConfig } from '../config/skills'

interface SkillBarProps {
  skills: SkillConfig[]
  cooldowns: Map<string, number>
  onSkillUse: (skillId: string) => void
}

export const SkillBar: React.FC<SkillBarProps> = ({
  skills,
  cooldowns,
  onSkillUse
}) => {
  const formatCooldown = (cooldown: number): string => {
    if (cooldown <= 0) return '';
    return (cooldown / 1000).toFixed(1);
  };

  return (
    <div className="flex gap-2 p-2 bg-gray-800 bg-opacity-75 rounded-lg">
      {skills.map((skill) => {
        const cooldown = cooldowns.get(skill.id) || 0;
        const isOnCooldown = cooldown > 0;
        const cooldownPercent = isOnCooldown ? (cooldown / skill.cooldown) * 100 : 0;

        return (
          <div
            key={skill.id}
            className="relative w-12 h-12 cursor-pointer"
            onClick={() => !isOnCooldown && onSkillUse(skill.id)}
            title={`${skill.name}\n${skill.description}\n魔法消耗: ${skill.manaCost}\n冷却时间: ${skill.cooldown / 1000}秒`}
          >
            {/* 技能图标 */}
            <div className={`w-full h-full rounded-lg border-2 ${isOnCooldown ? 'border-gray-500' : 'border-yellow-500'} overflow-hidden`}>
              <img
                src={`/assets/icons/${skill.icon}.svg`}
                alt={skill.name}
                className={`w-full h-full object-cover ${isOnCooldown ? 'opacity-50' : ''}`}
              />
            </div>

            {/* 冷却遮罩 */}
            {isOnCooldown && (
              <div
                className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"
                style={{
                  clipPath: `polygon(0 0, 100% 0, 100% ${cooldownPercent}%, 0 ${cooldownPercent}%)`
                }}
              />
            )}

            {/* 冷却时间文本 */}
            {isOnCooldown && (
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                {formatCooldown(cooldown)}
              </div>
            )}

            {/* 快捷键提示 */}
            <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 px-1 rounded text-xs text-white">
              {skills.indexOf(skill) + 1}
            </div>
          </div>
        );
      })}
    </div>
  )
} 