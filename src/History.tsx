import * as React from 'react';
import { Activity, Message, User, CardActionTypes } from 'botframework-directlinejs';
import { ChatState, FormatState, SizeState } from './Store';
import { Dispatch, connect } from 'react-redux';
import { ActivityView } from './ActivityView';
import { classList, doCardAction, IDoCardAction } from './Chat';
import * as konsole from './Konsole';
import { sendMessage } from './Store';
import { activityWithSuggestedActions } from './activityWithSuggestedActions';

export enum ActivityPosition {
    Alone,
    First,
    Last,
    Middle
}

export interface HistoryProps {
    format: FormatState,
    size: SizeState,
    activities: Activity[],
    activityMergeWindowSizeInMillis: number,
    hasActivityWithSuggestedActions: Activity,

    setMeasurements: (carouselMargin: number) => void,
    onClickRetry: (activity: Activity) => void,
    onClickCardAction: () => void,

    isFromMe: (activity: Activity) => boolean,
    isSelected: (activity: Activity) => boolean,
    onClickActivity: (activity: Activity) => React.MouseEventHandler<HTMLDivElement>,

    onCardAction: () => void,
    doCardAction: IDoCardAction
}

export class HistoryView extends React.Component<HistoryProps, {}> {
    private activityPositions: ActivityPosition[] = [];
    private carouselActivity: WrappedActivity;
    private largeWidth: number;
    private scrollContent: HTMLDivElement;
    private scrollMe: HTMLDivElement;
    private scrollToBottom = true;

    constructor(props: HistoryProps) {
        super(props);
    }

    private updateActivityPositions(nextProps: HistoryProps) {
        if (nextProps.activities.length <= this.activityPositions.length) {
            return;
        }

        const lastActivityPositionIndex = this.activityPositions.length - 1;

        const newActivity = nextProps.activities[lastActivityPositionIndex + 1];
        const lastActivity = nextProps.activities[lastActivityPositionIndex];

        if (!lastActivity || newActivity.from.id !== lastActivity.from.id) {
            this.activityPositions.push(ActivityPosition.Alone);
        }
        else if(new Date(newActivity.timestamp).getTime() - new Date(lastActivity.timestamp).getTime() < this.props.activityMergeWindowSizeInMillis) {
            const lastActivityPosition = this.activityPositions[lastActivityPositionIndex];
            if (lastActivityPosition === ActivityPosition.Alone) {
                this.activityPositions[lastActivityPositionIndex] = ActivityPosition.First;
            }
            else if (lastActivityPosition === ActivityPosition.Last) {
                this.activityPositions[lastActivityPositionIndex] = ActivityPosition.Middle;
            }
            this.activityPositions.push(ActivityPosition.Last);
        }
        else {
            this.activityPositions.push(ActivityPosition.Alone);
        }
    }

    componentWillUpdate(nextProps: HistoryProps) {
        this.updateActivityPositions(nextProps);

        let scrollToBottomDetectionTolerance = 1;

        if (!this.props.hasActivityWithSuggestedActions && nextProps.hasActivityWithSuggestedActions) {
            scrollToBottomDetectionTolerance = 40; // this should be in-sync with $actionsHeight scss var
        }

        this.scrollToBottom = (Math.abs(this.scrollMe.scrollHeight - this.scrollMe.scrollTop - this.scrollMe.offsetHeight) <= scrollToBottomDetectionTolerance);
    }

    componentDidUpdate() {
        if (this.props.format.carouselMargin == undefined) {
            // After our initial render we need to measure the carousel width

            // Measure the message padding by subtracting the known large width
            const paddedWidth = measurePaddedWidth(this.carouselActivity.messageDiv) - this.largeWidth;

            // Subtract the padding from the offsetParent's width to get the width of the content
            const maxContentWidth = (this.carouselActivity.messageDiv.offsetParent as HTMLElement).offsetWidth - paddedWidth;

            // Subtract the content width from the chat width to get the margin.
            // Next time we need to get the content width (on a resize) we can use this margin to get the maximum content width
            const carouselMargin = this.props.size.width - maxContentWidth;

            konsole.log('history measureMessage ' + carouselMargin);

            // Finally, save it away in the Store, which will force another re-render
            this.props.setMeasurements(carouselMargin)

            this.carouselActivity = null; // After the re-render this activity doesn't exist
        }

        this.autoscroll();
    }

