import { Scene, GameObjects, Sound, Textures } from 'phaser';

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface ParticleSystem extends GameObjects.GameObject {
  setFrequency: (frequency: number) => void;
  frequency: number;
  active: boolean;
}

export class PerformanceManager {
  private scene: Scene;
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  private lastUpdate: number = 0;
  private updateInterval: number = 1000; // 每秒更新一次
  private historySize: number = 60; // 保存60秒的历史数据

  constructor(scene: Scene) {
    this.scene = scene;
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    this.scene.game.events.on('step', this.update, this);
  }

  private update() {
    const now = performance.now();
    if (now - this.lastUpdate >= this.updateInterval) {
      // 记录FPS
      const fps = Math.round(this.scene.game.loop.actualFps);
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.historySize) {
        this.fpsHistory.shift();
      }

      // 记录内存使用
      const perf = performance as ExtendedPerformance;
      if (perf.memory) {
        const memory = perf.memory.usedJSHeapSize / 1024 / 1024; // MB
        this.memoryHistory.push(memory);
        if (this.memoryHistory.length > this.historySize) {
          this.memoryHistory.shift();
        }
      }

      this.lastUpdate = now;
      this.checkPerformance();
    }
  }

  private checkPerformance() {
    const avgFps = this.getAverageFps();
    if (avgFps < 30) {
      this.optimizeRendering();
    }

    if (this.memoryHistory.length > 0) {
      const avgMemory = this.getAverageMemory();
      if (avgMemory > 200) { // 如果内存使用超过200MB
        this.cleanupMemory();
      }
    }
  }

  private optimizeRendering() {
    // 降低粒子效果数量
    const particleSystems = this.scene.children.list
      .filter(child => child.type === 'ParticleEmitterManager') as ParticleSystem[];
    
    particleSystems.forEach(system => {
      if (system.active) {
        system.setFrequency(system.frequency * 1.5);
      }
    });

    // 降低动画帧率
    this.scene.anims.globalTimeScale = 0.8;

    // 减少视距
    if (this.scene.cameras.main.zoom > 0.8) {
      this.scene.cameras.main.zoom -= 0.1;
    }
  }

  private cleanupMemory() {
    // 清理纹理缓存
    const textureManager = this.scene.textures as Textures.TextureManager;
    const textureKeys = textureManager.getTextureKeys();
    const unusedTextures = textureKeys.filter(key => {
      return !key.startsWith('__DEFAULT') && !key.startsWith('__MISSING');
    });

    unusedTextures.forEach(key => {
      if (!this.isTextureInUse(key)) {
        this.scene.textures.remove(key);
      }
    });

    // 清理音频缓存
    const unusedSounds = Object.keys(this.scene.cache.audio.entries).filter(key => {
      return !this.isSoundPlaying(key);
    });

    unusedSounds.forEach(key => {
      this.scene.cache.audio.remove(key);
    });

    // 强制垃圾回收
    if (typeof window.gc === 'function') {
      window.gc();
    }
  }

  private isTextureInUse(key: string): boolean {
    return this.scene.children.list.some(child => {
      const sprite = child as GameObjects.Sprite;
      return sprite.texture && sprite.texture.key === key;
    });
  }

  private isSoundPlaying(key: string): boolean {
    const sounds = this.scene.sound.getAllPlaying() as Sound.BaseSound[];
    return sounds.some(sound => sound.key === key);
  }

  private getAverageFps(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  private getAverageMemory(): number {
    if (this.memoryHistory.length === 0) return 0;
    return this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length;
  }

  public getPerformanceStats() {
    return {
      currentFps: Math.round(this.scene.game.loop.actualFps),
      averageFps: Math.round(this.getAverageFps()),
      memory: this.memoryHistory.length > 0 ? Math.round(this.memoryHistory[this.memoryHistory.length - 1]) : 0,
      averageMemory: Math.round(this.getAverageMemory()),
    };
  }

  public destroy() {
    this.scene.game.events.off('step', this.update, this);
  }
} 