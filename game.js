// 游戏配置
const config = {
  tileSize: 20,
  mapWidth: 20,
  mapHeight: 20,
  colors: {
    wall: "#666",
    floor: "#222",
    player: "#0f0",
    enemy: "#f00",
    item: "#ff0",
    weapon: "#0ff",
    trap: "#f0f",
    boss: "#ff4400",
    portal: "#4444ff"
  },
  sounds: {
    hit: new Audio(
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" +
        Array(100).join("0")
    ),
    collect: new Audio(
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" +
        Array(100).join("1")
    ),
    levelUp: new Audio(
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" +
        Array(100).join("2")
    ),
  },
  expToLevel: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
};

// 在游戏配置后添加画布初始化
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置画布大小
canvas.width = config.tileSize * config.mapWidth;
canvas.height = config.tileSize * config.mapHeight;

// 成就定义
const achievements = [
  {
    id: "level5",
    icon: "👑",
    name: "初级探险家",
    description: "达到5级",
    condition: (game) => game.level >= 5,
    unlocked: false,
  },
  {
    id: "level10",
    icon: "👑",
    name: "中级探险家",
    description: "达到10级",
    condition: (game) => game.level >= 10,
    unlocked: false,
  },
  {
    id: "score1000",
    icon: "🏆",
    name: "积分大师",
    description: "获得1000分",
    condition: (game) => game.score >= 1000,
    unlocked: false,
  },
  {
    id: "score5000",
    icon: "🏆",
    name: "积分王者",
    description: "获得5000分",
    condition: (game) => game.score >= 5000,
    unlocked: false,
  },
  {
    id: "kills10",
    icon: "⚔️",
    name: "战斗新手",
    description: "击杀10个敌人",
    condition: (game) => game.totalKills >= 10,
    unlocked: false,
  },
  {
    id: "kills50",
    icon: "⚔️",
    name: "战斗大师",
    description: "击杀50个敌人",
    condition: (game) => game.totalKills >= 50,
    unlocked: false,
  },
  {
    id: "goldSword",
    icon: "🗡️",
    name: "最强武器",
    description: "获得金剑",
    condition: (game) => game.hasGoldSword,
    unlocked: false,
  },
  {
    id: "survivor",
    icon: "❤️",
    name: "生存专家",
    description: "在生命值低于10的情况下通过一关",
    condition: (game) => game.survivedWithLowHP,
    unlocked: false,
  },
  {
    id: "combo10",
    icon: "⚡",
    name: "连击大师",
    description: "达成10连击",
    condition: (game) => game.maxCombo >= 10,
    unlocked: false,
  },
  {
    id: "firstBoss",
    icon: "👹",
    name: "Boss猎人",
    description: "击败第一个Boss",
    condition: (game) => game.bossDefeated,
    unlocked: false,
  },
  {
    id: "collector",
    icon: "🎁",
    name: "收藏家",
    description: "收集所有类型的武器",
    condition: (game) => game.collectedWeapons?.size >= weaponTypes.length,
    unlocked: false,
  },
  {
    id: "explorer",
    icon: "🗺️",
    name: "探险家",
    description: "使用传送门20次",
    condition: (game) => game.portalUsed >= 20,
    unlocked: false,
  }
];

// 随机事件系统
const events = [
  {
    name: "宝藏房间",
    chance: 0.1,
    trigger: () => {
      const items = [];
      const itemCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < itemCount; i++) {
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        let x, y;
        do {
          x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
          y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
        } while (game.map[y][x] !== 0);
        items.push({ ...itemType, x, y });
      }
      game.items.push(...items);
      showNotification("发现宝藏房间！");
    }
  },
  {
    name: "精英怪物",
    chance: 0.15,
    trigger: () => {
      const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      let x, y;
      do {
        x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
        y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
      } while (game.map[y][x] !== 0);
      
      const eliteEnemy = {
        ...enemyType,
        x,
        y,
        hp: enemyType.hp * 2,
        attack: enemyType.attack * 1.5,
        exp: enemyType.exp * 2,
        isElite: true,
        color: "#ff00ff"
      };
      
      game.enemies.push(eliteEnemy);
      showNotification("小心！出现精英怪物！");
    }
  },
  {
    name: "恢复神殿",
    chance: 0.1,
    trigger: () => {
      game.player.hp = game.player.maxHp;
      showNotification("发现恢复神殿！生命值完全恢复！");
    }
  },
  {
    name: "武器强化",
    chance: 0.05,
    trigger: () => {
      if (game.player.weapon) {
        game.player.weapon.attack += 5;
        showNotification("发现武器强化祭坛！武器攻击力+5");
      }
    }
  }
];

