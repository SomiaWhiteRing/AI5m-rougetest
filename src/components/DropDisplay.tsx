import React, { useState, useEffect } from 'react';
import { Equipment } from '../types/equipment';
import { formatNumber } from '../utils/formatters';

interface DropDisplayProps {
  drops: Equipment[];
  onClose: () => void;
  onCollect: (equipment: Equipment[]) => void;
}

const DropDisplay: React.FC<DropDisplayProps> = ({ drops, onClose, onCollect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showingDrops, setShowingDrops] = useState<Equipment[]>([]);

  useEffect(() => {
    if (drops.length > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setShowingDrops(drops);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [drops]);

  const handleCollect = () => {
    onCollect(drops);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getQualityColor = (quality: number) => {
    switch (quality) {
      case 5: return 'text-orange-400';
      case 4: return 'text-purple-400';
      case 3: return 'text-blue-400';
      case 2: return 'text-green-400';
      default: return 'text-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-gray-900 p-6 rounded-lg max-w-md w-full transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white">获得物品</h2>
          <button
            onClick={handleCollect}
            className="text-gray-400 hover:text-white"
          >
            收集
          </button>
        </div>

        <div className="space-y-4">
          {showingDrops.map((equipment, index) => (
            <div
              key={equipment.id}
              className={`flex items-center space-x-4 p-3 rounded bg-gray-800 transform transition-all duration-300 ${
                showingDrops.length === drops.length ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <img src={equipment.icon} alt={equipment.name} className="w-12 h-12" />
              <div className="flex-1">
                <div className={`font-bold ${getQualityColor(equipment.quality)}`}>
                  {equipment.name}
                </div>
                <div className="text-sm text-gray-400">{equipment.description}</div>
                <div className="text-sm space-x-4">
                  {equipment.attack && (
                    <span className="text-red-400">攻击力 +{formatNumber(equipment.attack)}</span>
                  )}
                  {equipment.defense && (
                    <span className="text-blue-400">防御力 +{formatNumber(equipment.defense)}</span>
                  )}
                  {equipment.hp && (
                    <span className="text-green-400">生命值 +{formatNumber(equipment.hp)}</span>
                  )}
                  {equipment.mp && (
                    <span className="text-purple-400">魔法值 +{formatNumber(equipment.mp)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCollect}
          className="w-full mt-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
        >
          收集全部
        </button>
      </div>
    </div>
  );
};

export default DropDisplay; 