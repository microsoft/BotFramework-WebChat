import { Activity } from 'botframework-directlinejs';
export interface FormatOptions {
    showHeader?: boolean;
}
export interface ActivityOrID {
    activity?: Activity;
    id?: string;
}
