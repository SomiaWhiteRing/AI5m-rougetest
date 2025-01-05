import React, { useState } from 'react';
import { Equipment } from '../types/equipment';
import { EnchantConfig } from '../config/enchantConfig';
import { useGameStore } from '../stores/gameStore';
import { formatNumber, formatPercentage } from '../utils/formatters';

interface EnchantPanelProps {
  equipment: Equipment;
  onClose: () => void;
  onEnchant: (newEquipment: Equipment) => void;
}

const EnchantPanel: React.FC<EnchantPanelProps> = ({
  equipment,
  onClose,
  onEnchant,
}) => {
  const { enchantManager, materials, player, removeMaterials } = useGameStore();
  const [selectedEnchant, setSelectedEnchant] = useState<string | null>(null);
  const [isEnchanting, setIsEnchanting] = useState(false);

  const availableEnchants = enchantManager.getAvailableEnchants(equipment);
  const preview = selectedEnchant
    ? enchantManager.previewEnchant(equipment, selectedEnchant)
    : null;

  const handleEnchant = async () => {
    if (!selectedEnchant || isEnchanting) return;

    setIsEnchanting(true);
    const requiredMaterials = enchantManager.getRequiredMaterials(selectedEnchant);
    const cost = enchantManager.getEnchantCost(selectedEnchant);

    // 检查材料和金币是否足够
    if (!enchantManager.canEnchant(equipment, selectedEnchant, materials, player.gold)) {
      setIsEnchanting(false);
      return;
    }

    // 模拟附魔动画
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = enchantManager.enchant(equipment, selectedEnchant, materials);
    if (result) {
      // 扣除材料和金币
      removeMaterials(requiredMaterials.map(({ id, quantity }) => ({
        material: materials.find(m => m.material.id === id)!.material,
        quantity,
      })));
      onEnchant(result);
    }

    setIsEnchanting(false);
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

  const renderEnchantOption = (config: EnchantConfig) => {
    const canAfford = enchantManager.canEnchant(
      equipment,
      config.effect.id,
      materials,
      player.gold
    );

    return (
      <div
        key={config.effect.id}
        className={`p-4 rounded-lg cursor-pointer transition-colors ${
          selectedEnchant === config.effect.id
            ? 'bg-blue-900'
            : canAfford
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-gray-800 opacity-50 cursor-not-allowed'
        }`}
        onClick={() => canAfford && setSelectedEnchant(config.effect.id)}
      >
        <div className={`font-bold ${getQualityColor(config.effect.quality)}`}>
          {config.effect.name}
        </div>
        <div className="text-sm text-gray-400 mb-2">{config.effect.description}</div>
        <div className="space-y-1 text-sm">
          {config.effect.stats.attack && (
            <div className="text-red-400">攻击力 +{config.effect.stats.attack}</div>
          )}
          {config.effect.stats.defense && (
            <div className="text-blue-400">防御力 +{config.effect.stats.defense}</div>
          )}
          {config.effect.stats.hp && (
            <div className="text-green-400">生命值 +{config.effect.stats.hp}</div>
          )}
          {config.effect.stats.mp && (
            <div className="text-purple-400">魔法值 +{config.effect.stats.mp}</div>
          )}
          {config.effect.stats.critRate && (
            <div className="text-yellow-400">暴击率 +{formatPercentage(config.effect.stats.critRate)}</div>
          )}
          {config.effect.stats.critDamage && (
            <div className="text-yellow-400">暴击伤害 +{formatPercentage(config.effect.stats.critDamage)}</div>
          )}
          {config.effect.stats.elementalDamage && (
            <div className="text-orange-400">
              {config.effect.stats.elementalDamage.type}伤害 +{config.effect.stats.elementalDamage.value}
            </div>
          )}
        </div>
        <div className="mt-2 space-y-1 text-sm">
          <div className="text-gray-400">
            成功率：{formatPercentage(config.recipe.successRate)}
          </div>
          <div className="text-yellow-400">
            花费：{formatNumber(config.recipe.goldCost)} 金币
          </div>
          <div className="text-gray-400">所需材料：</div>
          {config.recipe.materials.map(({ id, quantity }) => {
            const material = materials.find(m => m.material.id === id);
            const hasEnough = material && material.quantity >= quantity;
            return (
              <div
                key={id}
                className={hasEnough ? 'text-gray-300' : 'text-red-400'}
              >
                {material?.material.name} x{quantity} ({material?.quantity || 0})
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-white font-bold">装备附魔</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* 装备信息 */}
          <div className="w-1/3 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-4 mb-4">
              <img src={equipment.icon} alt={equipment.name} className="w-16 h-16" />
              <div>
                <div className={`font-bold ${getQualityColor(equipment.quality)}`}>
                  {equipment.name}
                </div>
                <div className="text-gray-400">{equipment.slot}</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {equipment.attack && (
                <div className="text-red-400">攻击力：{formatNumber(equipment.attack)}</div>
              )}
              {equipment.defense && (
                <div className="text-blue-400">防御力：{formatNumber(equipment.defense)}</div>
              )}
              {equipment.hp && (
                <div className="text-green-400">生命值：{formatNumber(equipment.hp)}</div>
              )}
              {equipment.mp && (
                <div className="text-purple-400">魔法值：{formatNumber(equipment.mp)}</div>
              )}
              {equipment.critRate && (
                <div className="text-yellow-400">暴击率：{formatPercentage(equipment.critRate)}</div>
              )}
              {equipment.critDamage && (
                <div className="text-yellow-400">暴击伤害：{formatPercentage(equipment.critDamage)}</div>
              )}
            </div>

            {equipment.effects && equipment.effects.length > 0 && (
              <div className="mt-4">
                <div className="text-white font-bold mb-2">当前效果</div>
                <div className="space-y-2">
                  {equipment.effects.map((effect, index) => (
                    <div key={index} className="text-sm">
                      <div className="text-blue-400">{effect.name}</div>
                      <div className="text-gray-400">{effect.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 附魔选项 */}
          <div className="w-2/3 flex flex-col">
            <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {availableEnchants.map(renderEnchantOption)}
              </div>
            </div>

            {preview && (
              <div className="mt-4 bg-gray-800 rounded-lg p-4">
                <div className="text-lg text-white font-bold mb-2">预览效果</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">当前属性</div>
                    {equipment.attack && (
                      <div className="text-red-400">攻击力：{formatNumber(equipment.attack)}</div>
                    )}
                    {equipment.defense && (
                      <div className="text-blue-400">防御力：{formatNumber(equipment.defense)}</div>
                    )}
                    {equipment.hp && (
                      <div className="text-green-400">生命值：{formatNumber(equipment.hp)}</div>
                    )}
                    {equipment.mp && (
                      <div className="text-purple-400">魔法值：{formatNumber(equipment.mp)}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">附魔后</div>
                    {preview.stats.attack && (
                      <div className="text-red-400">攻击力：{formatNumber(preview.stats.attack)}</div>
                    )}
                    {preview.stats.defense && (
                      <div className="text-blue-400">防御力：{formatNumber(preview.stats.defense)}</div>
                    )}
                    {preview.stats.hp && (
                      <div className="text-green-400">生命值：{formatNumber(preview.stats.hp)}</div>
                    )}
                    {preview.stats.mp && (
                      <div className="text-purple-400">魔法值：{formatNumber(preview.stats.mp)}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleEnchant}
                  disabled={isEnchanting}
                  className={`w-full mt-4 py-2 px-4 rounded ${
                    isEnchanting
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white font-bold transition-colors`}
                >
                  {isEnchanting ? '附魔中...' : '开始附魔'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnchantPanel; 