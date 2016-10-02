import { Observable, Subscriber, AjaxResponse, AjaxRequest } from '@reactivex/rxjs';
import { Conversation, Activity, Message } from './directLineTypes'; 

/*
// DL V3

const domain = "https://ic-dandris-scratch.azurewebsites.net";
const baseUrl = `${domain}/V3/directline/conversations`;
*/

// DL v1 

const domain = "https://directline.botframework.com";
const baseUrl = `${domain}/api/conversations`;

export interface DLAttachment {
    url: string,
    contentType: string
}

export interface DLMessage
{
    id?: string,
    conversationId?: string,
    created?: string,
    from?: string,
    text?: string,
    channelData?: Activity,
    images?: string[],
    attachments?: DLAttachment[];
    eTag?: string;
}

export interface DLMessageGroup
{
    messages: DLMessage[],
    watermark?: string,
    eTag?: string
}

export const startConversation = (appSecret: string) =>
    Observable
        .ajax({
            method: "POST",
            url: `${baseUrl}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${appSecret}` 
            }
        })
        .do(ajaxResponse => console.log("conversation ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map<Conversation>(ajaxResponse => Object.assign({}, ajaxResponse.response, { userId: 'foo'}));

export const postMessage = (text: string, conversation: Conversation, userId: string) =>
    Observable
        .ajax({
            method: "POST",
            url: `${baseUrl}/${conversation.conversationId}/messages`,
            body: <DLMessage>{
                text: text,
                from: userId,
                conversationId: conversation.conversationId
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `BotConnector ${conversation.token}`
            }
        })
//        .do(ajaxResponse => console.log("post message ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => true);

export const postFile = (file: File, conversation: Conversation) => {
    const formData = new FormData();
    formData.append('file', file);
    return Observable
        .ajax({
            method: "POST",
            url: `${baseUrl}/${conversation.conversationId}/upload`,
            body: formData,
            headers: {
                "Authorization": `BotConnector ${conversation.token}`
            }
        })
//        .do(ajaxResponse => console.log("post file ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => true)
}

export const mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg'
}

export const getActivities = (conversation: Conversation) =>
    new Observable<Observable<DLMessage>>((subscriber:Subscriber<Observable<DLMessage>>) =>
        activitiesGenerator(conversation, subscriber)
    )
    .concatAll() 
    .do(dlm => console.log("DL Message", dlm))
    .map(dlm => {
        if (dlm.channelData) {
            switch(dlm.channelData.type) {
                case "message":
                    return <Message>Object.assign({}, dlm.channelData, {
                        id: dlm.id,
                        conversation: { id: dlm.conversationId },
                        timestamp: dlm.created,
                        from: { id: dlm.from },
                        channelData: null,
                    });
                default:
                    return <Activity>dlm.channelData;
            }
        } else {
            return <Message>{
                type: "message",
                id: dlm.id,
                conversation: { id: dlm.conversationId },
                timestamp: dlm.created,
                from: { id: dlm.from },
                text: dlm.text,
                textFormat: "markdown",
                eTag: dlm.eTag,
                attachments: dlm.images && dlm.images.map(path => ({
                    contentType: mimeTypes[path.split('.').pop()],
                    contentUrl: domain + path,
                    name: '2009-09-21'
                }))
            }
        }
    });

const activitiesGenerator = (conversation: Conversation, subscriber: Subscriber<Observable<DLMessage>>, watermark?: string) => {
    getActivityGroup(conversation, watermark).subscribe(
        messageGroup => {
            const someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
            if (someMessages)
                subscriber.next(Observable.from(messageGroup.messages));

            setTimeout(
                () => activitiesGenerator(conversation, subscriber, messageGroup && messageGroup.watermark),
                someMessages && messageGroup.watermark ? 0 : 3000
            );
        },
        error => subscriber.error(error)
    );
}

const getActivityGroup = (conversation: Conversation, watermark = "") =>
    Observable
        .ajax({
            method: "GET",
            url: `${baseUrl}/${conversation.conversationId}/messages?watermark=${watermark}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${conversation.token}`
            }
        })
//        .do(ajaxResponse => console.log("get messages ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => ajaxResponse.response as DLMessageGroup);
