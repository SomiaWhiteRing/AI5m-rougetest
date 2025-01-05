import { describe, it, expect } from 'vitest'
import { Scene } from 'phaser'

describe('Test Environment', () => {
  it('should have window object', () => {
    expect(window).toBeDefined()
    expect(document).toBeDefined()
    expect(navigator).toBeDefined()
  })

  it('should have canvas support', () => {
    const canvas = document.createElement('canvas')
    expect(canvas).toBeDefined()
    expect(canvas instanceof HTMLCanvasElement).toBe(true)
  })

  it('should support 2D context', () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    expect(context).toBeDefined()
    expect(context).not.toBeNull()
  })

  it('should support basic canvas operations', () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context) {
      context.fillStyle = '#ff0000'
      context.fillRect(0, 0, 100, 100)
      expect(context.fillStyle.toLowerCase()).toBe('#ff0000')
    }
  })

  it('should support animation frame methods', () => {
    expect(requestAnimationFrame).toBeDefined()
    expect(cancelAnimationFrame).toBeDefined()
    
    const callback = () => {}
    const frameId = requestAnimationFrame(callback)
    expect(frameId).toBeDefined()
    cancelAnimationFrame(frameId)
  })

  it('should support Phaser.Scene', () => {
    class TestScene extends Scene {
      constructor() {
        super({ key: 'TestScene' })
      }
    }
    const scene = new TestScene()
    expect(scene).toBeDefined()
    expect(scene instanceof Scene).toBe(true)
  })

  it('should support basic image operations', () => {
    const img = new Image()
    expect(img).toBeDefined()
    expect(typeof img.src).toBe('string')
    expect(typeof img.width).toBe('number')
    expect(typeof img.height).toBe('number')
  })

  it('should support basic audio operations', () => {
    const audio = new Audio()
    expect(audio).toBeDefined()
    expect(typeof audio.src).toBe('string')
    expect(typeof audio.volume).toBe('number')
    expect(typeof audio.play).toBe('function')
    expect(typeof audio.pause).toBe('function')
  })

  it('should support canvas dimensions', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    expect(canvas.width).toBe(800)
    expect(canvas.height).toBe(600)
  })

  it('should support canvas data operations', () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context) {
      const imageData = context.createImageData(100, 100)
      expect(imageData).toBeDefined()
      expect(imageData.width).toBe(100)
      expect(imageData.height).toBe(100)
      expect(imageData.data).toBeDefined()
      expect(imageData.data.length).toBe(100 * 100 * 4)
    }
  })

  it('should support basic WebGL context', () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl')
    expect(context).toBeDefined()
  })
}) 