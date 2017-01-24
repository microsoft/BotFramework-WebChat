import * as React from 'react';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { Activity, Media, IBotConnection, User, MediaType, ConnectionStatus } from './BotConnection';
import { DirectLine } from './directLine';
//import { BrowserLine } from './browserLine';
import { History } from './History';
import { Shell } from './Shell';
import { createStore, FormatAction, HistoryAction, ConnectionAction, ChatStore } from './Store';
import { strings } from './Strings';
import { Dispatch } from 'redux';
import { Provider } from 'react-redux';

export interface FormatOptions {
    showHeader?: boolean
}

export type ActivityOrID = {
    activity?: Activity
    id?: string
}

export interface ChatProps {
    user: User,
    bot: User,
    botConnection: IBotConnection,
    locale?: string,
    selectedActivity?: BehaviorSubject<ActivityOrID>,
    formatOptions?: FormatOptions
}

export class Chat extends React.Component<ChatProps, {}> {

    private store = createStore();

    private activitySubscription: Subscription;
    private connectionStatusSubscription: Subscription;
    private selectedActivitySubscription: Subscription;

    constructor(props: ChatProps) {
        super(props);

        konsole.log("BotChat.Chat props", props);

        if (props.formatOptions)
            this.store.dispatch<FormatAction>({ type: 'Set_Format_Options', options: props.formatOptions });

        this.store.dispatch<FormatAction>({ type: 'Set_Localized_Strings', strings: strings(props.locale || window.navigator.language) });
    }

    private handleIncomingActivity(activity: Activity) {
        let state = this.store.getState();
        switch (activity.type) {

            case "message":
                this.store.dispatch<HistoryAction>({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity });
                break;

            case "typing":
                this.store.dispatch<HistoryAction>({ type: 'Show_Typing', activity });
                break;
        }
    }

    componentDidMount() {
        let props = this.props;

        this.store.dispatch<ConnectionAction>({ type: 'Start_Connection', user: props.user, bot: props.bot, botConnection: props.botConnection, selectedActivity: props.selectedActivity });

        this.connectionStatusSubscription = props.botConnection.connectionStatus$.subscribe(connectionStatus =>
            this.store.dispatch<ConnectionAction>({ type: 'Connection_Change', connectionStatus })
        );

        this.activitySubscription = props.botConnection.activity$.subscribe(
            activity => this.handleIncomingActivity(activity),
            error => konsole.log("activity$ error", error)
        );

        if (props.selectedActivity) {
            this.selectedActivitySubscription = props.selectedActivity.subscribe(activityOrID => {
                this.store.dispatch<HistoryAction>({
                    type: 'Select_Activity',
                    selectedActivity: activityOrID.activity || this.store.getState().history.activities.find(activity => activity.id === activityOrID.id)
                });
            });
        }
    }

    componentWillUnmount() {
        this.connectionStatusSubscription.unsubscribe();
        this.activitySubscription.unsubscribe();
        if (this.selectedActivitySubscription)
            this.selectedActivitySubscription.unsubscribe();
        this.props.botConnection.end();
    }

