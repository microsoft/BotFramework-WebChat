import { Observable, Observer, Subscriber, AjaxResponse, AjaxRequest, BehaviorSubject, Subscription } from 'rxjs';
import { Conversation, Activity, Message, Media, IBotConnection, ConnectionStatus, User } from './BotConnection';
import { konsole } from './Chat';

export interface DirectLineOptions {
    secret?: string,
    token?: string
    domain?: string,
    webSocket?: boolean
}

interface ActivityGroup {
    activities: Activity[],
    watermark: string
}

const lifetimeRefreshToken = 30 * 60 * 1000;
const intervalRefreshToken = lifetimeRefreshToken / 2;
const timeout = 20 * 1000;
const retries = (lifetimeRefreshToken - intervalRefreshToken) / timeout;

const errorExpiredToken = new Error("expired token");
const errorConversationEnded = new Error("conversation ended");
const errorFailedToConnect = new Error("failed to connect");

export class DirectLine implements IBotConnection {
    public connectionStatus$ = new BehaviorSubject(ConnectionStatus.Uninitialized);
    public activity$: Observable<Activity>;

    private domain = "https://directline.botframework.com/v3/directline";
    private webSocket = false;

    private conversationId: string;
    private secret: string;
    private token: string;
    private watermark = '';
    private streamUrl: string;

    private tokenRefreshSubscription: Subscription;

    constructor(options: DirectLineOptions) {
        this.secret = options.secret;
        this.token = options.secret || options.token;
        if (options.domain)
            this.domain = options.domain;
        if (options.webSocket)
            this.webSocket = options.webSocket;

        this.activity$ = this.webSocket && WebSocket !== undefined
            ? this.webSocketActivity$()
            : this.pollingGetActivity$();
    }

