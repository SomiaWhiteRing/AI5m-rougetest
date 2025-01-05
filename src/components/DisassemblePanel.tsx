import React, { useState } from 'react';
import { Equipment } from '../types/equipment';
import { DisassembleResult } from '../game/managers/DisassembleManager';
import { useGameStore } from '../stores/gameStore';
import { formatNumber } from '../utils/formatters';

interface DisassemblePanelProps {
  onClose: () => void;
}

const DisassemblePanel: React.FC<DisassemblePanelProps> = ({ onClose }) => {
  const { inventory, disassembleManager, removeFromInventory, addMaterials } = useGameStore();
  const [selectedItems, setSelectedItems] = useState<Equipment[]>([]);
  const [previewResult, setPreviewResult] = useState<DisassembleResult | null>(null);

  const handleItemSelect = (item: Equipment) => {
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handlePreview = () => {
    if (selectedItems.length === 0) return;
    const result = disassembleManager.previewBatchDisassemble(selectedItems);
    setPreviewResult(result);
  };

  const handleDisassemble = () => {
    if (selectedItems.length === 0) return;
    const result = disassembleManager.batchDisassemble(selectedItems);
    addMaterials(result.materials);
    selectedItems.forEach(item => removeFromInventory(item.id));
    setSelectedItems([]);
    setPreviewResult(null);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-white font-bold">装备分解</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* 装备列表 */}
          <div className="w-1/2 bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 className="text-lg text-white font-bold mb-4">可分解装备</h3>
            <div className="space-y-2">
              {inventory.map(item => (
                <div
                  key={item.id}
                  className={`p-2 rounded flex items-center cursor-pointer ${
                    selectedItems.some(selected => selected.id === item.id)
                      ? 'bg-blue-900'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleItemSelect(item)}
                >
                  <img src={item.icon} alt={item.name} className="w-12 h-12" />
                  <div className="ml-4 flex-1">
                    <div className={`font-bold ${getQualityColor(item.quality)}`}>
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      分解价值：{formatNumber(disassembleManager.getDisassembleValue(item))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 预览结果 */}
          <div className="w-1/2 bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <h3 className="text-lg text-white font-bold mb-4">分解预览</h3>
            {selectedItems.length > 0 ? (
              <>
                <div className="mb-4">
                  <div className="text-gray-400">已选择 {selectedItems.length} 件装备</div>
                  <div className="text-yellow-400">
                    总价值：{formatNumber(disassembleManager.getBatchDisassembleValue(selectedItems))}
                  </div>
                </div>

                {previewResult && (
                  <div className="space-y-2">
                    {previewResult.materials.map(({ material, quantity }) => (
                      <div
                        key={material.id}
                        className="p-2 rounded bg-gray-700 flex items-center"
                      >
                        <img src={material.icon} alt={material.name} className="w-8 h-8" />
                        <div className="ml-4">
                          <div className={`font-bold ${getQualityColor(material.quality)}`}>
                            {material.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            预计获得：{quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-x-4">
                  <button
                    onClick={handlePreview}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    预览
                  </button>
                  <button
                    onClick={handleDisassemble}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    disabled={!previewResult}
                  >
                    分解
                  </button>
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-center">
                请选择要分解的装备
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisassemblePanel; 