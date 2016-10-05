import * as React from 'react';
import { Message } from './directLineTypes';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';

export const HistoryMessage = (props: {
    activity: Message
}) => {
    if (props.activity.attachments && props.activity.attachments.length >= 1) {
        if (props.activity.attachmentLayout === 'carousel' && props.activity.attachments.length > 1)
            return <Carousel attachments={props.activity.attachments} />;
        else
            return ( 
                <div>
                    { props.activity.attachments.map(attachment => <AttachmentView attachment={ attachment } />)}
                </div>
            );
    } else if (props.activity.text) {
        return <FormattedText text={ props.activity.text } format={ props.activity.textFormat } />;
    } else {
        return <span/>;
    }
}
