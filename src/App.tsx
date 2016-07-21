import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observable, Subscriber, Subject } from '@reactivex/rxjs';
import { BotMessage, BotConversation } from './directLineTypes';
import { startConversation, getMessages, postMessage } from './mockLine';
import { History } from './History.tsx'
import { Outgoing } from './Outgoing.tsx'

interface AppState {
    conversation?: BotConversation; 
    messages: string[];
}

const outgoing$ = new Subject<string>(); 

class App extends React.Component<{}, AppState> {
    constructor() {
        super();
        this.state = {
            conversation: null,
            messages: []
        }

        startConversation().subscribe(
            conversation => {
                getMessages(conversation)
                .map(message => message.text)
                .merge(outgoing$)
                .scan<string[]>((messages, message) => [...messages, message], [])
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

    sendMessage = (text:string) => {
        outgoing$.next(text);
    }

    render() {
        console.log("rendering I guess", this.state.messages);
        return <div id="appFrame">
            <Outgoing sendMessage={ this.sendMessage }/>
            <History messages={ this.state.messages }/> 
        </div>;
    }
}

ReactDOM.render(<App />, document.getElementById("app"));
