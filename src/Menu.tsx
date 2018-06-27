import * as React from 'react';
import MenuItem, {Item, MenuRoot} from './MenuItem';

interface MenuPropsInteface {
  doCardAction : Function
}

interface MenuState {
  isMenuOpened : boolean;
  menu : MenuRoot;
  itemsMap : Map < number,
  Item >;
  activeItemId : number;
}

export default class Menu extends React.Component < MenuPropsInteface,
MenuState > {

  constructor() {
    super();

    this.state = {
      isMenuOpened: false,
      menu: undefined,
      itemsMap: undefined,
      activeItemId: -1
    }

    this.menuClick = this
      .menuClick
      .bind(this);
    this.getItemById = this
      .getItemById
      .bind(this);
    this.mapMenuItems = this
      .mapMenuItems
      .bind(this);
    this.renderItem = this
      .renderItem
      .bind(this);
    this.renderBackButton = this
      .renderBackButton
      .bind(this);
    this.renderFloatingMenu = this
      .renderFloatingMenu
      .bind(this);
    this.setActiveItem = this
      .setActiveItem
      .bind(this);
    this.handleOutsideMenuClick = this
      .handleOutsideMenuClick
      .bind(this);
    this.sendMessage = this
      .sendMessage
      .bind(this);
  }

  handleOutsideMenuClick(e : Event) {
    const {target} = e;
    const clickedInsideMenu = target
      .className
      .startsWith('menu__popover');

    if (!clickedInsideMenu) {
      this.menuClick();
    }
  }

  setActiveItem(newActiveItemId : number) {
    this.setState({activeItemId: newActiveItemId});
  }

  mapMenuItems(items : Item[]) {
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

  getItemById(itemId : number) {
    const {itemsMap} = this.state;
    return itemsMap.get(itemId);
  }

  async componentWillMount() {
    const flatItems = (await fetch(window.MENU_CMS_URL).then(resp => resp.json())).data;

    const menu : MenuRoot = this.mapMenuItems(flatItems);

    const itemsMap = new Map < number,
      Item > ();
    flatItems.forEach((item : Item) => {
      itemsMap.set(item.id, item);
    });

    this.setState({itemsMap, menu});
  }

  menuClick() {
    const {isMenuOpened} = this.state;

    if (isMenuOpened) {
      document.removeEventListener('click', this.handleOutsideMenuClick);
      this.setState({isMenuOpened: false, activeItemId: -1});
    } else {
      document.addEventListener('click', this.handleOutsideMenuClick);
      this.setState({isMenuOpened: true, activeItemId: -1});
    }
  }

  sendMessage(type : string, payload : string, title : string) {
    if(type === 'postback') {
      type = 'postBack';
    }
    this
      .props
      .doCardAction(type, payload, title);
    this.menuClick();
  }

  renderItem = (item : Item, index : number) => {
    return <MenuItem
      key={index}
      item={item}
      setActiveItem={this.setActiveItem}
      sendMessage={this.sendMessage}/>;
  }

  renderBackButton(activeItem : Item) {
    if (activeItem.parentId === undefined || activeItem.parentId === null) {
      return null;
    }
    return (
      <div
        className="menu__popover__back"
        onClick={() => this.setActiveItem(activeItem.parentId)}></div>
    );
  }

  renderFloatingMenu(activeItemId : number) {
    let activeItem : Item = undefined;
    let children : Item[] = undefined;

    if (activeItemId !== -1) {
      activeItem = this.getItemById(activeItemId);
      children = activeItem.children;
    } else {
      children = this.state.menu.children;
    }

    return (
      <div className="menu__popover">
        <div className="menu__popover__header">
          {activeItem
            ? this.renderBackButton(activeItem)
            : ''}
          {activeItem
            ? activeItem.title
            : 'Menu'}
        </div>
        <div>
          {children.map(this.renderItem)}
        </div>
      </div>
    );
  }

  render() {
    const isMenuOpened : boolean = this.state.isMenuOpened;
    const {menu} = this.state;

    return (
      <div>
        {menu && <div
          className={`menu__btn ${isMenuOpened
          ? 'menu__btn--open'
          : 'menu__btn'}`}
          onClick={this.menuClick}/>
}
        {isMenuOpened && this.renderFloatingMenu(this.state.activeItemId)}
      </div>
    )
  }
}