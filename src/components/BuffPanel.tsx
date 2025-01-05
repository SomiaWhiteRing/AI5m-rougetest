import React from 'react'
import { StatusEffect } from '../types/combat'

interface BuffPanelProps {
  buffs: StatusEffect[]
  onBuffClick?: (buff: StatusEffect) => void
}

export const BuffPanel: React.FC<BuffPanelProps> = ({
  buffs,
  onBuffClick
}) => {
  const getBuffColor = (type: string) => {
    if (type.includes('buff')) return 'border-blue-500'
    if (type.includes('debuff')) return 'border-red-500'
    return 'border-gray-500'
  }

  const formatDuration = (duration: number) => {
    if (duration >= 1000) {
      return `${Math.ceil(duration / 1000)}s`
    }
    return `${duration}ms`
  }

  return (
    <div className="flex flex-wrap gap-2 bg-gray-800 bg-opacity-80 p-4 rounded-lg pointer-events-auto">
      {buffs.map(buff => (
        <div
          key={`${buff.type}_${buff.source?.id}`}
          className={`
            relative w-10 h-10 rounded-lg overflow-hidden cursor-help
            border-2 ${getBuffColor(buff.type)}
          `}
          onClick={() => onBuffClick?.(buff)}
        >
          {/* 状态图标 */}
          <img
            src={`/assets/icons/${buff.type}.png`}
            alt={buff.type}
            className="w-full h-full object-cover"
          />

          {/* 持续时间 */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-center text-xs text-white">
            {formatDuration(buff.duration)}
          </div>

          {/* 堆叠层数（如果有） */}
          {buff.stacks && (
            <div className="absolute top-0 right-0 bg-black bg-opacity-50 px-1 text-xs text-white">
              {buff.stacks}
            </div>
          )}

          {/* 详细信息提示 */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="font-bold">{buff.name}</div>
            <div className="text-xs">{buff.description}</div>
            {buff.value && (
              <div className="text-xs">
                效果值: {buff.value}
                {buff.interval && ` / ${formatDuration(buff.interval)}`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 