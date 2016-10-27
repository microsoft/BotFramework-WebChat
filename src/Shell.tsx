import * as React from 'react';
import { Action, Reducer, createStore } from 'redux';
import { Observable } from '@reactivex/rxjs';
import { getStore, getState, HistoryAction } from './Store';
import { Message, Image, ImageType } from './BotConnection';

export class Shell extends React.Component<{}, {}> {
    textInput:any;
    storeUnsubscribe:any;

    componentDidMount() {
        this.storeUnsubscribe = getStore().subscribe(() =>
            this.forceUpdate()
        );
    }

    componentWillUnmount() {
        this.storeUnsubscribe();
    }

    sendFile(files: FileList) {
        const store = getStore();
        for (let i = 0, numFiles = files.length; i < numFiles; i++) {
            const file = files[i];
            console.log("file", file);
            let state = store.getState();
            const sendId = state.history.sendCounter;
            store.dispatch({ type: 'Send_Message', activity: {
                type: "message",
                from: state.connection.user,
                timestamp: Date.now().toString(),
                attachments: [{
                    contentType: file.type as ImageType,
                    contentUrl: window.URL.createObjectURL(file),
                    name: file.name
                }]
            }} as HistoryAction);
            this.textInput.focus();
            store.getState().connection.botConnection.postFile(file)
            .subscribe(_ => {
                console.log("success posting file");
                store.dispatch({ type: "Send_Message_Succeed", sendId } as HistoryAction);
            }, error => {
                console.log("failed to post file");
                store.dispatch({ type: "Send_Message_Fail", sendId } as HistoryAction);
            });
        }
    }

    sendMessage() {
        const store = getStore();
        let state = store.getState();
        if (state.history.input.length === 0)
            return;
        const sendId = state.history.sendCounter;
        const input = state.history.input;
        store.dispatch({ type: 'Send_Message', activity: {
            type: "message",
            text: state.history.input,
            from: state.connection.user,
            timestamp: Date.now().toString()
        }} as HistoryAction);
        this.textInput.focus();
        this.trySendMessage(sendId);
    }

    trySendMessage(sendId: number, updateStatus = false) {
        const store = getStore();
        if (updateStatus) {
            store.dispatch({ type: "Send_Message_Try", sendId } as HistoryAction);
        }
        let state = store.getState();
        const activity = state.history.activities.find(activity => activity["sendId"] === sendId);
        state.connection.botConnection.postMessage((activity as Message).text, state.connection.user)
        .subscribe(_ => {
            console.log("success posting message");
            store.dispatch({ type: "Send_Message_Succeed", sendId } as HistoryAction);
        }, error => {
            console.log("failed to post message");
            // TODO: show an error under the message with "retry" link
            store.dispatch({ type: "Send_Message_Fail", sendId } as HistoryAction);
        });
    }

    onKeyPress(e) {
        if (e.key === 'Enter')
            this.sendMessage();
    }

    onClickSend() {
        this.sendMessage();
    }

    updateMessage(input: string) {
        getStore().dispatch({ type: 'Update_Input', input })
    }

    render() {
        const state = getState();
        return (
            <div className="wc-console">
                <label className="wc-upload">
                    <input type="file" accept="image/*" multiple onChange={ e => this.sendFile((e.target as any).files) } />
                    <svg width="26" height="18">
                        <path d="M 19.9603965 4.789052 m -2 0 a 2 2 0 0 1 4 0 a 2 2 0 0 1 -4 0 z M 8.3168322 4.1917918 L 2.49505 15.5342575 L 22.455446 15.5342575 L 17.465347 8.5643945 L 14.4158421 11.1780931 L 8.3168322 4.1917918 Z M 1.04 1 L 1.04 17 L 24.96 17 L 24.96 1 L 1.04 1 Z M 1.0352753 0 L 24.9647247 0 C 25.5364915 0 26 0.444957 26 0.9934084 L 26 17.006613 C 26 17.5552514 25.5265266 18 24.9647247 18 L 1.0352753 18 C 0.4635085 18 0 17.5550644 0 17.006613 L 0 0.9934084 C 0 0.44477 0.4734734 0 1.0352753 0 Z" />
                    </svg>
                </label>
                <div className="wc-textbox">
                    <input type="text" ref={ref => this.textInput = ref } autoFocus value={ state.history.input } onChange={ e => this.updateMessage((e.target as any).value) } onKeyPress = { e => this.onKeyPress(e) } placeholder="Type your message..." />
                </div>
                <label className="wc-send" onClick={ this.onClickSend } >
                    <svg width="27" height="18">
                        <path d="M 26.7862876 9.3774996 A 0.3121028 0.3121028 0 0 0 26.7862876 8.785123 L 0.4081408 0.0226012 C 0.363153 0.0000109 0.3406591 0.0000109 0.3181652 0.0000109 C 0.1372585 0.0000109 0 0.1315165 0 0.2887646 C 0 0.3270384 0.0081316 0.3668374 0.0257445 0.4066363 L 3.4448168 9.0813113 L 0.0257445 17.7556097 A 0.288143 0.288143 0 0 0 0.0126457 17.7975417 A 0.279813 0.279813 0 0 0 0.0055133 17.8603089 C 0.0055133 18.0178895 0.138422 18.1590562 0.303205 18.1590562 A 0.3049569 0.3049569 0 0 0 0.4081408 18.1400213 L 26.7862876 9.3774996 Z M 0.8130309 0.7906714 L 24.8365128 8.7876374 L 3.9846704 8.7876374 L 0.8130309 0.7906714 Z M 3.9846704 9.3749852 L 24.8365128 9.3749852 L 0.8130309 17.3719511 L 3.9846704 9.3749852 Z" />
                    </svg>
                </label>
            </div>
        );
    }
}
