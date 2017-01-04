import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity, User, IBotConnection } from './BotConnection';
import { HistoryAction, ChatState } from './Store';
import { ActivityView } from './ActivityView';
import { sendMessage, sendPostBack, FormatOptions, konsole, ActivityOrID } from './Chat';
import { Strings } from './Strings';
import { Dispatch, connect } from 'react-redux';
import { BehaviorSubject } from 'rxjs';

interface Props {
    options: FormatOptions,
    strings: Strings,
    activities: Activity[],
    selectedActivity: Activity
    user: User,
    botConnection: IBotConnection,
    selectedActivitySubject: BehaviorSubject<ActivityOrID>,
    dispatch: Dispatch<any>
}

class HistoryContainer extends React.Component<Props, {}> {
    private scrollMe: HTMLDivElement;
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
        if (this.scrollToBottom)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    }

    private onClickRetry(activity: Activity) {
        this.props.dispatch<HistoryAction>({ type: 'Send_Message_Retry', clientActivityId: activity.channelData.clientActivityId });
    }

    private onClickButton(type: string, value: string) {
        switch (type) {
            case "imBack":
                sendMessage(this.props.dispatch, value, this.props.user);
                break;
            case "postBack":
                sendPostBack(this.props.botConnection, value, this.props.user);
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
                <div className="wc-message-group">
                    <div className="wc-message-group-content">
                        { this.props.activities.map((activity, index) => 
                            <WrappedActivity 
                                key={ 'message' + index }
                                activity={ activity }
                                showTimestamp={ index === this.props.activities.length - 1 || (index + 1 < this.props.activities.length && suitableInterval(activity, this.props.activities[index + 1])) }
                                selected={ activity === this.props.selectedActivity }
                                fromMe={ activity.from.id === this.props.user.id }
                                options={ this.props.options }
                                strings={ this.props.strings }
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
            </div>
        )
    }
}

export const History = connect(
    (state: ChatState) => ({
        options: state.format.options,
        strings: state.format.strings,
        activities: state.history.activities,
        selectedActivity: state.history.selectedActivity,
        user: state.connection.user,
        botConnection: state.connection.botConnection,
        selectedActivitySubject: state.connection.selectedActivity
    })
)(HistoryContainer)

const suitableInterval = (current: Activity, next: Activity) =>
    Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;

interface WrappedActivityProps {
    activity: Activity,
    showTimestamp: boolean,
    selected: boolean,
    fromMe: boolean,
    options: FormatOptions,
    strings: Strings,
    onClickButton: (type: string, value: string) => void,
    onClickActivity: React.MouseEventHandler<HTMLDivElement>,
    onClickRetry: React.MouseEventHandler<HTMLAnchorElement>
    onImageLoad: () => void,
}

export class WrappedActivity extends React.Component<WrappedActivityProps, {}> {

    constructor(props: WrappedActivityProps) {
        super(props);
    }

    render () {
        let timeLine: JSX.Element;
        switch (this.props.activity.id) {
            case undefined:
                timeLine = <span>{ this.props.strings.messageSending }</span>;
                break;
            case null:
                timeLine = <span>{ this.props.strings.messageFailed }</span>;
                break;
            case "retry":
                timeLine =
                    <span>
                        { this.props.strings.messageFailed }
                        { ' ' }
                        <a href="." onClick={ this.props.onClickRetry }>{ this.props.strings.messageRetry }</a>
                    </span>;
                break;
            default:
                let sent: string;
                if (this.props.showTimestamp)
                    sent = this.props.strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
                timeLine = <span>{ this.props.activity.from.name || this.props.activity.from.id }{ sent }</span>;
                break;
        } 

        const who = this.props.fromMe ? 'me' : 'bot';

        return (
            <div className={ "wc-message-wrapper" + (this.props.onClickActivity ? ' clickable' : '') } onClick={ this.props.onClickActivity }>
                <div className={ 'wc-message wc-message-from-' + who }>
                    <div className={ 'wc-message-content' + (this.props.selected ? ' selected' : '') }>
                        <svg className="wc-message-callout">
                            <path className="point-left" d="m0,6 l6 6 v-12 z" />
                            <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                        </svg>
                        <ActivityView
                            activity={ this.props.activity }
                            options={ this.props.options}
                            strings={ this.props.strings }
                            onClickButton={ this.props.onClickButton }
                            onImageLoad={ this.props.onImageLoad }
                        />
                    </div>
                </div>
                <div className={ 'wc-message-from wc-message-from-' + who }>{ timeLine }</div>
            </div>
        );
    }
}