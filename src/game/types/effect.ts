export enum EffectType {
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL',
  SHIELD = 'SHIELD',
  BUFF = 'BUFF',
  DEBUFF = 'DEBUFF',
  DOT = 'DOT',  // Damage Over Time
  HOT = 'HOT',  // Heal Over Time
  STUN = 'STUN',
  SLOW = 'SLOW',
  HASTE = 'HASTE'
}

export interface Effect {
  type: EffectType;
  value: number;
  duration: number;
  interval?: number;
  target: any;  // 这里应该是Entity类型，但为了避免循环依赖，暂时使用any
  source?: any;
  stackable?: boolean;
  maxStacks?: number;
  currentStacks?: number;
  onApply?: () => void;
  onRemove?: () => void;
  onTick?: () => void;
}

export interface EffectConfig {
  type: EffectType;
  baseValue: number;
  baseDuration: number;
  baseInterval?: number;
  stackable?: boolean;
  maxStacks?: number;
  scalingStats?: {
    [key: string]: number;
  };
} 