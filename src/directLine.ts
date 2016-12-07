import { Observable, Subscriber, AjaxResponse, AjaxRequest, BehaviorSubject, Subscription } from '@reactivex/rxjs';
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

interface WebSocketResponse {
    type: string;
    message: ActivityGroup; 
}


const intervalRefreshToken = 29*60*1000;
const timeout = 5*1000;

export class DirectLine implements IBotConnection {
    public connectionStatus$ = new BehaviorSubject(ConnectionStatus.Connecting);
    public activity$:Observable<Activity>;

    private conversationId: string;
    private secret: string;
    private token: string;
    private watermark = '';
    private streamUrl:string;

    private conversationSubscription: Subscription;
    private tokenRefreshSubscription: Subscription;

    constructor(
        secretOrToken: SecretOrToken,
        private domain = "https://directline.botframework.com/v3/directline",
        private webSocket = false
    ) {
        this.secret = secretOrToken.secret;
        this.token = secretOrToken.secret || secretOrToken.token;
        this.activity$ = (webSocket && WebSocket !== undefined) ?
            this.getWebSocketActivity$() :        
            this.getGetPollingActivity$();
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
        this.tokenRefreshSubscription = Observable.timer(intervalRefreshToken, intervalRefreshToken)
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
    }

    postMessageWithAttachments(message: Message) {
        const formData = new FormData();

        formData.append('activity', new Blob([JSON.stringify(
            Object.assign({}, message, { attachments: undefined })
        )], { type: 'application/vnd.microsoft.activity' }));

        return this.connectionStatus$
        .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
        .flatMap(_ =>
            Observable.from(message.attachments || [])
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

    private getGetPollingActivity$() {
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
        .flatMap(activityGroup => {
            if (activityGroup.watermark)
                this.watermark = activityGroup.watermark;
            return Observable.from(activityGroup.activities);
        })
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

    /**
     * Gets an observable of streamURL by requestings a new one from the conversation APIs. 
     * @return An Observable of stream url.
     */
    private getWebSocketStreamURL$(): Observable<string> {
        return this.connectionStatus$
            // If connection is OK
            .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
            // Create an Ajax observable
            .flatMap(_ => {
                if (this.streamUrl) {
                    var copy = this.streamUrl;
                    this.streamUrl = null;

                    return Observable.of(copy);
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
                    })// Takes one result
                    .take(1)
                    // Extracts the stream URL
                    .map(result => result.response.streamUrl);
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

    /**
     * Gets an Observable of activity from the Web Socket connectivity of direct line.
     * @return An Observable of activity.
     */
    private getWebSocketActivity$(): Observable<Activity> {
        // From the Web Socket stream URL
        return this.getWebSocketStreamURL$()
            // Create an observable Web Socket
            .flatMap<string, WebSocketResponse>(url => {
                // Use a result selector to prevent crash from incoming empty message (it could also helps in timeout detection)
                var ws$ = Observable.webSocket({
                    url: url,
                    resultSelector: e => ({                 
                        type: e.data ? "ACTIVITY" : "PING",
                        message: e.data ? JSON.parse(e.data) : null
                    })
                });

                // timeout seconds ping for keep alive even if already in the browser.
                Observable.interval(timeout)
                    .timeInterval()
                    .subscribe(_ => { ws$.next({}) });

                return ws$;                
            })
            // Retry the full connection + grabbing the socket URL in case of issue (reset the connection) 
            .retryWhen(error$ => error$
                .mergeMap(error => {
                    return Observable.of(error);
                }) 
                .delay(timeout))
            // Only deals with activity message (discard the ping)
            .filter(data => data.type == "ACTIVITY")
            // Maps to activity group
            .map(data => data.message)
            // Creates observable of activityfor the client as well as updating the watermark           
            .flatMap(activityGroup => {
                if (activityGroup.watermark)
                    this.watermark = activityGroup.watermark;
                return Observable.from(activityGroup.activities);
            });
    }
}
