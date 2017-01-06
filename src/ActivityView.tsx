import * as React from 'react';
import { Activity, Attachment, AttachmentLayout } from './BotConnection';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { FormatOptions } from './Chat';
import { Strings } from './Strings';

const Attachments = (props: {
    attachments: Attachment[],
    attachmentLayout: AttachmentLayout,
    options: FormatOptions,
    strings: Strings,
    onClickButton: (type: string, value: string) => void,
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

interface Props {
    options: FormatOptions,
    strings: Strings,
    activity: Activity,
    onClickButton: (type: string, value: string) => void,
    onImageLoad: () => void
}

export class ActivityView extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props)
    }

    shouldComponentUpdate(nextProps: Props) {
        return this.props.activity !== nextProps.activity || this.props.options !== nextProps.options || this.props.strings !== nextProps.strings;
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
                return <div>TYPING</div>;
        }
    }
}
