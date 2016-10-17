import * as React from 'react';
import { UI, UIProps } from './BotChat';
import { DebugView, DebugViewProps } from './DebugView';

interface Props {
    uiProps: UIProps,
    debugProps: DebugViewProps
}

export class App extends React.Component<Props, {}> {
    storeUnsubscribe: any;

    render() {
        return (
            <div className="wc-app">
                <div className="wc-app-left-container">
                    <UI { ...this.props.uiProps } />
                </div>
                <div className="wc-app-right-container">
                    <DebugView { ...this.props.debugProps } />
                </div>
            </div>
        );
    }
}
