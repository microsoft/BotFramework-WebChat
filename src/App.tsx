import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { BotMessage, BotConversation } from './directLineTypes';
import { startConversation, getMessages, postMessage } from './directLine';
import { History } from './History.tsx'
import { Outgoing } from './Outgoing.tsx'

export interface Message {
    from: "me" | "bot",
    text: string
} 

export interface Compose {
    text?: string,
    enableSend?: boolean
}

interface State {
    // conversation metadata
    conversation?: BotConversation,
    // message history
    messages?: Message[],
    // compose window
    compose?: Compose
}

const composeStart:Compose = {text: "", enableSend: true}

const outgoing$ = new Subject<Message>();

const compose$ = new Subject<Compose>();

const incoming$ = (conversation) =>
    getMessages(conversation)
    .filter(botmessage => botmessage.from === "TestBot");

const message$ = (conversation) =>
    incoming$(conversation)
    .map<Message>(botmessage => ({ text: botmessage.text, from: "bot" }))
    .merge(outgoing$)
    .scan<Message[]>((messages, message) => [...messages, message], []);

const state$ = (conversation) => 
    message$(conversation).startWith([])
    .combineLatest(
        compose$.startWith(composeStart),
        (messages, compose) => ({
            conversation: conversation,
            messages: messages,
            compose: compose
        } as State)
    )
    .do(state => console.log("state", state));

class App extends React.Component<{}, State> {
    constructor() {
        super();
        this.state = {
            conversation: null,
            messages: [],
            compose: composeStart
        }

        startConversation().subscribe(
            conversation => state$(conversation).subscribe(
                state => this.setState(state),
                error => console.log("errors", error)
            ),
            error => console.log("error starting conversation", error)
        )
    }

    updateMessage = (text: string) => {
        compose$.next({text: text, enableSend: this.state.compose.enableSend});
    }

    sendMessage = () => {
        compose$.next({text: this.state.compose.text, enableSend: false});
        postMessage({
            text: this.state.compose.text,
            from: null,
            conversationId: this.state.conversation.conversationId
        }, this.state.conversation)
        .retry(2)
        .subscribe(
            () => {
                outgoing$.next({
                    text: this.state.compose.text,
                    from: "me"
                });
                compose$.next({
                    text: "",
                    enableSend: true
                });
            },
            error => {
                console.log("failed to post message");
                compose$.next({text: this.state.compose.text, enableSend: true});
            }
        );
    }

    render() {
        return <div id="appFrame">
            <Outgoing sendMessage={ this.sendMessage } updateMessage={ this.updateMessage } { ...this.state.compose } />
            <History messages={ this.state.messages }/> 
        </div>;
    }
}

ReactDOM.render(<App />, document.getElementById("app"));
