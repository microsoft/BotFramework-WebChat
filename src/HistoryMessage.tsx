import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from './App.tsx';

export const HistoryMessage = (props:{
    message:Message
}) => {
    let inside;
    if (props.message.images && props.message.images.length > 0)
        inside = props.message.images.map(path => <img src= { path }/>);
    else
        inside = props.message.text;
    console.log("inside", inside);
    return <p>{ props.message.from + ": "}{ inside }</p>;
}
