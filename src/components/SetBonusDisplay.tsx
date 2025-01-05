import React from 'react';
import { Equipment } from '../types/equipment';
import { EquipmentSet, SetBonus, calculateSetBonuses, equipmentSets } from '../config/setConfig';
import { formatNumber, formatPercentage } from '../utils/formatters';

interface SetBonusDisplayProps {
  equippedItems: Equipment[];
}

const SetBonusDisplay: React.FC<SetBonusDisplayProps> = ({ equippedItems }) => {
  const setBonuses = calculateSetBonuses(equippedItems);

  // 获取套装件数
  const getSetPieceCount = (setId: string): number => {
    return equippedItems.filter(item => {
      const set = Object.values(equipmentSets).find(s => s.pieces.includes(item.id));
      return set?.id === setId;
    }).length;
  };

  // 渲染套装效果
  const renderSetBonus = (bonus: SetBonus) => {
    const effects = [];
    if (bonus.effects.attack) effects.push(`攻击力 +${formatNumber(bonus.effects.attack)}`);
    if (bonus.effects.defense) effects.push(`防御力 +${formatNumber(bonus.effects.defense)}`);
    if (bonus.effects.hp) effects.push(`生命值 +${formatNumber(bonus.effects.hp)}`);
    if (bonus.effects.mp) effects.push(`魔法值 +${formatNumber(bonus.effects.mp)}`);
    if (bonus.effects.critRate) effects.push(`暴击率 +${formatPercentage(bonus.effects.critRate)}`);
    if (bonus.effects.critDamage) effects.push(`暴击伤害 +${formatPercentage(bonus.effects.critDamage)}`);

    return (
      <div className="text-sm">
        <div className="text-gray-400">{bonus.effects.description}</div>
        <div className="text-blue-400">{effects.join('，')}</div>
      </div>
    );
  };

  if (Object.keys(setBonuses).length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-lg text-white font-bold">套装效果</h3>
      {Object.entries(setBonuses).map(([setId, bonuses]) => {
        const set = equipmentSets[setId];
        const pieceCount = getSetPieceCount(setId);

        return (
          <div key={setId} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="text-white font-bold">{set.name}</div>
              <div className="text-gray-400">
                {pieceCount}/{set.pieces.length} 件
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-4">{set.description}</div>
            <div className="space-y-4">
              {set.bonuses.map((bonus, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    pieceCount >= bonus.pieces
                      ? 'bg-blue-900 bg-opacity-50'
                      : 'bg-gray-900 bg-opacity-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className={`text-sm font-bold ${
                      pieceCount >= bonus.pieces ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {bonus.pieces}件套装效果
                    </div>
                    {pieceCount >= bonus.pieces && (
                      <div className="text-xs text-green-400">已激活</div>
                    )}
                  </div>
                  {renderSetBonus(bonus)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SetBonusDisplay; 