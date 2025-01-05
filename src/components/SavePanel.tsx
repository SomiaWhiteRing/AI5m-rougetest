import React, { useState, useEffect } from 'react';
import { PersistenceManager } from '../game/managers/PersistenceManager';
import { formatNumber, formatDate, formatDuration } from '../utils/formatters';

interface SavePanelProps {
  persistenceManager: PersistenceManager;
  onClose: () => void;
  onLoad: () => void;
  onSave: () => void;
}

const SavePanel: React.FC<SavePanelProps> = ({
  persistenceManager,
  onClose,
  onLoad,
  onSave,
}) => {
  const [saveSlots, setSaveSlots] = useState<Array<{
    slot: string;
    meta: {
      timestamp: number;
      version: string;
      playerLevel: number;
      playTime: number;
    };
  }>>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSaveSlots();
  }, []);

  const loadSaveSlots = () => {
    const slots = persistenceManager.getSaveSlots();
    setSaveSlots(slots);
  };

  const handleSave = async () => {
    if (!selectedSlot) {
      setError('请选择一个存档位');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await persistenceManager.save(selectedSlot);
      loadSaveSlots();
      onSave();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async () => {
    if (!selectedSlot) {
      setError('请选择一个存档位');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await persistenceManager.load(selectedSlot);
      onLoad();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlot) {
      setError('请选择一个存档位');
      return;
    }

    if (!window.confirm('确定要删除这个存档吗？')) {
      return;
    }

    setError(null);

    try {
      await persistenceManager.delete(selectedSlot);
      setSelectedSlot(null);
      loadSaveSlots();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const createNewSaveSlot = () => {
    const existingSlots = saveSlots.map(s => parseInt(s.slot.replace('slot_', '')));
    const maxSlot = Math.max(0, ...existingSlots);
    return `slot_${maxSlot + 1}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-white font-bold">游戏存档</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 flex gap-4">
          {/* 存档列表 */}
          <div className="w-2/3 bg-gray-800 rounded-lg p-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {saveSlots.map(({ slot, meta }) => (
                <div
                  key={slot}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedSlot === slot
                      ? 'bg-blue-900'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-white font-bold">
                      存档 {slot.replace('slot_', '')}
                    </div>
                    <div className="text-gray-400 text-sm">
                      v{meta.version}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-300">
                      等级：{meta.playerLevel}
                    </div>
                    <div className="text-gray-300">
                      游戏时间：{formatDuration(meta.playTime)}
                    </div>
                    <div className="text-gray-400">
                      {formatDate(meta.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {/* 新建存档按钮 */}
              <div
                className="p-4 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
                onClick={() => setSelectedSlot(createNewSaveSlot())}
              >
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">+</div>
                  <div>新建存档</div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作面板 */}
          <div className="w-1/3 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg text-white font-bold mb-4">存档操作</h3>
              <div className="space-y-4">
                <button
                  onClick={handleSave}
                  disabled={!selectedSlot || isSaving || isLoading}
                  className={`w-full py-2 px-4 rounded ${
                    !selectedSlot || isSaving || isLoading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white font-bold transition-colors`}
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleLoad}
                  disabled={!selectedSlot || isSaving || isLoading}
                  className={`w-full py-2 px-4 rounded ${
                    !selectedSlot || isSaving || isLoading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white font-bold transition-colors`}
                >
                  {isLoading ? '读取中...' : '读取'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!selectedSlot || isSaving || isLoading}
                  className={`w-full py-2 px-4 rounded ${
                    !selectedSlot || isSaving || isLoading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white font-bold transition-colors`}
                >
                  删除
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 text-white p-4 rounded-lg">
                {error}
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg text-white font-bold mb-2">提示</h3>
              <div className="text-gray-400 text-sm space-y-2">
                <p>• 保存游戏会覆盖当前选中的存档位</p>
                <p>• 读取存档会丢失当前未保存的进度</p>
                <p>• 删除存档操作无法撤销</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavePanel; 