    private autoscroll() {
        const vAlignBottomPadding = Math.max(0, measurePaddedHeight(this.scrollMe) - this.scrollContent.offsetHeight);
        this.scrollContent.style.marginTop = vAlignBottomPadding + 'px';

        const lastActivity = this.props.activities[this.props.activities.length - 1];
        const lastActivityFromMe = lastActivity && this.props.isFromMe && this.props.isFromMe(lastActivity);

        // Validating if we are at the bottom of the list or the last activity was triggered by the user.
        if (this.scrollToBottom || lastActivityFromMe) {
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
        }
    }

    // In order to do their cool horizontal scrolling thing, Carousels need to know how wide they can be.
    // So, at startup, we create this mock Carousel activity and measure it.
    private measurableCarousel = () =>
        // find the largest possible message size by forcing a width larger than the chat itself
        <WrappedActivity
            activity={ {
                type: 'message',
                id: '',
                from: { id: '' },
                attachmentLayout: 'carousel'
            } }
            format={ null }
            fromMe={ false }
            activityPosition={ActivityPosition.Alone}
            onClickActivity={ null }
            onClickRetry={ null }
            ref={ x => this.carouselActivity = x }
            selected={ false }
            showTimestamp={ false }
        >
            <div style={ { width: this.largeWidth } }>&nbsp;</div>
        </WrappedActivity>;

    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (not much needs to actually render here)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity

    private doCardAction(type: CardActionTypes, value: string | object) {
        this.props.onClickCardAction();
        this.props.onCardAction && this.props.onCardAction();
        return this.props.doCardAction(type, value);
    }

    render() {
        konsole.log("History props", this);
        let content;
        if (this.props.size.width !== undefined) {
            if (this.props.format.carouselMargin === undefined) {
                // For measuring carousels we need a width known to be larger than the chat itself
                this.largeWidth = this.props.size.width * 2;
                content = <this.measurableCarousel/>;
            } else {
                content = this.props.activities.map((activity, index) =>
                    (activity.type !== 'message' || activity.text || (activity.attachments && activity.attachments.length)) &&
                        <WrappedActivity
                            activity={ activity }
                            format={ this.props.format }
                            fromMe={ this.props.isFromMe(activity) }
                            key={ 'message' + index }
                            activityPosition={this.activityPositions[index]}
                            onClickActivity={ this.props.onClickActivity(activity) }
                            onClickRetry={ e => {
                                // Since this is a click on an anchor, we need to stop it
                                // from trying to actually follow a (nonexistant) link
                                e.preventDefault();
                                e.stopPropagation();
                                this.props.onClickRetry(activity)
                            } }
                            selected={ this.props.isSelected(activity) }
                            showTimestamp={ index === this.props.activities.length - 1 || (index + 1 < this.props.activities.length && suitableInterval(activity, this.props.activities[index + 1])) }
                        >
                            <ActivityView
                                activity={ activity }
                                format={ this.props.format }
                                onCardAction={ (type: CardActionTypes, value: string | object) => this.doCardAction(type, value) }
                                onImageLoad={ () => this.autoscroll() }
                                size={ this.props.size }
                            />
                        </WrappedActivity>
                );
            }
        }

        const groupsClassName = classList('wc-message-groups', !this.props.format.chatTitle && 'no-header');

        return (
            <div
                className={ groupsClassName }
                ref={ div => this.scrollMe = div || this.scrollMe }
                role="log"
                tabIndex={ 0 }
            >
                <div className="wc-message-group-content" ref={ div => { if (div) this.scrollContent = div }}>
                    { content }
                </div>
            </div>
        );
    }
}

export const History = connect(
    (state: ChatState) => ({
        // passed down to HistoryView
        format: state.format,
        size: state.size,
        activities: state.history.activities,
        hasActivityWithSuggestedActions: !!activityWithSuggestedActions(state.history.activities),
        // only used to create helper functions below
        connectionSelectedActivity: state.connection.selectedActivity,
        selectedActivity: state.history.selectedActivity,
        botConnection: state.connection.botConnection,
        user: state.connection.user
    }), {
        setMeasurements: (carouselMargin: number) => ({ type: 'Set_Measurements', carouselMargin }),
        onClickRetry: (activity: Activity) => ({ type: 'Send_Message_Retry', clientActivityId: activity.channelData.clientActivityId }),
        onClickCardAction: () => ({ type: 'Card_Action_Clicked'}),
        // only used to create helper functions below
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): HistoryProps => ({
        // from stateProps
        format: stateProps.format,
        size: stateProps.size,
        activities: stateProps.activities,
        hasActivityWithSuggestedActions: stateProps.hasActivityWithSuggestedActions,
        // from dispatchProps
        setMeasurements: dispatchProps.setMeasurements,
        onClickRetry: dispatchProps.onClickRetry,
        onClickCardAction: dispatchProps.onClickCardAction,
        // helper functions
        doCardAction: doCardAction(stateProps.botConnection, stateProps.user, stateProps.format.locale, dispatchProps.sendMessage),
        isFromMe: (activity: Activity) => activity.from.id === stateProps.user.id,
        isSelected: (activity: Activity) => activity === stateProps.selectedActivity,
        onClickActivity: (activity: Activity) => stateProps.connectionSelectedActivity && (() => stateProps.connectionSelectedActivity.next({ activity })),
        onCardAction: ownProps.onCardAction,
        activityMergeWindowSizeInMillis: ownProps.activityMergeWindowSizeInMillis
    }), {
        withRef: true
    }
)(HistoryView);

