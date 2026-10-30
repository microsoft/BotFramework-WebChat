import '../setup';

import { expectType } from 'tsd';

import { createDirectLine } from '../../src/boot/exports/index';
import { WebChatElement, type WebChatElementProps } from '../../src/boot/exports/customElement';

customElements.define('webchat-element', WebChatElement);

const element = document.querySelector<WebChatElement>('webchat-element');

element.props = { directLine: createDirectLine({ token: '...' }), styleOptions: { accent: 'green' } };

expectType<WebChatElementProps | undefined>(element.props);
