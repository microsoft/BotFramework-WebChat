import * as React from 'react';
import { Activity, Attachment, AttachmentLayout } from 'botframework-directlinejs';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { FormatState } from './Store';

const Attachments = (props: {
    attachments: Attachment[],
    attachmentLayout: AttachmentLayout,
    format: FormatState,
    onCardAction: (type: string, value: string) => void,
    onImageLoad: () => void
}) => {
    const { attachments, attachmentLayout, ... otherProps } = props;
    if (!attachments || attachments.length == 0)
        return null;
    return attachmentLayout === 'carousel' ?
        <Carousel
            attachments={ attachments }
            { ... otherProps }
        />
    : 
        <div className="wc-list">
            { attachments.map((attachment, index) =>
                <AttachmentView
                    key={ index }
                    attachment={ attachment }
                    { ... otherProps }
                />
            ) }
        </div>
}

export interface ActivityViewProps {
    format: FormatState,
    activity: Activity,
    onCardAction: (type: string, value: string) => void,
    onImageLoad: () => void
}

export class ActivityView extends React.Component<ActivityViewProps, {}> {
    constructor(props: ActivityViewProps) {
        super(props)
    }

    shouldComponentUpdate(nextProps: ActivityViewProps) {
        // if the activity changed, re-render
        return this.props.activity != nextProps.activity || this.props.format != nextProps.format;
    }

    render() {
        const { activity, ... otherProps } = this.props;
        switch (activity.type) {
            case 'message':
                return (
                    <div>
                        <FormattedText
                            text={ activity.text }
                            format={ activity.textFormat }
                            onImageLoad={ otherProps.onImageLoad }
                        />
                        <Attachments
                            attachments={ activity.attachments }
                            attachmentLayout={ activity.attachmentLayout }
                            { ... otherProps }
                        />
                    </div>
                );

            case 'typing':
                return <div className="wc-typing"/>;
        }
    }
}