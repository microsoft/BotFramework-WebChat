import { Message, Conversation } from './directLineTypes';
import { startConversation, getMessages, postMessage } from './mockLine';

const app = () =>
    startConversation().subscribe(
        conversation => {
            const messages = document.getElementById("app");
            getMessages(conversation).subscribe(
                message =>  messages.innerHTML += "<p>Received: " + message.text + "</p>",
                error => console.log("error getting messages", error),
                () => console.log("done getting messages")
            );
        },
        error => console.log("error starting conversation", error),
        () => console.log("done starting conversation")
    );

app();
