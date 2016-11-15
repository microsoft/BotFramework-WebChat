import { Observable, Subscriber, AjaxResponse, AjaxRequest, BehaviorSubject, Subscription } from '@reactivex/rxjs';
import { Conversation, Activity, Message, Media, IBotConnection, User } from './BotConnection';

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
    connected$ = new BehaviorSubject(false);
    activity$: Observable<Activity>;

    private conversationId: string;
    private token: string;
    private secret: string;
    private tokenRefreshSubscription: Subscription;
    private getActivityGroupSubscription: Subscription;
    private watermark: string = '';
    private pollTimer: number;

    constructor(
        secretOrToken: SecretOrToken,
        private domain = "https://directline.botframework.com/v3/directline",
        private segment?: string // DEPRECATED will be removed before release
    ) {
        this.secret = secretOrToken.secret;
        this.token = secretOrToken.secret || secretOrToken.token;
        if (segment) {
            console.log("Support for 'segment' is deprecated and will be removed before release. Please use default domain or pass entire path in domain")
            this.domain += `/${segment}`;
        }
    }

    start() {
        Observable.ajax({
            method: "POST",
            url: `${this.domain}/conversations`,
            timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
        .do(ajaxResponse => console.log("conversation ajaxResponse", ajaxResponse.response))
        .map(ajaxResponse => <Conversation>ajaxResponse.response)
//        .retryWhen(error$ => error$.delay(1000))
        .subscribe(conversation => {
            this.conversationId = conversation.conversationId;
            this.token = this.secret || conversation.token;
            this.connected$.next(true);
            if (!this.secret) {
                this.tokenRefreshSubscription = Observable.timer(intervalRefreshToken, intervalRefreshToken).flatMap(_ =>
                    Observable.ajax({
                        method: "GET",
                        url: `${this.domain}/tokens/refresh`,
                        timeout,
                        headers: {
                            "Authorization": `Bearer ${this.token}`
                        }
                    })
                    .map(ajaxResponse => <string>ajaxResponse.response)
                ).subscribe(token => {
                    console.log("refreshing token", token, "at", new Date())
                    this.token = token;
                })
            }
        });

        this.activity$ = this.connected$
        .filter(connected => connected === true)
        .flatMap(_ => this.getActivity$());
    }

    end() {
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

        return Observable.from(message.attachments || [])
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
        .flatMap(count =>
            Observable.ajax({
                method: "POST",
                url: `${this.domain}/conversations/${this.conversationId}/upload?userId=${message.from.id}`,
                body: formData,
                timeout,
                headers: {
                    "Authorization": `Bearer ${this.token}`
                }
            })
        )
        .map(ajaxResponse => ajaxResponse.response.id as string)
        .catch(error => {
            console.log("postMessageWithAttachments error", error);
            return error.status >= 400 && error.status < 500
            ? Observable.throw(error)
            : Observable.of("retry")
        });
}

    postActivity(activity: Activity) {
        return Observable.ajax({
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
        .catch(error =>
            error.status >= 400 && error.status < 500
            ? Observable.throw(error)
            : Observable.of("retry")
        );
    }

    private getActivity$() {
        return new Observable<Observable<Activity>>((subscriber:Subscriber<Observable<Activity>>) =>
            this.activitiesGenerator(subscriber)
        )
        .concatAll()
        .do(activity => console.log("Activity", activity));
    }

    private activitiesGenerator(subscriber: Subscriber<Observable<Activity>>) {
        this.getActivityGroupSubscription = this.getActivityGroup().subscribe(activityGroup => {
            this.watermark = activityGroup.watermark;
            const someMessages = activityGroup && activityGroup.activities && activityGroup.activities.length > 0;
            if (someMessages)
                subscriber.next(Observable.from(activityGroup.activities));
            this.pollTimer = setTimeout(
                () => this.activitiesGenerator(subscriber),
                someMessages && this.watermark ? 0 : 1000
            );
         }, error =>
            subscriber.error(error)
        );
    }

    private getActivityGroup() {
        return Observable.ajax({
            method: "GET",
            url: `${this.domain}/conversations/${this.conversationId}/activities?watermark=${this.watermark}`,
            timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
//      .do(ajaxResponse => console.log("getActivityGroup ajaxResponse", ajaxResponse))
        .map(ajaxResponse => ajaxResponse.response as ActivityGroup)
        .retryWhen(error$ =>
            error$
            .mergeMap(error =>
                error.status === 403
                ? Observable.throw(error)
                : Observable.of(error)
            )
            .delay(5 * 1000)
        );
    }
}
