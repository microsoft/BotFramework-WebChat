import { Observable, Subscriber, AjaxResponse, AjaxRequest, BehaviorSubject } from '@reactivex/rxjs';
import { Conversation, Activity, Message, Image, IBotConnection, User, mimeTypes } from './directLineTypes';
import { Severity, IConsoleProvider, NullConsoleProvider } from './ConsoleProvider';

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

const intervalRefreshToken = 28*60*1000;

export class DirectLine implements IBotConnection {
    connected$ = new BehaviorSubject(false);
    activities$: Observable<Activity>;

    private conversationId: string;
    private token: string;

    private statusToSeverity = (status: number, defaultSev: Severity): Severity => {
        let statusCode = `${status}`;
        if (statusCode.match(/^2\d\d$/))
            return defaultSev;
        return Severity.error;
    }
    private logResponse = (defaultSev: Severity, text: string, response: AjaxResponse) => {
        this.devConsole.add(this.statusToSeverity(response.status, defaultSev), text, response.status, response.responseText)
    }

    private logError = (text: string, response: AjaxResponse) => {
        let severity = this.statusToSeverity(response.status, Severity.info);
        if (severity == Severity.error)
            this.devConsole.error(text, response.status, response.responseText)
    }

    constructor(
        secretOrToken: {
            secret?: string,
            token?: string
        },
        private domain = "https://directline.botframework.com",
        private devConsole: IConsoleProvider = new NullConsoleProvider()
    ) {
        this.devConsole.log('Start new conversation');
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
        .do(response => this.logError("Start Conversation", response))
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
                    .do(response => this.logError('Token renew', response))
                    .retryWhen(error$ => error$.delay(1000))
                    .map(ajaxResponse => <string>ajaxResponse.response)
                ).subscribe(token => {
                    this.devConsole.log("Refreshing token", token, "at", new Date())
                    this.token = token;
                })
            }
        });

        this.activities$ = this.connected$
        .filter(connected => connected === true)
        .flatMap(_ => this.getActivities());
    }

    postMessage = (text: string, from: User, channelData?: any) => {
        this.devConsole.log('Post message', text, from, channelData);
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
        .do(response => this.logResponse(Severity.info, 'Response', response))
        .retryWhen(error$ => error$.delay(1000))
        .mapTo(true);
    }

    postFile = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        this.devConsole.log('Post file', file.name);
        return Observable.ajax({
            method: "POST",
            url: `${this.domain}/api/conversations/${this.conversationId}/upload`,
            body: formData,
            headers: {
                "Authorization": `BotConnector ${this.token}`
            }
        })
//              .do(ajaxResponse => console.log("post file ajaxResponse", ajaxResponse))
        .do(response => this.logResponse(Severity.info, 'Response', response))
        .retryWhen(error$ => error$.delay(1000))
        .mapTo(true)
    }

    private getActivities = () =>
        new Observable<Observable<DLMessage>>((subscriber:Subscriber<Observable<DLMessage>>) =>
            this.activitiesGenerator(subscriber)
        )
        .concatAll()
        //.do(dlm => console.log("DL Message", dlm))
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

    private activitiesGenerator = (subscriber: Subscriber<Observable<DLMessage>>, watermark?: string) => {
        this.getActivityGroup(watermark).subscribe(
            messageGroup => {
                const someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
                if (someMessages) {
                    this.devConsole.log(`Received ${messageGroup.messages.length} messages`);
                    subscriber.next(Observable.from(messageGroup.messages));
                }

                setTimeout(
                    () => this.activitiesGenerator(subscriber, messageGroup && messageGroup.watermark),
                    someMessages && messageGroup.watermark ? 0 : 3000
                );
            },
            error => subscriber.error(error)
        );
    }

    private getActivityGroup = (watermark = "") => {
        return Observable.ajax({
            method: "GET",
            url: `${this.domain}/api/conversations/${this.conversationId}/messages?watermark=${watermark}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `BotConnector ${this.token}`
            }
        })
//      .do(ajaxResponse => console.log("get messages ajaxResponse", ajaxResponse))
        .do(response => this.logError('Get messages', response))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => ajaxResponse.response as DLMessageGroup);
    }
}
