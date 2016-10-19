import * as React from 'react';
import { UI, UIProps } from './BotChat';
import { DebugView, DebugViewProps } from './DebugView';
import { IConsoleProvider, BuiltinConsoleProvider } from './Console';
import { ConsoleView, ConsoleProvider } from './ConsoleView';

export interface AppProps {
    uiProps: UIProps,
    debugProps: DebugViewProps
}

export class App extends React.Component<AppProps, {}> {
    storeUnsubscribe: any;
    devConsole = new ConsoleProvider();

    render() {
        return (
            <div className="wc-app">
                <div className="wc-app-left-container">
                    <div className={ "wc-chatview-panel" }>
                        <div className="wc-chatview-header">
                            <span>{ this.props.uiProps.title || "WebChat" }</span>
                        </div>
                        <UI devConsole={ this.devConsole } { ...this.props.uiProps } />
                    </div>
                </div>
                <div className="wc-app-right-container">
                    <div className="wc-app-debugview-container">
                        <div className="wc-chatview-panel">
                            <div className="wc-debugview-header">
                                <span>JSON</span>
                            </div>
                            <DebugView { ...this.props.debugProps } />
                        </div>
                    </div>
                    <div className="wc-app-consoleview-container">
                        <div className="wc-consoleview-header">
                            <span>Console</span>
                        </div>
                        <ConsoleView />
                    </div>
                </div>
            </div>
        );
    }
}
