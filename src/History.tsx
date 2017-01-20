import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity, User, IBotConnection, Message } from './BotConnection';
import { HistoryAction, ChatState, FormatState } from './Store';
import { ActivityView } from './ActivityView';
import { sendMessage, sendPostBack, konsole, ActivityOrID } from './Chat';
import { Dispatch, connect } from 'react-redux';
import { BehaviorSubject } from 'rxjs';

interface Props {
    format: FormatState
    activities: Activity[],
    selectedActivity: Activity
    user: User,
    botConnection: IBotConnection,
    selectedActivitySubject: BehaviorSubject<ActivityOrID>,
    dispatch: Dispatch<any>
}

class HistoryContainer extends React.Component<Props, {}> {
    private scrollMe: HTMLDivElement;
    private scrollContent: HTMLDivElement;
    private scrollToBottom = true;
    private resizeListener = () => this.autoscroll();

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeListener);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
    }

    componentWillUpdate() {
        this.scrollToBottom = (Math.abs(this.scrollMe.scrollHeight - this.scrollMe.scrollTop - this.scrollMe.offsetHeight) <= 1);
    }

    componentDidUpdate() {
        this.autoscroll();
    }

    private autoscroll() {
        const vAlignBottomPadding = Math.max(0, measureInnerHeight(this.scrollMe) - this.scrollContent.offsetHeight);
        this.scrollContent.style.marginTop = vAlignBottomPadding + 'px';

        if (this.scrollToBottom)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    }

    private onClickRetry(activity: Activity) {
        this.props.dispatch<HistoryAction>({ type: 'Send_Message_Retry', clientActivityId: activity.channelData.clientActivityId });
    }

    private onClickButton(type: string, value: string) {
        switch (type) {
            case "imBack":
                sendMessage(this.props.dispatch, value, this.props.user, this.props.format.locale);
                break;
            case "postBack":
                sendPostBack(this.props.botConnection, value, this.props.user, this.props.format.locale);
                break;

            case "openUrl":
            case "signin":
                window.open(value);
                break;

            default:
                konsole.log("unknown button type", type);
            }
    }

    private onSelectActivity(activity: Activity) {
        this.props.selectedActivitySubject.next({ activity });
    }

    render() {
        return (
            <div className="wc-message-groups" ref={ div => this.scrollMe = div }>
                <div className="wc-message-group-content" ref={ div => this.scrollContent = div }>
                    { this.props.activities.map((activity, index) => 
                        <WrappedActivity 
                            key={ 'message' + index }
                            activity={ activity }
                            showTimestamp={ index === this.props.activities.length - 1 || (index + 1 < this.props.activities.length && suitableInterval(activity, this.props.activities[index + 1])) }
                            selected={ activity === this.props.selectedActivity }
                            fromMe={ activity.from.id === this.props.user.id }
                            format={ this.props.format }
                            onClickButton={ (type, value) => this.onClickButton(type, value) }
                            onClickActivity={ this.props.selectedActivitySubject && (() => this.onSelectActivity(activity)) }
                            onClickRetry={ e => {
                                // Since this is a click on an anchor, we need to stop it
                                // from trying to actually follow a (nonexistant) link
                                e.preventDefault();
                                e.stopPropagation();
                                this.onClickRetry(activity)
                            } }
                            onImageLoad={ () => this.autoscroll() }
                        />
                    ) }
                </div>
            </div>
        )
    }
}

export const History = connect(
    (state: ChatState): Partial<Props> => ({
        activities: state.history.activities,
        selectedActivity: state.history.selectedActivity,
        format: state.format,
        user: state.connection.user,
        botConnection: state.connection.botConnection,
        selectedActivitySubject: state.connection.selectedActivity
    })
)(HistoryContainer)

const getComputedStyleValues = (el: HTMLElement, stylePropertyNames: string[]) => {
    const s = window.getComputedStyle(el);
    const result: { [key: string]: number } = {};
    stylePropertyNames.forEach(name => result[name] = parseInt(s.getPropertyValue(name)));
    return result;
}

const measureInnerHeight = (el: HTMLElement): number => {
    const paddingTop = 'padding-top', paddingBottom = 'padding-bottom';
    const values = getComputedStyleValues(el, [paddingTop, paddingBottom]);
    return el.offsetHeight - values[paddingTop] - values[paddingBottom];
}

const measureOuterWidth = (el: HTMLElement): number => {
    const marginLeft = 'margin-left', marginRight = 'margin-right';
    const values = getComputedStyleValues(el, [marginLeft, marginRight]);
    return el.offsetWidth + values[marginLeft] + values[marginRight];
}

const suitableInterval = (current: Activity, next: Activity) =>
    Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;

interface WrappedActivityProps {
    activity: Activity,
    showTimestamp: boolean,
    selected: boolean,
    fromMe: boolean,
    format: FormatState,
    onClickButton: (type: string, value: string) => void,
    onClickActivity: React.MouseEventHandler<HTMLDivElement>,
    onClickRetry: React.MouseEventHandler<HTMLAnchorElement>
    onImageLoad: () => void,
}

export class WrappedActivity extends React.Component<WrappedActivityProps, {}> {
    private messageDiv: HTMLDivElement;

    constructor(props: WrappedActivityProps) {
        super(props);
    }

    render () {
        let timeLine: JSX.Element;
        switch (this.props.activity.id) {
            case undefined:
                timeLine = <span>{ this.props.format.strings.messageSending }</span>;
                break;
            case null:
                timeLine = <span>{ this.props.format.strings.messageFailed }</span>;
                break;
            case "retry":
                timeLine =
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
                timeLine = <span>{ this.props.activity.from.name || this.props.activity.from.id }{ sent }</span>;
                break;
        } 

        const who = this.props.fromMe ? 'me' : 'bot';

        const wrapperClassName = [
            'wc-message-wrapper',
            (this.props.activity as Message).attachmentLayout || 'list',
            this.props.onClickActivity ? 'clickable' : ''
        ].join(' ');

        const contentClassName = [
            'wc-message-content',
            this.props.selected ? 'selected' : ''
        ].join(' ');
        

        return (
            <div data-activity-id={ this.props.activity.id } className={ wrapperClassName } onClick={ this.props.onClickActivity }>
                <div className={ 'wc-message wc-message-from-' + who } ref={ div => this.messageDiv = div }>
                    <div className={ contentClassName }>
                        <svg className="wc-message-callout">
                            <path className="point-left" d="m0,6 l6 6 v-12 z" />
                            <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                        </svg>
                        <ActivityView
                            activity={ this.props.activity }
                            format={ this.props.format }
                            onClickButton={ this.props.onClickButton }
                            onImageLoad={ this.props.onImageLoad }
                            measureParentHorizontalOverflow={ () => measureOuterWidth(this.messageDiv) - (this.messageDiv.offsetParent as HTMLElement).offsetWidth }
                        />
                    </div>
                </div>
                <div className={ 'wc-message-from wc-message-from-' + who }>{ timeLine }</div>
            </div>
        );
    }
}