// 游戏状态
const game = {
  map: [],
  player: { 
    x: 1, 
    y: 1, 
    hp: 100, 
    maxHp: 100,
    attack: 10, 
    defense: 5,
    weapon: null,
    exp: 0,
    nextLevelExp: 100,
    skills: []
  },
  enemies: [],
  items: [],
  weapons: [],
  traps: [],
  portals: [],
  level: 1,
  score: 0,
  highScore: 0,
  isGameOver: false,
  isPaused: false,
  totalKills: 0,
  hasGoldSword: false,
  survivedWithLowHP: false,
  bossDefeated: false,
  combo: 0,
  maxCombo: 0,
  collectedWeapons: new Set(),
  portalUsed: 0,
  eliteKills: 0,
  bossKills: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  maxLevel: 1,
  currentCombo: 0
};

// 武器数据
const weaponTypes = [
  { name: "铁剑", attack: 5, color: "#aaa", description: "普通的铁剑" },
  { name: "银剑", attack: 10, color: "#ddd", description: "锋利的银剑" },
  { name: "金剑", attack: 15, color: "#ff0", description: "传说中的金剑" },
  { name: "魔剑", attack: 20, color: "#f0f", description: "蕴含魔力的神秘之剑", special: "每次攻击有20%概率造成双倍伤害" },
  { name: "屠龙刀", attack: 25, color: "#f00", description: "杀死boss掉落的神器", special: "对boss造成额外50%伤害" }
];

// 物品类型
const itemTypes = [
  { type: "health", value: 20, color: "#ff0", description: "恢复20点生命值" },
  { type: "maxHealth", value: 10, color: "#f00", description: "永久增加10点最大生命值" },
  { type: "strength", value: 2, color: "#f0f", description: "永久增加2点攻击力" },
  { type: "defense", value: 1, color: "#00f", description: "永久增加1点防御力" },
  { type: "exp", value: 50, color: "#0ff", description: "获得50点经验值" }
];

// 敌人类型
const enemyTypes = [
  { name: "史莱姆", hp: 20, attack: 5, exp: 20, color: "#0f0" },
  { name: "骷髅", hp: 30, attack: 8, exp: 30, color: "#fff" },
  { name: "蝙蝠", hp: 15, attack: 12, exp: 25, color: "#00f" },
  { name: "巨魔", hp: 50, attack: 15, exp: 50, color: "#f00" }
];

// Boss数据
const bossTypes = [
  { 
    name: "地牢守卫", 
    hp: 200, 
    attack: 20, 
    exp: 500,
    color: "#ff4400",
    skills: [
      { name: "重击", damage: 30, chance: 0.2 },
      { name: "召唤小怪", summonCount: 2, chance: 0.1 }
    ]
  }
];

// 存档系统
const saveGame = () => {
  try {
    const saveData = {
      score: game.score,
      highScore: game.highScore,
      achievements: achievements.map(a => ({
        id: a.id,
        unlocked: a.unlocked
      })),
      stats: {
        totalKills: game.totalKills,
        eliteKills: game.eliteKills,
        bossKills: game.bossKills,
        maxCombo: game.maxCombo,
        maxLevel: game.maxLevel,
        totalDamageDealt: game.totalDamageDealt,
        totalDamageTaken: game.totalDamageTaken,
        collectedWeapons: Array.from(game.collectedWeapons),
        portalUsed: game.portalUsed
      },
      lastSaved: Date.now()
    };
    localStorage.setItem('dungeonGame', JSON.stringify(saveData));
  } catch (err) {
    console.error('保存游戏失败:', err);
    showNotification('保存游戏失败');
  }
};

