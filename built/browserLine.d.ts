import { Observable, BehaviorSubject } from '@reactivex/rxjs';
import { Activity, IBotConnection, User } from './directLineTypes';
export declare class BrowserLine implements IBotConnection {
    connected$: BehaviorSubject<boolean>;
    activities$: Observable<Activity>;
    constructor();
    postMessage: (text: string, from: User, channelData?: any) => Observable<boolean>;
    postFile: (file: File) => Observable<boolean>;
    private getActivities;
}
