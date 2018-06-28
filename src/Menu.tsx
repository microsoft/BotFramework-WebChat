import * as React from 'react';
import MenuItem, {Item, MenuRoot} from './MenuItem';

import { mapMenuItems } from './helpers/menuHelpers';

export interface MenuPropsInteface {
  doCardAction : Function
}

export interface MenuState {
  isMenuOpened : boolean;
  menu : MenuRoot;
  itemsMap : Map < number,
  Item >;
  activeItemId : number;
}

export default class Menu extends React.Component < MenuPropsInteface, MenuState > {
  constructor() {
    super();

    this.state = {
      isMenuOpened: false,
      menu: undefined,
      itemsMap: undefined,
      activeItemId: -1
    }

    this.menuClick = this.menuClick.bind(this);
    this.getItemById = this.getItemById.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderBackButton = this.renderBackButton.bind(this);
    this.renderFloatingMenu = this.renderFloatingMenu.bind(this);
    this.setActiveItem = this.setActiveItem.bind(this);
    this.handleOutsideMenuClick = this.handleOutsideMenuClick.bind(this);
    this.itemClick = this.itemClick.bind(this);
  }

  handleOutsideMenuClick(e : any) {
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

  getItemById(itemId : number) {
    const {itemsMap} = this.state;
    return itemsMap.get(itemId);
  }

  async componentWillMount() {
    const flatItems = (await fetch((window as any).CMS_URL + '/api/bot_menu_items?environment=live&is_published=true').then(resp => resp.json())).data;

    const menu : MenuRoot = mapMenuItems(flatItems);

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

  itemClick(type : string, payload : string, title : string) {
    switch (type) {
      case 'postBack':
        this.props.doCardAction(type, payload, title);
        break;
      case 'web_url':
        window.open(payload, 'blank');
        break;
    }

    this.menuClick();
  }

  renderItem = (item : Item, index : number) => {
    return <MenuItem
      key={index}
      item={item}
      setActiveItem={this.setActiveItem}
      itemClick={this.itemClick}/>;
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
      <div className="wc-menu-container">
        {
          menu && <div className={`menu__btn ${isMenuOpened
            ? 'menu__btn--open'
            : 'menu__btn'}`}
            onClick={this.menuClick}/>
        }
        {isMenuOpened && this.renderFloatingMenu(this.state.activeItemId)}
      </div>
    )
  }
}