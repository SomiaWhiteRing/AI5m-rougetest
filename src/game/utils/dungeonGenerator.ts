import { TileType } from '../types/dungeon'

interface Room {
  x: number
  y: number
  width: number
  height: number
  type: RoomType
  connected: boolean
}

enum RoomType {
  START = 'start',
  NORMAL = 'normal',
  TREASURE = 'treasure',
  SHOP = 'shop',
  BOSS = 'boss'
}

interface Corridor {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function generateDungeon(width: number, height: number): number[][] {
  // 初始化地图为墙壁
  const map: number[][] = Array(height).fill(0).map(() => Array(width).fill(TileType.WALL))
  
  // 生成房间
  const rooms: Room[] = generateRooms(width, height)
  
  // 连接房间
  const corridors: Corridor[] = connectRooms(rooms)
  
  // 将房间和走廊绘制到地图上
  drawRooms(map, rooms)
  drawCorridors(map, corridors)
  
  // 添加装饰
  addDecorations(map)
  
  return map
}

function generateRooms(width: number, height: number): Room[] {
  const rooms: Room[] = []
  const attempts = 50 // 尝试生成房间的次数
  const minRoomSize = 5
  const maxRoomSize = 10
  const minDistance = 2 // 房间之间的最小距离

  // 生成起始房间
  const startRoom: Room = {
    x: Math.floor(width / 4),
    y: Math.floor(height / 4),
    width: 7,
    height: 7,
    type: RoomType.START,
    connected: false
  }
  rooms.push(startRoom)

  // 生成Boss房间
  const bossRoom: Room = {
    x: Math.floor(width * 3 / 4),
    y: Math.floor(height * 3 / 4),
    width: 9,
    height: 9,
    type: RoomType.BOSS,
    connected: false
  }
  rooms.push(bossRoom)

  // 生成其他房间
  for (let i = 0; i < attempts; i++) {
    const roomWidth = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize
    const roomHeight = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize
    const roomX = Math.floor(Math.random() * (width - roomWidth - 2)) + 1
    const roomY = Math.floor(Math.random() * (height - roomHeight - 2)) + 1

    const newRoom: Room = {
      x: roomX,
      y: roomY,
      width: roomWidth,
      height: roomHeight,
      type: Math.random() < 0.15 ? (Math.random() < 0.5 ? RoomType.TREASURE : RoomType.SHOP) : RoomType.NORMAL,
      connected: false
    }

    // 检查是否与其他房间重叠
    let overlaps = false
    for (const room of rooms) {
      if (roomsOverlap(newRoom, room, minDistance)) {
        overlaps = true
        break
      }
    }

    if (!overlaps) {
      rooms.push(newRoom)
    }
  }

  return rooms
}

function roomsOverlap(room1: Room, room2: Room, minDistance: number): boolean {
  return !(room1.x + room1.width + minDistance < room2.x ||
           room2.x + room2.width + minDistance < room1.x ||
           room1.y + room1.height + minDistance < room2.y ||
           room2.y + room2.height + minDistance < room1.y)
}

function connectRooms(rooms: Room[]): Corridor[] {
  const corridors: Corridor[] = []
  const connectedRooms = new Set<Room>()
  
  // 从起始房间开始
  const startRoom = rooms.find(room => room.type === RoomType.START)
  if (!startRoom) return corridors
  
  connectedRooms.add(startRoom)
  startRoom.connected = true

  // 使用Prim算法连接所有房间
  while (connectedRooms.size < rooms.length) {
    let shortestDistance = Infinity
    let bestCorridor: Corridor | null = null
    let roomToConnect: Room | null = null

    // 寻找最近的未连接房间
    for (const connectedRoom of connectedRooms) {
      for (const room of rooms) {
        if (room.connected) continue

        const distance = Math.abs(room.x - connectedRoom.x) + Math.abs(room.y - connectedRoom.y)
        if (distance < shortestDistance) {
          shortestDistance = distance
          roomToConnect = room
          bestCorridor = {
            startX: connectedRoom.x + Math.floor(connectedRoom.width / 2),
            startY: connectedRoom.y + Math.floor(connectedRoom.height / 2),
            endX: room.x + Math.floor(room.width / 2),
            endY: room.y + Math.floor(room.height / 2)
          }
        }
      }
    }

    if (bestCorridor && roomToConnect) {
      corridors.push(bestCorridor)
      connectedRooms.add(roomToConnect)
      roomToConnect.connected = true
    } else {
      break
    }
  }

  return corridors
}

function drawRooms(map: number[][], rooms: Room[]) {
  rooms.forEach(room => {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
          // 设置房间地板
          map[y][x] = TileType.FLOOR

          // 根据房间类型添加特殊标记
          if (room.type === RoomType.START && x === room.x + Math.floor(room.width / 2) && y === room.y + Math.floor(room.height / 2)) {
            map[y][x] = TileType.START
          } else if (room.type === RoomType.BOSS && x === room.x + Math.floor(room.width / 2) && y === room.y + Math.floor(room.height / 2)) {
            map[y][x] = TileType.BOSS
          } else if (room.type === RoomType.TREASURE && x === room.x + Math.floor(room.width / 2) && y === room.y + Math.floor(room.height / 2)) {
            map[y][x] = TileType.TREASURE
          } else if (room.type === RoomType.SHOP && x === room.x + Math.floor(room.width / 2) && y === room.y + Math.floor(room.height / 2)) {
            map[y][x] = TileType.SHOP
          }
        }
      }
    }
  })
}

