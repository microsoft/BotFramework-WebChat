import { Observable, Subscriber, AjaxResponse, AjaxRequest, BehaviorSubject } from '@reactivex/rxjs';
import { Conversation, Activity, Message, Image, IBotConnection, User } from './BotConnection';
import { SecretOrToken } from './DirectLine';

interface ActivityGroup {
    activities: Activity[],
    watermark: string
}

const intervalRefreshToken = 29*60*1000;

export class DirectLine3 implements IBotConnection {
    connected$ = new BehaviorSubject(false);
    activity$: Observable<Activity>;

    private conversationId: string;
    private token: string;

    constructor(
        secretOrToken: SecretOrToken,
        private domain = "https://directline.botframework.com",
        private segment
    ) {
        this.token = secretOrToken.secret || secretOrToken.token;
        Observable.ajax({
            method: "POST",
            url: `https://${this.domain}/${this.segment}/conversations`,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
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
                        url: `https://${this.domain}/${this.segment}/tokens/${this.conversationId}/refresh`,
                        headers: {
                            "Authorization": `Bearer ${this.token}`
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
        .flatMap(_ => this.getActivity$());
    }

    postMessage(text: string, from: User, channelData?: any) {
        return Observable.ajax({
            method: "POST",
            url: `https://${this.domain}/${this.segment}/conversations/${this.conversationId}/activities`,
            body: <Message>{
                type: "message",
                text,
                from,
                conversationId: this.conversationId,
                channelData
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
//      .do(ajaxResponse => console.log("post message ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => ajaxResponse.response.id as string);
    }

    postFile(file: File, from: User) {
        const formData = new FormData();
        formData.append('file', file);
        return Observable.ajax({
            method: "POST",
            url: `https://${this.domain}/${this.segment}/conversations/${this.conversationId}/upload?userId=${from.id}`,
            body: formData,
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Content-Type": file.type,
                "Content-Disposition": file.name
            }
        })
//      .do(ajaxResponse => console.log("post file ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => ajaxResponse.response.id as string);
    }

    private getActivity$() {
        return new Observable<Observable<Activity>>((subscriber:Subscriber<Observable<Activity>>) =>
            this.activitiesGenerator(subscriber)
        )
        .concatAll()
        .do(activity => console.log("Activity", activity));
    }

    private activitiesGenerator(
        subscriber: Subscriber<Observable<Activity>>,
        watermark?: string)
    {
        this.getActivityGroup(watermark).subscribe(activityGroup => {
            const someMessages = activityGroup && activityGroup.activities && activityGroup.activities.length > 0;
            if (someMessages)
                subscriber.next(Observable.from(activityGroup.activities));
            setTimeout(
                () => this.activitiesGenerator(subscriber, activityGroup && activityGroup.watermark),
                someMessages && activityGroup.watermark ? 0 : 1000
            );
         }, error =>
            subscriber.error(error)
        );
    }

    private getActivityGroup(watermark = "") {
        return Observable.ajax({
            method: "GET",
            url: `https://${this.domain}/${this.segment}/conversations/${this.conversationId}/activities?watermark=${watermark}`,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
//      .do(ajaxResponse => console.log("getActivityGroup ajaxResponse", ajaxResponse))
        .retryWhen(error$ => error$.delay(1000))
        .map(ajaxResponse => ajaxResponse.response as ActivityGroup);
    }
}