const loadGame = () => {
  try {
    const saveData = localStorage.getItem("dungeonGame");
    if (saveData) {
      const data = JSON.parse(saveData);
      
      // 加载基本数据
      game.highScore = data.highScore || 0;
      
      // 加载成就
      if (data.achievements) {
        data.achievements.forEach((a) => {
          const achievement = achievements.find((ach) => ach.id === a.id);
          if (achievement) achievement.unlocked = a.unlocked;
        });
      }
      
      // 加载统计数据
      if (data.stats) {
        game.totalKills = data.stats.totalKills || 0;
        game.eliteKills = data.stats.eliteKills || 0;
        game.bossKills = data.stats.bossKills || 0;
        game.maxCombo = data.stats.maxCombo || 0;
        game.maxLevel = data.stats.maxLevel || 1;
        game.totalDamageDealt = data.stats.totalDamageDealt || 0;
        game.totalDamageTaken = data.stats.totalDamageTaken || 0;
        game.collectedWeapons = new Set(data.stats.collectedWeapons || []);
        game.portalUsed = data.stats.portalUsed || 0;
      }
      
      showNotification('游戏数据加载成功');
    }
  } catch (err) {
    console.error('加载游戏失败:', err);
    showNotification('加载游戏失败');
  }
};

// 自动保存
setInterval(saveGame, 60000); // 每分钟自动保存一次

// 在页面关闭时保存
window.addEventListener('beforeunload', () => {
  if (!game.isGameOver) {
    saveGame();
  }
});

// 成就系统
const checkAchievements = () => {
  let newUnlocks = false;
  achievements.forEach((achievement) => {
    if (!achievement.unlocked && achievement.condition(game)) {
      achievement.unlocked = true;
      newUnlocks = true;
      showNotification(`🎉 解锁成就：${achievement.name}`);
    }
  });
  if (newUnlocks) {
    updateAchievementsDisplay();
    saveGame();
  }
};

const updateAchievementsDisplay = () => {
  const container = document.getElementById("achievements");
  container.innerHTML = achievements
    .map(
      (a) => `
    <div class="achievement ${a.unlocked ? "unlocked" : ""}">
      <span class="achievement-icon">${a.icon}</span>
      <strong>${a.name}</strong><br>
      <small>${a.description}</small>
    </div>
  `
    )
    .join("");
};

// 通知系统
const showNotification = (message) => {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
};

// 更新状态显示
function updateStatus() {
  document.getElementById("levelText").textContent = game.level;
  document.getElementById("hpText").textContent = `${game.player.hp}/${game.player.maxHp}`;
  document.getElementById("attackText").textContent = 
    game.player.attack + (game.player.weapon ? game.player.weapon.attack : 0);
  document.getElementById("defenseText").textContent = game.player.defense;
  document.getElementById("scoreText").textContent = game.score;
  document.getElementById("comboText").textContent = game.currentCombo;
  
  const expProgress = Math.floor((game.player.exp / game.player.nextLevelExp) * 100);
  document.getElementById("expText").textContent = `${expProgress}%`;
}

