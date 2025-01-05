export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'start' | 'boss' | 'treasure' | 'shop' | 'normal';
  connections: Room[];
}

export interface MapConfig {
  width: number;
  height: number;
  minRooms: number;
  maxRooms: number;
  minRoomSize: number;
  maxRoomSize: number;
  minTreasureRooms: number;
  minShopRooms: number;
}

const DEFAULT_CONFIG: MapConfig = {
  width: 100,
  height: 100,
  minRooms: 10,
  maxRooms: 15,
  minRoomSize: 5,
  maxRoomSize: 10,
  minTreasureRooms: 2,
  minShopRooms: 1,
};

export class MapGenerator {
  private config: MapConfig;
  private grid: number[][];
  private rooms: Room[];

  constructor(config: Partial<MapConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.grid = [];
    this.rooms = [];
  }

  // 生成地图
  generate(): { rooms: Room[]; grid: number[][] } {
    this.initializeGrid();
    this.generateRooms();
    this.connectRooms();
    this.assignRoomTypes();
    this.carveCorridors();
    return { rooms: this.rooms, grid: this.grid };
  }

  // 初始化网格
  private initializeGrid(): void {
    this.grid = Array(this.config.height).fill(0).map(() =>
      Array(this.config.width).fill(2) // 2表示墙
    );
  }

  // 生成房间
  private generateRooms(): void {
    this.rooms = [];
    const numRooms = Math.floor(
      Math.random() * (this.config.maxRooms - this.config.minRooms + 1) + this.config.minRooms
    );

    for (let i = 0; i < numRooms; i++) {
      const room = this.createRoom();
      if (room) {
        this.rooms.push(room);
        this.carveRoom(room);
      }
    }
  }

  // 创建单个房间
  private createRoom(): Room | null {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const width = Math.floor(
        Math.random() * (this.config.maxRoomSize - this.config.minRoomSize + 1) + this.config.minRoomSize
      );
      const height = Math.floor(
        Math.random() * (this.config.maxRoomSize - this.config.minRoomSize + 1) + this.config.minRoomSize
      );
      const x = Math.floor(Math.random() * (this.config.width - width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.config.height - height - 2)) + 1;

      if (this.isValidRoomLocation(x, y, width, height)) {
        return {
          x,
          y,
          width,
          height,
          type: 'normal',
          connections: [],
        };
      }

      attempts++;
    }

