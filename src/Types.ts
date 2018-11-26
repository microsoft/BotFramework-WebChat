import { Activity } from 'botframework-directlinejs';

declare global {
  interface Window {
    CMS_URL: string;
  }
}

export interface FormatOptions {
    showHeader?: boolean // DEPRECATED: Use "title" instead
}

export type ActivityOrID = {
    activity?: Activity
    id?: string
}
