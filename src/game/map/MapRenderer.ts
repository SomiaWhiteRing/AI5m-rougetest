import { Room } from './MapGenerator';

export interface TileConfig {
  floor: {
    normal: string;
    start: string;
    boss: string;
    treasure: string;
    shop: string;
  };
  wall: {
    normal: string;
    corner: string;
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  corridor: string;
}

export interface RenderConfig {
  tileSize: number;
  tileConfig: TileConfig;
  showGrid: boolean;
  gridColor: string;
  backgroundColor: string;
}

export class MapRenderer {
  private _config: RenderConfig;
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  private _tileImages: Map<string, HTMLImageElement>;
  private _isLoading: boolean;
  private _loadPromise: Promise<void>;

  constructor(canvas: HTMLCanvasElement, config: Partial<RenderConfig> = {}) {
    this._canvas = canvas;
    this._context = canvas.getContext('2d')!;
    this._tileImages = new Map();
    this._isLoading = false;

    // 默认配置
    this._config = {
      tileSize: 32,
      tileConfig: {
        floor: {
          normal: '/assets/tiles/floor_normal.png',
          start: '/assets/tiles/floor_start.png',
          boss: '/assets/tiles/floor_boss.png',
          treasure: '/assets/tiles/floor_treasure.png',
          shop: '/assets/tiles/floor_shop.png',
        },
        wall: {
          normal: '/assets/tiles/wall_normal.png',
          corner: '/assets/tiles/wall_corner.png',
          top: '/assets/tiles/wall_top.png',
          bottom: '/assets/tiles/wall_bottom.png',
          left: '/assets/tiles/wall_left.png',
          right: '/assets/tiles/wall_right.png',
        },
        corridor: '/assets/tiles/corridor.png',
      },
      showGrid: false,
      gridColor: 'rgba(255, 255, 255, 0.1)',
      backgroundColor: '#000',
      ...config,
    };

    // 加载图片
    this._loadPromise = this.loadTileImages();
  }

  // 加载图片
  private async loadTileImages(): Promise<void> {
    if (this._isLoading) return this._loadPromise;

    this._isLoading = true;
    const promises: Promise<void>[] = [];

    // 加载地板图片
    for (const [key, path] of Object.entries(this._config.tileConfig.floor)) {
      promises.push(this.loadImage(`floor_${key}`, path));
    }

    // 加载墙壁图片
    for (const [key, path] of Object.entries(this._config.tileConfig.wall)) {
      promises.push(this.loadImage(`wall_${key}`, path));
    }

    // 加载走廊图片
    promises.push(this.loadImage('corridor', this._config.tileConfig.corridor));

    try {
      await Promise.all(promises);
      this._isLoading = false;
    } catch (error) {
      console.error('Failed to load tile images:', error);
      this._isLoading = false;
      throw error;
    }
  }

  // 加载单个图片
  private loadImage(key: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this._tileImages.set(key, img);
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
      img.src = path;
    });
  }

  // 渲染地图
  async render(grid: number[][], rooms: Room[]): Promise<void> {
    // 等待图片加载完成
    if (this._isLoading) {
      await this._loadPromise;
    }

    // 调整画布大小
    const width = grid[0].length * this._config.tileSize;
    const height = grid.length * this._config.tileSize;
    this._canvas.width = width;
    this._canvas.height = height;

    // 清空画布
    this._context.fillStyle = this._config.backgroundColor;
    this._context.fillRect(0, 0, width, height);

    // 渲染地板和走廊
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        if (tile === 1) { // 地板
          this.renderFloor(x, y, this.getFloorType(x, y, rooms));
        } else if (tile === 2) { // 墙
          this.renderWall(x, y, grid);
        }
      }
    }

    // 渲染网格
    if (this._config.showGrid) {
      this.renderGrid(width, height);
    }
  }

  // 获取地板类型
  private getFloorType(x: number, y: number, rooms: Room[]): keyof TileConfig['floor'] {
    for (const room of rooms) {
      if (
        x >= room.x && x < room.x + room.width &&
        y >= room.y && y < room.y + room.height
      ) {
        return room.type === 'normal' ? 'normal' : room.type;
      }
    }
    return 'normal'; // 走廊
  }

  // 渲染地板
  private renderFloor(x: number, y: number, type: keyof TileConfig['floor']): void {
    const image = this._tileImages.get(`floor_${type}`);
    if (!image) return;

    this._context.drawImage(
      image,
      x * this._config.tileSize,
      y * this._config.tileSize,
      this._config.tileSize,
      this._config.tileSize
    );
  }

  // 渲染墙壁
  private renderWall(x: number, y: number, grid: number[][]): void {
    // 检查周围的墙壁情况
    const top = y > 0 ? grid[y - 1][x] === 2 : false;
    const bottom = y < grid.length - 1 ? grid[y + 1][x] === 2 : false;
    const left = x > 0 ? grid[y][x - 1] === 2 : false;
    const right = x < grid[0].length - 1 ? grid[y][x + 1] === 2 : false;

    // 选择合适的墙壁图片
    let wallType: keyof TileConfig['wall'] = 'normal';

    if (!top && !bottom && !left && !right) {
      wallType = 'normal';
    } else if (top && bottom && !left && !right) {
      wallType = 'top';
    } else if (!top && !bottom && left && right) {
      wallType = 'left';
    } else if (top && !bottom && !left && !right) {
      wallType = 'bottom';
    } else if (!top && bottom && !left && !right) {
      wallType = 'top';
    } else if (!top && !bottom && left && !right) {
      wallType = 'right';
    } else if (!top && !bottom && !left && right) {
      wallType = 'left';
    } else {
      wallType = 'corner';
    }

    const image = this._tileImages.get(`wall_${wallType}`);
    if (!image) return;

    this._context.drawImage(
      image,
      x * this._config.tileSize,
      y * this._config.tileSize,
      this._config.tileSize,
      this._config.tileSize
    );
  }

  // 渲染网格
  private renderGrid(width: number, height: number): void {
    this._context.strokeStyle = this._config.gridColor;
    this._context.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x <= width; x += this._config.tileSize) {
      this._context.beginPath();
      this._context.moveTo(x, 0);
      this._context.lineTo(x, height);
      this._context.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= height; y += this._config.tileSize) {
      this._context.beginPath();
      this._context.moveTo(0, y);
      this._context.lineTo(width, y);
      this._context.stroke();
    }
  }

  // 设置配置
  setConfig(config: Partial<RenderConfig>): void {
    this._config = {
      ...this._config,
      ...config,
    };
  }

  // 获取配置
  getConfig(): RenderConfig {
    return { ...this._config };
  }

  // 获取画布
  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }

  // 获取上下文
  getContext(): CanvasRenderingContext2D {
    return this._context;
  }

  // 检查是否正在加载
  isLoading(): boolean {
    return this._isLoading;
  }
}