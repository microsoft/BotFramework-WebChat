import { Activity, Attachment, AttachmentLayout } from 'botframework-directlinejs';
import * as React from 'react';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { IDoCardAction } from './Chat';
import { FormattedText } from './FormattedText';
import { FormatState, SizeState } from './Store';

const Attachments = (props: {
    attachmentLayout: AttachmentLayout;
    attachments: Attachment[];
    disabled: boolean;
    format: FormatState;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
    size: SizeState;
}) => {
    const { attachments, attachmentLayout, ...otherProps } = props;

    if (!attachments || attachments.length === 0) {
        return null;
    }

    return attachmentLayout === 'carousel' ?
        <Carousel
            attachments={ attachments }
            disabled={ props.disabled }
            { ...otherProps }
        />
    :
        <div className="wc-list">
            { attachments.map((attachment, index) =>
                <AttachmentView
                    attachment={ attachment }
                    format={ props.format }
                    disabled={ props.disabled }
                    key={ index }
                    onCardAction={ props.onCardAction }
                    onImageLoad={ props.onImageLoad }
                />
            ) }
        </div>;
};

export interface ActivityViewProps {
    activity: Activity;
    disabled: boolean;
    format: FormatState;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
    size: SizeState;
}

export class ActivityView extends React.Component<ActivityViewProps, {}> {
    constructor(props: ActivityViewProps) {
        super(props);
    }

    shouldComponentUpdate(nextProps: ActivityViewProps) {
        // if the activity changed, re-render
        return this.props.activity !== nextProps.activity
        // if the format changed, re-render
            || this.props.format !== nextProps.format
        // if it's a carousel and the size changed, re-render
            || (this.props.activity.type === 'message'
                && this.props.activity.attachmentLayout === 'carousel'
                && this.props.size !== nextProps.size)
            || !this.props.disabled !== !nextProps.disabled;
    }

    render() {
        const { activity, ...props } = this.props;

        switch (activity.type) {
            case 'message':
                return (
                    <div>
                        <FormattedText
                            text={ activity.text }
                            format={ activity.textFormat }
                            onImageLoad={ props.onImageLoad }
                        />
                        <Attachments
                            attachments={ activity.attachments }
                            attachmentLayout={ activity.attachmentLayout }
                            disabled={ props.disabled }
                            format={ props.format }
                            onCardAction={ props.onCardAction }
                            onImageLoad={ props.onImageLoad }
                            size={ props.size }
                        />
                    </div>
                );

            case 'typing':
                return <div className="wc-typing"/>;
        }
    }
}