// 生成随机地图
function generateMap() {
  game.map = [];
  for (let y = 0; y < config.mapHeight; y++) {
    game.map[y] = [];
    for (let x = 0; x < config.mapWidth; x++) {
      game.map[y][x] = Math.random() < 0.3 ? 1 : 0;
    }
  }

  // 确保玩家起始位置可用
  game.player.x = 1;
  game.player.y = 1;
  game.map[1][1] = 0;

  // 生成敌人
  game.enemies = [];
  const enemyCount = 3 + Math.floor(game.level / 2);
  for (let i = 0; i < enemyCount; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y][x] !== 0 || 
             (Math.abs(x - game.player.x) < 3 && Math.abs(y - game.player.y) < 3));
    
    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    game.enemies.push({
      ...enemyType,
      x,
      y,
      hp: enemyType.hp + game.level * 5,
      attack: enemyType.attack + Math.floor(game.level / 2)
    });
  }

  // 生成物品
  game.items = [];
  const itemCount = Math.min(3 + Math.floor(game.level / 3), 6);
  for (let i = 0; i < itemCount; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y][x] !== 0 || 
             isPositionOccupied(x, y) ||
             (Math.abs(x - game.player.x) < 2 && Math.abs(y - game.player.y) < 2));
      
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      game.items.push({ ...itemType, x, y });
    }

  // 生成武器
  game.weapons = [];
  if (Math.random() < 0.7) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y][x] !== 0 || 
             isPositionOccupied(x, y) ||
             (Math.abs(x - game.player.x) < 2 && Math.abs(y - game.player.y) < 2));
      
      const weaponLevel = Math.min(Math.floor(game.level / 3), weaponTypes.length - 1);
      const weaponType = weaponTypes[Math.max(0, weaponLevel)];
      game.weapons.push({ ...weaponType, x, y });
    }

  // 生成陷阱
  game.traps = [];
  const trapCount = Math.floor(game.level / 3);
  for (let i = 0; i < trapCount; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y][x] !== 0);
    game.traps.push({ x, y, damage: 10 + game.level * 2 });
  }

  // 每5关生成一个boss
  if (game.level % 5 === 0 && !game.bossDefeated) {
    const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    let x, y;
    do {
      x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y][x] !== 0);
    game.enemies.push({
      ...bossType,
      x,
      y,
      isBoss: true,
      currentHp: bossType.hp
    });
  }

  // 生成传送门
  if (Math.random() < 0.3) {
    let x1, y1, x2, y2;
    do {
      x1 = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y1 = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y1][x1] !== 0);
    do {
      x2 = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y2 = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y2][x2] !== 0 || (x2 === x1 && y2 === y1));
    
    game.portals = [
      { x: x1, y: y1, target: { x: x2, y: y2 } },
      { x: x2, y: y2, target: { x: x1, y: y1 } }
    ];
  }

  // 触发随机事件
  events.forEach(event => {
    if (Math.random() < event.chance) {
      event.trigger();
    }
  });
}

// 渲染游戏
function render() {
  if (game.isPaused) return;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制地图
  for (let y = 0; y < config.mapHeight; y++) {
    for (let x = 0; x < config.mapWidth; x++) {
      ctx.fillStyle = game.map[y][x] ? config.colors.wall : config.colors.floor;
      ctx.fillRect(
        x * config.tileSize,
        y * config.tileSize,
        config.tileSize - 1,
        config.tileSize - 1
      );
    }
  }

  // 绘制陷阱
  game.traps.forEach(trap => {
    ctx.fillStyle = config.colors.trap;
    ctx.fillRect(
      trap.x * config.tileSize,
      trap.y * config.tileSize,
      config.tileSize - 1,
      config.tileSize - 1
    );
  });

  // 绘制传送门
  game.portals.forEach(portal => {
    ctx.fillStyle = config.colors.portal;
    ctx.fillRect(
      portal.x * config.tileSize,
      portal.y * config.tileSize,
      config.tileSize - 1,
      config.tileSize - 1
    );
  });

  // 绘制物品
  game.items.forEach(item => {
    ctx.fillStyle = item.color || config.colors.item;
    ctx.fillRect(
      item.x * config.tileSize,
      item.y * config.tileSize,
      config.tileSize - 1,
      config.tileSize - 1
    );
  });

  // 绘制武器
  game.weapons.forEach(weapon => {
    ctx.fillStyle = weapon.color || config.colors.weapon;
    ctx.fillRect(
      weapon.x * config.tileSize,
      weapon.y * config.tileSize,
      config.tileSize - 1,
      config.tileSize - 1
    );
  });

  // 绘制敌人
  game.enemies.forEach(enemy => {
    ctx.fillStyle = enemy.isBoss ? config.colors.boss : 
                   enemy.isElite ? "#ff00ff" : 
                   enemy.color || config.colors.enemy;
    ctx.fillRect(
      enemy.x * config.tileSize,
      enemy.y * config.tileSize,
      config.tileSize - 1,
      config.tileSize - 1
    );
    
    // 绘制生命条
    if (enemy.isBoss || enemy.isElite) {
      const hpPercent = enemy.hp / (enemy.isBoss ? enemy.currentHp : enemy.maxHp || enemy.hp);
      const hpWidth = config.tileSize - 2;
      const currentHpWidth = hpWidth * hpPercent;
      
      // 背景
      ctx.fillStyle = "#600";
      ctx.fillRect(
        enemy.x * config.tileSize,
        enemy.y * config.tileSize - 4,
        hpWidth,
        3
      );
      
      // 当前生命值
      ctx.fillStyle = "#f00";
      ctx.fillRect(
        enemy.x * config.tileSize,
        enemy.y * config.tileSize - 4,
        currentHpWidth,
        3
      );
    }
  });

  // 绘制玩家
  ctx.fillStyle = config.colors.player;
  ctx.fillRect(
    game.player.x * config.tileSize,
    game.player.y * config.tileSize,
    config.tileSize - 1,
    config.tileSize - 1
  );
  
  // 绘制玩家生命条
  const playerHpPercent = game.player.hp / game.player.maxHp;
  const hpWidth = config.tileSize - 2;
  const currentHpWidth = hpWidth * playerHpPercent;
  
  // 背景
  ctx.fillStyle = "#600";
  ctx.fillRect(
    game.player.x * config.tileSize,
    game.player.y * config.tileSize - 4,
    hpWidth,
    3
  );
  
  // 当前生命值
  ctx.fillStyle = "#f00";
  ctx.fillRect(
    game.player.x * config.tileSize,
    game.player.y * config.tileSize - 4,
    currentHpWidth,
    3
  );
}

