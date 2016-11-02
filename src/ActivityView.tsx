import * as React from 'react';
import { Activity, Attachment, AttachmentLayout } from './BotConnection';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { ChatStore } from './Store';

export const CarouselOrList = (props: {
    store: ChatStore,
    attachmentLayout: AttachmentLayout,
    attachments: Attachment[],
    onImageLoad: () => void
}) => {
    if (props.attachments && props.attachments.length >= 1) {
        if (props.attachmentLayout === 'carousel')
            return <Carousel store= { props.store } attachments={props.attachments} onImageLoad={ props.onImageLoad }/>;
        else
            return (
                <div> { props.attachments.map(attachment => 
                    <AttachmentView store={ props.store } attachment={ attachment } onImageLoad={ props.onImageLoad }/>
                ) } </div>
            );
    } else
        return <span/>
}

export const ActivityView = (props: {
    store: ChatStore,
    activity: Activity,
    onImageLoad: () => void
}) => {
    switch (props.activity.type) {
        case 'message':
            return (
                <div>
                    <FormattedText text={ props.activity.text } format={ props.activity.textFormat }/>
                    <CarouselOrList store={ props.store } attachments={ props.activity.attachments } attachmentLayout={ props.activity.attachmentLayout } onImageLoad= { props.onImageLoad }/>
                </div>
            );
                    
        case 'typing':
            return <div>TYPING</div>;
    }
}
