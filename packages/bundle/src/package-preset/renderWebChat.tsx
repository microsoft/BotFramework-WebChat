import React, { ComponentType } from 'react';
import { render } from 'react-dom';

export default function renderWebChat(ReactWebChat: ComponentType<any>, props: any, element: HTMLElement): void {
  render(<ReactWebChat {...props} />, element);
}