    render() {
        const state = this.store.getState();
        konsole.log("BotChat.Chat state", state);

        // Trying to get a welcome message
        sendPostBack(this.props.botConnection, "hi", this.props.user);

        let header;
        if (state.format.options.showHeader) header =
            <div className="wc-header">
                <span>{ state.format.strings.title }</span>
            </div>;

        let add_url = "http://www.chron.com/";
        let img_src = "https://upload.wikimedia.org/wikipedia/commons/7/70/Houston_Chronicle_Logo_2016.svg";
        let add = <div className="wc-add"><a href={add_url} target="_blank" title="Click here for more info"><img src={img_src} /></a></div>

        return (
            <Provider store={ this.store }>
                <div className={ "wc-chatview-panel" }>
                    { add }
                    { header }
                    <History />
                    <Shell />
                    <div className='wizeline-branded'>
                      <span className='wizeline-branded-font'> Powered by  </span>
                      <svg>
                        <polygon id="Shape" fill="#B3B3B3" points="6.31057143 13 4.63542857 13 3.93342857 5.837 3.13485714 13 1.48014286 13 0 0 1.94814286 0 2.57028571 8.19742857 3.32985714 0 4.83042857 0 5.473 8.19742857 6.21214286 0 8.02285714 0"/>
                        <rect id="Rectangle-path" fill="#B3B3B3" x="10.79" y="0" width="2.00571429" height="13"/>
                        <polygon id="Shape" fill="#B3B3B3" points="17.9177143 11.0871429 20.2335714 11.0871429 20.2335714 13 15.717 13 15.717 12.3165714 18.1498571 1.91285714 15.8525714 1.91285714 15.8525714 0 20.3505714 0 20.3505714 0.683428571"/>
                        <polygon id="Shape" fill="#B3B3B3" points="23.3498571 13 23.3498571 0 27.5562857 0 27.5562857 1.87385714 25.3555714 1.87385714 25.3555714 5.42657143 26.8171429 5.42657143 26.8171429 7.202 25.3555714 7.202 25.3555714 11.0667143 27.5562857 11.0667143 27.5562857 13"/>
                        <polygon id="Shape" fill="#CCCCCC" points="30.8675714 13 30.8675714 0 32.2697143 0 32.2697143 11.6535714 34.8994286 11.6535714 34.8994286 13"/>
                        <rect id="Rectangle-path" fill="#CCCCCC" x="38.2292857" y="0" width="1.42071429" height="13"/>
                        <polygon id="Shape" fill="#CCCCCC" points="47.5577143 13 45.357 6.422 44.733 4.33271429 44.733 13 43.4088571 13 43.4088571 0 44.6754286 0 46.6811429 6.67642857 47.2642857 8.78428571 47.2642857 0 48.5884286 0 48.5884286 13"/>
                        <polygon id="Shape" fill="#CCCCCC" points="52.3287143 13 52.3287143 0 56.4571429 0 56.4571429 1.30742857 53.7308571 1.30742857 53.7308571 5.642 55.6975714 5.642 55.6975714 6.91042857 53.7308571 6.91042857 53.7308571 11.6925714 56.4571429 11.6925714 56.4571429 13"/>
                      </svg>
                    </div>
                </div>
            </Provider>
        );
    }
}

export const sendMessage = (dispatch: Dispatch<HistoryAction>, text: string, from: User) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0)
        return;
    let postback;
    try {
        postback = JSON.parse(text);
        text = postback.text || text;
        delete postback.text;
    } catch(e) {
        // Error occurs
    }
    dispatch({ type: 'Send_Message', activity: {
        type: "message",
        text,
        from,
        timestamp: (new Date()).toISOString(),
        postback
    }});
}

export const sendPostBack = (botConnection: IBotConnection, text: string, from: User) => {
    botConnection.postActivity({
        type: "message",
        text,
        from
    })
    .subscribe(id => {
        konsole.log("success sending postBack", id)
    }, error => {
        konsole.log("failed to send postBack", error);
    });
}

const attachmentsFromFiles = (files: FileList) => {
    const attachments: Media[] = [];
    for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i];
        attachments.push({
            contentType: file.type as MediaType,
            contentUrl: window.URL.createObjectURL(file),
            name: file.name
        });
    }
    return attachments;
}

export const sendFiles = (dispatch: Dispatch<HistoryAction>, files: FileList, from: User) => {
    dispatch({ type: 'Send_Message', activity: {
        type: "message",
        attachments: attachmentsFromFiles(files),
        from
    }});
}

export const renderIfNonempty = (value: any, renderer: (value: any) => JSX.Element ) => {
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0))
        return renderer(value);
}

export const konsole = {
    log: (message?: any, ... optionalParams: any[]) => {
        if (typeof(window) !== 'undefined' && window["botchatDebug"] === true && message)
            console.log(message, ... optionalParams);
    }
}