// 移动处理
function move(dx, dy) {
  if (game.isGameOver || game.isPaused) return;

  const newX = game.player.x + dx;
  const newY = game.player.y + dy;

  if (newX < 0 || newX >= config.mapWidth || newY < 0 || newY >= config.mapHeight) {
    return;
  }

  if (game.map[newY][newX] === 1) {
    return;
  }

  // 检查陷阱
  const trap = game.traps.find(t => t.x === newX && t.y === newY);
  if (trap) {
    game.player.hp -= Math.max(1, trap.damage - game.player.defense);
    showNotification(`触发陷阱！受到 ${trap.damage} 点伤害`);
    if (game.player.hp <= 0) {
      gameOver();
      return;
    }
  }

  // 检查传送门
  const portal = game.portals.find(p => p.x === newX && p.y === newY);
  if (portal) {
    game.player.x = portal.target.x;
    game.player.y = portal.target.y;
    game.portalUsed++;
    showNotification("传送成功！");
    checkAchievements();
    updateStatus();
    render();
    return;
  }

  // 战斗处理
  const enemy = game.enemies.find(e => e.x === newX && e.y === newY);
  if (enemy) {
    playSound(config.sounds.hit);
    const playerTotalAttack = game.player.attack + (game.player.weapon ? game.player.weapon.attack : 0);
    
    // 特殊武器效果
    let damage = playerTotalAttack;
    if (game.player.weapon) {
      if (game.player.weapon.name === "魔剑" && Math.random() < 0.2) {
        damage *= 2;
        showNotification("触发魔剑效果！双倍伤害！");
      } else if (game.player.weapon.name === "屠龙刀" && enemy.isBoss) {
        damage *= 1.5;
        showNotification("触发屠龙刀效果！");
      }
    }

    // 连击系统
    game.currentCombo++;
    if (game.currentCombo > game.maxCombo) {
      game.maxCombo = game.currentCombo;
      if (game.maxCombo % 5 === 0) {
        showNotification(`达成${game.maxCombo}连击！`);
      }
    }

    // 伤害计算
    enemy.hp -= damage;
    game.totalDamageDealt += damage;

    if (enemy.hp <= 0) {
      game.enemies = game.enemies.filter(e => e !== enemy);
      let expGain = enemy.exp;
      let scoreGain = 100 * game.level;
      
      if (enemy.isBoss) {
        expGain *= 2;
        scoreGain = 1000 * game.level;
        game.bossDefeated = true;
        game.bossKills++;
        showNotification(`击败Boss！获得 ${expGain} 经验值和大量分数！`);
        
        if (Math.random() < 0.5) {
          game.weapons.push({
            ...weaponTypes[weaponTypes.length - 1],
            x: enemy.x,
            y: enemy.y
          });
        }
      } else if (enemy.isElite) {
        expGain *= 1.5;
        scoreGain *= 2;
        game.eliteKills++;
        showNotification(`击败精英怪物！获得 ${expGain} 经验值！`);
      } else {
        showNotification(`击败敌人！连击 ${game.currentCombo}！获得 ${expGain} 经验值`);
      }
      
      game.player.exp += expGain;
      game.score += scoreGain;
      game.totalKills++;
      
      // 经验值检查
      while (game.player.exp >= game.player.nextLevelExp) {
        game.player.exp -= game.player.nextLevelExp;
        playerLevelUp();
      }
      
      checkAchievements();
    } else {
      // 敌人反击
      let enemyDamage = Math.max(1, enemy.attack - game.player.defense);
      
      if (enemy.isBoss) {
        enemy.skills.forEach(skill => {
          if (Math.random() < skill.chance) {
            if (skill.damage) {
              enemyDamage = Math.max(1, skill.damage - game.player.defense);
              showNotification(`Boss使用${skill.name}！造成 ${enemyDamage} 点伤害`);
            } else if (skill.summonCount) {
              for (let i = 0; i < skill.summonCount; i++) {
                spawnMinion(enemy);
              }
              showNotification(`Boss召唤了 ${skill.summonCount} 个随从！`);
            }
          }
        });
      }
      
      game.player.hp -= enemyDamage;
      game.totalDamageTaken += enemyDamage;
      showNotification(`受到 ${enemyDamage} 点伤害`);
      
      if (game.player.hp <= 0) {
        gameOver();
      }
      game.currentCombo = 0;
    }
    return;
  }

  // 物品拾取
  const item = game.items.find(i => i.x === newX && i.y === newY);
  if (item) {
    handleItemPickup(item);
  }

  // 武器拾取
  const weapon = game.weapons.find(w => w.x === newX && w.y === newY);
  if (weapon) {
    handleWeaponPickup(weapon);
  }

  // 移动玩家
  game.player.x = newX;
  game.player.y = newY;

  // 检查是否通关
  if (game.enemies.length === 0) {
    if (game.player.hp < 10) game.survivedWithLowHP = true;
    playSound(config.sounds.levelUp);
    game.level++;
    if (game.level > game.maxLevel) game.maxLevel = game.level;
    game.score += 500;
    game.currentCombo = 0;
    showNotification(`通过第 ${game.level - 1} 关！`);
    generateMap();
    checkAchievements();
  }

  updateStatus();
}

