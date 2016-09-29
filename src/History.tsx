import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Timestamp } from './Timestamp';
import { MessageGroup, HistoryActions } from './App';
import { HistoryMessage } from './HistoryMessage';

interface Props {
    messagegroups: MessageGroup[],
    autoscroll: boolean,
    actions: HistoryActions
}

export class History extends React.Component<Props, {}> {
    scrollme:any;
    constructor(props:Props) {
        super();
    }

    componentDidUpdate(prevProps:Props, prevState:{}) {
        if (this.props.autoscroll)
            this.scrollme.scrollTop = this.scrollme.scrollHeight;
    }

    render() {
        return (
            <div className="wc-message-groups" ref={ref => this.scrollme = ref} onScroll={ e => this.props.actions.setAutoscroll(e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight) }>
                { this.props.messagegroups.map(messagegroup =>
                    <div className="wc-message-group">
                        <Timestamp timestamp={ messagegroup.timestamp } />
                        { messagegroup.messages.map(message => <HistoryMessage message={ message } actions={ this.props.actions }/>) }
                    </div>
                ) }
            </div>
        );
    }
}