import * as React from 'react';
import { UI, UIProps } from './BotChat';
import { DebugView } from './DebugView';

interface Props {
    uiProps: UIProps
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
                    <DebugView />
                </div>
            </div>
        );
    }
}
