import * as React from 'react';
import { Observable } from 'rxjs';
import { HistoryAction, ChatState } from './Store';
import { Message, Media, MediaType, User, IBotConnection } from './BotConnection';
import { sendMessage, sendFiles, FormatOptions } from './Chat';
import { Strings } from './Strings';
import { Dispatch, connect } from 'react-redux';

interface Props {
    inputText: string,
    options: FormatOptions,
    strings: Strings,
    user: User,
    dispatch: Dispatch<any>
}

class ShellContainer extends React.Component<Props, {}> {
    private textInput: HTMLInputElement;
    private fileInput: HTMLInputElement;

    constructor(props: Props) {
        super(props);
    }

    private sendMessage() {
        sendMessage(this.props.dispatch, this.props.inputText, this.props.user);
    }

    private onChangeText() {
        this.props.dispatch<HistoryAction>({ type: 'Update_Input', input: this.textInput.value })
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
        sendFiles(this.props.dispatch, this.fileInput.files, this.props.user);
        this.fileInput.value = null;
    }

    render() {
        let className = 'wc-console';
        if (this.props.inputText.length > 0) className += ' has-text';

        return (
            <div className={className}>
                <label className="wc-upload">
                    <input type="file" ref={ input => this.fileInput = input } multiple onChange={ () => this.onChangeFile() } />
                    <svg width="26" height="18">
                        <path d="M 19.9603965 4.789052 m -2 0 a 2 2 0 0 1 4 0 a 2 2 0 0 1 -4 0 z M 8.3168322 4.1917918 L 2.49505 15.5342575 L 22.455446 15.5342575 L 17.465347 8.5643945 L 14.4158421 11.1780931 L 8.3168322 4.1917918 Z M 1.04 1 L 1.04 17 L 24.96 17 L 24.96 1 L 1.04 1 Z M 1.0352753 0 L 24.9647247 0 C 25.5364915 0 26 0.444957 26 0.9934084 L 26 17.006613 C 26 17.5552514 25.5265266 18 24.9647247 18 L 1.0352753 18 C 0.4635085 18 0 17.5550644 0 17.006613 L 0 0.9934084 C 0 0.44477 0.4734734 0 1.0352753 0 Z" />
                    </svg>
                </label>
                <div className="wc-textbox">
                    <input
                        type="text"
                        ref={ input => this.textInput = input }
                        autoFocus
                        value={ this.props.inputText }
                        onChange={ () => this.onChangeText() }
                        onKeyPress={ e => this.onKeyPress(e) }
                        placeholder={ this.props.strings.consolePlaceholder }
                    />
                </div>
                <label className="wc-send" onClick={ () => this.onClickSend() } >SEND</label>
            </div>
        );
    }
}

export const Shell = connect(
    (state: ChatState) => ({
        inputText: state.history.input,
        options: state.format.options,
        strings: state.format.strings,
        user: state.connection.user,
    })
)(ShellContainer);
