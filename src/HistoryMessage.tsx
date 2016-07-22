import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from './App.tsx';

export const HistoryMessage = (props:{
    message:Message
}) =>
    <p>{ props.message.from + ": " + props.message.text }</p>;
