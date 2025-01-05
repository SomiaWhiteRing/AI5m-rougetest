import React, { useState } from 'react';
import { Equipment } from '../types/equipment';
import { formatNumber, formatPercentage } from '../utils/formatters';

interface EnhancePanelProps {
  equipment: Equipment;
  onEnhance: (equipment: Equipment) => void;
  onClose: () => void;
}

const ENHANCE_COST_BASE = 100;
const ENHANCE_COST_MULTIPLIER = 1.5;
const SUCCESS_RATE_BASE = 0.95;
const SUCCESS_RATE_DECAY = 0.05;
const MAX_ENHANCE_LEVEL = 10;

const EnhancePanel: React.FC<EnhancePanelProps> = ({ equipment, onEnhance, onClose }) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const calculateEnhanceCost = (level: number): number => {
    return Math.floor(ENHANCE_COST_BASE * Math.pow(ENHANCE_COST_MULTIPLIER, level));
  };

  const calculateSuccessRate = (level: number): number => {
    return Math.max(0.05, SUCCESS_RATE_BASE - level * SUCCESS_RATE_DECAY);
  };

  const handleEnhance = async () => {
    if (isEnhancing || equipment.enhanceLevel >= MAX_ENHANCE_LEVEL) return;

    setIsEnhancing(true);
    const cost = calculateEnhanceCost(equipment.enhanceLevel);
    const successRate = calculateSuccessRate(equipment.enhanceLevel);
    
    // 模拟强化动画
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isSuccess = Math.random() < successRate;
    if (isSuccess) {
      const enhancedEquipment = {
        ...equipment,
        enhanceLevel: equipment.enhanceLevel + 1,
        attack: equipment.attack ? Math.floor(equipment.attack * 1.1) : undefined,
        defense: equipment.defense ? Math.floor(equipment.defense * 1.1) : undefined,
        hp: equipment.hp ? Math.floor(equipment.hp * 1.1) : undefined,
        mp: equipment.mp ? Math.floor(equipment.mp * 1.1) : undefined,
      };
      onEnhance(enhancedEquipment);
    }
    
    setIsEnhancing(false);
  };

  const cost = calculateEnhanceCost(equipment.enhanceLevel);
  const successRate = calculateSuccessRate(equipment.enhanceLevel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white">强化装备</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <img src={equipment.icon} alt={equipment.name} className="w-16 h-16" />
            <div>
              <div className="text-white font-bold">{equipment.name}</div>
              <div className="text-gray-400">+{equipment.enhanceLevel}</div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            {equipment.attack && (
              <div>攻击力：{formatNumber(equipment.attack)} → {formatNumber(Math.floor(equipment.attack * 1.1))}</div>
            )}
            {equipment.defense && (
              <div>防御力：{formatNumber(equipment.defense)} → {formatNumber(Math.floor(equipment.defense * 1.1))}</div>
            )}
            {equipment.hp && (
              <div>生命值：{formatNumber(equipment.hp)} → {formatNumber(Math.floor(equipment.hp * 1.1))}</div>
            )}
            {equipment.mp && (
              <div>魔法值：{formatNumber(equipment.mp)} → {formatNumber(Math.floor(equipment.mp * 1.1))}</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">成功率</span>
            <span className="text-white">{formatPercentage(successRate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">强化费用</span>
            <span className="text-white">{formatNumber(cost)} 金币</span>
          </div>
        </div>

        <button
          onClick={handleEnhance}
          disabled={isEnhancing || equipment.enhanceLevel >= MAX_ENHANCE_LEVEL}
          className={`w-full mt-6 py-2 px-4 rounded ${
            isEnhancing || equipment.enhanceLevel >= MAX_ENHANCE_LEVEL
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-bold transition-colors`}
        >
          {isEnhancing ? '强化中...' : equipment.enhanceLevel >= MAX_ENHANCE_LEVEL ? '已达最大等级' : '强化'}
        </button>
      </div>
    </div>
  );
};

export default EnhancePanel; 