function gameOver() {
  game.isGameOver = true;
  if (game.score > game.highScore) {
    game.highScore = game.score;
    showNotification("🎉 新的最高分！");
  }
  
  document.getElementById("gameOver").style.display = "block";
  document.getElementById("finalScore").textContent = game.score;
  document.getElementById("highScore").textContent = game.highScore;
  document.getElementById("finalCombo").textContent = game.maxCombo;
  document.getElementById("finalKills").textContent = 
    `${game.totalKills} (普通: ${game.totalKills - game.eliteKills - game.bossKills}, ` +
    `精英: ${game.eliteKills}, Boss: ${game.bossKills})`;
  document.getElementById("finalLevel").textContent = game.maxLevel;
  
  saveGame();
}

function restartGame() {
  game.isGameOver = false;
  game.isPaused = false;
  game.level = 1;
  game.score = 0;
  game.totalKills = 0;
  game.eliteKills = 0;
  game.bossKills = 0;
  game.hasGoldSword = false;
  game.survivedWithLowHP = false;
  game.bossDefeated = false;
  game.combo = 0;
  game.maxCombo = 0;
  game.currentCombo = 0;
  game.collectedWeapons = new Set();
  game.portalUsed = 0;
  game.totalDamageDealt = 0;
  game.totalDamageTaken = 0;
  game.maxLevel = 1;
  
  // 重置玩家状态
  game.player = { 
    x: 1,
    y: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    weapon: null,
    exp: 0,
    nextLevelExp: config.expToLevel(1),
    skills: []
  };
  
  // 清空游戏对象
  game.enemies = [];
  game.items = [];
  game.weapons = [];
  game.traps = [];
  game.portals = [];
  
  // 关闭所有模态框
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
  
  generateMap();
  updateStatus();
  render();
}

