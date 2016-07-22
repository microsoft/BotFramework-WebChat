import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { BotMessage, BotConversation } from './directLineTypes';
import { startConversation, getMessages, postMessage } from './directLine';
import { History } from './History.tsx'
import { Outgoing } from './Outgoing.tsx'

export interface Message {
    from: "me" | "bot";
    text: string;
} 

interface State {
    conversation?: BotConversation; 
    messages?: Message[];
    outgoingMessage?: string;
    enableSend?: boolean;
}

const outgoing$ = new Subject<Message>();

class App extends React.Component<{}, State> {
    constructor() {
        super();
        this.state = {
            conversation: null,
            messages: [],
            outgoingMessage: "",
            enableSend: true
        }

        startConversation().subscribe(
            conversation => {
                this.setState({conversation:conversation});

                getMessages(conversation)
                .filter(botmessage => botmessage.from === "TestBot")
                .map<Message>(botmessage => ({ text: botmessage.text, from: "bot" }))
                .merge(outgoing$)
                .scan<Message[]>((messages, message) => [...messages, message], [])
                .subscribe(
                    messages => this.setState({ messages : messages }),
                    error => console.log("error getting messages", error),
                    () => console.log("done getting messages")
                );
            },
            error => console.log("error starting conversation", error),
            () => console.log("done starting conversation")
        )
    }

    updateMessage = (text:string) => {
        this.setState({ outgoingMessage: text });
    }

    sendMessage = () => {
        this.setState({enableSend: false});
        postMessage({
            text: this.state.outgoingMessage,
            from: null,
            conversationId: this.state.conversation.conversationId
        }, this.state.conversation)
        .retry(2)
        .subscribe(
            () => {
                outgoing$.next({text: this.state.outgoingMessage, from: "me"});
                this.setState({outgoingMessage: "", enableSend:true});
            },
            error => {
                console.log("failed to post message");
                this.setState({enableSend: true});
            }
        );
    }

    render() {
        return <div id="appFrame">
            <Outgoing sendMessage={ this.sendMessage } updateMessage={ this.updateMessage } enableSend={ this.state.enableSend } outgoingMessage={ this.state.outgoingMessage }/>
            <History messages={ this.state.messages }/> 
        </div>;
    }
}

ReactDOM.render(<App />, document.getElementById("app"));
