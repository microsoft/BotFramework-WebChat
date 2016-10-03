import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity, Message } from './directLineTypes'
import { HistoryActions } from './BotChat';
import { HistoryMessage } from './HistoryMessage';

interface Props {
    activities: Activity[],
    autoscroll: boolean,
    actions: HistoryActions,
    userId: string
}

export class History extends React.Component<Props, {}> {
    scrollMe:any;
    constructor(props:Props) {
        super();
    }

    componentDidUpdate(prevProps:Props, prevState:{}) {
        if (this.props.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    }

    render() {
        return (
            <div className="wc-message-groups" ref={ref => this.scrollMe = ref} onScroll={ e => this.props.actions.setAutoscroll(e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight) }>
                <div className="wc-message-group">
                { this.props.activities
                    .filter(activity => activity.type === "message" && (activity.from.id != this.props.userId || !activity.id))
                    .map((activity:Message) => 
                        <div className={ 'wc-message wc-message-from-' + (activity.from.id === 'user' ? 'me' : 'bot') }>
                            <div className="wc-message-content">
                                <svg className="wc-message-callout">
                                    <path className="point-left" d="m0,0 h12 v10 z" />
                                    <path className="point-right" d="m0,10 v-10 h12 z" />
                                </svg>
                                <HistoryMessage activity={ activity } actions={ this.props.actions }/>
                            </div>
                            <div className="wc-message-from">{ activity.from.id === 'user' ? 'you' : activity.from.id }</div>
                        </div>
                )}
                </div>
            </div>
        );
    }
}

// <Timestamp timestamp={ messagegroup.timestamp } />
// { activities.map(activity => <HistoryMessage message={ activity } actions={ this.props.actions }/>) }
