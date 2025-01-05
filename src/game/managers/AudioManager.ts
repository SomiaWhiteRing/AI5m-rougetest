import { Scene } from 'phaser'

interface PhaserSound extends Phaser.Sound.BaseSound {
  setVolume(value: number): this;
}

export interface AudioConfig {
  key: string
  path: string
  volume?: number
  loop?: boolean
  category: 'music' | 'sfx'
}

export const AUDIO_CONFIG: Record<string, AudioConfig> = {
  // 背景音乐
  mainTheme: {
    key: 'mainTheme',
    path: 'assets/audio/music/main_theme.mp3',
    volume: 0.5,
    loop: true,
    category: 'music'
  },
  battleTheme: {
    key: 'battleTheme',
    path: 'assets/audio/music/battle_theme.mp3',
    volume: 0.5,
    loop: true,
    category: 'music'
  },
  bossTheme: {
    key: 'bossTheme',
    path: 'assets/audio/music/boss_theme.mp3',
    volume: 0.6,
    loop: true,
    category: 'music'
  },

  // 环境音效
  wind: {
    key: 'wind',
    path: 'assets/audio/ambient/wind.mp3',
    volume: 0.3,
    loop: true,
    category: 'sfx'
  },
  rain: {
    key: 'rain',
    path: 'assets/audio/ambient/rain.mp3',
    volume: 0.3,
    loop: true,
    category: 'sfx'
  },

  // 战斗音效
  swordSwing: {
    key: 'swordSwing',
    path: 'assets/audio/sfx/sword_swing.mp3',
    volume: 0.4,
    category: 'sfx'
  },
  fireball: {
    key: 'fireball',
    path: 'assets/audio/sfx/fireball.mp3',
    volume: 0.4,
    category: 'sfx'
  },
  heal: {
    key: 'heal',
    path: 'assets/audio/sfx/heal.mp3',
    volume: 0.4,
    category: 'sfx'
  },
  hit: {
    key: 'hit',
    path: 'assets/audio/sfx/hit.mp3',
    volume: 0.4,
    category: 'sfx'
  },
  death: {
    key: 'death',
    path: 'assets/audio/sfx/death.mp3',
    volume: 0.4,
    category: 'sfx'
  },

  // UI音效
  click: {
    key: 'click',
    path: 'assets/audio/ui/click.mp3',
    volume: 0.3,
    category: 'sfx'
  },
  hover: {
    key: 'hover',
    path: 'assets/audio/ui/hover.mp3',
    volume: 0.2,
    category: 'sfx'
  },
  achievement: {
    key: 'achievement',
    path: 'assets/audio/ui/achievement.mp3',
    volume: 0.4,
    category: 'sfx'
  }
}

export class AudioManager {
  private scene: Scene
  private currentMusic?: PhaserSound
  private sounds: Map<string, PhaserSound> = new Map()
  private musicVolume: number = 0.5
  private sfxVolume: number = 0.5
  private isMusicMuted: boolean = false
  private isSfxMuted: boolean = false

  constructor(scene: Scene) {
    this.scene = scene
    this.loadSettings()
    this.preloadAudio()
  }

  private loadSettings() {
    // 从本地存储加载音频设置
    const settings = localStorage.getItem('audioSettings')
    if (settings) {
      const { musicVolume, sfxVolume, isMusicMuted, isSfxMuted } = JSON.parse(settings)
      this.musicVolume = musicVolume
      this.sfxVolume = sfxVolume
      this.isMusicMuted = isMusicMuted
      this.isSfxMuted = isSfxMuted
    }
  }

  private saveSettings() {
    // 保存音频设置到本地存储
    localStorage.setItem('audioSettings', JSON.stringify({
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMusicMuted: this.isMusicMuted,
      isSfxMuted: this.isSfxMuted
    }))
  }

  private preloadAudio() {
    // 预加载所有音频资源
    Object.values(AUDIO_CONFIG).forEach(config => {
      this.scene.load.audio(config.key, config.path)
    })
  }

  // 播放背景音乐
  playMusic(key: string, fadeIn: boolean = true) {
    const config = AUDIO_CONFIG[key]
    if (!config || config.category !== 'music') return

    // 如果当前有音乐在播放，先淡出
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.stop()
    }

    // 创建新的音乐实例
    const music = this.scene.sound.add(key, {
      volume: this.isMusicMuted ? 0 : this.musicVolume * (config.volume || 1),
      loop: config.loop
    })

    if (fadeIn) {
      music.setVolume(0)
      music.play()
      this.scene.tweens.add({
        targets: music,
        volume: this.isMusicMuted ? 0 : this.musicVolume * (config.volume || 1),
        duration: 1000
      })
    } else {
      music.play()
    }

    this.currentMusic = music
  }

  // 播放音效
  playSfx(key: string) {
    const config = AUDIO_CONFIG[key]
    if (!config || config.category !== 'sfx' || this.isSfxMuted) return

    // 复用已有的音效实例或创建新的
    let sound = this.sounds.get(key)
    if (!sound) {
      sound = this.scene.sound.add(key, {
        volume: this.sfxVolume * (config.volume || 1),
        loop: config.loop
      })
      this.sounds.set(key, sound)
    }

    sound.play()
  }

  // 停止音效
  stopSfx(key: string) {
    const sound = this.sounds.get(key)
    if (sound) {
      sound.stop()
    }
  }

  // 停止所有音效
  stopAllSfx() {
    this.sounds.forEach(sound => {
      sound.stop()
    })
  }

  // 设置音乐音量
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.isMusicMuted ? 0 : this.musicVolume)
    }
    this.saveSettings()
  }

  // 设置音效音量
  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach(sound => {
      sound.setVolume(this.isSfxMuted ? 0 : this.sfxVolume)
    })
    this.saveSettings()
  }

  // 静音/取消静音音乐
  toggleMusicMute() {
    this.isMusicMuted = !this.isMusicMuted
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.isMusicMuted ? 0 : this.musicVolume)
    }
    this.saveSettings()
  }

  // 静音/取消静音音效
  toggleSfxMute() {
    this.isSfxMuted = !this.isSfxMuted
    this.sounds.forEach(sound => {
      sound.setVolume(this.isSfxMuted ? 0 : this.sfxVolume)
    })
    this.saveSettings()
  }

  // 获取音频设置
  getSettings() {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMusicMuted: this.isMusicMuted,
      isSfxMuted: this.isSfxMuted
    }
  }

  // 清理资源
  destroy() {
    if (this.currentMusic) {
      this.currentMusic.destroy()
    }
    this.sounds.forEach(sound => {
      sound.destroy()
    })
    this.sounds.clear()
  }
} 