// 菜单控制
document.getElementById("menu-btn").addEventListener("click", () => {
  game.isPaused = true;
  document.getElementById("menuModal").style.display = "block";
});

document.getElementById("continueBtn").addEventListener("click", () => {
  game.isPaused = false;
  document.getElementById("menuModal").style.display = "none";
  render();
});

document.getElementById("newGameBtn").addEventListener("click", () => {
  document.getElementById("menuModal").style.display = "none";
  restartGame();
  render();
});

document.getElementById("achievementsBtn").addEventListener("click", () => {
  document.getElementById("menuModal").style.display = "none";
  document.getElementById("achievementsModal").style.display = "block";
  updateAchievementsDisplay();
});

document.getElementById("helpBtn").addEventListener("click", () => {
  document.getElementById("menuModal").style.display = "none";
  document.getElementById("helpModal").style.display = "block";
});

document.getElementById("shareBtn").addEventListener("click", () => {
  const text = `我在地牢探险中获得了 ${game.score} 分！来挑战我吧！`;
  if (navigator.share) {
    navigator
      .share({
        title: "地牢探险",
        text: text,
        url: window.location.href,
      })
      .catch(() => {});
  } else {
    try {
      navigator.clipboard.writeText(text);
      showNotification("分享文本已复制到剪贴板");
    } catch {
      showNotification("分享失败");
    }
  }
});

// 控制按钮事件处理
const buttons = document.querySelectorAll(".control-btn");
const directions = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

buttons.forEach((btn, index) => {
  // 同时支持触摸和点击
  const handleInput = (e) => {
    e.preventDefault();
    if (index !== 4) { // 跳过中间的按钮
      move(directions[index][0], directions[index][1]);
      render();
    }
  };
  
  btn.addEventListener('touchstart', handleInput);
  btn.addEventListener('mousedown', handleInput);
});

// 添加键盘控制支持
document.addEventListener('keydown', (e) => {
  if (game.isGameOver || game.isPaused) return;
  
  const keyDirections = {
    'ArrowUp': [0, -1],
    'ArrowDown': [0, 1],
    'ArrowLeft': [-1, 0],
    'ArrowRight': [1, 0],
  };
  
  const direction = keyDirections[e.key];
  if (direction) {
    e.preventDefault();
    move(direction[0], direction[1]);
    render();
  }
});

// 初始化游戏
loadGame();
generateMap();
updateStatus();
updateAchievementsDisplay();
render();

