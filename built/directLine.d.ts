import { Observable, BehaviorSubject } from '@reactivex/rxjs';
import { Activity, IBotConnection, User } from './directLineTypes';
export interface SecretOrToken {
    secret?: string;
    token?: string;
}
export declare class DirectLine implements IBotConnection {
    private domain;
    connected$: BehaviorSubject<boolean>;
    activities$: Observable<Activity>;
    private conversationId;
    private token;
    constructor(secretOrToken: SecretOrToken, domain?: string);
    postMessage(text: string, from: User, channelData?: any): Observable<boolean>;
    postFile(file: File): Observable<boolean>;
    private getActivities();
    private activitiesGenerator(subscriber, watermark?);
    private getActivityGroup(watermark?);
}
