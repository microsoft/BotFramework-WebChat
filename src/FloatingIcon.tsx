import { Activity } from 'botframework-directlinejs';
import * as React from 'react';
import { connect } from 'react-redux';
import { filteredActivities } from './History';
import { ChatState, FormatState, SizeState } from './Store';

interface LogoSVGProps {
    color: string;
}

const LogoSVG = (props: LogoSVGProps) => {
    return (
        <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.54 73.86" fill={props.color}>
            <title>gideon-logo-white</title>
            <path  d="M108.45,4.63A123.7,123.7,0,0,1,99,53a35.54,35.54,0,0,1-3.34,5.68c-11.56,16-35,20.09-51.25,8.87A37.67,37.67,0,0,1,34.17,57a37.08,37.08,0,0,1-3.47-6.82c-.26-.66-.49-1.34-.71-2a11.06,11.06,0,0,0-.56-1.91A22.53,22.53,0,0,0,8.82,28C9.61,28,10.41,28,11.23,28c5.4,0,17.64.2,18,0A19.29,19.29,0,0,1,47.87,41.65s0,0,0,.05h0c.14.5.3,1,.49,1.49A18,18,0,0,0,80.81,46,13.91,13.91,0,0,0,67.52,28c4.89,0,9.8.19,14.68-.06a28.62,28.62,0,0,0,22.87-14,28.69,28.69,0,0,0,2.81-6.54c.07-.25.13-.52.19-.79Z"/>
            <path  d="M72.26.68C78.61,1.94,82,8,79.29,13.92a9.44,9.44,0,0,1-10.45,5.45l-1.08-.2a18.23,18.23,0,0,0-4.43,0,17.57,17.57,0,0,0-3.47.67,18,18,0,0,0-12,21.85A19.29,19.29,0,0,0,29.26,28c.32-.17.42-1.22.54-1.61.29-1,.62-1.93,1-2.87A36.9,36.9,0,0,1,72.26.68Z"/>
            <path  d="M121.49,69.85a3.08,3.08,0,0,1-3,3.11c-1.72.07-6.49.07-7.1-.08-1.71-.43-2.24-2-2.55-3.56A29.26,29.26,0,0,0,99,53a123.7,123.7,0,0,0,9.46-48.33h0c.36-1.6,1-3.1,2.66-3.55,1.18-.31,7.33-.11,7.33-.11a3,3,0,0,1,3,2.48C121.64,4.54,121.5,69.39,121.49,69.85Z"/>
            <path  d="M80.81,46H71.36c-2.55,0-5.4.32-7.81-.68a9.09,9.09,0,0,1-5-11.39A9.2,9.2,0,0,1,67.39,28h.13A13.91,13.91,0,0,1,80.81,46Z"/>
            <path  d="M29.43,46.28c-.24-.44,0-.2-.33-.32h0c-1.1-.17-18.37,0-20,0A9.1,9.1,0,0,1,.46,39.82,9,9,0,0,1,4.59,29.2,9.85,9.85,0,0,1,8.82,28,22.53,22.53,0,0,1,29.43,46.28Z"/>
        </svg>
    );
};

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
    logoColor: string;
    bottomOffset: number;
    rightOffset: number;
}

/**
 * Floating Icon Component
 */
class FloatingIconView extends React.Component<FloatingIconProps> {
    constructor(props: FloatingIconProps) {
        super(props);
    }

    render() {
        const { visible, activity, logoColor, bottomOffset, rightOffset } = this.props;

        const floatingIconStyle = {
          ...(bottomOffset > 0) && { bottom: bottomOffset },
          ...(rightOffset > 0) && { right: rightOffset}
        };

        return (
            <div
                className="wc-floating-wrap"
                onClick={() => this.props.clicked() }
                style={floatingIconStyle}
            >
                {activity && activity.text !== '' && (
                    <span className={`wc-floating-message ${visible && activity != null ? 'visible' : '' }`}>
                        {activity.text}
                    </span>
                )}

                <div style={{ backgroundColor: logoColor }} className={`wc-floating`}>
                    <LogoSVG color="white" />
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
              null,
            format: state.format
        };
    }, {

    }, (stateProps: any, dispatchProps: any, ownProps: any): FloatingIconProps => ({
        activity: stateProps.activities ? stateProps.activities[0] : null,
        visible: ownProps.visible,
        clicked: ownProps.clicked,
        logoColor: stateProps.format.themeColor,
        bottomOffset: stateProps.format.bottomOffset,
        rightOffset: stateProps.format.rightOffset
    })
)(FloatingIconView);
