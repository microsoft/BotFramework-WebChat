import * as React from 'react';
import { Activity, Attachment, AttachmentLayout } from './BotConnection';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { ChatStore } from './Store';
import { FormatOptions } from './Chat';
import { Strings } from './Strings';

const Attachments = (props: {
    options: FormatOptions,
    strings: Strings,
    attachmentLayout: AttachmentLayout,
    attachments: Attachment[],
    sendMessage: (value: string) => void,
    sendPostBack: (value: string) => void,
    onImageLoad: () => void
}) => {
    if (props.attachments && props.attachments.length >= 1) {
        if (props.attachmentLayout === 'carousel')
            return <Carousel options={ props.options } strings={ props.strings } attachments={props.attachments} sendMessage={ props.sendMessage } sendPostBack={ props.sendPostBack } onImageLoad={ props.onImageLoad }/>;
        else
            return (
                <div className="wc-list"> { props.attachments.map((attachment, index) =>
                    <AttachmentView key={ index } options={ props.options } strings={ props.strings } attachment={ attachment } sendMessage={ props.sendMessage } sendPostBack={ props.sendPostBack } onImageLoad={ props.onImageLoad } />
                ) } </div>
            );
    } else
        return <span/>
}

export const ActivityView = (props: {
    options: FormatOptions,
    strings: Strings,
    activity: Activity,
    sendMessage: (value: string) => void,
    sendPostBack: (value: string) => void,
    onImageLoad: () => void
}) => {
    switch (props.activity.type) {
        case 'message':
            return (
                <div>
                    <FormattedText text={ props.activity.text } format={ props.activity.textFormat } onImageLoad={ props.onImageLoad }/>
                    <Attachments options={ props.options } strings={ props.strings } attachments={ props.activity.attachments } attachmentLayout={ props.activity.attachmentLayout } sendMessage={ props.sendMessage } sendPostBack={ props.sendPostBack } onImageLoad={ props.onImageLoad }/>
                </div>
            );

        case 'typing':
            return <div>TYPING</div>;
    }
}