    // Every time we're about to make a Direct Line REST call, we call this first to see check the current connection status.
    // Either throws an error (indicating an error state) or emits a null, indicating a (presumably) healthy connection
    private checkConnection(once = false) {
        let obs =  this.connectionStatus$
        .flatMap(connectionStatus => {
            if (connectionStatus === ConnectionStatus.Uninitialized) {
                this.connectionStatus$.next(ConnectionStatus.Connecting);

                return this.startConversation()
                .do(conversation => {
                    this.conversationId = conversation.conversationId;
                    this.token = this.secret || conversation.token;
                    this.streamUrl = conversation.streamUrl;
                    if (!this.secret)
                        this.refreshTokenLoop();

                    this.connectionStatus$.next(ConnectionStatus.Online);
                }, error => {
                    this.connectionStatus$.next(ConnectionStatus.FailedToConnect);
                })
                .mapTo(connectionStatus);
            } else {
                return Observable.of(connectionStatus);
            }
        })
        .filter(connectionStatus => connectionStatus != ConnectionStatus.Uninitialized && connectionStatus != ConnectionStatus.Connecting)
        .flatMap(connectionStatus => {
            switch (connectionStatus) {
                case ConnectionStatus.Ended:
                    return Observable.throw(errorConversationEnded);

                case ConnectionStatus.FailedToConnect:
                    return Observable.throw(errorFailedToConnect);

                case ConnectionStatus.ExpiredToken:
                    return Observable.throw(errorExpiredToken);

                default:
                    return Observable.of(null);
            }
        })

        return once ? obs.take(1) : obs;
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
        .map(ajaxResponse => ajaxResponse.response as Conversation)
        .retryWhen(error$ =>
            // for now we deem 4xx and 5xx errors as unrecoverable
            // for everything else (timeouts), retry for a while
            error$.mergeMap(error => error.status >= 400 && error.status < 600
                ? Observable.throw(error)
                : Observable.of(error)
            )
            .delay(timeout)
            .take(retries)
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
        return this.checkConnection(true)
        .flatMap(_ =>
            Observable.ajax({
                method: "POST",
                url: `${this.domain}/tokens/refresh`,
                timeout,
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })
            .map(ajaxResponse => ajaxResponse.response.token as string)
            .retryWhen(error$ => error$
                .mergeMap(error => {
                    if (error.status === 403) {
                        // if the token is expired there's no reason to keep trying
                        this.connectionStatus$.next(ConnectionStatus.ExpiredToken);
                        return Observable.throw(error);
                    }
                    return Observable.of(error);
                })
                .delay(timeout)
                .take(retries)
            )
        )
    }

    public reconnect(conversation: Conversation) {
        this.token = conversation.token;
        this.streamUrl = conversation.streamUrl;
        if (this.connectionStatus$.getValue() === ConnectionStatus.ExpiredToken)
            this.connectionStatus$.next(ConnectionStatus.Online);
    }

    end() {
        if (this.tokenRefreshSubscription)
            this.tokenRefreshSubscription.unsubscribe();
        this.connectionStatus$.next(ConnectionStatus.Ended);
    }

    postActivity(activity: Activity) {
        // Use postMessageWithAttachments for messages with attachments that are local files (e.g. an image to upload)
        // Technically we could use it for *all* activities, but postActivity is much lighter weight
        // So, since WebChat is partially a reference implementation of Direct Line, we implement both.
        if (activity.type === "message" && activity.attachments && activity.attachments.length > 0)
            return this.postMessageWithAttachments(activity);
            
        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        konsole.log("postActivity", activity);
        return this.checkConnection(true)
        .flatMap(_ =>
            Observable.ajax({
                method: "POST",
                url: `${this.domain}/conversations/${this.conversationId}/activities`,
                body: activity,
                timeout,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.token}`
                }
            })
            .map(ajaxResponse => ajaxResponse.response.id as string)
            .catch(error => this.catchPostError(error))
        )
        .catch(error => this.catchExpiredToken(error));
    }

    private postMessageWithAttachments(message: Message) {
        let formData: FormData;
        const { attachments, ... newMessage } = message;

        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        return this.checkConnection(true)
        .flatMap(_ => {
            // To send this message to DirectLine we need to deconstruct it into a "template" activity
            // and one blob for each attachment.
            formData = new FormData();
            formData.append('activity', new Blob([JSON.stringify(newMessage)], { type: 'application/vnd.microsoft.activity' }));

            return Observable.from(attachments || [])
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
        })
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
            .catch(error => this.catchPostError(error))
        )
        .catch(error => this.catchPostError(error));
    }

    private catchPostError(error: any) {
        if (error.status === 403)
            // token has expired (will fall through to return "retry")
            this.connectionStatus$.next(ConnectionStatus.ExpiredToken);
        else if (error.status >= 400 && error.status < 500)
            // more unrecoverable errors
            return Observable.throw(error);
        return Observable.of("retry");
    }

    private catchExpiredToken(error: any) {
        return error === errorExpiredToken
        ? Observable.of("retry")
        : Observable.throw(error);
    }

    private pollingGetActivity$() {
        return Observable.interval(1000)
        .combineLatest(this.checkConnection())
        .flatMap(_ =>
            Observable.ajax({
                method: "GET",
                url: `${this.domain}/conversations/${this.conversationId}/activities?watermark=${this.watermark}`,
                timeout,
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.token}`
                }
            })
            .catch(error => {
                if (error.status === 403) {
                    // This is slightly ugly. We want to update this.connectionStatus$ to ExpiredToken so that subsequent
                    // calls to checkConnection will throw an error. But when we do so, it causes this.checkConnection()
                    // to immediately throw an error, which is caught by the catch() below and transformed into an empty
                    // object. Then next() returns, and we emit an empty object. Which means one 403 is causing
                    // two empty objects to be emitted. Which is harmless but, again, slightly ugly.
                    this.connectionStatus$.next(ConnectionStatus.ExpiredToken);
                }
                return Observable.empty<AjaxResponse>();            
            })
//          .do(ajaxResponse => konsole.log("getActivityGroup ajaxResponse", ajaxResponse))
            .map(ajaxResponse => ajaxResponse.response as ActivityGroup)
            .flatMap(activityGroup => this.observableFromActivityGroup(activityGroup))
        )
        .catch(error => Observable.empty<Activity>());
    }

    private observableFromActivityGroup(activityGroup: ActivityGroup) {
        if (activityGroup.watermark)
            this.watermark = activityGroup.watermark;
        return Observable.from(activityGroup.activities);
    }

    private webSocketActivity$(): Observable<Activity> {
        return this.checkConnection()
        .flatMap(_ =>
            this.observableWebSocket<ActivityGroup>()
            // WebSockets can be closed by the server or the browser. In the former case we need to
            // retrieve a new streamUrl. In the latter case we could first retry with the current streamUrl,
            // but it's simpler just to always fetch a new one.
            .retryWhen(error$ => error$.mergeMap(error => this.reconnectToConversation()))
        )
        .flatMap(activityGroup => this.observableFromActivityGroup(activityGroup))
    }

    // Originally we used Observable.webSocket, but it's fairly opionated  and I ended up writing
    // a lot of code to work around their implemention details. Since WebChat is meant to be a reference
    // implementation, I decided roll the below, where the logic is more purposeful. - @billba
    private observableWebSocket<T>() {
        return Observable.create((subscriber: Subscriber<T>) => {
            konsole.log("creating WebSocket", this.streamUrl);
            const ws = new WebSocket(this.streamUrl);
            let sub: Subscription;

            ws.onopen = open => {
                konsole.log("WebSocket open", open);
                // Chrome is pretty bad at noticing when a WebSocket connection is broken.
                // If we periodically ping the server with empty messages, it helps Chrome 
                // realize when connection breaks, and close the socket. We then throw an
                // error, and that give us the opportunity to attempt to reconnect.
                sub = Observable.interval(timeout).subscribe(_ => ws.send(null));
            }

            ws.onclose = close => {
                konsole.log("WebSocket close", close);
                if (sub) sub.unsubscribe();
                subscriber.error(close);
            }

            ws.onmessage = message => message.data && subscriber.next(JSON.parse(message.data));

            // This is the 'unsubscribe' method, which is called when this observable is disposed.
            // When the WebSocket closes itself, we throw an error, and this function is eventually called.
            // When the observable is closed first (e.g. when tearing down a WebChat instance) then 
            // we need to manually close the WebSocket.
            return () => {
                if (ws.readyState === 0 || ws.readyState === 1) ws.close();
            }            
        }) as Observable<T>
    }

    private reconnectToConversation() {
        return this.checkConnection(true)
        .flatMap(_ =>
            Observable.ajax({
                method: "GET",
                url: `${this.domain}/conversations/${this.conversationId}?watermark=${this.watermark}`,
                timeout,
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.token}`
                }
            })
            .do(result => {
                this.token = result.response.token;
                this.streamUrl = result.response.streamUrl;
            })
            .mapTo(null)
            .retryWhen(error$ => error$
                .mergeMap(error => {
                    if (error.status === 403) {
                        // token has expired. We can't recover from this here, but the embedding
                        // website might eventually call reconnect() with a new token and streamUrl.
                        this.connectionStatus$.next(ConnectionStatus.ExpiredToken);
                    }
                    return Observable.of(error);
                })
                .delay(timeout)
                .take(retries)
            )
        )
    }

}
