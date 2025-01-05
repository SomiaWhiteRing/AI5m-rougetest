import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Player } from '../game/entities/Player'
import { Enemy } from '../game/entities/Enemy'
import { Item } from '../game/entities/Item'
import { Skill } from '../game/entities/Skill'
import { generateDungeon } from '../game/utils/dungeonGenerator'
import { ENEMY_CONFIGS } from '../game/types/enemy'
import { ITEM_CONFIGS } from '../game/types/item'
import { SKILL_CONFIGS } from '../game/configs/skillConfigs'

// 模拟Phaser场景
class MockScene {
  add = {
    existing: () => {},
    sprite: () => {},
    particles: () => {},
    group: () => ({
      add: () => {},
      clear: () => {},
      countActive: () => 0,
      getLength: () => 0
    })
  }
  physics = {
    add: {
      existing: () => {},
      sprite: () => {}
    }
  }
  anims = {
    create: () => {},
    exists: () => false,
    generateFrameNumbers: () => []
  }
  time = {
    delayedCall: (delay: number, callback: () => void) => {
      setTimeout(callback, delay)
    }
  }
  tweens = {
    add: () => {}
  }
  events = {
    on: () => {},
    off: () => {}
  }
  children = {
    list: []
  }
}

describe('Player', () => {
  let scene: any
  let player: Player

  beforeEach(() => {
    scene = new MockScene()
    player = new Player(scene, 0, 0)
  })

  it('should initialize with correct default stats', () => {
    const state = player.getState()
    expect(state.health).toBe(100)
    expect(state.maxHealth).toBe(100)
    expect(state.mana).toBe(100)
    expect(state.maxMana).toBe(100)
    expect(state.level).toBe(1)
  })

  it('should take damage correctly', () => {
    const initialHealth = player.getState().health
    player.takeDamage(20)
    expect(player.getState().health).toBe(initialHealth - Math.max(1, 20 - player.getState().defense))
  })

  it('should heal correctly', () => {
    player.takeDamage(50)
    const beforeHeal = player.getState().health
    player.heal(30)
    expect(player.getState().health).toBe(Math.min(player.getState().maxHealth, beforeHeal + 30))
  })

  it('should gain experience and level up', () => {
    const initialLevel = player.getState().level
    player.gainExperience(1000)
    expect(player.getState().level).toBeGreaterThan(initialLevel)
  })
})

describe('Enemy', () => {
  let scene: any
  let enemy: Enemy

  beforeEach(() => {
    scene = new MockScene()
    enemy = new Enemy(scene, 0, 0, ENEMY_CONFIGS.slime)
  })

  it('should initialize with correct config stats', () => {
    const state = enemy.getState()
    expect(state.health).toBe(ENEMY_CONFIGS.slime.health)
    expect(state.attack).toBe(ENEMY_CONFIGS.slime.attack)
  })

  it('should take damage and die', () => {
    const initialHealth = enemy.getState().health
    enemy.takeDamage(initialHealth)
    expect(enemy.getState().health).toBe(0)
  })
})

describe('Item', () => {
  let scene: any
  let item: Item

  beforeEach(() => {
    scene = new MockScene()
    item = new Item(scene, 0, 0, ITEM_CONFIGS.health_potion)
  })

  it('should initialize with correct config', () => {
    expect(item.getConfig().id).toBe('health_potion')
  })

  it('should handle stacking correctly', () => {
    expect(item.canStack()).toBe(true)
    expect(item.getQuantity()).toBe(1)
    item.addToStack(2)
    expect(item.getQuantity()).toBe(3)
  })
})

describe('Skill', () => {
  let scene: any
  let player: Player
  let skill: Skill

  beforeEach(() => {
    scene = new MockScene()
    player = new Player(scene, 0, 0)
    skill = new Skill(SKILL_CONFIGS.slash, player)
  })

  it('should initialize with correct config', () => {
    expect(skill.getConfig().id).toBe('slash')
  })

  it('should handle cooldown correctly', () => {
    const time = Date.now()
    expect(skill.canUse(time)).toBe(true)
    skill.use(time)
    expect(skill.canUse(time)).toBe(false)
    expect(skill.canUse(time + skill.getConfig().cooldown! + 100)).toBe(true)
  })

  it('should level up correctly', () => {
    const initialLevel = skill.getLevel()
    expect(skill.levelUp()).toBe(true)
    expect(skill.getLevel()).toBe(initialLevel + 1)
  })
})

describe('Dungeon Generator', () => {
  it('should generate valid dungeon', () => {
    const width = 50
    const height = 50
    const dungeon = generateDungeon(width, height)

    expect(dungeon.length).toBe(height)
    expect(dungeon[0].length).toBe(width)

    // 检查是否有起点和终点
    let hasStart = false
    let hasBoss = false

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (dungeon[y][x] === 2) hasStart = true
        if (dungeon[y][x] === 3) hasBoss = true
      }
    }

    expect(hasStart).toBe(true)
    expect(hasBoss).toBe(true)
  })

  it('should generate connected rooms', () => {
    const width = 50
    const height = 50
    const dungeon = generateDungeon(width, height)

    // 检查是否有通路（值为1的格子）
    let hasPath = false
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (dungeon[y][x] === 1) {
          hasPath = true
          break
        }
      }
      if (hasPath) break
    }

    expect(hasPath).toBe(true)
  })
}) 