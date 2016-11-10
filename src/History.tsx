import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity } from './BotConnection';
import { HistoryAction, ChatStore } from './Store';
import { ActivityView } from './ActivityView';

interface Props {
    store: ChatStore,
    selectActivity?: (activity: Activity) => void
}

export class History extends React.Component<Props, {}> {
    scrollMe: HTMLElement;
    scrollToBottom = true;

    constructor(props: Props) {
        super(props);
    }

    componentWillUpdate() {
        this.scrollToBottom = this.scrollMe.scrollTop + this.scrollMe.offsetHeight >= this.scrollMe.scrollHeight;
    }

    componentDidUpdate() {
        this.autoscroll();
    }

    selectActivity(activity: Activity) {
        if (this.props.selectActivity)
            this.props.selectActivity(activity);
    }

    onImageLoad() {
        this.autoscroll();
    }

    autoscroll() {
        if (this.scrollToBottom)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    }

    suitableInterval(current: Activity, next: Activity) {
        return Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;
    }

    render() {
        const state = this.props.store.getState();
        const activities = state.history.activities;

        const wrappedActivities = activities.map((activity: Activity, index) => {
            let timeLine: String;
            if (index === activities.length - 1 || (index + 1 < activities.length && this.suitableInterval(activity, activities[index + 1]))) {
                timeLine = ` at ${(new Date(activity.timestamp)).toLocaleTimeString()}`;
            }
            return (
                <div key={ index } className={ "wc-message-wrapper" + (this.props.selectActivity ? ' clickable' : '') } onClick={ e => this.selectActivity(activity) }>
                    <div className={ 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot') }>
                        <div className={ 'wc-message-content' + (activity === state.history.selectedActivity ? ' selected' : '') }>
                            <svg className="wc-message-callout">
                                <path className="point-left" d="m0,6 l6 6 v-12 z" />
                                <path className="point-right" d="m6,6 l-6 6 v-12 z" />
                            </svg>
                            <ActivityView store={ this.props.store } activity={ activity } onImageLoad={ () => this.onImageLoad }/>
                        </div>
                        <div className="wc-message-from">
                            { activity.from.id === state.connection.user.id ? 'you' : activity.from.name || activity.from.id || '' }
                            { timeLine }
                        </div>
                    </div>
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
