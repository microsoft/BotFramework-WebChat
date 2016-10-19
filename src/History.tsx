import * as React from 'react';
import { Reducer } from 'redux';
//import { Timestamp } from './Timestamp';
import { Activity, Message } from './directLineTypes';
import { getStore, getState } from './Store';
import { HistoryMessage } from './HistoryMessage';
import { Observable, Subscription } from '@reactivex/rxjs';


export interface HistoryState {
    activities: Activity[],
    autoscroll: boolean,
    selectedActivity: Activity
}

export type HistoryAction = {
    type: 'Receive_Message' | 'Send_Message',
    activity: Activity
} | {
    type: 'Set_Autoscroll',
    autoscroll: boolean
} | {
    type: 'Select_Activity',
    selectedActivity: Activity
}

export const historyReducer: Reducer<HistoryState> = (
    state: HistoryState = {
        activities: [],
        autoscroll: true,
        selectedActivity: null
    },
    action: HistoryAction
) => {
    switch (action.type) {
        case 'Receive_Message':
            return { activities: [... state.activities, action.activity], autoscroll: state.autoscroll, selectedActivity: state.selectedActivity };
        case 'Send_Message':
            return { activities: [... state.activities, action.activity], autoscroll: true, selectedActivity: state.selectedActivity };
        case 'Set_Autoscroll':
            return { activities: state.activities, autoscroll: action.autoscroll, selectedActivity: state.selectedActivity };
        case 'Select_Activity':
            return { activities: state.activities, autoscroll: state.autoscroll, selectedActivity: action.selectedActivity };
        default:
            return state;
    }
}

export class HistoryProps {
    allowSelection: boolean
}

export class History extends React.Component<HistoryProps, {}> {
    scrollMe:any;
    autoscrollSubscription:Subscription;
    storeUnsubscribe:any;

    constructor() {
        super();
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

    onMessageClicked = (e: React.SyntheticEvent<any>, activity: Activity) => {
        e.preventDefault();
        e.stopPropagation();
        getStore().dispatch({ type: 'Select_Activity', selectedActivity: activity } as HistoryAction);
    }

    render() {
        console.log()
        const state = getState();
        return (
            <div className="wc-message-groups" ref={ ref => this.scrollMe = ref }>
                <div className="wc-message-group">
                { state.history.activities
                    .filter(activity => activity.type === "message" && (activity.from.id != state.connection.user.id || !activity.id))
                    .map((activity:Message) =>
                        <div className={ 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot') }>
                            <div className={ 'wc-message-content' + (this.props.allowSelection ? ' clickable' : '') + (activity === state.history.selectedActivity ? ' selected' : '') } onClick={ e => this.props.allowSelection ? this.onMessageClicked(e, activity) : undefined }>
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
