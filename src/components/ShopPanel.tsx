import React, { useState, useEffect } from 'react';
import { Equipment } from '../types/equipment';
import { ShopItem } from '../config/shopConfig';
import { useGameStore } from '../stores/gameStore';
import { formatNumber } from '../utils/formatters';
import { getEquipmentTemplate } from '../config/dropTables';

interface ShopItemProps {
  item: ShopItem;
  playerLevel: number;
  playerGold: number;
  isSpecial?: boolean;
  onBuy: () => void;
}

const ShopItemComponent: React.FC<ShopItemProps> = ({
  item,
  playerLevel,
  playerGold,
  isSpecial,
  onBuy,
}) => {
  const template = getEquipmentTemplate(item.id);
  if (!template) return null;

  const canBuy = playerGold >= item.basePrice && playerLevel >= (item.levelRequirement || 0);

  return (
    <div className={`p-4 rounded-lg ${isSpecial ? 'bg-purple-900' : 'bg-gray-800'} relative`}>
      <div className="flex items-center space-x-4">
        <img src={template.icon} alt={template.name} className="w-16 h-16" />
        <div className="flex-1">
          <div className="text-lg font-bold text-white">{template.name}</div>
          <div className="text-sm text-gray-400">{template.description}</div>
          <div className="mt-2 space-y-1">
            {template.attack && (
              <div className="text-red-400">攻击力 +{template.attack}</div>
            )}
            {template.defense && (
              <div className="text-blue-400">防御力 +{template.defense}</div>
            )}
            {template.hp && (
              <div className="text-green-400">生命值 +{template.hp}</div>
            )}
            {template.mp && (
              <div className="text-purple-400">魔法值 +{template.mp}</div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-yellow-400">
            {formatNumber(item.basePrice)} 金币
          </div>
          <div className="text-sm text-gray-400">
            库存: {item.stock}
          </div>
          {item.levelRequirement && (
            <div className={`text-sm ${playerLevel >= item.levelRequirement ? 'text-green-400' : 'text-red-400'}`}>
              等级需求: {item.levelRequirement}
            </div>
          )}
          <button
            onClick={onBuy}
            disabled={!canBuy || item.stock <= 0}
            className={`mt-2 px-4 py-2 rounded ${
              canBuy && item.stock > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 cursor-not-allowed'
            } text-white font-bold transition-colors`}
          >
            {item.stock <= 0 ? '已售罄' : '购买'}
          </button>
        </div>
      </div>
      {isSpecial && (
        <div className="absolute top-2 right-2 bg-purple-600 px-2 py-1 rounded text-xs text-white">
          限时
        </div>
      )}
    </div>
  );
};

const ShopPanel: React.FC = () => {
  const { player, shopManager, addToInventory } = useGameStore();
  const [selectedShop, setSelectedShop] = useState('generalStore');
  const [items, setItems] = useState<{ regular: ShopItem[]; special: ShopItem[] }>({
    regular: [],
    special: [],
  });

  useEffect(() => {
    const shopItems = shopManager.getShopItems(selectedShop);
    setItems(shopItems);
  }, [selectedShop, shopManager]);

  const handleBuy = (itemId: string, isSpecial: boolean) => {
    const item = shopManager.buyItem(selectedShop, itemId, isSpecial);
    if (item) {
      addToInventory([item]);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-white font-bold">商店</h2>
        <div className="text-yellow-400 font-bold">
          金币: {formatNumber(player.gold)}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedShop('generalStore')}
            className={`px-4 py-2 rounded ${
              selectedShop === 'generalStore'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            杂货商店
          </button>
          <button
            onClick={() => setSelectedShop('magicShop')}
            className={`px-4 py-2 rounded ${
              selectedShop === 'magicShop'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            魔法商店
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.special.length > 0 && (
          <div>
            <h3 className="text-lg text-purple-400 font-bold mb-2">限时商品</h3>
            <div className="space-y-4">
              {items.special.map((item) => (
                <ShopItemComponent
                  key={item.id}
                  item={item}
                  playerLevel={player.level}
                  playerGold={player.gold}
                  isSpecial
                  onBuy={() => handleBuy(item.id, true)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg text-white font-bold mb-2">普通商品</h3>
          <div className="space-y-4">
            {items.regular.map((item) => (
              <ShopItemComponent
                key={item.id}
                item={item}
                playerLevel={player.level}
                playerGold={player.gold}
                onBuy={() => handleBuy(item.id, false)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPanel; 