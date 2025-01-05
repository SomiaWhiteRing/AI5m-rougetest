import React, { useState } from 'react';

interface SettingsPanelProps {
  settings: {
    musicVolume: number;
    sfxVolume: number;
    isMusicMuted: boolean;
    isSfxMuted: boolean;
  };
  onSave: (settings: any) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSave,
  onClose
}) => {
  const [currentSettings, setCurrentSettings] = useState(settings);

  const handleVolumeChange = (type: 'music' | 'sfx', value: number) => {
    setCurrentSettings(prev => ({
      ...prev,
      [type === 'music' ? 'musicVolume' : 'sfxVolume']: value
    }));
  };

  const handleMuteToggle = (type: 'music' | 'sfx') => {
    setCurrentSettings(prev => ({
      ...prev,
      [type === 'music' ? 'isMusicMuted' : 'isSfxMuted']: !prev[type === 'music' ? 'isMusicMuted' : 'isSfxMuted']
    }));
  };

  const handleSave = () => {
    onSave(currentSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg w-96 p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">设置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* 音乐设置 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-lg">音乐音量</label>
              <button
                onClick={() => handleMuteToggle('music')}
                className={`px-3 py-1 rounded ${
                  currentSettings.isMusicMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {currentSettings.isMusicMuted ? '已静音' : '开启'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentSettings.musicVolume}
              onChange={e => handleVolumeChange('music', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400">
              {Math.round(currentSettings.musicVolume * 100)}%
            </div>
          </div>

          {/* 音效设置 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-lg">音效音量</label>
              <button
                onClick={() => handleMuteToggle('sfx')}
                className={`px-3 py-1 rounded ${
                  currentSettings.isSfxMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {currentSettings.isSfxMuted ? '已静音' : '开启'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentSettings.sfxVolume}
              onChange={e => handleVolumeChange('sfx', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400">
              {Math.round(currentSettings.sfxVolume * 100)}%
            </div>
          </div>

          {/* 其他设置选项可以在这里添加 */}
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}; 