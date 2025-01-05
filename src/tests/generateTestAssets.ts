import { createCanvas } from 'canvas'
import * as fs from 'fs'
import * as path from 'path'

// 生成测试图像
function generateTestImage(width: number, height: number, color: string): Buffer {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toBuffer()
}

// 生成精灵表
function generateSpritesheet(width: number, height: number, frames: number, color: string): Buffer {
  const canvas = createCanvas(width * frames, height)
  const ctx = canvas.getContext('2d')
  
  for (let i = 0; i < frames; i++) {
    ctx.fillStyle = color
    ctx.fillRect(i * width, 0, width, height)
    ctx.strokeStyle = '#000000'
    ctx.strokeRect(i * width, 0, width, height)
  }
  
  return canvas.toBuffer()
}

// 确保目录存在
const assetsDir = path.join(process.cwd(), 'assets')
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir)
}

// 生成测试资源
const playerImage = generateTestImage(32, 32, '#ff0000')
const enemiesSheet = generateSpritesheet(32, 32, 4, '#00ff00')
const itemsSheet = generateSpritesheet(32, 32, 4, '#0000ff')

// 保存文件
fs.writeFileSync(path.join(assetsDir, 'player.png'), playerImage)
fs.writeFileSync(path.join(assetsDir, 'enemies.png'), enemiesSheet)
fs.writeFileSync(path.join(assetsDir, 'items.png'), itemsSheet)

console.log('测试资源生成完成') 