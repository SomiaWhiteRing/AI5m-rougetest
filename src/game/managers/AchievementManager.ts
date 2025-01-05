import { AchievementConfig, ACHIEVEMENTS } from '../../config/achievements';

export interface AchievementProgress {
  id: string;
  current: number;
  isUnlocked: boolean;
  unlockTime?: number;
}

export interface AchievementState {
  progress: Record<string, AchievementProgress>;
  unlockedCount: number;
  totalCount: number;
}

export class AchievementManager {
  private progress: Record<string, AchievementProgress> = {};
  private unlockedCount: number = 0;
  private totalCount: number = Object.keys(ACHIEVEMENTS).length;

  constructor() {
    this.initializeProgress();
  }

  private initializeProgress() {
    Object.keys(ACHIEVEMENTS).forEach(id => {
      this.progress[id] = {
        id,
        current: 0,
        isUnlocked: false,
      };
    });
  }

  public updateProgress(achievementId: string, value: number) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    const progress = this.progress[achievementId];
    if (!progress || progress.isUnlocked) return;

    progress.current = Math.min(value, achievement.requirement.target);

    if (progress.current >= achievement.requirement.target && !progress.isUnlocked) {
      this.unlockAchievement(achievementId);
    }
  }

  private unlockAchievement(achievementId: string) {
    const progress = this.progress[achievementId];
    if (!progress || progress.isUnlocked) return;

    progress.isUnlocked = true;
    progress.unlockTime = Date.now();
    this.unlockedCount++;
  }

  public getState(): AchievementState {
    return {
      progress: { ...this.progress },
      unlockedCount: this.unlockedCount,
      totalCount: this.totalCount,
    };
  }
}