// 游戏循环
let lastUpdate = Date.now();
const gameLoop = () => {
  if (game.isGameOver || game.isPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const now = Date.now();
  const dt = now - lastUpdate;
  
  if (dt >= 500) { // 每500ms更新一次敌人
    updateEnemies();
    lastUpdate = now;
  }
  
  render();
  requestAnimationFrame(gameLoop);
};

// 更新敌人
function updateEnemies() {
  game.enemies.forEach((enemy) => {
    if (Math.random() < (enemy.isBoss ? 0.3 : 0.2)) {
      const dx = game.player.x - enemy.x;
      const dy = game.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果是Boss，有概率随机移动而不是追踪玩家
      if (enemy.isBoss && Math.random() < 0.3) {
        const randomDirs = [[-1,0], [1,0], [0,-1], [0,1]];
        const dir = randomDirs[Math.floor(Math.random() * randomDirs.length)];
        tryMoveEnemy(enemy, dir[0], dir[1]);
        return;
      }
      
      // 如果距离过远，有概率随机移动
      if (distance > 6 && Math.random() < 0.4) {
        const randomDirs = [[-1,0], [1,0], [0,-1], [0,1]];
        const dir = randomDirs[Math.floor(Math.random() * randomDirs.length)];
        tryMoveEnemy(enemy, dir[0], dir[1]);
        return;
      }
      
      // 否则朝玩家方向移动
      const moveX = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0;
      const moveY = Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : 0;
      
      if (!tryMoveEnemy(enemy, moveX, moveY)) {
        // 如果主要方向移动失败，尝试次要方向
        if (moveX === 0) {
          tryMoveEnemy(enemy, Math.sign(dx), 0);
        } else {
          tryMoveEnemy(enemy, 0, Math.sign(dy));
        }
      }
    }
  });
}

// 尝试移动敌人
function tryMoveEnemy(enemy, dx, dy) {
  const newX = enemy.x + dx;
  const newY = enemy.y + dy;
  
  // 检查是否可以移动到新位置
  if (newX >= 0 && newX < config.mapWidth && 
      newY >= 0 && newY < config.mapHeight && 
      game.map[newY][newX] === 0 && 
      !game.enemies.some(e => e !== enemy && e.x === newX && e.y === newY) &&
      !(game.player.x === newX && game.player.y === newY)) {
    
    enemy.x = newX;
    enemy.y = newY;
    return true;
  }
  return false;
}

// 启动游戏循环
gameLoop();

// 修改音效播放函数
const playSound = (sound) => {
  sound.currentTime = 0;
  sound.play().catch(err => {
    console.log('音效播放失败:', err);
  });
};

// 玩家升级
function playerLevelUp() {
  playSound(config.sounds.levelUp);
  game.player.maxHp += 10;
  game.player.hp = game.player.maxHp;
  game.player.attack += 2;
  game.player.defense += 1;
  game.player.nextLevelExp = config.expToLevel(game.level + 1);
  showNotification("升级了！属性全面提升！");
  updateStatus();
}

// 生成Boss随从
function spawnMinion(boss) {
  const positions = [
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
  ];
  
  for (const pos of positions) {
    const x = boss.x + pos.dx;
    const y = boss.y + pos.dy;
    if (x >= 0 && x < config.mapWidth && y >= 0 && y < config.mapHeight && 
        game.map[y][x] === 0 && !game.enemies.some(e => e.x === x && e.y === y)) {
      const minion = {
        ...enemyTypes[0],
        x,
        y,
        hp: enemyTypes[0].hp * (game.level / 2)
      };
      game.enemies.push(minion);
      return;
    }
  }
}

// 检查位置是否被占用
function isPositionOccupied(x, y) {
  return (
    game.enemies.some(e => e.x === x && e.y === y) ||
    game.items.some(i => i.x === x && i.y === y) ||
    game.weapons.some(w => w.x === x && w.y === y) ||
    game.traps.some(t => t.x === x && t.y === y) ||
    game.portals.some(p => p.x === x && p.y === y)
  );
}

// 物品拾取处理
function handleItemPickup(item) {
  playSound(config.sounds.collect);
  let message = '';
  let scoreGain = 0;
  
  switch (item.type) {
    case "health":
      const healAmount = Math.min(item.value, game.player.maxHp - game.player.hp);
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + item.value);
      scoreGain = 50;
      message = `恢复 ${healAmount} 点生命值`;
      break;
    case "maxHealth":
      game.player.maxHp += item.value;
      game.player.hp += item.value;
      scoreGain = 100;
      message = `永久增加 ${item.value} 点最大生命值`;
      break;
    case "strength":
      game.player.attack += item.value;
      scoreGain = 150;
      message = `永久增加 ${item.value} 点攻击力`;
      break;
    case "defense":
      game.player.defense += item.value;
      scoreGain = 150;
      message = `永久增加 ${item.value} 点防御力`;
      break;
    case "exp":
      game.player.exp += item.value;
      scoreGain = 100;
      message = `获得 ${item.value} 点经验值`;
      break;
  }
  
  game.score += scoreGain;
  showNotification(message);
  
  // 经验值检查
  while (game.player.exp >= game.player.nextLevelExp) {
    game.player.exp -= game.player.nextLevelExp;
    playerLevelUp();
  }
}

// 武器拾取处理
function handleWeaponPickup(weapon) {
  playSound(config.sounds.collect);
  
  // 如果已有武器，将其放在当前位置
  if (game.player.weapon) {
    const oldWeapon = { ...game.player.weapon, x: game.player.x, y: game.player.y };
    game.weapons.push(oldWeapon);
  }
  
  if (weapon.name === "金剑") game.hasGoldSword = true;
  game.collectedWeapons.add(weapon.name);
  game.player.weapon = { ...weapon };
  game.score += 200;
  
  showNotification(`获得${weapon.name}！${weapon.description}`);
  if (weapon.special) {
    showNotification(`特殊效果：${weapon.special}`);
  }
  
  checkAchievements();
}
