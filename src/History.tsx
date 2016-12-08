import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity } from './BotConnection';
import { HistoryAction, ChatStore } from './Store';
import { ActivityView } from './ActivityView';
import { trySendMessage } from './Chat';

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

    onClickRetry(e: React.SyntheticEvent<HTMLAnchorElement>, activity: Activity) {
        e.preventDefault();
        e.stopPropagation();
        trySendMessage(this.props.store, activity.channelData.clientActivityId, true);
    }

    render() {
        const state = this.props.store.getState();
        const activities = state.history.activities;

        const wrappedActivities = activities.map((activity: Activity, index) => {
            let timeLine;
            switch (activity.id) {
                case undefined:
                    timeLine = <span>{ state.format.strings.messageSending }</span>;
                    break;
                case null:
                    timeLine = <span>{ state.format.strings.messageFailed }</span>;
                    break;
                case "retry":
                    timeLine =
                        <span>
                            { state.format.strings.messageFailed }
                            { ' ' }
                            <a href="." onClick={ e => this.onClickRetry(e, activity) }>{ state.format.strings.messageRetry }</a>
                        </span>;
                    break;
                default:
                    let sent: string;
                    if (index === activities.length - 1 || (index + 1 < activities.length && this.suitableInterval(activity, activities[index + 1])))
                        sent = state.format.strings.timeSent.replace('%1', (new Date(activity.timestamp)).toLocaleTimeString());
                    timeLine = <span>{ activity.from.name || activity.from.id }{ sent }</span>;
                    break;
            } 

            const who = activity.from.id === state.connection.user.id ? 'me' : 'bot';

            return (
                <div key={ index } className={ "wc-message-wrapper" + (this.props.selectActivity ? ' clickable' : '') } onClick={ e => this.selectActivity(activity) }>
                    <div className={ 'wc-message wc-message-from-' + who }>
                        <div className={ 'wc-message-content' + (activity === state.history.selectedActivity ? ' selected' : '') }>
                            <svg className="wc-message-callout">
                                <path className="point-left" d="m0,6 l6 6 v-12 z" />
                                <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                            </svg>
                            <ActivityView store={ this.props.store } activity={ activity } onImageLoad={ this.autoscroll }/>
                        </div>
                    </div>
                    <div className={ 'wc-message-from wc-message-from-' + who }>{ timeLine }</div>
                </div>
            );
        });

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
