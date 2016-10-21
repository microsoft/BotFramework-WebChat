export interface FormatOptions {
    showHeader?: boolean
}

export interface ChatProps {
    user: { id: string, name: string },
    secret?: string,
    token?: string,
    title?: string,
    allowMessagesFrom?: string[],
    directLineDomain?: string,
    allowMessageSelection?: boolean,
    formatOptions?: FormatOptions
}

export declare const App: (props:ChatProps) => {};
