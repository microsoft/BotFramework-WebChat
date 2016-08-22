import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message, HistoryActions } from './App.tsx';
import { HeroCard } from './HeroCard.tsx';

const textify = (text:string) =>
    text.split("\n").map((line, index) =>
        <span>{ index > 0 ? <br/> : null }{ line }</span>
    );

export const HistoryMessage = (props: {
    message: Message,
    actions: HistoryActions
}) => {
    let inside;
    if (props.message.channelData) {
        const attachment = props.message.channelData.attachments[0];
        if (attachment.contentType == "application/vnd.microsoft.card.hero")
            inside = <HeroCard actions={ props.actions } content={ attachment.content } />;
        else if (attachment.contentType == "image/png")
            inside = <img src={ attachment.contentUrl }/>;
    } else
        inside = <span>{ textify(props.message.text) }</span>

    return <div className={ 'wc-message wc-message-from-' + (props.message.fromBot ? 'bot' : 'me') }>
        <div className="wc-message-content">
            <svg className="wc-message-callout">
                <path className="point-left" d="m0,0 h12 v10 z" />
                <path className="point-right" d="m0,10 v-10 h12 z" />
            </svg>
            { inside }
        </div>
        <div className="wc-message-from">{ props.message.fromBot ? props.message.from : 'you' }</div>
    </div>;
}
