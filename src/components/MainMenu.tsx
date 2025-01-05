import React, { useState } from 'react';
import { SavePanel } from './SavePanel';
import { SettingsPanel } from './SettingsPanel';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: (slot: number) => void;
  onSettings: () => void;
  onExit: () => void;
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
  onSaveSettings: (settings: any) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onNewGame,
  onLoadGame,
  onSettings,
  onExit,
  saves,
  settings,
  onSaveSettings
}) => {
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLoadGame = (slot: number) => {
    onLoadGame(slot);
    setShowSavePanel(false);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleSaveSettings = (newSettings: any) => {
    onSaveSettings(newSettings);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="relative w-full max-w-4xl">
        {/* 游戏标题 */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">Roguelike Game</h1>
          <p className="text-xl text-gray-300">探索、战斗、成长</p>
        </div>

        {/* 主菜单按钮 */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={onNewGame}
            className="w-64 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors"
          >
            新游戏
          </button>
          <button
            onClick={() => setShowSavePanel(true)}
            className="w-64 px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors"
          >
            继续游戏
          </button>
          <button
            onClick={handleSettings}
            className="w-64 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-lg transition-colors"
          >
            设置
          </button>
          <button
            onClick={onExit}
            className="w-64 px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-lg transition-colors"
          >
            退出游戏
          </button>
        </div>

        {/* 版本信息 */}
        <div className="absolute bottom-4 left-4 text-gray-500">
          Version 1.0.0
        </div>

        {/* 存档面板 */}
        {showSavePanel && (
          <SavePanel
            saves={saves}
            onLoad={handleLoadGame}
            onSave={() => {}}
            onDelete={() => {}}
            onClose={() => setShowSavePanel(false)}
          />
        )}

        {/* 设置面板 */}
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
}; 