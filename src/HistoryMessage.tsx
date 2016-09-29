import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message, HistoryActions } from './App';
import { IAttachment, Attachment } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';


export const HistoryMessage = (props: {
    message: Message,
    actions: HistoryActions
}) => {
    let inside;
    if (props.message.channelData && props.message.channelData.attachments) {
        const attachmentLayout = props.message.channelData.attachmentLayout;

        if (attachmentLayout === 'carousel' && props.message.channelData.attachments.length > 1) {
            inside = <Carousel attachments={props.message.channelData.attachments} actions={props.actions} />;
        } else {
            inside = <Attachment attachment={props.message.channelData.attachments[0]} actions={props.actions} />;
        }

    } else if (props.message.text) {
        // TODO @eanders-MS: Send format={ props.activity.textFormat } once updated to DirectLine v3
        inside = <FormattedText text={ props.message.text } format="markdown" />
    }
    else {
        inside = <span></span>
    }

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
