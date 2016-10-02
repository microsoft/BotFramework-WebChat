import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Message } from './directLineTypes';
import { HistoryActions } from './App';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';


export const HistoryMessage = (props: {
    activity: Message,
    actions: HistoryActions
}) => {
    if (props.activity.attachments && props.activity.attachments.length >= 1) {
        if (props.activity.attachmentLayout === 'carousel' && props.activity.attachments.length > 1)
            return <Carousel attachments={props.activity.attachments} actions={props.actions} />;
        else
            return ( 
                <div>
                    { props.activity.attachments.map(attachment => <AttachmentView attachment={ attachment } actions={props.actions} />)}
                </div>
            );
    } else if (props.activity.text) {
        return <FormattedText text={ props.activity.text } format={ props.activity.textFormat } />;
    } else {
        return <span/>;
    }
}
