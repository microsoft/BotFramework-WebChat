import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity, Message } from './directLineTypes';
import { postMessage } from './directLine';
import { store, HistoryAction, DebugAction, DebugViewState } from './BotChat';
import { HistoryMessage } from './HistoryMessage';
import { Observable, Subscription } from '@reactivex/rxjs';

export class History extends React.Component<{}, {}> {
    scrollMe:any;
    autoscrollSubscription:Subscription;

    constructor() {
        super();
    }

    componentWillMount() {
        store.subscribe(() => 
            this.forceUpdate()
        );
    }

    componentDidMount() {
        const autoscrollSubscription = Observable
        .fromEvent<any>(this.scrollMe, 'scroll')
        .map(e => e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight)
        .distinctUntilChanged()
        .subscribe(autoscroll =>
            store.dispatch({ type: 'Set_Autoscroll', autoscroll } as HistoryAction)
        );
    }

    componentWillUnmount() {
        this.autoscrollSubscription.unsubscribe();
    }

    componentDidUpdate(prevProps:{}, prevState:{}) {
        if (store.getState().history.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    }

    onMessageClicked = (e: React.SyntheticEvent<any>, activity: Activity) => {
        if (store.getState().debug.viewState === DebugViewState.visible) {
            e.preventDefault();
            e.stopPropagation();
            store.dispatch({ type: 'Select_Activity', activity } as DebugAction)
        }
    }
/*
    onScroll = (e) => {
        store.dispatch({ type: 'Set_Autoscroll', autoscroll: e.scrollTop + e.offsetHeight >= e.scrollHeight } as HistoryAction);
    }
*/
    render() {
        const state = store.getState();
        return (
            <div className="wc-message-groups" ref={ ref => this.scrollMe = ref }>
                <div className="wc-message-group">
                { state.history.activities
                    .filter(activity => activity.type === "message" && (activity.from.id != state.connection.userId || !activity.id))
                    .map((activity:Message) =>
                        <div className={ 'wc-message wc-message-from-' + (activity.from.id === state.connection.userId ? 'me' : 'bot') }>
                            <div className={ 'wc-message-content' + (state.debug.viewState === DebugViewState.visible ? ' clickable' : '') + (activity === state.debug.selectedActivity ? ' selected' : '') } onClick={ e => this.onMessageClicked(e, activity) }>
                                <svg className="wc-message-callout">
                                    <path className="point-left" d="m0,0 h12 v10 z" />
                                    <path className="point-right" d="m0,10 v-10 h12 z" />
                                </svg>
                                <HistoryMessage activity={ activity }/>
                            </div>
                            <div className="wc-message-from">{ activity.from.id === state.connection.userId ? 'you' : activity.from.id }</div>
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
