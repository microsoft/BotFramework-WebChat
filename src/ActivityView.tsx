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
        // most common case
        if (this.props.activity == nextProps.activity && this.props.format == nextProps.format)
            {
            console.log("scu false");
            return false;
            }
        // if we're resizing, the only activities that might change are carousels
        var update = /*return */ this.props.activity.type == 'message'
                && this.props.activity.attachmentLayout == 'carousel'
                && (this.props.format.chatHeight != nextProps.format.chatHeight
                    || this.props.format.chatWidth != nextProps.format.chatWidth);
        console.log("scu", update, nextProps);
        return update;
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