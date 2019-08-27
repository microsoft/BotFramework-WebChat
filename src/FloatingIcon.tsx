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
    activity?: Activity & { text: string };
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
        const { visible, activity } = this.props;

        return (
            <div
                className="wc-floating-wrap"
                onClick={() => this.props.clicked() }
            >
                {activity && activity.text !== '' && (
                    <span className={`wc-floating-message ${visible && activity != null ? 'visible' : '' }`}>
                        {activity.text}
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
            activities: state.history ?
              state.history.activities.filter((activity: Activity & { text: string }) => activity.text !== state.format.strings.pingMessage) :
              null
        };
    }, {

    }, (stateProps: any, dispatchProps: any, ownProps: any): FloatingIconProps => ({
        activity: stateProps.activities ? stateProps.activities[0] : null,
        visible: ownProps.visible,
        clicked: ownProps.clicked
    })
)(FloatingIconView);