function drawCorridors(map: number[][], corridors: Corridor[]) {
  corridors.forEach(corridor => {
    // 先水平后垂直
    const horizontalFirst = Math.random() < 0.5

    if (horizontalFirst) {
      // 水平走廊
      const startX = Math.min(corridor.startX, corridor.endX)
      const endX = Math.max(corridor.startX, corridor.endX)
      for (let x = startX; x <= endX; x++) {
        if (x >= 0 && x < map[0].length && corridor.startY >= 0 && corridor.startY < map.length) {
          map[corridor.startY][x] = TileType.FLOOR
        }
      }

      // 垂直走廊
      const startY = Math.min(corridor.startY, corridor.endY)
      const endY = Math.max(corridor.startY, corridor.endY)
      for (let y = startY; y <= endY; y++) {
        if (corridor.endX >= 0 && corridor.endX < map[0].length && y >= 0 && y < map.length) {
          map[y][corridor.endX] = TileType.FLOOR
        }
      }
    } else {
      // 垂直走廊
      const startY = Math.min(corridor.startY, corridor.endY)
      const endY = Math.max(corridor.startY, corridor.endY)
      for (let y = startY; y <= endY; y++) {
        if (corridor.startX >= 0 && corridor.startX < map[0].length && y >= 0 && y < map.length) {
          map[y][corridor.startX] = TileType.FLOOR
        }
      }

      // 水平走廊
      const startX = Math.min(corridor.startX, corridor.endX)
      const endX = Math.max(corridor.startX, corridor.endX)
      for (let x = startX; x <= endX; x++) {
        if (x >= 0 && x < map[0].length && corridor.endY >= 0 && corridor.endY < map.length) {
          map[corridor.endY][x] = TileType.FLOOR
        }
      }
    }
  })
}

function addDecorations(map: number[][]) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === TileType.WALL) {
        // 检查是否是墙壁边缘
        if (isWallEdge(map, x, y)) {
          // 随机添加装饰
          if (Math.random() < 0.2) {
            map[y][x] = TileType.WALL_DECORATION
          }
        }
      } else if (map[y][x] === TileType.FLOOR) {
        // 随机添加地板装饰
        if (Math.random() < 0.05) {
          map[y][x] = TileType.FLOOR_DECORATION
        }
      }
    }
  }
}

function isWallEdge(map: number[][], x: number, y: number): boolean {
  // 检查周围8个方向是否有地板
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      
      const newY = y + dy
      const newX = x + dx
      
      if (newY >= 0 && newY < map.length && newX >= 0 && newX < map[0].length) {
        if (map[newY][newX] === TileType.FLOOR) {
          return true
        }
      }
    }
  }
  return false
} 