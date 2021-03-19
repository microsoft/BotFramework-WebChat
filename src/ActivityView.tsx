import * as React from 'react';
import { Activity, Attachment, AttachmentLayout, CardAction, KnownMedia } from 'botframework-directlinejs';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { FormatState, SizeState } from './Store';
import { IDoCardAction } from './Chat';
import { Tile } from './Types';

const Attachments = (props: {
    attachments: Attachment[],
    attachmentLayout: AttachmentLayout,
    format: FormatState,
    size: SizeState,
    tiles?: Tile[]
    onCardAction: IDoCardAction,
    onImageLoad: () => void
}) => {
    const { attachments, attachmentLayout, ... otherProps } = props;
    if (!attachments || attachments.length === 0)
        return null;
    if(attachmentLayout === 'carousel') {
        return <Carousel
            attachments={ attachments }
            { ... otherProps }
        />
    }
    if(props.tiles){
        return <div className="wc-list tiles">
            { attachments.map((attachment, index) =>
                <AttachmentView
                    key={ index }
                    attachment={ attachment }
                    tiles={props.tiles}
                    format={ props.format }
                    onCardAction={ props.onCardAction }
                    onImageLoad={ props.onImageLoad }
                />
            ) }
        </div>
    }
    return <div className="wc-list">
            { attachments.map((attachment, index) =>
                <AttachmentView
                    key={ index }
                    attachment={ attachment }
                    format={ props.format }
                    onCardAction={ props.onCardAction }
                    onImageLoad={ props.onImageLoad }
                />
            ) }
        </div>
}

export interface ActivityViewProps {
    format: FormatState,
    size: SizeState,
    activity: Activity,
    onCardAction: IDoCardAction,
    onImageLoad: () => void,
    isLast: boolean
}

export class ActivityView extends React.Component<ActivityViewProps, {}> {
    constructor(props: ActivityViewProps) {
        super(props)
    }

    shouldComponentUpdate(nextProps: ActivityViewProps) {
        // if the activity changed, re-render
        return this.props.activity !== nextProps.activity
        // if activity became not the last one, re-render
            || this.props.isLast !== nextProps.isLast
        // if the format changed, re-render
            || this.props.format !== nextProps.format
        // if it's a carousel and the size changed, re-render
            || (this.props.activity.type === 'message'
                && this.props.activity.attachmentLayout === 'carousel'
                && this.props.size !== nextProps.size);
    }

    render() {
        const { activity, isLast, ... props } = this.props;
        switch (activity.type) {
            case 'message':
                // FEEDYOU - show/disable imBack buttons only for the last activity
                // TODO should be possible to enable/disable using <Chat> props
                const tiles = activity.channelData ? activity.channelData.tiles : undefined
                const attachments: Attachment[] = (activity.attachments || []).map((attachment: KnownMedia) => {
                    if (isLast || attachment.contentType !== 'application/vnd.microsoft.card.hero') {
                        return attachment
                    } else {
                        const {content, ...attachmentWithoutContent} = attachment
                        const {tap, buttons, ...contentWithoutButtons} = content
                        
                        // hide imBack buttons
                        const buttonsWithoutImback = (buttons || []).filter((button: CardAction) => !button.type || button.type !== 'imBack' )

                        // deactivate imBack buttons
                        //const buttonsWithoutImback = buttons.map(button => !button.type || button.type !== 'imBack' ? button : {...button, value: ""} )

                        const contentWithoutImbackButtons = buttonsWithoutImback.length ? {...contentWithoutButtons, buttons: buttonsWithoutImback} : contentWithoutButtons
                        return Object.keys(contentWithoutImbackButtons).length === 0 ? attachmentWithoutContent as Attachment : {...attachment, content: contentWithoutImbackButtons}
                    }
                })
                    return (
                        <div>
                            <FormattedText
                                text={ activity.text }
                                format={ activity.textFormat }
                                onImageLoad={ props.onImageLoad }
                            />
                            <Attachments
                                attachments={ attachments }
                                attachmentLayout={ activity.attachmentLayout }
                                format={ props.format }
                                onCardAction={ isLast ? props.onCardAction : () => {} }
                                onImageLoad={ props.onImageLoad }
                                size={ props.size }
                                tiles={tiles}
                            />
                        </div>
                    );

            case 'typing':
                return <div className="wc-typing"/>;
        }
    }
}