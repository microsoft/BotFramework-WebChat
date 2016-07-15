import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BotMessage, BotConversation } from './directLineTypes';
import { startConversation, getMessages, postMessage } from './mockLine';
import { Message } from './Message.tsx'

interface AppState {
    conversation?: BotConversation; 
    messages: string[];
}

class App extends React.Component<any, AppState> {
    constructor() {
        super();
        this.state = {
            conversation: null,
            messages: []
        }

        startConversation().subscribe(
            conversation => {
                getMessages(conversation)
                .scan<string[]>((messages, message) => [...messages, message.text], [])
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

    render() {
        console.log("rendering I guess", this.state.messages);
        return <div>
            { this.state.messages.map(message => <Message key={ message } text={ message }/>) }
        </div>;
    }
}


ReactDOM.render(<App />, document.getElementById("app"));
