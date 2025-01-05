import React from 'react';
import { Item } from '../game/entities/Item';

interface InventoryProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ items, onItemClick }) => {
  return (
    <div className="inventory-container">
      {items.map((item, index) => (
        <div
          key={`${item.getConfig().id}-${index}`}
          className="inventory-item"
          onClick={() => onItemClick(item)}
        >
          <div className="item-name">{item.getConfig().name}</div>
          {item.getQuantity() > 1 && (
            <div className="item-quantity">x{item.getQuantity()}</div>
          )}
          {item.getMaxDurability() > 0 && (
            <div className="item-durability">
              {item.getDurability()}/{item.getMaxDurability()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};