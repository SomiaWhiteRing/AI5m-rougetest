import { ITEM_CONFIGS, ItemConfig } from '../types/item'

export interface ShopItem {
  itemId: string
  config: ItemConfig
  price: number
  stock: number
  discount?: number
}

export interface Shop {
  id: string
  name: string
  description: string
  items: ShopItem[]
  refreshInterval?: number
  lastRefreshTime?: number
}

export class ShopSystem {
  private static instance: ShopSystem
  private shops: Map<string, Shop> = new Map()
  private listeners: ((shopId: string, shop: Shop) => void)[] = []

  private constructor() {
    this.loadShops()
  }

  static getInstance(): ShopSystem {
    if (!ShopSystem.instance) {
      ShopSystem.instance = new ShopSystem()
    }
    return ShopSystem.instance
  }

  private loadShops() {
    try {
      const savedShops = localStorage.getItem('shops')
      if (savedShops) {
        const shops = JSON.parse(savedShops)
        this.shops = new Map(Object.entries(shops))
      } else {
        this.initializeDefaultShops()
      }
    } catch (error) {
      console.error('加载商店数据失败:', error)
      this.initializeDefaultShops()
    }
  }

  private saveShops() {
    try {
      const shopsObj = Object.fromEntries(this.shops)
      localStorage.setItem('shops', JSON.stringify(shopsObj))
    } catch (error) {
      console.error('保存商店数据失败:', error)
    }
  }

  private initializeDefaultShops() {
    // 武器店
    this.addShop({
      id: 'weapon_shop',
      name: '武器店',
      description: '各种武器装备',
      items: [
        this.createShopItem('sword', 1.2),
        this.createShopItem('axe', 1.2),
        this.createShopItem('spear', 1.2)
      ],
      refreshInterval: 3600000 // 1小时
    })

    // 防具店
    this.addShop({
      id: 'armor_shop',
      name: '防具店',
      description: '各种防具护甲',
      items: [
        this.createShopItem('leather_armor', 1.2),
        this.createShopItem('chain_mail', 1.2)
      ],
      refreshInterval: 3600000
    })

    // 药水店
    this.addShop({
      id: 'potion_shop',
      name: '药水店',
      description: '各种药水和卷轴',
      items: [
        this.createShopItem('health_potion', 1.5),
        this.createShopItem('strength_potion', 1.5),
        this.createShopItem('fireball_scroll', 2),
        this.createShopItem('teleport_scroll', 2)
      ],
      refreshInterval: 1800000 // 30分钟
    })
  }

  private createShopItem(itemId: string, priceMultiplier: number = 1): ShopItem {
    const config = ITEM_CONFIGS[itemId]
    if (!config) throw new Error(`未找到物品配置: ${itemId}`)

    return {
      itemId,
      config,
      price: Math.round(config.price * priceMultiplier),
      stock: Math.floor(Math.random() * 3) + 1
    }
  }

  addShop(shop: Shop) {
    this.shops.set(shop.id, shop)
    this.notifyListeners(shop.id, shop)
    this.saveShops()
  }

  getShop(shopId: string): Shop | undefined {
    return this.shops.get(shopId)
  }

  getAllShops(): Shop[] {
    return Array.from(this.shops.values())
  }

  refreshShop(shopId: string) {
    const shop = this.shops.get(shopId)
    if (!shop) return

    // 刷新商品库存和价格
    shop.items = shop.items.map(item => ({
      ...item,
      stock: Math.floor(Math.random() * 3) + 1,
      discount: Math.random() < 0.2 ? 0.8 : undefined // 20%概率打折
    }))

    shop.lastRefreshTime = Date.now()
    this.notifyListeners(shopId, shop)
    this.saveShops()
  }

  buyItem(shopId: string, itemId: string, amount: number = 1): boolean {
    const shop = this.shops.get(shopId)
    if (!shop) return false

    const item = shop.items.find(i => i.itemId === itemId)
    if (!item || item.stock < amount) return false

    const totalPrice = Math.round(item.price * (item.discount || 1) * amount)
    if (!this.canAfford(totalPrice)) return false

    // 扣除金币
    this.deductGold(totalPrice)

    // 减少库存
    item.stock -= amount

    // 添加物品到玩家背包
    this.addItemToInventory(itemId, amount)

    this.notifyListeners(shopId, shop)
    this.saveShops()
    return true
  }

  private canAfford(price: number): boolean {
    // 这里需要与游戏状态管理器集成
    // 检查玩家是否有足够的金币
    return true
  }

  private deductGold(amount: number) {
    // 这里需要与游戏状态管理器集成
    // 扣除玩家金币
  }

  private addItemToInventory(itemId: string, amount: number) {
    // 这里需要与游戏状态管理器集成
    // 将物品添加到玩家背包
  }

  addListener(callback: (shopId: string, shop: Shop) => void) {
    this.listeners.push(callback)
  }

  removeListener(callback: (shopId: string, shop: Shop) => void) {
    const index = this.listeners.indexOf(callback)
    if (index !== -1) {
      this.listeners.splice(index, 1)
    }
  }

  private notifyListeners(shopId: string, shop: Shop) {
    this.listeners.forEach(listener => listener(shopId, shop))
  }

  checkRefresh() {
    const now = Date.now()
    this.shops.forEach(shop => {
      if (shop.refreshInterval && shop.lastRefreshTime) {
        if (now - shop.lastRefreshTime >= shop.refreshInterval) {
          this.refreshShop(shop.id)
        }
      }
    })
  }

  resetShops() {
    this.shops.clear()
    this.initializeDefaultShops()
    this.saveShops()
  }
} 