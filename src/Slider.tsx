import * as React from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Activity, User, IBotConnection, CardAction } from 'botframework-directlinejs';
import { sendMessage, sendPostBack, konsole, ActivityOrID } from './Chat';
import { ChatActions, ChatState, FormatState, SizeState } from './Store';
import { Dispatch, connect } from 'react-redux';
import { History } from './History';
import { SuggestedActions } from './SuggestedActions';

const onCardAction = (
    botConnection: IBotConnection,
    user: User,
    locale: string
) => (
    sendMessage: (value: string, user: User, locale: string) => void,
) => (
    type: string,
    value: string
)  => {
    switch (type) {
        case "imBack":
            sendMessage(value, user, locale);
            break;

        case "postBack":
            sendPostBack(botConnection, value, user, locale);
            break;

        case "call":
        case "openUrl":
        case "playAudio":
        case "playVideo":
        case "showImage":
        case "downloadFile":
        case "signin":
            window.open(value);
            break;

        default:
            konsole.log("unknown button type", type);
        }
}

interface SliderProps {
    format: FormatState,
    size: SizeState,
    activities: Activity[],
    actions: CardAction[],
    isFromMe: (activity: Activity) => boolean,
    isSelected: (activity: Activity) => boolean,
    onClickActivity: (activity: Activity) => () => void,
    onCardAction: (sendMessage: (value: string, user: User, locale: string) => void) => (type: string, value: string) => void,
    onClickRetry: (activity: Activity) => void,
    setMeasurements: (carouselMargin: number) => void,
    sendMessage: (value: string, user: User, locale: string) => void
}

const SliderView = (props: SliderProps) => {
    const onCardAction = props.onCardAction(props.sendMessage);
    return (
        <div className={ props.actions ? 'show-actions' : '' }>
            <History { ... props } onCardAction={ onCardAction }/>
            <SuggestedActions actions={ props.actions } onCardAction={ onCardAction }/>
        </div>
    );
}

function suggestedActions(activities: Activity[]) {
    if (!activities || activities.length === 0)
        return;
    const lastActivity = activities[activities.length - 1];
    if (!lastActivity || lastActivity.type !== 'message' || !lastActivity.suggestedActions || lastActivity.suggestedActions.length === 0)
        return;
    return lastActivity.suggestedActions;
}

export const Slider = connect(
    (state: ChatState): Partial<SliderProps> => ({
        format: state.format,
        size: state.size,
        activities: state.history.activities,
        actions: suggestedActions(state.history.activities),
        isFromMe: (activity: Activity) => activity.from.id === state.connection.user.id,
        isSelected: (activity: Activity) => activity === state.history.selectedActivity,
        onClickActivity: (activity: Activity) => state.connection.selectedActivity && (() => state.connection.selectedActivity.next({ activity })),
        onCardAction: onCardAction(state.connection.botConnection, state.connection.user, state.format.locale),
    }),
    (dispatch: Dispatch<any>): Partial<SliderProps> => ({
        setMeasurements: (carouselMargin: number) => dispatch<ChatActions>({ 
            type: 'Set_Measurements',
            carouselMargin
        }),
        onClickRetry: (activity: Activity) => dispatch<ChatActions>({
            type: 'Send_Message_Retry',
            clientActivityId: activity.channelData.clientActivityId
        }),
        sendMessage: (value: string, user: User, locale: string) => sendMessage(dispatch, value, user, locale)
    })
)(SliderView);
