import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from './App.tsx';
import { ImageMessage } from './ImageMessage.tsx';
import { TextMessage } from './TextMessage.tsx';

export const HistoryMessage = (props: {
    message: Message
}) => {
    let inside;
    if (props.message.images && props.message.images.length > 0)
        inside = <ImageMessage images={ props.message.images }/>;
    else
        inside = <TextMessage text={ props.message.text }/>;
    return <p class="message">{ props.message.from }: <br/>{ inside }</p>;
}
