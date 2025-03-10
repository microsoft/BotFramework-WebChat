import React, { ComponentType } from 'react';
import ReactDOM from 'react-dom';

export default function renderWebChat(ReactWebChat: ComponentType<any>, props: any, element: HTMLElement): void {
  ReactDOM.render(<ReactWebChat {...props} />, element);
}
