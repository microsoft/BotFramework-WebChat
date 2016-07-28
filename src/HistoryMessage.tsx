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
    if (this.props.message.images && this.props.message.images.length > 0)
        inside = this.props.message.images.map(path => <img src= { path }/>);
    else
        inside = textify(this.props.message.text);

    return <p>{ this.props.message.from }: { inside }</p>;
}
