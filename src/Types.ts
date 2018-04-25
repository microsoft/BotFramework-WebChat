import { Activity } from 'botframework-directlinejs';

export interface FormatOptions {
    showHeader?: boolean // DEPRECATED: Use "title" instead
}

export type ActivityOrID = {
    activity?: Activity
    id?: string
}
