import { nanoid } from 'nanoid';
import { Equipment } from '../../types/equipment';
import { Shop, ShopItem, shops, calculatePrice, calculateSellPrice } from '../../config/shopConfig';
import { getEquipmentTemplate } from '../../config/dropTables';

interface ShopState {
  lastRefresh: number;
  currentItems: ShopItem[];
  currentSpecialItems: ShopItem[];
}

export class ShopManager {
  private shopStates: Map<string, ShopState> = new Map();

  constructor() {
    this.loadShopStates();
    this.checkAndRefreshShops();
  }

  private loadShopStates() {
    try {
      const savedStates = localStorage.getItem('shopStates');
      if (savedStates) {
        const states = JSON.parse(savedStates);
        Object.entries(states).forEach(([shopId, state]) => {
          this.shopStates.set(shopId, state as ShopState);
        });
      } else {
        // 初始化商店状态
        Object.entries(shops).forEach(([shopId, shop]) => {
          this.shopStates.set(shopId, {
            lastRefresh: Date.now(),
            currentItems: [...shop.items],
            currentSpecialItems: shop.specialItems ? [...shop.specialItems] : [],
          });
        });
      }
    } catch (error) {
      console.error('Failed to load shop states:', error);
      // 初始化默认状态
      this.initializeDefaultStates();
    }
  }

  private saveShopStates() {
    try {
      const states = Object.fromEntries(this.shopStates);
      localStorage.setItem('shopStates', JSON.stringify(states));
    } catch (error) {
      console.error('Failed to save shop states:', error);
    }
  }

  private initializeDefaultStates() {
    Object.entries(shops).forEach(([shopId, shop]) => {
      this.shopStates.set(shopId, {
        lastRefresh: Date.now(),
        currentItems: [...shop.items],
        currentSpecialItems: shop.specialItems ? [...shop.specialItems] : [],
      });
    });
    this.saveShopStates();
  }

  private checkAndRefreshShops() {
    const now = Date.now();
    Object.entries(shops).forEach(([shopId, shop]) => {
      const state = this.shopStates.get(shopId);
      if (!state) return;

      if (now - state.lastRefresh >= shop.refreshInterval) {
        this.refreshShop(shopId);
      }

      // 检查限时商品
      if (shop.specialItems) {
        const newSpecialItems = state.currentSpecialItems.filter(item => {
          return !item.refreshTime || now - state.lastRefresh < item.refreshTime;
        });

        if (newSpecialItems.length !== state.currentSpecialItems.length) {
          state.currentSpecialItems = newSpecialItems;
          this.shopStates.set(shopId, state);
          this.saveShopStates();
        }
      }
    });
  }

  public refreshShop(shopId: string) {
    const shop = shops[shopId];
    if (!shop) return;

    const state = this.shopStates.get(shopId);
    if (!state) return;

    // 刷新普通商品
    state.currentItems = shop.items.map(item => ({
      ...item,
      stock: Math.max(0, item.stock),
    }));

    // 刷新限时商品
    if (shop.specialItems) {
      state.currentSpecialItems = shop.specialItems.map(item => ({
        ...item,
        stock: Math.max(0, item.stock),
      }));
    }

    state.lastRefresh = Date.now();
    this.shopStates.set(shopId, state);
    this.saveShopStates();
  }

  public getShopItems(shopId: string): { regular: ShopItem[]; special: ShopItem[] } {
    this.checkAndRefreshShops();
    const state = this.shopStates.get(shopId);
    if (!state) {
      return { regular: [], special: [] };
    }
    return {
      regular: state.currentItems,
      special: state.currentSpecialItems,
    };
  }

  public buyItem(shopId: string, itemId: string, isSpecial: boolean): Equipment | null {
    const state = this.shopStates.get(shopId);
    if (!state) return null;

    const items = isSpecial ? state.currentSpecialItems : state.currentItems;
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return null;

    const item = items[itemIndex];
    if (item.stock <= 0) return null;

    const template = getEquipmentTemplate(itemId);
    if (!template) return null;

    // 减少库存
    items[itemIndex] = { ...item, stock: item.stock - 1 };
    this.shopStates.set(shopId, state);
    this.saveShopStates();

    // 创建装备实例
    return {
      id: nanoid(),
      enhanceLevel: 0,
      ...template,
    } as Equipment;
  }

  public getItemPrice(itemId: string, rarity: number): number {
    return calculatePrice(shops.generalStore.items.find(item => item.id === itemId)?.basePrice || 0, rarity);
  }

  public getSellPrice(equipment: Equipment): number {
    const template = getEquipmentTemplate(equipment.id);
    if (!template) return 0;

    const basePrice = shops.generalStore.items.find(item => item.id === equipment.id)?.basePrice || 0;
    return calculateSellPrice(basePrice, equipment.quality);
  }
} 