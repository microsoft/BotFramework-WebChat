import { Activity } from 'botframework-directlinejs';

export interface FormatOptions {
    showHeader?: boolean // DEPRECATED: Use "title" instead
    title?: boolean | string
}

export type ActivityOrID = {
    activity?: Activity
    id?: string
}
