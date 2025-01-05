import React, { useState } from 'react';
import { SavePanel } from './SavePanel';
import { SettingsPanel } from './SettingsPanel';

interface PauseMenuProps {
  onResume: () => void;
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
  onSettings: (settings: any) => void;
  onMainMenu: () => void;
  saves: Array<{
    slot: number;
    data: any;
  }>;
  settings: {
    musicVolume: number;
    sfxVolume: number;
    isMusicMuted: boolean;
    isSfxMuted: boolean;
  };
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onSave,
  onLoad,
  onSettings,
  onMainMenu,
  saves,
  settings
}) => {
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const handleSaveGame = (slot: number) => {
    onSave(slot);
    setShowSavePanel(false);
  };

  const handleLoadGame = (slot: number) => {
    onLoad(slot);
    setShowSavePanel(false);
  };

  const handleSettings = (newSettings: any) => {
    onSettings(newSettings);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="relative w-full max-w-lg">
        {/* 暂停标题 */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white">游戏暂停</h2>
        </div>

        {/* 主菜单按钮 */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onResume}
            className="w-64 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-lg transition-colors"
          >
            继续游戏
          </button>
          <button
            onClick={() => setShowSavePanel(true)}
            className="w-64 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-colors"
          >
            保存/读取
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-64 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-lg transition-colors"
          >
            设置
          </button>
          <button
            onClick={() => setShowConfirmExit(true)}
            className="w-64 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-lg transition-colors"
          >
            返回主菜单
          </button>
        </div>

        {/* 存档面板 */}
        {showSavePanel && (
          <SavePanel
            saves={saves}
            onLoad={handleLoadGame}
            onSave={handleSaveGame}
            onDelete={() => {}}
            onClose={() => setShowSavePanel(false)}
          />
        )}

        {/* 设置面板 */}
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onSave={handleSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* 退出确认对话框 */}
        {showConfirmExit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-4">确认退出</h3>
              <p className="mb-6">确定要返回主菜单吗？未保存的进度将会丢失。</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmExit(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                >
                  取消
                </button>
                <button
                  onClick={onMainMenu}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 