const getComputedStyleValues = (el: HTMLElement, stylePropertyNames: string[]) => {
    const s = window.getComputedStyle(el);
    const result: { [key: string]: number } = {};
    stylePropertyNames.forEach(name => result[name] = parseInt(s.getPropertyValue(name)));
    return result;
}

const measurePaddedHeight = (el: HTMLElement): number => {
    const paddingTop = 'padding-top', paddingBottom = 'padding-bottom';
    const values = getComputedStyleValues(el, [paddingTop, paddingBottom]);
    return el.offsetHeight - values[paddingTop] - values[paddingBottom];
}

const measurePaddedWidth = (el: HTMLElement): number => {
    const paddingLeft = 'padding-left', paddingRight = 'padding-right';
    const values = getComputedStyleValues(el, [paddingLeft, paddingRight]);
    return el.offsetWidth + values[paddingLeft] + values[paddingRight];
}

const suitableInterval = (current: Activity, next: Activity) =>
    Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;

export interface WrappedActivityProps {
    activity: Activity,
    format: FormatState,
    fromMe: boolean,
    activityPosition?: ActivityPosition,
    onClickActivity: React.MouseEventHandler<HTMLDivElement>,
    onClickRetry: React.MouseEventHandler<HTMLAnchorElement>,
    selected: boolean,
    showTimestamp: boolean
}

export class WrappedActivity extends React.Component<WrappedActivityProps, {}> {
    public messageDiv: HTMLDivElement;

    constructor(props: WrappedActivityProps) {
        super(props);
    };

    private activityPosition2Class = {
        [ActivityPosition.Alone]: 'wc-message-alone',
        [ActivityPosition.First]: 'wc-message-first',
        [ActivityPosition.Last]: 'wc-message-last',
        [ActivityPosition.Middle]: 'wc-message-middle'
    };

    render () {
        let timeLine: JSX.Element;

        const {activity, format, activityPosition} = this.props;

        switch (activity.id) {
            case undefined:
                timeLine = <span>{ format.strings.messageSending }</span>;
                break;
            case null:
                timeLine = <span>{ format.strings.messageFailed }</span>;
                break;
            case "retry":
                timeLine =
                    <span>
                        { format.strings.messageFailed }
                        { ' ' }
                        <a href="." onClick={ this.props.onClickRetry }>{ format.strings.messageRetry }</a>
                    </span>;
                break;
            default:
                let sent: string;
                if (this.props.showTimestamp) {
                    sent = format.strings.timeSent.replace('%1', (new Date(activity.timestamp)).toLocaleTimeString());
                }
                timeLine = <span>{ activity.from.name || activity.from.id }{ sent }</span>;
                break;
        }

        const who = this.props.fromMe ? 'me' : 'bot';

        const wrapperClassName = classList(
            'wc-message-wrapper',
            (activity as Message).attachmentLayout || 'list',
            this.props.onClickActivity && 'clickable'
        );

        const contentClassName = classList(
            'wc-message-content',
            this.props.selected && 'selected'
        );

        const messageAtBottom = activityPosition === ActivityPosition.Last || activityPosition === ActivityPosition.Alone;

        return (
            <div className={ `${wrapperClassName} ${this.activityPosition2Class[activityPosition]}` }
                 data-activity-id={ activity.id }
                 onClick={ this.props.onClickActivity }>
                <div className={ 'wc-message wc-message-from-' + who } ref={ div => this.messageDiv = div }>
                    <div className={ contentClassName }>
                        {
                            messageAtBottom
                            ? <svg className='wc-message-callout'>
                                <path className='point-left' d='m0,6 l6 6 v-12 z' />
                                <path className='point-right' d='m6,6 l-6 6 v-12 z' />
                              </svg>
                            : null
                        }
                        { this.props.children }
                    </div>
                </div>
                {
                    messageAtBottom
                    ? <div className={ 'wc-message-from wc-message-from-' + who }>{ timeLine }</div>
                    : null
                }
            </div>
        );
    }
}
