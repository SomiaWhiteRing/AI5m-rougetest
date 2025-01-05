import { Scene } from 'phaser';
import { Entity } from '../entities/Entity';
import { LevelConfig, ObjectiveType, LEVELS } from '../../config/levels';
import { EventEmitter } from 'events';

export interface LevelState {
  levelId: string;
  objectives: {
    type: ObjectiveType;
    target: number;
    current: number;
    description: string;
  }[];
  timeRemaining?: number;
  isCompleted: boolean;
  startTime: number;
}

export class LevelManager {
  private scene: Scene;
  private currentLevel?: LevelConfig;
  private levelState?: LevelState;
  private events: EventEmitter;
  private updateInterval: number = 1000; // 1秒更新一次
  private lastUpdate: number = 0;

  constructor(scene: Scene) {
    this.scene = scene;
    this.events = new EventEmitter();
  }

  loadLevel(levelId: string): boolean {
    const level = LEVELS[levelId];
    if (!level) return false;

    this.currentLevel = level;
    this.levelState = {
      levelId,
      objectives: level.objectives.map(obj => ({
        type: obj.type,
        target: obj.target,
        current: 0,
        description: obj.description
      })),
      timeRemaining: level.timeLimit,
      isCompleted: false,
      startTime: this.scene.time.now
    };

    // 播放背景音乐
    if (level.backgroundMusic) {
      // TODO: 播放背景音乐
    }

    // 播放环境音效
    if (level.ambientSounds) {
      // TODO: 播放环境音效
    }

    this.events.emit('levelStart', this.levelState);
    return true;
  }

  update(time: number): void {
    if (!this.currentLevel || !this.levelState) return;

    // 每秒更新一次
    if (time - this.lastUpdate < this.updateInterval) return;
    this.lastUpdate = time;

    // 更新剩余时间
    if (this.levelState.timeRemaining !== undefined) {
      this.levelState.timeRemaining -= this.updateInterval;
      if (this.levelState.timeRemaining <= 0) {
        this.failLevel('时间耗尽');
        return;
      }
    }

    // 检查目标完成情况
    const allObjectivesCompleted = this.levelState.objectives.every(
      obj => obj.current >= obj.target
    );

    if (allObjectivesCompleted && !this.levelState.isCompleted) {
      this.completeLevel();
    }

    this.events.emit('levelUpdate', this.levelState);
  }

  private completeLevel(): void {
    if (!this.currentLevel || !this.levelState) return;

    this.levelState.isCompleted = true;
    this.events.emit('levelComplete', {
      levelId: this.levelState.levelId,
      reward: this.currentLevel.reward,
      timeTaken: this.scene.time.now - this.levelState.startTime
    });
  }

  private failLevel(reason: string): void {
    this.events.emit('levelFail', {
      levelId: this.levelState?.levelId,
      reason
    });
  }

  // 目标进度更新
  updateObjective(type: ObjectiveType, amount: number = 1): void {
    if (!this.levelState) return;

    const objective = this.levelState.objectives.find(obj => obj.type === type);
    if (objective) {
      objective.current = Math.min(objective.current + amount, objective.target);
      this.events.emit('objectiveUpdate', {
        type,
        current: objective.current,
        target: objective.target
      });
    }
  }

  // 事件监听
  onLevelStart(callback: (state: LevelState) => void): void {
    this.events.on('levelStart', callback);
  }

  onLevelUpdate(callback: (state: LevelState) => void): void {
    this.events.on('levelUpdate', callback);
  }

  onLevelComplete(callback: (data: { levelId: string; reward: any; timeTaken: number }) => void): void {
    this.events.on('levelComplete', callback);
  }

  onLevelFail(callback: (data: { levelId: string; reason: string }) => void): void {
    this.events.on('levelFail', callback);
  }

  onObjectiveUpdate(callback: (data: { type: ObjectiveType; current: number; target: number }) => void): void {
    this.events.on('objectiveUpdate', callback);
  }

  // 清理事件监听
  destroy(): void {
    this.events.removeAllListeners();
  }

  // 获取当前关卡状态
  getLevelState(): LevelState | undefined {
    return this.levelState;
  }

  // 获取当前关卡配置
  getCurrentLevel(): LevelConfig | undefined {
    return this.currentLevel;
  }

  // 检查关卡是否可进入
  canEnterLevel(levelId: string, playerLevel: number): boolean {
    const level = LEVELS[levelId];
    if (!level) return false;
    return playerLevel >= level.minLevel;
  }
} 