import { EffectType } from './EffectType';

export interface GameEffect {
  type: EffectType;
  value: number;
  duration: number;
  startTime: number;
} 