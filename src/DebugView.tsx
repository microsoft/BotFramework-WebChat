import * as React from 'react';
import { Activity } from './directLineTypes';
import { FormattedJSON } from './FormattedJSON';

interface Props {
    activity: Activity
}

export class DebugView extends React.Component<Props, {}> {

    render() {
        if (this.props.activity) {
            return (
                <div className="wc-debugview">
                    <div className="wc-debugview-json">
                        <FormattedJSON obj={ this.props.activity } />
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="wc-debugview">
                </div>
            );
        }
    }
}
