import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity } from './BotConnection';
import { HistoryAction, ChatStore } from './Store';
import { ActivityView } from './ActivityView';
import { trySendMessage } from './Chat';
import { Strings } from './Strings';

interface Props {
    store: ChatStore,
    selectActivity?: (activity: Activity) => void
}

export class History extends React.Component<Props, {}> {
    scrollMe: HTMLElement;
    scrollToBottom = true;
    atBottomThreshold = 80;
    scrollEventListener: () => void;
    resizeListener: () => void;

    constructor(props: Props) {
        super(props);
        this.scrollEventListener = () => this.checkBottom();
        this.resizeListener = () => this.checkBottom();
    }

    componentDidMount() {
        this.scrollMe.addEventListener('scroll', this.scrollEventListener);
        window.addEventListener('resize', this.resizeListener);
    }

    componentWillUnmount() {
        this.scrollMe.removeEventListener('scroll', this.scrollEventListener);
        window.removeEventListener('resize', this.resizeListener);
    }

    checkBottom() {
        const offBottom = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight - this.scrollMe.scrollTop; 
        this.scrollToBottom = offBottom <= this.atBottomThreshold;
    }

    componentDidUpdate() {
        this.autoscroll();
    }

    selectActivity(activity: Activity) {
        if (this.props.selectActivity)
            this.props.selectActivity(activity);
    }

    autoscroll = () => {
        if (this.scrollToBottom && (this.scrollMe.scrollHeight > this.scrollMe.offsetHeight))
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    }

    suitableInterval(current: Activity, next: Activity) {
        return Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;
    }

    render() {
        const state = this.props.store.getState();
        const activities = state.history.activities;

        const wrappedActivities = activities.map((activity, index) => 
            <WrappedActivity 
                key={ 'message' + index } 
                store={ this.props.store }
                activity={ activity }
                showTimestamp={ index === activities.length - 1 || (index + 1 < activities.length && this.suitableInterval(activity, activities[index + 1])) }
                onClick={ e => this.selectActivity(activity) }
                selected={ activity === state.history.selectedActivity }
                fromMe={ activity.from.id === state.connection.user.id }
                autoscroll={ this.autoscroll }
            />);

        return (
            <div className="wc-message-groups" ref={ ref => this.scrollMe = ref }>
                <div className="wc-message-group">
                    <div className="wc-message-group-content">
                        { wrappedActivities }
                    </div>
                </div>
            </div>
        );
    }
}

interface WrappedActivityProps {
    activity: Activity;
    autoscroll: () => void;
    fromMe: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    selected: boolean;
    showTimestamp: boolean;
    store: ChatStore;
}

export class WrappedActivity extends React.Component<WrappedActivityProps, {}> {

    constructor(props: WrappedActivityProps) {
        super(props);
    }

    onClickRetry(e: React.SyntheticEvent<HTMLAnchorElement>) {
        e.preventDefault();
        e.stopPropagation();
        trySendMessage(this.props.store, this.props.activity.channelData.clientActivityId, true);
    }

    render () {
        const strings = this.props.store.getState().format.strings;

        let timeLine: JSX.Element;
        switch (this.props.activity.id) {
            case undefined:
                timeLine = <span>{ strings.messageSending }</span>;
                break;
            case null:
                timeLine = <span>{ strings.messageFailed }</span>;
                break;
            case "retry":
                timeLine =
                    <span>
                        { strings.messageFailed }
                        { ' ' }
                        <a href="." onClick={ e => this.onClickRetry(e) }>{ strings.messageRetry }</a>
                    </span>;
                break;
            default:
                let sent: string;
                if (this.props.showTimestamp)
                    sent = strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
                timeLine = <span>{ this.props.activity.from.name || this.props.activity.from.id }{ sent }</span>;
                break;
        } 

        const who = this.props.fromMe ? 'me' : 'bot';

        return (
            <div className={ "wc-message-wrapper" + (this.props.onClick ? ' clickable' : '') } onClick={ this.props.onClick }>
                <div className={ 'wc-message wc-message-from-' + who }>
                    <div className={ 'wc-message-content' + (this.props.selected ? ' selected' : '') }>
                        <svg className="wc-message-callout">
                            <path className="point-left" d="m0,6 l6 6 v-12 z" />
                            <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                        </svg>
                        <ActivityView store={ this.props.store } activity={ this.props.activity } onImageLoad={ this.props.autoscroll }/>
                    </div>
                </div>
                <div className={ 'wc-message-from wc-message-from-' + who }>{ timeLine }</div>
            </div>
        );
    }
}