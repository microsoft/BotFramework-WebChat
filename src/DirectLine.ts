import { Observable, Subscriber, AjaxResponse, AjaxRequest, BehaviorSubject } from '@reactivex/rxjs';
import { Conversation, Activity, Message, Image, IBotConnection, User } from './BotConnection';

interface DLAttachment {
    url: string,
    contentType: string
}

interface DLMessage
{
    id?: string,
    conversationId?: string,
    created?: string,
    from?: string,
    text?: string,
    channelData?: Activity | any,
    images?: string[],
    attachments?: DLAttachment[];
    eTag?: string;
}

interface DLMessageGroup
{
    messages: DLMessage[],
    watermark?: string,
    eTag?: string
}

const intervalRefreshToken = 29*60*1000;

export interface SecretOrToken {
    secret?: string,
    token?: string
}

export class DirectLine implements IBotConnection {
    connected$ = new BehaviorSubject(false);
    activity$: Observable<Activity>;

    private conversationId: string;
    private token: string;

    constructor(
        secretOrToken: SecretOrToken,
        private domain = "https://directline.botframework.com"
    ) {
        this.token = secretOrToken.secret || secretOrToken.token;
        Observable.ajax({
            method: "POST",
            url: `${this.domain}/api/conversations`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${this.token}`
            }
        })
//      .do(ajaxResponse => console.log("conversation ajaxResponse", ajaxResponse))
        .map(ajaxResponse => <Conversation>ajaxResponse.response)
        .retryWhen(error$ => error$.delay(1000))
        .subscribe(conversation => {
            this.conversationId = conversation.conversationId;
            this.connected$.next(true);
            if (!secretOrToken.secret) {
                Observable.timer(intervalRefreshToken, intervalRefreshToken).flatMap(_ =>
                    Observable.ajax({
                        method: "GET",
                        url: `${this.domain}/api/tokens/${this.conversationId}/renew`,
                        headers: {
                            "Authorization": `BotConnector ${this.token}`
                        }
                    })
                    .retryWhen(error$ => error$.delay(1000))
                    .map(ajaxResponse => <string>ajaxResponse.response)
                ).subscribe(token => {
                    console.log("refreshing token", token, "at", new Date())
                    this.token = token;
                })
            }
        });

        this.activity$ = this.connected$
        .filter(connected => connected === true)
        .flatMap(_ => this.getActivities());
    }

    postMessage(text: string, from: User, channelData?: any) {
        console.log("sending", text);
        return Observable.ajax({
            method: "POST",
            url: `${this.domain}/api/conversations/${this.conversationId}/messages`,
            body: <DLMessage>{
                text,
                from: from.id,
                conversationId: this.conversationId,
                channelData
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `BotConnector ${this.token}`
            }
        })
//      .do(ajaxResponse => console.log("post message ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .mapTo(true);
    }

    postFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return Observable.ajax({
            method: "POST",
            url: `${this.domain}/api/conversations/${this.conversationId}/upload`,
            body: formData,
            headers: {
                "Authorization": `BotConnector ${this.token}`
            }
        })
//      .do(ajaxResponse => console.log("post file ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .mapTo(true)
    }

    private getActivities() {
        return new Observable<Observable<DLMessage>>((subscriber:Subscriber<Observable<DLMessage>>) =>
            this.activitiesGenerator(subscriber)
        )
        .concatAll()
        .do(dlm => console.log("DL Message", dlm))
        .map(dlm => {
            if (dlm.channelData) {
                const channelData = <Activity>dlm.channelData;
                switch(channelData.type) {
                    case "message":
                        return <Message>Object.assign({}, channelData, {
                            id: dlm.id,
                            conversation: { id: dlm.conversationId },
                            timestamp: dlm.created,
                            from: { id: dlm.from },
                            channelData: null,
                        });
                    default:
                        return channelData;
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
                    attachments: dlm.images && dlm.images.map(path => <Image>{
                        contentType: "image/png",
                        contentUrl: this.domain + path,
                        name: '2009-09-21'
                    })
                }
            }
        });
    }

    private activitiesGenerator(subscriber: Subscriber<Observable<DLMessage>>, watermark?: string) {
        this.getActivityGroup(watermark).subscribe(messageGroup => {
            const someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
            if (someMessages)
                subscriber.next(Observable.from(messageGroup.messages));

            setTimeout(
                () => this.activitiesGenerator(subscriber, messageGroup && messageGroup.watermark),
                someMessages && messageGroup.watermark ? 0 : 1000
            );
         }, error =>
            subscriber.error(error)
        );
    }

    private getActivityGroup(watermark = "") {
        return Observable.ajax({
            method: "GET",
            url: `${this.domain}/api/conversations/${this.conversationId}/messages?watermark=${watermark}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${this.token}`
            }
        })
//      .do(ajaxResponse => console.log("get messages ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => ajaxResponse.response as DLMessageGroup);
    }
}
