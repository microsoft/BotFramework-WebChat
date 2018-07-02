import {Item, MenuRoot} from '../MenuItem';

export function prepareMenu(items : Item[]) {
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

      pushOrSet(parentItem.children, item.position, item);
    } else {
      item.parentId = -1;
      pushOrSet(mappedMenu.children, item.position, item);
    }
  })

  return mappedMenu;
}

function pushOrSet(child: Item[], position: number, item: Item) {
      if (!child[position]) {
        child[position] = item;
      } else {
        child.push(item);
      }
}