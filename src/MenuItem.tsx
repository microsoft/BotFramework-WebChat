import * as React from 'react';

type ItemType = "nested" | "postBack" | "web_url";

export interface Item {
  type : ItemType;
  title : string;
  position : number;
  payload?: string;
  url?: string;
  parentId : number;
  id : number;
  environment : string;
  actionId : number;
  children?: Item[];
}

export interface MenuRoot {
  id : number;
  children : Item[];
}

export interface MenuItemProps {
  item : Item;
  setActiveItem : Function;
  itemClick : Function
}

export default class MenuItem extends React.Component < MenuItemProps > {

  constructor(props : MenuItemProps) {
    super(props);
    this.setActiveItem = this.setActiveItem.bind(this);
    this.itemClick = this.itemClick.bind(this);
  }

  itemClick() {
    const {item} = this.props;

    if ((item.type as string) === 'postback') {
      item.type = 'postBack';
    }

    switch (item.type) {
      case 'postBack':
        this.props.itemClick(item.type, item.payload, item.title);
        break;
      case 'web_url':
        this.props.itemClick(item.type, item.url, item.title);
        break;
    }

  }

  setActiveItem() {
    const itemId = this.props.item.id;
    this.props.setActiveItem(itemId);
  }

  render() {
    const {item} = this.props;

    if (item.type === 'nested') {
      return (
        <div
          key={item.id}
          className="menu__popover__link menu__popover__link--parent"
          onClick={this.setActiveItem}>
          {item.title}
        </div>
      );
    }

    return (
      <div key={item.id} className="menu__popover__link" onClick={this.itemClick}>
        {item.title}
      </div>
    );
  }
}