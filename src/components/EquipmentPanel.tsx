import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { Equipment, EquipmentSlot } from '../types/equipment';
import { formatNumber } from '../utils/formatters';
import SetBonusDisplay from './SetBonusDisplay';

interface EquipmentSlotProps {
  slot: EquipmentSlot;
  equipment: Equipment | null;
  onEquip: (slot: EquipmentSlot, equipment: Equipment | null) => void;
}

const EquipmentSlotComponent: React.FC<EquipmentSlotProps> = ({ slot, equipment, onEquip }) => {
  return (
    <div 
      className="w-16 h-16 border-2 border-gray-700 rounded-lg bg-gray-800 relative cursor-pointer hover:border-yellow-500"
      onClick={() => onEquip(slot, equipment)}
    >
      {equipment ? (
        <>
          <img src={equipment.icon} alt={equipment.name} className="w-full h-full p-1" />
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${equipment.quality >= 4 ? 'bg-orange-500' : equipment.quality >= 3 ? 'bg-purple-500' : equipment.quality >= 2 ? 'bg-blue-500' : 'bg-white'}`} />
          {equipment.enhanceLevel > 0 && (
            <div className="absolute bottom-0 right-0 bg-blue-600 px-1 rounded text-xs text-white">
              +{equipment.enhanceLevel}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          {slot}
        </div>
      )}
    </div>
  );
};

const EquipmentPanel: React.FC = () => {
  const { player, equipment, equipItem, unequipItem } = useGameStore();

  const handleEquipmentClick = (slot: EquipmentSlot, currentEquipment: Equipment | null) => {
    if (currentEquipment) {
      unequipItem(slot);
    }
  };

  const calculateTotalStats = () => {
    const stats = {
      attack: player.baseAttack,
      defense: player.baseDefense,
      hp: player.baseHp,
      mp: player.baseMp,
      critRate: player.baseCritRate,
      critDamage: player.baseCritDamage,
    };

    Object.values(equipment).forEach(equip => {
      if (equip) {
        stats.attack += equip.attack || 0;
        stats.defense += equip.defense || 0;
        stats.hp += equip.hp || 0;
        stats.mp += equip.mp || 0;
        stats.critRate += equip.critRate || 0;
        stats.critDamage += equip.critDamage || 0;
      }
    });

    return stats;
  };

  const totalStats = calculateTotalStats();
  const equippedItems = Object.values(equipment).filter((item): item is Equipment => item !== null);

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h2 className="text-xl text-white mb-4">装备</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(equipment).map(([slot, equip]) => (
          <EquipmentSlotComponent
            key={slot}
            slot={slot as EquipmentSlot}
            equipment={equip}
            onEquip={handleEquipmentClick}
          />
        ))}
      </div>
      <div className="text-white space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>攻击力：{formatNumber(totalStats.attack)}</div>
          <div>防御力：{formatNumber(totalStats.defense)}</div>
          <div>生命值：{formatNumber(totalStats.hp)}</div>
          <div>魔法值：{formatNumber(totalStats.mp)}</div>
          <div>暴击率：{(totalStats.critRate * 100).toFixed(1)}%</div>
          <div>暴击伤害：{(totalStats.critDamage * 100).toFixed(1)}%</div>
        </div>
      </div>

      <SetBonusDisplay equippedItems={equippedItems} />
    </div>
  );
};

export default EquipmentPanel; 