import * as React from 'react';
//import { Timestamp } from './Timestamp';
import { Activity, User } from './BotConnection';
import { HistoryAction, ChatStore } from './Store';
import { ActivityView } from './ActivityView';
import { sendMessage, sendPostBack, trySendMessage, FormatOptions, konsole } from './Chat';
import { Strings } from './Strings';

interface Props {
    store: ChatStore,
    selectActivity?: (activity: Activity) => void
}

export class History extends React.Component<Props, {}> {
    scrollMe: HTMLDivElement;
    scrollToBottom = true;
    resizeListener = () => this.autoscroll();

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

    autoscroll() {
        if (this.scrollToBottom)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
    }

    onClickRetry(e: React.MouseEvent<HTMLAnchorElement>, activity: Activity) {
        // Since this is a click on an anchor, we need to stop it
        // from trying to actually follow a (nonexistant) link
        e.preventDefault();
        e.stopPropagation();
        trySendMessage(this.props.store, activity.channelData.clientActivityId, true);
    }

    onClickButton(type: string, value: string) {
        switch (type) {
            case "imBack":
                sendMessage(this.props.store, value);
                break;
            case "postBack":
                sendPostBack(this.props.store, value);
                break;

            case "openUrl":
            case "signin":
                window.open(value);
                break;

            default:
                konsole.log("unknown button type", type);
            }
    }

    render() {
        const state = this.props.store.getState();

        return <HistoryView
                activities={ state.history.activities }
                selectedActivity={ state.history.selectedActivity }
                user={ state.connection.user }
                options={ state.format.options }
                strings={ state.format.strings }
                onClickButton={ (type, value) => this.onClickButton(type, value) }
                onClickActivity={ this.props.selectActivity }
                onClickRetry={ (e, activity) => this.onClickRetry(e, activity) }
                onImageLoad={ () => this.autoscroll() }
                setScroll={ div => this.scrollMe = div }
            />;
    }
}

const suitableInterval = (current: Activity, next: Activity) =>
    Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;

const HistoryView = (props: {
    activities: Activity[],
    selectedActivity: Activity,
    user: User,
    options: FormatOptions,
    strings: Strings,
    onClickButton: (type: string, value: string) => void,
    onClickActivity: (activity: Activity) => void,
    onClickRetry: (e: React.MouseEvent<HTMLAnchorElement>, activity: Activity) => void,
    onImageLoad: () => void,
    setScroll: (div: HTMLDivElement) => void
}) => 
    <div className="wc-message-groups" ref={ props.setScroll }>
        <div className="wc-message-group">
            <div className="wc-message-group-content">
                { props.activities.map((activity, index) => 
                    <WrappedActivity 
                        key={ 'message' + index }
                        activity={ activity }
                        showTimestamp={ index === props.activities.length - 1 || (index + 1 < props.activities.length && suitableInterval(activity, props.activities[index + 1])) }
                        selected={ activity === props.selectedActivity }
                        fromMe={ activity.from.id === props.user.id }
                        options={ props.options }
                        strings={ props.strings }
                        onClickButton={ props.onClickButton }
                        onClickActivity={ props.onClickActivity && (() => props.onClickActivity(activity)) }
                        onClickRetry={ e => props.onClickRetry(e, activity) }
                        onImageLoad={ props.onImageLoad }
                    />
                ) }
            </div>
        </div>
    </div>;

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