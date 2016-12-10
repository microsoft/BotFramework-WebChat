import { Observable, Observer, Subscriber, AjaxResponse, AjaxRequest, BehaviorSubject, Subscription } from '@reactivex/rxjs';
import { Conversation, Activity, Message, Media, IBotConnection, ConnectionStatus, User } from './BotConnection';
import { konsole } from './Chat';

export interface SecretOrToken {
    secret?: string,
    token?: string
}

interface ActivityGroup {
    activities: Activity[],
    watermark: string
}

const intervalRefreshToken = 29*60*1000;
const timeout = 5*1000;

export class DirectLine implements IBotConnection {
    public connectionStatus$ = new BehaviorSubject(ConnectionStatus.Connecting);
    public activity$:Observable<Activity>;

    private domain = "https://directline.botframework.com/v3/directline";
    private webSocket = false;

    private conversationId: string;
    private secret: string;
    private token: string;
    private watermark = '';
    private streamUrl: string;

    private conversationSubscription: Subscription;
    private tokenRefreshSubscription: Subscription;
    private webSocketPingSubscription: Subscription;

    constructor(
        secretOrToken: SecretOrToken,
        options?: {
            domain: string,
            webSocket: boolean
        }
    ) {
        this.secret = secretOrToken.secret;
        this.token = secretOrToken.secret || secretOrToken.token;

        if (options) {
            if (options.domain)
                this.domain = options.domain;
            if (options.webSocket)
                this.webSocket = options.webSocket;
        }

        this.activity$ = this.webSocket && WebSocket !== undefined
            ? this.webSocketActivity$()
            : this.pollingGetActivity$();
    }

    start() {
        this.conversationSubscription = this.startConversation()
        .subscribe(conversation => {
            this.conversationId = conversation.conversationId;
            this.token = this.secret || conversation.token;
            this.streamUrl = conversation.streamUrl;
            this.connectionStatus$.next(ConnectionStatus.Online);

            if (!this.secret)
                this.refreshTokenLoop();
        });
    }

