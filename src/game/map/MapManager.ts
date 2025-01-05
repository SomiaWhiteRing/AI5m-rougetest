import { EventEmitter } from 'events';
import { MapGenerator, Room, MapConfig } from './MapGenerator';
import { MapRenderer, RenderConfig } from './MapRenderer';

export interface MapData {
  grid: number[][];
  rooms: Room[];
}

export class MapManager extends EventEmitter {
  private static _instance: MapManager;
  private _generator: MapGenerator;
  private _renderer: MapRenderer | null;
  private _currentMap: MapData | null;
  private _canvas: HTMLCanvasElement | null;

  private constructor() {
    super();
    this._generator = new MapGenerator();
    this._renderer = null;
    this._currentMap = null;
    this._canvas = null;
  }

  static getInstance(): MapManager {
    if (!MapManager._instance) {
      MapManager._instance = new MapManager();
    }
    return MapManager._instance;
  }

  // 初始化渲染器
  initRenderer(canvas: HTMLCanvasElement, config?: Partial<RenderConfig>): void {
    this._canvas = canvas;
    this._renderer = new MapRenderer(canvas, config);
  }

  // 生成新地图
  generateMap(config?: Partial<MapConfig>): MapData {
    // 更新生成器配置
    if (config) {
      this._generator = new MapGenerator(config);
    }

    // 生成地图
    const { rooms, grid } = this._generator.generate();
    this._currentMap = { rooms, grid };

    // 发出地图生成事件
    this.emit('mapGenerated', this._currentMap);

    return this._currentMap;
  }

  // 渲染地图
  async renderMap(): Promise<void> {
    if (!this._renderer || !this._currentMap) {
      throw new Error('Renderer or map not initialized');
    }

    await this._renderer.render(this._currentMap.grid, this._currentMap.rooms);
    this.emit('mapRendered');
  }

  // 获取房间信息
  getRoomAt(x: number, y: number): Room | null {
    if (!this._currentMap) return null;

    for (const room of this._currentMap.rooms) {
      if (
        x >= room.x && x < room.x + room.width &&
        y >= room.y && y < room.y + room.height
      ) {
        return room;
      }
    }

    return null;
  }

  // 获取地图数据
  getMapData(): MapData | null {
    return this._currentMap;
  }

  // 获取地图网格
  getGrid(): number[][] | null {
    return this._currentMap?.grid || null;
  }

  // 获取房间列表
  getRooms(): Room[] | null {
    return this._currentMap?.rooms || null;
  }

  // 获取起始房间
  getStartRoom(): Room | null {
    return this._currentMap?.rooms.find(room => room.type === 'start') || null;
  }

  // 获取Boss房间
  getBossRoom(): Room | null {
    return this._currentMap?.rooms.find(room => room.type === 'boss') || null;
  }

  // 获取宝藏房间
  getTreasureRooms(): Room[] {
    return this._currentMap?.rooms.filter(room => room.type === 'treasure') || [];
  }

  // 获取商店房间
  getShopRooms(): Room[] {
    return this._currentMap?.rooms.filter(room => room.type === 'shop') || [];
  }

  // 检查位置是否可通行
  isWalkable(x: number, y: number): boolean {
    if (!this._currentMap) return false;

    // 检查边界
    if (
      x < 0 || x >= this._currentMap.grid[0].length ||
      y < 0 || y >= this._currentMap.grid.length
    ) {
      return false;
    }

    // 1表示地板，可以通行
    return this._currentMap.grid[y][x] === 1;
  }

  // 检查位置是否是墙
  isWall(x: number, y: number): boolean {
    if (!this._currentMap) return false;

    // 检查边界
    if (
      x < 0 || x >= this._currentMap.grid[0].length ||
      y < 0 || y >= this._currentMap.grid.length
    ) {
      return true;
    }

    // 2表示墙
    return this._currentMap.grid[y][x] === 2;
  }

  // 获取相邻的可通行位置
  getAdjacentWalkablePositions(x: number, y: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 },  // 左
    ];

    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      if (this.isWalkable(newX, newY)) {
        positions.push({ x: newX, y: newY });
      }
    }

    return positions;
  }

  // 获取两点间的路径（使用A*算法）
  findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
    if (!this._currentMap) return [];

    // A*算法的辅助函数
    const heuristic = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    };

    const getKey = (x: number, y: number): string => `${x},${y}`;

    // 初始化
    const openSet = new Set<string>();
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, { x: number; y: number }>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const startKey = getKey(startX, startY);
    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(startX, startY, endX, endY));

    // 主循环
    while (openSet.size > 0) {
      // 找到f值最小的节点
      let current = '';
      let minF = Infinity;
      for (const key of openSet) {
        const f = fScore.get(key) || Infinity;
        if (f < minF) {
          minF = f;
          current = key;
        }
      }

      // 解析当前节点坐标
      const [x, y] = current.split(',').map(Number);

      // 到达目标
      if (x === endX && y === endY) {
        const path: { x: number; y: number }[] = [];
        let currentKey = current;
        while (cameFrom.has(currentKey)) {
          const pos = currentKey.split(',').map(Number);
          path.unshift({ x: pos[0], y: pos[1] });
          currentKey = getKey(cameFrom.get(currentKey)!.x, cameFrom.get(currentKey)!.y);
        }
        path.unshift({ x: startX, y: startY });
        return path;
      }

      // 从开放集中移除当前节点
      openSet.delete(current);
      closedSet.add(current);

      // 检查相邻节点
      const neighbors = this.getAdjacentWalkablePositions(x, y);
      for (const neighbor of neighbors) {
        const neighborKey = getKey(neighbor.x, neighbor.y);
        if (closedSet.has(neighborKey)) continue;

        const tentativeG = (gScore.get(current) || 0) + 1;

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        } else if (tentativeG >= (gScore.get(neighborKey) || Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, { x, y });
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(neighbor.x, neighbor.y, endX, endY));
      }
    }

    // 没有找到路径
    return [];
  }

  // 获取渲染器
  getRenderer(): MapRenderer | null {
    return this._renderer;
  }

  // 获取画布
  getCanvas(): HTMLCanvasElement | null {
    return this._canvas;
  }

  // 清理地图
  clear(): void {
    this._currentMap = null;
    this.emit('mapCleared');
  }
}