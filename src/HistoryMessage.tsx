import * as React from 'react';
import { Store } from 'redux';
import { Message } from './BotConnection';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { ChatState } from './Store';


export const HistoryMessage = (props: {
    store: Store<ChatState>,
    activity: Message
}) => {
    if (props.activity.attachments && props.activity.attachments.length >= 1) {
        if (props.activity.attachmentLayout === 'carousel' && props.activity.attachments.length > 1)
            return <Carousel store= { props.store } attachments={props.activity.attachments} />;
        else
            return (
                <div>
                    { props.activity.attachments.map(attachment => <AttachmentView store={ props.store } attachment={ attachment } />)}
                </div>
            );
    } else if (props.activity.text) {
        return <FormattedText text={ props.activity.text } format={ props.activity.textFormat } />;
    } else {
        return <span/>;
    }
}
