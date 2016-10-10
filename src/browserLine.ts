import { Observable, BehaviorSubject } from '@reactivex/rxjs';
import { Conversation, Activity, Message, IBotConnection, mimeTypes } from './directLineTypes'; 

// An experimental feature. The idea is to allow two instances of botchat on a page, A and B
// A sends and receives messages to and from the bot, as normal
// B sends and receives backchannel messages to and from the bot using A as a proxy

export class BrowserLine implements IBotConnection {
    connected$ = new BehaviorSubject(false);
    activities$: Observable<Activity>;

    constructor() {
        this.connected$.next(true);
        this.activities$ = this.getActivities();
    }

    postMessage = (text: string, from: string, channelData?: any) =>
        Observable.of(true);

    postFile = (file: File) =>
        Observable.of(true);

    private getActivities = () => Observable.of(<Activity>{
        type: "message"
    });

}
