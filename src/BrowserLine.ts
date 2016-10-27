import { Observable, BehaviorSubject } from '@reactivex/rxjs';
import { Conversation, Activity, Message, IBotConnection, User } from './BotConnection'; 

// An experimental feature. The idea is to allow two instances of botchat on a page, A and B
// A sends and receives messages to and from the bot, as normal
// B sends and receives backchannel messages to and from the bot using A as a proxy

export class BrowserLine implements IBotConnection {
    connected$ = new BehaviorSubject(false);
    activity$: Observable<Activity>;

    constructor() {
        this.connected$.next(true);
        this.activity$ = this.getActivities();
    }

    postMessage(text: string, from: User, channelData?: any) {
        return Observable.of(true);
    }

    postFile(file: File) {
        return Observable.of(true);
    }

    private getActivities() {
        return Observable.of(<Activity>{
            type: "message"
        });
    }
}
