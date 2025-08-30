import { MENU_ITEMS, HORIZONTAL_MENU_ITEMS, TWO_COl_MENU_ITEMS } from "../constants/menu";

// Always return an array from getMenuItems
const getMenuItems = (tenantSlug) => {
  // If MENU_ITEMS is a function, call it with a default argument (e.g., empty string)
  if (typeof MENU_ITEMS === "function") {
    return MENU_ITEMS(tenantSlug);
  }
  // Otherwise, return as is (should be an array)
  return Array.isArray(MENU_ITEMS) ? MENU_ITEMS : [];
};

const getHorizontalMenuItems = () => {
  if (typeof HORIZONTAL_MENU_ITEMS === "function") {
    return HORIZONTAL_MENU_ITEMS("");
  }
  return Array.isArray(HORIZONTAL_MENU_ITEMS) ? HORIZONTAL_MENU_ITEMS : [];
};

const getTwoColumnMenuItems = () => {
  if (typeof TWO_COl_MENU_ITEMS === "function") {
    return TWO_COl_MENU_ITEMS("");
  }
  return Array.isArray(TWO_COl_MENU_ITEMS) ? TWO_COl_MENU_ITEMS : [];
};

const findAllParent = (menuItems, menuItem) => {
  let parents = [];
  const parent = findMenuItem(menuItems, menuItem["parentKey"]);
  if (parent) {
    parents.push(parent["key"]);
    if (parent["parentKey"]) parents = [...parents, ...findAllParent(menuItems, parent)];
  }
  return parents;
};

const findMenuItem = (menuItems, menuItemKey) => {
  if (Array.isArray(menuItems) && menuItemKey) {
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].key === menuItemKey) {
        return menuItems[i];
      }
      // Only recurse if children is an array
      if (Array.isArray(menuItems[i].children)) {
        const found = findMenuItem(menuItems[i].children, menuItemKey);
        if (found) return found;
      }
    }
  }
  return null;
};
export { getMenuItems, getHorizontalMenuItems, getTwoColumnMenuItems, findAllParent, findMenuItem };