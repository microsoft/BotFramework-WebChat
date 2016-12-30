import * as React from 'react';
import { Activity, Attachment, AttachmentLayout } from './BotConnection';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { FormatOptions } from './Chat';
import { Strings } from './Strings';

const Attachments = (props: {
    options: FormatOptions,
    strings: Strings,
    attachmentLayout: AttachmentLayout,
    attachments: Attachment[],
    onClickButton: (type: string, value: string) => void,
    onImageLoad: () => void
}) => {
    if (!props.attachments || props.attachments.length == 0)
        return null;
    return props.attachmentLayout === 'carousel' ?
        <Carousel
            attachments={props.attachments}
            options={ props.options }
            strings={ props.strings }
            onClickButton={ props.onClickButton }
            onImageLoad={ props.onImageLoad }
        />
    : 
        <div className="wc-list">
            { props.attachments.map((attachment, index) =>
                <AttachmentView
                    key={ index }
                    attachment={ attachment }
                    options={ props.options }
                    strings={ props.strings }
                    onClickButton={ props.onClickButton }
                    onImageLoad={ props.onImageLoad }
                />
            ) }
        </div>
}

export const ActivityView = (props: {
    options: FormatOptions,
    strings: Strings,
    activity: Activity,
    onClickButton: (type: string, value: string) => void,
    onImageLoad: () => void
}) => {
    switch (props.activity.type) {
        case 'message':
            return (
                <div>
                    <FormattedText
                        text={ props.activity.text }
                        format={ props.activity.textFormat }
                        onImageLoad={ props.onImageLoad }
                    />
                    <Attachments
                        attachments={ props.activity.attachments }
                        attachmentLayout={ props.activity.attachmentLayout } 
                        options={ props.options }
                        strings={ props.strings } onClickButton={ props.onClickButton }
                        onImageLoad={ props.onImageLoad }
                    />
                </div>
            );

        case 'typing':
            return <div>TYPING</div>;
    }
}
