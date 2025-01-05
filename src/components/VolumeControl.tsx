import React, { useEffect, useState } from 'react'
import { AudioManager } from '../game/managers/AudioManager'

interface VolumeControlProps {
  className?: string
}

const VolumeControl: React.FC<VolumeControlProps> = ({ className = '' }) => {
  const [bgmVolume, setBgmVolume] = useState(AudioManager.getInstance().getBGMVolume())
  const [sfxVolume, setSfxVolume] = useState(AudioManager.getInstance().getSFXVolume())

  useEffect(() => {
    AudioManager.getInstance().setBGMVolume(bgmVolume)
  }, [bgmVolume])

  useEffect(() => {
    AudioManager.getInstance().setSFXVolume(sfxVolume)
  }, [sfxVolume])

  return (
    <div className={`flex flex-col gap-4 p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-white">音乐</span>
        <input
          type="range"
          min="0"
          max="100"
          value={bgmVolume * 100}
          onChange={(e) => setBgmVolume(Number(e.target.value) / 100)}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-white w-12 text-right">{Math.round(bgmVolume * 100)}%</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-white">音效</span>
        <input
          type="range"
          min="0"
          max="100"
          value={sfxVolume * 100}
          onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-white w-12 text-right">{Math.round(sfxVolume * 100)}%</span>
      </div>
    </div>
  )
}

export default VolumeControl 