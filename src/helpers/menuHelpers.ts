import {Item, MenuRoot} from '../MenuItem';

export function mapMenuItems(items : Item[]) {
  const mappedMenu : MenuRoot = {
    id: -1,
    children: []
  };

  if (!items || !items.length) {
    return;
  }

  items.forEach((item, index) => {
    if (item.parentId !== undefined && item.parentId !== null) {
      const parentItem = items.find((parentCheckItem : Item) => {
        return parentCheckItem.id === item.parentId;
      });
      if (!parentItem.children) {
        parentItem.children = [];
      }
      if (!parentItem.children[item.position])
        parentItem.children[item.position] = item;
      else
        parentItem
          .children
          .push(item);
      }
    else {
      item.parentId = -1;
      if (!mappedMenu.children[item.position])
        mappedMenu.children[item.position] = item;
      else
        mappedMenu
          .children
          .push(item);
      }
    })

  return mappedMenu;
}