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
};

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
];

// 游戏状态
const game = {
  map: [],
  player: { x: 0, y: 0, hp: 100, attack: 10, weapon: null },
  enemies: [],
  items: [],
  weapons: [],
  level: 1,
  score: 0,
  highScore: 0,
  isGameOver: false,
  isPaused: false,
  totalKills: 0,
  hasGoldSword: false,
  survivedWithLowHP: false,
};

// 武器数据
const weaponTypes = [
  { name: "铁剑", attack: 5, color: "#aaa" },
  { name: "银剑", attack: 10, color: "#ddd" },
  { name: "金剑", attack: 15, color: "#ff0" },
];

// 存档系统
const saveGame = () => {
  const saveData = {
    score: game.score,
    highScore: game.highScore,
    achievements: achievements.map((a) => ({ id: a.id, unlocked: a.unlocked })),
  };
  localStorage.setItem("dungeonGame", JSON.stringify(saveData));
};

const loadGame = () => {
  const saveData = localStorage.getItem("dungeonGame");
  if (saveData) {
    const data = JSON.parse(saveData);
    game.highScore = data.highScore || 0;
    if (data.achievements) {
      data.achievements.forEach((a) => {
        const achievement = achievements.find((ach) => ach.id === a.id);
        if (achievement) achievement.unlocked = a.unlocked;
      });
    }
  }
};

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
  document.getElementById("hpText").textContent = game.player.hp;
  document.getElementById("attackText").textContent =
    game.player.attack + (game.player.weapon ? game.player.weapon.attack : 0);
  document.getElementById("scoreText").textContent = game.score;
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
    } while (game.map[y][x] !== 0);
    game.enemies.push({
      x,
      y,
      hp: 15 + game.level * 5,
      attack: 3 + game.level,
    });
  }

  // 生成物品
  game.items = [];
  for (let i = 0; i < 3; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y][x] !== 0);
    game.items.push({ x, y, type: "health", value: 20 });
  }

  // 生成武器
  game.weapons = [];
  if (Math.random() < 0.7) {
    let x, y;
    do {
      x = Math.floor(Math.random() * (config.mapWidth - 2)) + 1;
      y = Math.floor(Math.random() * (config.mapHeight - 2)) + 1;
    } while (game.map[y][x] !== 0);
    const weaponType =
      weaponTypes[Math.min(Math.floor(game.level / 3), weaponTypes.length - 1)];
    game.weapons.push({ x, y, ...weaponType });
  }
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

  // 绘制物品
  game.items.forEach((item) => {
    ctx.fillStyle = config.colors.item;
    ctx.fillRect(
      item.x * config.tileSize,
      item.y * config.tileSize,
      config.tileSize - 1,
      config.tileSize - 1
    );
  });

  // 绘制武器
  game.weapons.forEach((weapon) => {
    ctx.fillStyle = weapon.color;
    ctx.fillRect(
      weapon.x * config.tileSize,
      weapon.y * config.tileSize,
      config.tileSize - 1,
      config.tileSize - 1
    );
  });

  // 绘制敌人
  game.enemies.forEach((enemy) => {
    ctx.fillStyle = config.colors.enemy;
    ctx.fillRect(
      enemy.x * config.tileSize,
      enemy.y * config.tileSize,
      config.tileSize - 1,
      config.tileSize - 1
    );
  });

  // 绘制玩家
  ctx.fillStyle = config.colors.player;
  ctx.fillRect(
    game.player.x * config.tileSize,
    game.player.y * config.tileSize,
    config.tileSize - 1,
    config.tileSize - 1
  );
}

// 移动处理
function move(dx, dy) {
  if (game.isGameOver || game.isPaused) return;

  const newX = game.player.x + dx;
  const newY = game.player.y + dy;

  if (
    newX < 0 ||
    newX >= config.mapWidth ||
    newY < 0 ||
    newY >= config.mapHeight
  ) {
    return;
  }

  if (game.map[newY][newX] === 1) {
    return;
  }

  const enemy = game.enemies.find((e) => e.x === newX && e.y === newY);
  if (enemy) {
    config.sounds.hit.play().catch(() => {});
    const playerTotalAttack =
      game.player.attack + (game.player.weapon ? game.player.weapon.attack : 0);
    enemy.hp -= playerTotalAttack;
    if (enemy.hp <= 0) {
      game.enemies = game.enemies.filter((e) => e !== enemy);
      game.score += 100 * game.level;
      game.totalKills++;
      checkAchievements();
    } else {
      game.player.hp -= enemy.attack;
      if (game.player.hp <= 0) {
        gameOver();
      }
    }
    return;
  }

  const item = game.items.find((i) => i.x === newX && i.y === newY);
  if (item) {
    config.sounds.collect.play().catch(() => {});
    if (item.type === "health") {
      game.player.hp += item.value;
      game.score += 50;
    }
    game.items = game.items.filter((i) => i !== item);
    checkAchievements();
  }

  const weapon = game.weapons.find((w) => w.x === newX && w.y === newY);
  if (weapon) {
    config.sounds.collect.play().catch(() => {});
    if (weapon.name === "金剑") game.hasGoldSword = true;
    game.player.weapon = weapon;
    game.weapons = game.weapons.filter((w) => w !== weapon);
    game.score += 200;
    checkAchievements();
  }

  game.player.x = newX;
  game.player.y = newY;

  if (game.enemies.length === 0) {
    if (game.player.hp < 10) game.survivedWithLowHP = true;
    config.sounds.levelUp.play().catch(() => {});
    game.level++;
    game.score += 500;
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
  saveGame();
}

function restartGame() {
  game.isGameOver = false;
  game.isPaused = false;
  game.level = 1;
  game.score = 0;
  game.totalKills = 0;
  game.hasGoldSword = false;
  game.survivedWithLowHP = false;
  game.player = { x: 0, y: 0, hp: 100, attack: 10, weapon: null };
  document.getElementById("gameOver").style.display = "none";
  generateMap();
  updateStatus();
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
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (index !== 4) {
      move(directions[index][0], directions[index][1]);
      render();
    }
  });
});

// 初始化游戏
loadGame();
generateMap();
updateStatus();
updateAchievementsDisplay();
render();

// 游戏循环
setInterval(() => {
  if (game.isGameOver || game.isPaused) return;

  game.enemies.forEach((enemy) => {
    if (Math.random() < 0.2) {
      const dx = Math.sign(game.player.x - enemy.x);
      const dy = Math.sign(game.player.y - enemy.y);
      const newX = enemy.x + dx;
      const newY = enemy.y + dy;

      if (
        newX >= 0 &&
        newX < config.mapWidth &&
        newY >= 0 &&
        newY < config.mapHeight &&
        game.map[newY][newX] === 0
      ) {
        enemy.x = newX;
        enemy.y = newY;
      }
    }
  });
  render();
}, 500);
