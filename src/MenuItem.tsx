import * as React from 'react';

export interface Item {
  type : string;
  title : string;
  position : number;
  payload : string;
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

interface MenuItemProps {
  item : Item;
  setActiveItem : Function;
  sendMessage : Function
}

export default class MenuItem extends React.Component < MenuItemProps > {

  constructor(props : MenuItemProps) {
    super(props);
    this.setActiveItem = this
      .setActiveItem
      .bind(this);
    this.sendMessage = this
      .sendMessage
      .bind(this);
  }

  sendMessage() {
    const {item} = this.props;
    this
      .props
      .sendMessage(item.type, item.payload, item.title);
  }

  setActiveItem(e : Event) {
    e.preventDefault();
    e.stopPropagation();
    const itemId = this.props.item.id;
    this
      .props
      .setActiveItem(itemId);
  }

  render() {
    const {item} = this.props;

    if (item.type === 'nested') {
      return (
        <div
          key={item.id}
          className="menu__popover__link menu__popover__link--parent"
          onClick={this
          .setActiveItem
          .bind(this)}>
          {item.title}
        </div>
      );
    }

    return (
      <div key={item.id} className="menu__popover__link" onClick={this.sendMessage}>
        {item.title}
      </div>
    );
  }
}