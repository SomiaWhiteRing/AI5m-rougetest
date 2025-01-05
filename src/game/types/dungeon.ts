export enum TileType {
  WALL = 0,
  FLOOR = 1,
  START = 2,
  BOSS = 3,
  TREASURE = 4,
  SHOP = 5,
  WALL_DECORATION = 6,
  FLOOR_DECORATION = 7
}

export enum RoomType {
  Normal = 'normal',
  Start = 'start',
  Boss = 'boss',
  Treasure = 'treasure',
  Shop = 'shop'
}

export interface Room {
  x: number
  y: number
  width: number
  height: number
  type: RoomType
} 