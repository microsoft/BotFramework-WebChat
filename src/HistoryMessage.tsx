import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message, ButtonActions } from './App.tsx';
import { ImageMessage } from './ImageMessage.tsx';
import { TextMessage } from './TextMessage.tsx';
import { HeroCard } from './HeroCard.tsx';

export const HistoryMessage = (props: {
    message: Message,
    buttonActions: ButtonActions
}) => {
    let inside;
    if (props.message.images && props.message.images.length > 0)
        inside = <ImageMessage images={ props.message.images }/>;
    else if (props.message.text.includes("Bender"))
        inside = <HeroCard buttonActions={ props.buttonActions }/>
    else 
        inside = <TextMessage text={ props.message.text }/>;
    return <p class="message">{ props.message.from }: <br/>{ inside }</p>;
}