    private startConversation() {
        return Observable.ajax({
            method: "POST",
            url: `${this.domain}/conversations`,
            timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
//      .do(ajaxResponse => konsole.log("conversation ajaxResponse", ajaxResponse.response))
        .map(ajaxResponse => <Conversation>ajaxResponse.response)
        .retryWhen(error$ => error$
            .mergeMap(error => {
                if (error.status >= 400 && error.status <= 599) {
                    this.connectionStatus$.next(ConnectionStatus.Offline);
                    return Observable.throw(error);
                } else {
                    return Observable.of(error);
                }
            })
            .delay(5 * 1000)
        )
    }

    private refreshTokenLoop() {
        this.tokenRefreshSubscription = Observable.interval(intervalRefreshToken)
        .flatMap(_ => this.refreshToken())
        .subscribe(token => {
            konsole.log("refreshing token", token, "at", new Date());
            this.token = token;
        });
    }

    private refreshToken() {
        return this.connectionStatus$
        .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
        .flatMap(_ => Observable.ajax({
            method: "POST",
            url: `${this.domain}/tokens/refresh`,
            timeout,
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        }))
        .map(ajaxResponse => <string>ajaxResponse.response.token)
        .retryWhen(error$ => error$
            .mergeMap(error => {
                if (error.status === 403) {
                    this.connectionStatus$.next(ConnectionStatus.Offline);
                    return Observable.throw(error);
                } else {
                    return Observable.of(error);
                }
            })
            .delay(5 * 1000)
        )
    }

    end() {
        if (this.conversationSubscription) {
            this.conversationSubscription.unsubscribe();
            this.conversationSubscription = undefined;
        }
        if (this.tokenRefreshSubscription) {
            this.tokenRefreshSubscription.unsubscribe();
            this.tokenRefreshSubscription = undefined;
        }
        if (this.webSocketPingSubscription) {
            this.webSocketPingSubscription.unsubscribe();
            this.webSocketPingSubscription = undefined;
        }
    }

    postMessageWithAttachments(message: Message) {
        const formData = new FormData();
        const { attachments, ... newMessage } = message;

        formData.append('activity', new Blob([JSON.stringify(newMessage)], { type: 'application/vnd.microsoft.activity' }));

        return this.connectionStatus$
        .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
        .flatMap(_ =>
            Observable.from(attachments || [])
            .flatMap((media: Media) =>
                Observable.ajax({
                    method: "GET",
                    url: media.contentUrl,
                    responseType: 'arraybuffer'
                })
                .do(ajaxResponse =>
                    formData.append('file', new Blob([ajaxResponse.response], { type: media.contentType }), media.name)
                )
            )
            .count()
        )
        .flatMap(_ =>
            Observable.ajax({
                method: "POST",
                url: `${this.domain}/conversations/${this.conversationId}/upload?userId=${message.from.id}`,
                body: formData,
                timeout,
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })
           .map(ajaxResponse => ajaxResponse.response.id as string)
        )
        .catch(error => {
            konsole.log("postMessageWithAttachments error", error);
            return error.status >= 400 && error.status < 500
            ? Observable.throw(error)
            : Observable.of("retry")
        });
    }

    postActivity(activity: Activity) {
        return this.connectionStatus$
        .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
        .flatMap(_ => Observable.ajax({
            method: "POST",
            url: `${this.domain}/conversations/${this.conversationId}/activities`,
            body: activity,
            timeout,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        }))
        .map(ajaxResponse => ajaxResponse.response.id as string)
        .catch(error =>
            error.status >= 400 && error.status < 500
            ? Observable.throw(error)
            : Observable.of("retry")
        );
    }

    private pollingGetActivity$() {
        return this.connectionStatus$
        .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
        .flatMap(_ => Observable.ajax({
            method: "GET",
            url: `${this.domain}/conversations/${this.conversationId}/activities?watermark=${this.watermark}`,
            timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        }))
        .take(1)
//      .do(ajaxResponse => konsole.log("getActivityGroup ajaxResponse", ajaxResponse))
        .map(ajaxResponse => ajaxResponse.response as ActivityGroup)
        .flatMap(activityGroup => this.observableFromActivityGroup(activityGroup))
        .repeatWhen(completed => completed.delay(1000))
        .retryWhen(error$ => error$
            .mergeMap(error => {
                if (error.status === 403) {
                    this.connectionStatus$.next(ConnectionStatus.Offline);
                    return Observable.throw(error);
                } else {
                    return Observable.of(error);
                }
            })
            .delay(5 * 1000)
        );
    }

    private observableFromActivityGroup(activityGroup: ActivityGroup) {
        if (activityGroup.watermark)
            this.watermark = activityGroup.watermark;
        return Observable.from(activityGroup.activities);
    }

    private webSocketURL$() {
        return this.connectionStatus$
        .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
        .flatMap(_ => {
            if (this.streamUrl) {
                const streamUrl = this.streamUrl;
                this.streamUrl = null;

                return Observable.of(streamUrl);
            }
            else {
                return Observable.ajax({
                    method: "GET",
                    url: `${this.domain}/conversations/${this.conversationId}`,
                    timeout,
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${this.token}`
                    }
                })
                .map(result => result.response.streamUrl as string);
            }
        })            
        // Retries every Timeout seconds in case of connection issue other than security
        .retryWhen(error$ => error$
            .mergeMap(error => {
                if (error.status === 403) {
                    this.connectionStatus$.next(ConnectionStatus.Offline);
                    return Observable.throw(error);
                } else {
                    return Observable.of(error);
                }
            })
            .delay(timeout)
        );
    }

    private webSocketActivity$(): Observable<Activity> {
        let ws: WebSocket;

        // Chrome is pretty bad at noticing when a WebSocket connection is broken.
        // If we periodically ping the server with empty messages, it helps Chrome 
        // realize when connection breaks, and close the socket. We then throw an
        // error, and that give us the opportunity to attempt to reconnect.
        this.webSocketPingSubscription = Observable.interval(timeout)
        .subscribe(_ => ws && ws.send(null));

        return this.webSocketURL$()
        .flatMap(url =>
            Observable.create((observer: Observer<ActivityGroup>) => {
                ws = new WebSocket(url);

                ws.onclose = close => {
                    konsole.log("WebSocket close", close);
                    ws = null;
                    observer.error(close);
                }

                ws.onmessage = message => message.data && observer.next(JSON.parse(message.data));
            }) as Observable<ActivityGroup>
        )
        .retryWhen(error$ => error$.delay(timeout))
        .flatMap(activityGroup => this.observableFromActivityGroup(activityGroup))
    }
}
