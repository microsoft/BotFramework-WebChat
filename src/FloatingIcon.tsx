import { Activity } from 'botframework-directlinejs';
import * as React from 'react';
import { connect } from 'react-redux';
import { filteredActivities } from './History';
import { ChatState, FormatState, SizeState } from './Store';

export interface Node {
    node_type: string;
    upload_url: string;
    conversation_id: string;
    node_id: number;
}

interface FloatingIconProps {
    visible?: boolean;
    format?: FormatState;
    activities?: Activity[];
    clicked?: () => void;
}

/**
 * Floating Icon Component
 */
class FloatingIconView extends React.Component<FloatingIconProps> {
    constructor(props: FloatingIconProps) {
        super(props);
    }

    render() {
        const { visible, activities, format } = this.props;

        const filtered = filteredActivities(
            activities,
            format.strings.pingMessage
        );

        const lastActivity: any = filtered.length > 0 ? filtered[filtered.length - 1] : null;

        return (
            <div
                className="wc-floating-wrap"
                onClick={() => this.props.clicked() }
            >
                {lastActivity !== null && lastActivity.text !== '' && (
                    <span className={`wc-floating-message ${visible && lastActivity != null ? 'visible' : '' }`}>
                        {lastActivity.text}
                    </span>
                )}

                <div className={`wc-floating`}>
                    <img src="https://s3.amazonaws.com/com.gideon.static.dev/chatbot/gideon-horn-logo.svg"/>
                </div>
            </div>
        );
    }
}

export const FloatingIcon = connect(
    (state: ChatState) => {
        return {
            // passed down to MessagePaneView
            format: state.format,
            activities: state.history ? state.history.activities : []
        };
    }, {

    }, (stateProps: any, dispatchProps: any, ownProps: any): FloatingIconProps => ({
        format: stateProps.format,
        activities: stateProps.activities,
        visible: ownProps.visible,
        clicked: ownProps.clicked
    })
)(FloatingIconView);
