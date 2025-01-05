import { EffectType } from './EffectType';

export interface Effect {
  type: EffectType;
  value: number;
  duration: number;
  startTime: number;
}