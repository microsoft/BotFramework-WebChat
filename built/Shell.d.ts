import * as React from 'react';
export declare class Shell extends React.Component<{}, {}> {
    textInput: any;
    storeUnsubscribe: any;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(): void;
    sendFile: (files: FileList) => void;
    sendMessage: () => void;
    onKeyPress: (e: any) => void;
    onClickSend: () => void;
    updateMessage: (text: string) => void;
    render(): JSX.Element;
}
