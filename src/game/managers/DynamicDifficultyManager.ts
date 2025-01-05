import { Scene } from 'phaser';
import { BalanceManager } from './BalanceManager';
import { Difficulty } from '../../config/balanceConfig';

interface PerformanceMetrics {
  damageDealt: number;
  damageTaken: number;
  killCount: number;
  deathCount: number;
  completedQuests: number;
  averageQuestTime: number;
  goldEarned: number;
  experienceGained: number;
  timeAlive: number;
}

export class DynamicDifficultyManager {
  private scene: Scene;
  private balanceManager: BalanceManager;
  private metrics: PerformanceMetrics = {
    damageDealt: 0,
    damageTaken: 0,
    killCount: 0,
    deathCount: 0,
    completedQuests: 0,
    averageQuestTime: 0,
    goldEarned: 0,
    experienceGained: 0,
    timeAlive: 0,
  };
  private lastUpdateTime: number;
  private updateInterval: number = 5 * 60 * 1000; // 5分钟更新一次
  private performanceHistory: number[] = [];
  private historySize: number = 10;
  private difficultyChangeThreshold: number = 0.2;
  private enabled: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
    this.balanceManager = BalanceManager.getInstance();
    this.lastUpdateTime = Date.now();
    this.resetMetrics();
    this.initializeEvents();
  }

  private resetMetrics() {
    this.metrics = {
      damageDealt: 0,
      damageTaken: 0,
      killCount: 0,
      deathCount: 0,
      completedQuests: 0,
      averageQuestTime: 0,
      goldEarned: 0,
      experienceGained: 0,
      timeAlive: 0,
    };
  }

  private initializeEvents() {
    // 监听伤害事件
    this.scene.events.on('playerDamageDealt', (amount: number) => {
      this.metrics.damageDealt += amount;
    });

    this.scene.events.on('playerDamageTaken', (amount: number) => {
      this.metrics.damageTaken += amount;
    });

    // 监听击杀和死亡
    this.scene.events.on('enemyKilled', () => {
      this.metrics.killCount++;
    });

    this.scene.events.on('playerDeath', () => {
      this.metrics.deathCount++;
      this.updateDifficulty();
    });

    // 监听任务完成
    this.scene.events.on('questCompleted', (questTime: number) => {
      this.metrics.completedQuests++;
      this.metrics.averageQuestTime = 
        (this.metrics.averageQuestTime * (this.metrics.completedQuests - 1) + questTime) / 
        this.metrics.completedQuests;
      this.updateDifficulty();
    });

    // 监听资源获取
    this.scene.events.on('goldEarned', (amount: number) => {
      this.metrics.goldEarned += amount;
    });

    this.scene.events.on('experienceGained', (amount: number) => {
      this.metrics.experienceGained += amount;
    });

    // 定期更新
    this.scene.time.addEvent({
      delay: this.updateInterval,
      callback: this.updateDifficulty,
      callbackScope: this,
      loop: true
    });
  }

  public enable() {
    this.enabled = true;
    this.resetMetrics();
    this.performanceHistory = [];
  }

  public disable() {
    this.enabled = false;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private calculatePerformanceScore(): number {
    const now = Date.now();
    const timeElapsed = (now - this.lastUpdateTime) / 1000; // 转换为秒
    this.metrics.timeAlive = timeElapsed;

    // 计算各项指标的得分
    const damageRatio = this.metrics.damageTaken > 0 
      ? this.metrics.damageDealt / this.metrics.damageTaken 
      : 2;
    const killDeathRatio = this.metrics.deathCount > 0 
      ? this.metrics.killCount / this.metrics.deathCount 
      : 2;
    const questEfficiency = this.metrics.averageQuestTime > 0 
      ? 300 / this.metrics.averageQuestTime 
      : 1;
    const resourceEfficiency = timeElapsed > 0 
      ? (this.metrics.goldEarned + this.metrics.experienceGained) / timeElapsed 
      : 0;

    // 综合评分
    const score = (
      damageRatio * 0.3 +
      killDeathRatio * 0.3 +
      questEfficiency * 0.2 +
      resourceEfficiency * 0.2
    );

    // 归一化到0-1范围
    return Math.min(Math.max(score / 2, 0), 1);
  }

  private updateDifficulty() {
    if (!this.enabled) return;

    const performanceScore = this.calculatePerformanceScore();
    this.performanceHistory.push(performanceScore);

    if (this.performanceHistory.length > this.historySize) {
      this.performanceHistory.shift();
    }

    const averagePerformance = 
      this.performanceHistory.reduce((a, b) => a + b, 0) / 
      this.performanceHistory.length;

    const currentDifficulty = this.balanceManager.getCurrentDifficulty();
    const difficulties = Object.values(Difficulty);
    const currentIndex = difficulties.indexOf(currentDifficulty);

    if (averagePerformance > 0.8 && currentIndex < difficulties.length - 1) {
      // 表现优秀，提高难度
      this.balanceManager.setDifficulty(difficulties[currentIndex + 1]);
      this.scene.events.emit('difficultyIncreased', difficulties[currentIndex + 1]);
    } else if (averagePerformance < 0.3 && currentIndex > 0) {
      // 表现不佳，降低难度
      this.balanceManager.setDifficulty(difficulties[currentIndex - 1]);
      this.scene.events.emit('difficultyDecreased', difficulties[currentIndex - 1]);
    }

    // 重置指标
    this.resetMetrics();
    this.lastUpdateTime = Date.now();
  }

  public getPerformanceStats() {
    return {
      currentPerformance: this.calculatePerformanceScore(),
      performanceHistory: [...this.performanceHistory],
      metrics: { ...this.metrics },
      difficulty: this.balanceManager.getCurrentDifficulty()
    };
  }

  public destroy() {
    this.scene.events.off('playerDamageDealt');
    this.scene.events.off('playerDamageTaken');
    this.scene.events.off('enemyKilled');
    this.scene.events.off('playerDeath');
    this.scene.events.off('questCompleted');
    this.scene.events.off('goldEarned');
    this.scene.events.off('experienceGained');
  }
} 