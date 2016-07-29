import * as React from 'react';
import * as ReactDOM from 'react-dom';

const textify = (text:string) =>
    text.split("\n").map((line, index) =>
        <span>{ index > 0 ? <br/> : null }{ line }</span>
    );

export const TextMessage = (props: {
    text: string
}) =>
    <div class="textMessage">
        { textify(props.text) }
    </div>;
