import type { Item, UserInventory } from '../types';

export const getInventoryItem = (inventoryItem: UserInventory): Partial<Item & UserInventory> =>
  (inventoryItem.items ?? inventoryItem.item ?? inventoryItem) as Partial<Item & UserInventory>;

export const getInventoryItemId = (inventoryItem: UserInventory) =>
  getInventoryItem(inventoryItem).id ?? inventoryItem.item_id;

export const getInventoryItemType = (inventoryItem: UserInventory) =>
  getInventoryItem(inventoryItem).item_type ?? inventoryItem.item_type ?? inventoryItem.asset_type;

export const getInventoryItemSlot = (inventoryItem: UserInventory) =>
  getInventoryItem(inventoryItem).slot ?? inventoryItem.slot ?? null;

export const getInventoryItemName = (inventoryItem: UserInventory) =>
  getInventoryItem(inventoryItem).name ?? inventoryItem.name ?? 'Unknown item';

export const getInventoryItemDescription = (inventoryItem: UserInventory) =>
  getInventoryItem(inventoryItem).description ?? inventoryItem.description ?? '';

export const getInventoryItemRarity = (inventoryItem: UserInventory) =>
  getInventoryItem(inventoryItem).rarity ?? inventoryItem.rarity ?? 'common';

export const getInventoryItemIcon = (inventoryItem: UserInventory) => {
  const item = getInventoryItem(inventoryItem);
  return item.asset_variant?.preview_url ?? inventoryItem.asset_variant?.preview_url ?? item.file_path;
};

export const isVisualItem = (inventoryItem: UserInventory) =>
  (getInventoryItem(inventoryItem).has_visual ?? inventoryItem.has_visual) === true;

export const isVisualEquippedItem = (inventoryItem: UserInventory) =>
  inventoryItem.equipped === true &&
  isVisualItem(inventoryItem) &&
  !!(getInventoryItem(inventoryItem).asset_variant ?? inventoryItem.asset_variant);
