import * as React from 'react';
import { Unsubscribe } from 'redux';
//import { Timestamp } from './Timestamp';
import { Activity, Message } from './BotConnection';
import { getStore, getState, HistoryAction } from './Store';
import { HistoryMessage } from './HistoryMessage';
import { Observable, Subscription } from '@reactivex/rxjs';


interface Props {
    allowMessageSelection: boolean
}

export class History extends React.Component<Props, {}> {
    scrollMe: Element;
    autoscrollSubscription: Subscription;
    storeUnsubscribe: Unsubscribe;

    constructor(props: Props) {
        super(props);
    }

    componentWillMount() {
        this.storeUnsubscribe = getStore().subscribe(() =>
            this.forceUpdate()
        );
    }

    componentDidMount() {
        this.autoscrollSubscription = Observable
        .fromEvent<any>(this.scrollMe, 'scroll')
        .map(e => e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight)
        .distinctUntilChanged()
        .subscribe(autoscroll =>
            getStore().dispatch({ type: 'Set_Autoscroll', autoscroll } as HistoryAction)
        );
    }

    componentWillUnmount() {
        this.autoscrollSubscription.unsubscribe();
        this.storeUnsubscribe();
    }

    componentDidUpdate(prevProps:{}, prevState:{}) {
        if (getState().history.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    }

    onMessageClicked(e: React.SyntheticEvent<any>, activity: Activity) {
        e.preventDefault();
        e.stopPropagation();
        getStore().dispatch({ type: 'Select_Activity', selectedActivity: activity } as HistoryAction);
    }

    render() {
        const state = getState();
        return (
            <div className="wc-message-groups" ref={ ref => this.scrollMe = ref }>
                <div className="wc-message-group">
                { state.history.activities
                    .filter(activity => activity.type === "message" && (activity.from.id != state.connection.user.id || !activity.id))
                    .map((activity:Message, index) =>
                        <div key={index} className={ 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot') }>
                            <div className={ 'wc-message-content' + (this.props.allowMessageSelection ? ' clickable' : '') + (activity === state.history.selectedActivity ? ' selected' : '') } onClick={ e => this.props.allowMessageSelection ? this.onMessageClicked(e, activity) : undefined }>
                                <svg className="wc-message-callout">
                                    <path className="point-left" d="m0,0 h12 v10 z" />
                                    <path className="point-right" d="m0,10 v-10 h12 z" />
                                </svg>
                                <HistoryMessage activity={ activity }/>
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
