import * as React from 'react';
import { Unsubscribe } from 'redux';
//import { Timestamp } from './Timestamp';
import { Activity, Message } from './BotConnection';
import { HistoryAction, ChatStore } from './Store';
import { HistoryMessage } from './HistoryMessage';
import { Observable, Subscription } from '@reactivex/rxjs';


interface Props {
    store: ChatStore,
    onActivitySelected: (activity: Activity) => void
}

export class History extends React.Component<Props, {}> {
    scrollMe: Element;
    autoscrollSubscription: Subscription;
    storeUnsubscribe: Unsubscribe;

    constructor(props: Props) {
        super(props);
    }

    componentWillMount() {
        this.storeUnsubscribe = this.props.store.subscribe(() =>
            this.forceUpdate()
        );
    }

    componentDidMount() {
        this.autoscrollSubscription = Observable
        .fromEvent<any>(this.scrollMe, 'scroll')
        .map(e => e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight)
        .distinctUntilChanged()
        .subscribe(autoscroll =>
            this.props.store.dispatch({ type: 'Set_Autoscroll', autoscroll } as HistoryAction)
        );
    }

    componentWillUnmount() {
        this.autoscrollSubscription.unsubscribe();
        this.storeUnsubscribe();
    }

    componentDidUpdate(prevProps:{}, prevState:{}) {
        if (this.props.store.getState().history.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    }

    onActivitySelected(e: React.SyntheticEvent<any>, activity: Activity) {
        if (this.props.onActivitySelected) {
            e.preventDefault();
            e.stopPropagation();
            this.props.store.dispatch({ type: 'Select_Activity', selectedActivity: activity } as HistoryAction);
            this.props.onActivitySelected(activity);
        }
    }

    render() {
        const state = this.props.store.getState();
        return (
            <div className="wc-message-groups" ref={ ref => this.scrollMe = ref }>
                <div className="wc-message-group">
                { state.history.activities
                    .filter(activity => activity.type === "message" && (activity.from.id != state.connection.user.id || activity["status"] != "received"))
                    .map((activity:Message, index) =>
                        <div key={index} className={ 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot') }>
                            <div className={ 'wc-message-content' + (this.props.onActivitySelected ? ' clickable' : '') + (activity === state.history.selectedActivity ? ' selected' : '') } onClick={ e => this.onActivitySelected(e, activity) }>
                                <svg className="wc-message-callout">
                                    <path className="point-left" d="m0,0 h12 v10 z" />
                                    <path className="point-right" d="m0,10 v-10 h12 z" />
                                </svg>
                                <HistoryMessage store={ this.props.store } activity={ activity }/>
                            </div>
                            <div className="wc-message-from">{ activity.from.id === state.connection.user.id ? 'you' : activity.from.id }</div>
                        </div>
                    )
                }
                </div>
            </div>
        );
    }
}

// <Timestamp timestamp={ messagegroup.timestamp } />
// { activities.map(activity => <HistoryMessage message={ activity } actions={ this.props.actions }/>) }
