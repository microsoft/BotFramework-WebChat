import * as React from 'react';
import { Activity, Attachment, AttachmentLayout, Message } from './BotConnection';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { FormattedText } from './FormattedText';
import { FormatState } from './Store';
import { measure } from './Chat';

const Attachments = (props: {
    attachments: Attachment[],
    attachmentLayout: AttachmentLayout,
    calcOverflow: () => number,
    format: FormatState,
    onClickButton: (type: string, value: string) => void,
    onImageLoad: () => void
}) => {
    const { attachments, attachmentLayout, calcOverflow, ... otherProps } = props;
    if (!attachments || attachments.length == 0)
        return null;
    return attachmentLayout === 'carousel' ?
        <Carousel
            attachments={ attachments }
            calcOverflow={ calcOverflow }
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
    showTimestamp: boolean,
    selected: boolean,
    fromMe: boolean,
    onClickActivity: React.MouseEventHandler<HTMLDivElement>,
    onClickRetry: React.MouseEventHandler<HTMLAnchorElement>

    format: FormatState,
    activity: Activity,
    onClickButton: (type: string, value: string) => void,
    onImageLoad: () => void
}

export class ActivityView extends React.Component<Props, {}> {
    private messageDiv: HTMLDivElement;

    constructor(props: Props) {
        super(props)
    }

    shouldComponentUpdate(nextProps: Props) {
        return this.props.activity !== nextProps.activity || this.props.format !== nextProps.format;
    }

    renderInner() {
        const { activity, ... otherProps } = this.props;
        switch (activity.type) {
            case 'message':
                return [
                    <FormattedText
                        key='formattedText'
                        text={ activity.text }
                        format={ activity.textFormat }
                        onImageLoad={ otherProps.onImageLoad }
                    />,
                    <Attachments
                        key='attachments'
                        attachments={ activity.attachments }
                        attachmentLayout={ activity.attachmentLayout }
                        calcOverflow={
                            () => {
                                var offsetParent = this.messageDiv.offsetParent as HTMLElement;
                                return measure.outerWidth(this.messageDiv) - offsetParent.offsetWidth;
                            } 
                        }
                        { ... otherProps }
                    />
                ];

            case 'typing':
                return [<div key='typing'>TYPING</div>];
        }
    }

    timeline (className: string) {
        if (this.props.activity.type != 'message') return;

        let el: JSX.Element;
        switch (this.props.activity.id) {
            case undefined:
                el = <span>{ this.props.format.strings.messageSending }</span>;
                break;
            case null:
                el = <span>{ this.props.format.strings.messageFailed }</span>;
                break;
            case "retry":
                el =
                    <span>
                        { this.props.format.strings.messageFailed }
                        { ' ' }
                        <a href="." onClick={ this.props.onClickRetry }>{ this.props.format.strings.messageRetry }</a>
                    </span>;
                break;
            default:
                let sent: string;
                if (this.props.showTimestamp)
                    sent = this.props.format.strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
                el = <span>{ this.props.activity.from.name || this.props.activity.from.id }{ sent }</span>;
                break;
        } 

        return <div className={ className }>{ el }</div>
    }

    render () {
        const who = this.props.fromMe ? 'me' : 'bot';
        
        let classNames = ['wc-message-wrapper'];
        if (this.props.onClickActivity) classNames.push('clickable');
        classNames.push((this.props.activity as Message).attachmentLayout);

        return (
            <div data-activity-id={this.props.activity.id} className={ classNames.join(' ') } onClick={ this.props.onClickActivity }>
                <div className={ 'wc-message wc-message-from-' + who } ref={ div => this.messageDiv = div }>
                    <div className={ 'wc-message-content' + (this.props.selected ? ' selected' : '') }>
                        <svg className="wc-message-callout">
                            <path className="point-left" d="m0,6 l6 6 v-12 z" />
                            <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                        </svg>
                        { this.renderInner() }
                    </div>
                </div>
                { this.timeline('wc-message-from wc-message-from-' + who) }
            </div>
        );
    }
}
