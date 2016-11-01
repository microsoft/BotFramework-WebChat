import * as React from 'react';
import { Activity } from './BotConnection';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { ChatStore } from './Store';


export const HistoryMessage = (props: {
    store: ChatStore,
    activity: Activity,
    onImageLoad: () => void
}) => {
    switch (props.activity.type) {
        case 'message':
            if (props.activity.attachments && props.activity.attachments.length >= 1) {
                if (props.activity.attachmentLayout === 'carousel' && props.activity.attachments.length > 1)
                    return <Carousel store= { props.store } attachments={props.activity.attachments} onImageLoad={ props.onImageLoad }/>;
                else
                    return (
                        <div>
                            { props.activity.attachments.map(attachment => <AttachmentView store={ props.store } attachment={ attachment }  onImageLoad={ props.onImageLoad }/>)}
                        </div>
                    );
            } else if (props.activity.text) {
                return <FormattedText text={ props.activity.text } format={ props.activity.textFormat } />;
            } else {
                return <span/>;
            }
        case 'typing':
            return <div>TYPING</div>;
    }
}
