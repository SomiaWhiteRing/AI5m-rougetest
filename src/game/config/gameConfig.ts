export const GAME_CONFIG = {
  // 游戏基本设置
  title: 'Roguelike Game',
  version: '1.0.0',
  
  // 显示设置
  tileSize: 32,
  gameWidth: window.innerWidth,
  gameHeight: window.innerHeight * 0.6,
  
  // 玩家初始属性
  playerStats: {
    health: 100,
    maxHealth: 100,
    attack: 10,
    defense: 5,
    speed: 200
  },
  
  // 游戏平衡性设置
  balance: {
    experienceMultiplier: 1.0,
    damageMultiplier: 1.0,
    dropRate: 0.1,
    enemySpawnRate: 0.05
  },
  
  // 音频设置
  audio: {
    defaultBGMVolume: 0.3,
    defaultSFXVolume: 0.5
  },
  
  // 控制设置
  controls: {
    touchAreaSize: 64,
    touchResponseThreshold: 0.3
  },
  
  // 性能设置
  performance: {
    maxParticles: 100,
    maxEnemies: 50,
    cullDistance: 1000
  }
} 