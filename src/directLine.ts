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

const intervalRefreshToken = 29*60*1000;
const timeout = 5*1000;

export class DirectLine implements IBotConnection {
    public connectionStatus$: BehaviorSubject<ConnectionStatus>;
    public activity$: Observable<Activity>;

    private conversationId: string;
    private token: string;
    private secret: string;
    private conversationSubscription: Subscription;
    private tokenRefreshSubscription: Subscription;
    private getActivityGroupSubscription: Subscription;
    private watermark: string = '';
    private pollTimer: number;

    constructor(
        secretOrToken: SecretOrToken,
        private domain = "https://directline.botframework.com/v3/directline"
    ) {
        this.secret = secretOrToken.secret;
        this.token = secretOrToken.secret || secretOrToken.token;
        this.connectionStatus$ = new BehaviorSubject(ConnectionStatus.Connecting);
        this.activity$ = this.getActivity$();
    }

    public start() {
        this.conversationSubscription = Observable.ajax({
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
            .mergeMap(error =>
                error.status >= 400 && error.status <= 599
                ? Observable.throw(error)
                : Observable.of(error)
            )
            .delay(5 * 1000)
        )
        .subscribe(conversation => {
            this.conversationId = conversation.conversationId;
            this.token = this.secret || conversation.token;
            this.connectionStatus$.next(ConnectionStatus.Online);
  
            if (!this.secret)
                this.RefreshToken();
        }, error => {
            this.connectionStatus$.next(ConnectionStatus.Offline);
        });
    }

    private RefreshToken() {
        this.tokenRefreshSubscription = this.connectionStatus$
        .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
        .flatMap(_ => Observable.ajax({
            method: "POST",
            url: `${this.domain}/tokens/refresh`,
            timeout,
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        }))
        .take(1)
        .map(ajaxResponse => <string>ajaxResponse.response.token)
        .retryWhen(error$ => error$
            .mergeMap(error =>
                error.status === 403
                ? Observable.throw(error)
                : Observable.of(error)
            )
            .delay(5 * 1000)
        )
        .repeatWhen(completed => completed.delay(intervalRefreshToken))
        .subscribe(token => {
            konsole.log("refreshing token", token, "at", new Date())
            this.token = token;
        }, error => {
            this.connectionStatus$.next(ConnectionStatus.Offline);
        });
    }

    public end() {
        if (this.conversationSubscription) {
            this.conversationSubscription.unsubscribe();
            this.conversationSubscription = undefined;
        }
        if (this.tokenRefreshSubscription) {
            this.tokenRefreshSubscription.unsubscribe();
            this.tokenRefreshSubscription = undefined;
        }
        if (this.getActivityGroupSubscription) {
            this.getActivityGroupSubscription.unsubscribe();
            this.getActivityGroupSubscription = undefined;
        }
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = undefined;
        }
    }

    postMessageWithAttachments(message: Message) {
        const formData = new FormData();

        formData.append('activity', new Blob([JSON.stringify(
            Object.assign({}, message, { attachments: undefined })
        )], { type: 'application/vnd.microsoft.activity' }));

        return this.connectionStatus$
        .filter(connectionStatus => connectionStatus === ConnectionStatus.Online)
        .flatMap(_ => Observable.from(message.attachments || []))
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
        .flatMap(_ => Observable.ajax({
            method: "POST",
            url: `${this.domain}/conversations/${this.conversationId}/upload?userId=${message.from.id}`,
            body: formData,
            timeout,
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        }))
        .map(ajaxResponse => ajaxResponse.response.id as string)
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

    private getActivity$() {
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
        .flatMap<Activity>(activityGroup => {
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
}
