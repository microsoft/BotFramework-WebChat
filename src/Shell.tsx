import * as React from 'react';
import { Observable } from 'rxjs';
import { HistoryAction, ChatState } from './Store';
import { Message, Media, MediaType, User, IBotConnection } from './BotConnection';
import { sendMessage, sendFiles, sendPostBack, FormatOptions } from './Chat';
import { Strings } from './Strings';
import { Dispatch, connect } from 'react-redux';

interface Props {
    inputText: string,
    options: FormatOptions,
    strings: Strings,
    user: User,
    botConnection: IBotConnection,
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

    private postbackHelp() {
        document.getElementById('button-help').style.pointerEvents = 'none';
        document.getElementById('button-svg').style.fill = '#ccc';
        setTimeout(() => {
            document.getElementById('button-help').style.pointerEvents = 'auto';
            document.getElementById('button-svg').style.fill = '#0083ff'
        }, 10000);
        sendPostBack(this.props.botConnection, 'HELP', this.props.user);
    }

    render() {
        let className = 'wc-console';
        if (this.props.inputText.length > 0) className += ' has-text';

        return (
            <div className={className}>
                <label className="wc-upload">
                    <a alt="Click for HELP" id="button-help" onClick={ () => this.postbackHelp() }>
                        <svg width="30" height="30" id="button-svg">
                          <path d="M22.6666667,2.66666667 L1.33333333,2.66666667 C0.533333333,2.66666667 0,2.13333333 0,1.33333333 C0,0.533333333 0.533333333,0 1.33333333,0 L22.6666667,0 C23.4666667,0 24,0.533333333 24,1.33333333 C24,2.13333333 23.4666667,2.66666667 22.6666667,2.66666667 Z" />
                          <path d="M22.6666667,24 L1.33333333,24 C0.533333333,24 0,23.4666667 0,22.6666667 C0,21.8666667 0.533333333,21.3333333 1.33333333,21.3333333 L22.6666667,21.3333333 C23.4666667,21.3333333 24,21.8666667 24,22.6666667 C24,23.4666667 23.4666667,24 22.6666667,24 Z" />
                          <path d="M22.6666667,13.3333333 L1.33333333,13.3333333 C0.533333333,13.3333333 0,12.8 0,12 C0,11.2 0.533333333,10.6666667 1.33333333,10.6666667 L22.6666667,10.6666667 C23.4666667,10.6666667 24,11.2 24,12 C24,12.8 23.4666667,13.3333333 22.6666667,13.3333333 Z" />
                        </svg>
                    </a>
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
        botConnection: state.connection.botConnection,
        user: state.connection.user,
    })
)(ShellContainer);
