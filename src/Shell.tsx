import * as React from 'react';
import { ChatActions, ChatState, FormatState } from './Store';
import { User } from 'botframework-directlinejs';
import { sendMessage, sendFiles } from './Chat';
import { Dispatch, connect } from 'react-redux';

interface Props {
    inputText: string,
    format: FormatState,
    user: User,
    sendMessage: (inputText: string, from: User, locale: string) => void,
    sendFiles: (files: FileList, from: User, locale: string) => void,
    onChangeText: (inputText: string) => void
}

class ShellContainer extends React.Component<Props, {}> {
    private textInput: HTMLInputElement;
    private fileInput: HTMLInputElement;

    constructor(props: Props) {
        super(props);
    }

    private sendMessage() {
        if (this.props.inputText.trim().length > 0)
            this.props.sendMessage(this.props.inputText, this.props.user, this.props.format.locale);
    }

    private onKeyPress(e) {
        if (e.key === 'Enter')
            this.sendMessage();
    }

    private onClickSend() {
        this.textInput.focus();
        this.sendMessage();
    }

    private onChangeFile() {
        this.textInput.focus();
        this.props.sendFiles(this.fileInput.files, this.props.user, this.props.format.locale);
        this.fileInput.value = null;
    }

    render() {
        let className = 'wc-console';
        if (this.props.inputText.length > 0) className += ' has-text';

        return (
            <div className={className}>
                <input id="wc-upload-input" type="file" ref={ input => this.fileInput = input } multiple onChange={ () => this.onChangeFile() } />
                <label className="wc-upload" htmlFor="wc-upload-input">
                    <svg>
                        <path d="M19.96 4.79m-2 0a2 2 0 0 1 4 0 2 2 0 0 1-4 0zM8.32 4.19L2.5 15.53 22.45 15.53 17.46 8.56 14.42 11.18 8.32 4.19ZM1.04 1L1.04 17 24.96 17 24.96 1 1.04 1ZM1.03 0L24.96 0C25.54 0 26 0.45 26 0.99L26 17.01C26 17.55 25.53 18 24.96 18L1.03 18C0.46 18 0 17.55 0 17.01L0 0.99C0 0.45 0.47 0 1.03 0Z" />
                    </svg>
                </label>
                <div className="wc-textbox">
                    <input
                        type="text"
                        ref={ input => this.textInput = input }
                        autoFocus
                        value={ this.props.inputText }
                        onChange={ _ => this.props.onChangeText(this.textInput.value) }
                        onKeyPress={ e => this.onKeyPress(e) }
                        placeholder={ this.props.format.strings.consolePlaceholder }
                    />
                </div>
                <label className="wc-send" onClick={ () => this.onClickSend() } >
                    <svg>
                        <path d="M26.79 9.38A0.31 0.31 0 0 0 26.79 8.79L0.41 0.02C0.36 0 0.34 0 0.32 0 0.14 0 0 0.13 0 0.29 0 0.33 0.01 0.37 0.03 0.41L3.44 9.08 0.03 17.76A0.29 0.29 0 0 0 0.01 17.8 0.28 0.28 0 0 0 0.01 17.86C0.01 18.02 0.14 18.16 0.3 18.16A0.3 0.3 0 0 0 0.41 18.14L26.79 9.38ZM0.81 0.79L24.84 8.79 3.98 8.79 0.81 0.79ZM3.98 9.37L24.84 9.37 0.81 17.37 3.98 9.37Z" />
                    </svg>
                </label>
            </div>
        );
    }
}


export const Shell = connect(
    (state: ChatState): Partial<Props> => ({
        inputText: state.shell.input,
        format: state.format,
        user: state.connection.user,
    }), {
        sendMessage,
        sendFiles,
        onChangeText: (input: string) => ({ type: 'Update_Input', input } as ChatActions)
    }
)(ShellContainer);
