import { describe, it, expect, beforeEach } from 'vitest'
import { Scene } from 'phaser'
import { HealthBar } from '../game/ui/HealthBar'
import { Inventory } from '../game/ui/Inventory'
import { Dialog } from '../game/ui/Dialog'
import { Button } from '../game/ui/Button'
import { Player } from '../game/entities/Player'

class MockScene extends Scene {
  constructor() {
    super({ key: 'MockScene' })
  }

  create() {
    // 空实现
  }
}

describe('UI Components', () => {
  let scene: Scene
  let player: Player

  beforeEach(() => {
    scene = new MockScene()
    player = new Player(scene, 0, 0)
  })

  describe('HealthBar', () => {
    let healthBar: HealthBar

    beforeEach(() => {
      healthBar = new HealthBar(scene, player)
    })

    it('should initialize with correct values', () => {
      expect(healthBar.getValue()).toBe(player.getState().health)
      expect(healthBar.getMaxValue()).toBe(player.getState().maxHealth)
    })

    it('should update when player health changes', () => {
      player.takeDamage(20)
      healthBar.update()
      expect(healthBar.getValue()).toBe(player.getState().health)
    })

    it('should handle zero health correctly', () => {
      player.takeDamage(player.getState().maxHealth)
      healthBar.update()
      expect(healthBar.getValue()).toBe(0)
    })
  })

  describe('Inventory', () => {
    let inventory: Inventory

    beforeEach(() => {
      inventory = new Inventory(scene, player)
    })

    it('should initialize empty', () => {
      expect(inventory.isEmpty()).toBe(true)
      expect(inventory.getItemCount()).toBe(0)
    })

    it('should add and remove items correctly', () => {
      const item = { id: 'health_potion', name: '生命药水', quantity: 1 }
      inventory.addItem(item)
      expect(inventory.getItemCount()).toBe(1)
      expect(inventory.hasItem('health_potion')).toBe(true)

      inventory.removeItem('health_potion')
      expect(inventory.getItemCount()).toBe(0)
      expect(inventory.hasItem('health_potion')).toBe(false)
    })

    it('should handle item stacking correctly', () => {
      const item = { id: 'health_potion', name: '生命药水', quantity: 1 }
      inventory.addItem(item)
      inventory.addItem(item)
      expect(inventory.getItemCount()).toBe(1)
      expect(inventory.getItemQuantity('health_potion')).toBe(2)
    })
  })

  describe('Dialog', () => {
    let dialog: Dialog

    beforeEach(() => {
      dialog = new Dialog(scene)
    })

    it('should show and hide correctly', () => {
      dialog.show('测试对话')
      expect(dialog.isVisible()).toBe(true)

      dialog.hide()
      expect(dialog.isVisible()).toBe(false)
    })

    it('should update text content', () => {
      const text = '新的对话内容'
      dialog.setText(text)
      expect(dialog.getText()).toBe(text)
    })

    it('should handle long text correctly', () => {
      const longText = '这是一段非常长的对话文本，需要测试是否能够正确处理换行和分页。'.repeat(10)
      dialog.setText(longText)
      expect(dialog.getPageCount()).toBeGreaterThan(1)
    })
  })

  describe('Button', () => {
    let button: Button
    let clicked: boolean

    beforeEach(() => {
      clicked = false
      button = new Button(scene, 0, 0, '测试按钮', () => {
        clicked = true
      })
    })

    it('should handle click events', () => {
      button.emit('pointerdown')
      expect(clicked).toBe(true)
    })

    it('should update text', () => {
      const newText = '新按钮文本'
      button.setText(newText)
      expect(button.getText()).toBe(newText)
    })

    it('should enable and disable correctly', () => {
      expect(button.isEnabled()).toBe(true)
      
      button.disable()
      expect(button.isEnabled()).toBe(false)
      
      button.enable()
      expect(button.isEnabled()).toBe(true)
    })
  })
}) 