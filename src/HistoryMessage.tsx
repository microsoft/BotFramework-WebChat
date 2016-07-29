import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from './App.tsx';

const textify = (text:string) =>
    text.split("\n").map((line, index) =>
        <span>{ index > 0 ? <br/> : null }{ line }</span>
    );

export const HistoryMessage = (props: {
    message:Message
}) => {
    let inside;
    if (props.message.images && props.message.images.length > 0)
        inside = props.message.images.map(path => <img src= { path }/>);
    else
        inside = textify(props.message.text);

    return <p>{ props.message.from }: { inside }</p>;
}