    return null;
  }

  // 检查房间位置是否有效
  private isValidRoomLocation(x: number, y: number, width: number, height: number): boolean {
    // 检查边界
    if (
      x < 0 || x + width >= this.config.width ||
      y < 0 || y + height >= this.config.height
    ) {
      return false;
    }

    // 检查是否与其他房间重叠（包括留出1格间距）
    for (let i = y - 1; i <= y + height; i++) {
      for (let j = x - 1; j <= x + width; j++) {
        if (this.grid[i]?.[j] === 1) { // 1表示地板
          return false;
        }
      }
    }

    return true;
  }

  // 在网格中雕刻房间
  private carveRoom(room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.grid[y][x] = 1; // 1表示地板
      }
    }
  }

  // 连接房间
  private connectRooms(): void {
    // 使用最小生成树算法连接房间
    const edges: { from: Room; to: Room; distance: number }[] = [];

    // 计算所有房间之间的距离
    for (let i = 0; i < this.rooms.length; i++) {
      for (let j = i + 1; j < this.rooms.length; j++) {
        const distance = this.calculateDistance(this.rooms[i], this.rooms[j]);
        edges.push({
          from: this.rooms[i],
          to: this.rooms[j],
          distance,
        });
      }
    }

    // 按距离排序
    edges.sort((a, b) => a.distance - b.distance);

    // 使用并查集实现克鲁斯卡尔算法
    const disjointSet = new DisjointSet(this.rooms);
    for (const edge of edges) {
      if (!disjointSet.connected(edge.from, edge.to)) {
        disjointSet.union(edge.from, edge.to);
        edge.from.connections.push(edge.to);
        edge.to.connections.push(edge.from);
      }
    }
  }

  // 计算两个房间之间的曼哈顿距离
  private calculateDistance(room1: Room, room2: Room): number {
    const center1 = {
      x: room1.x + Math.floor(room1.width / 2),
      y: room1.y + Math.floor(room1.height / 2),
    };
    const center2 = {
      x: room2.x + Math.floor(room2.width / 2),
      y: room2.y + Math.floor(room2.height / 2),
    };
    return Math.abs(center1.x - center2.x) + Math.abs(center1.y - center2.y);
  }

  // 雕刻走廊
  private carveCorridors(): void {
    for (const room of this.rooms) {
      for (const connected of room.connections) {
        this.carveCorridorBetweenRooms(room, connected);
      }
    }
  }

  // 在两个房间之间雕刻走廊
  private carveCorridorBetweenRooms(room1: Room, room2: Room): void {
    const start = {
      x: room1.x + Math.floor(room1.width / 2),
      y: room1.y + Math.floor(room1.height / 2),
    };
    const end = {
      x: room2.x + Math.floor(room2.width / 2),
      y: room2.y + Math.floor(room2.height / 2),
    };

    // 先水平后垂直
    let x = start.x;
    let y = start.y;

    while (x !== end.x) {
      this.grid[y][x] = 1;
      x += x < end.x ? 1 : -1;
    }
    while (y !== end.y) {
      this.grid[y][x] = 1;
      y += y < end.y ? 1 : -1;
    }
  }

  // 分配房间类型
  private assignRoomTypes(): void {
    // 随机选择起始房间
    const startRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
    startRoom.type = 'start';

    // 选择距离起始房间最远的房间作为Boss房间
    let maxDistance = -1;
    let bossRoom: Room | null = null;
    for (const room of this.rooms) {
      if (room === startRoom) continue;
      const distance = this.calculateDistance(startRoom, room);
      if (distance > maxDistance) {
        maxDistance = distance;
        bossRoom = room;
      }
    }
    if (bossRoom) {
      bossRoom.type = 'boss';
    }

    // 分配宝藏房间
    const remainingRooms = this.rooms.filter(room => room.type === 'normal');
    for (let i = 0; i < this.config.minTreasureRooms && remainingRooms.length > 0; i++) {
      const index = Math.floor(Math.random() * remainingRooms.length);
      remainingRooms[index].type = 'treasure';
      remainingRooms.splice(index, 1);
    }

    // 分配商店房间
    for (let i = 0; i < this.config.minShopRooms && remainingRooms.length > 0; i++) {
      const index = Math.floor(Math.random() * remainingRooms.length);
      remainingRooms[index].type = 'shop';
      remainingRooms.splice(index, 1);
    }
  }
}

// 并查集实现
class DisjointSet {
  private parent: Map<Room, Room>;
  private rank: Map<Room, number>;

  constructor(rooms: Room[]) {
    this.parent = new Map();
    this.rank = new Map();

    for (const room of rooms) {
      this.parent.set(room, room);
      this.rank.set(room, 0);
    }
  }

  find(room: Room): Room {
    if (this.parent.get(room) !== room) {
      this.parent.set(room, this.find(this.parent.get(room)!));
    }
    return this.parent.get(room)!;
  }

  union(room1: Room, room2: Room): void {
    const root1 = this.find(room1);
    const root2 = this.find(room2);

    if (root1 !== root2) {
      const rank1 = this.rank.get(root1)!;
      const rank2 = this.rank.get(root2)!;

      if (rank1 < rank2) {
        this.parent.set(root1, root2);
      } else if (rank1 > rank2) {
        this.parent.set(root2, root1);
      } else {
        this.parent.set(root2, root1);
        this.rank.set(root1, rank1 + 1);
      }
    }
  }

  connected(room1: Room, room2: Room): boolean {
    return this.find(room1) === this.find(room2);
  }
}