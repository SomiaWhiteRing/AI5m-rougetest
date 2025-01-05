export interface EnemyConfig {
  name: string
  health: number
  damage: number
  speed: number
  experience: number
  gold: number
  sprite: string
  frame: number
}

export const ENEMY_CONFIGS: { [key: string]: EnemyConfig } = {
  slime: {
    name: '史莱姆',
    health: 20,
    damage: 5,
    speed: 50,
    experience: 10,
    gold: 5,
    sprite: 'enemies',
    frame: 0
  },
  skeleton: {
    name: '骷髅',
    health: 40,
    damage: 10,
    speed: 75,
    experience: 20,
    gold: 10,
    sprite: 'enemies',
    frame: 1
  },
  ghost: {
    name: '幽灵',
    health: 30,
    damage: 15,
    speed: 100,
    experience: 25,
    gold: 15,
    sprite: 'enemies',
    frame: 2
  },
  boss: {
    name: '魔王',
    health: 200,
    damage: 30,
    speed: 50,
    experience: 100,
    gold: 100,
    sprite: 'enemies',
    frame: 3
  }
} 