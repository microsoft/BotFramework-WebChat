import { CardAction, Message} from 'botframework-directlinejs';
import * as moment from 'moment';
import * as React from 'react';
import ReactDatePicker from 'react-datepicker';
import { ReactDatePickerProps } from 'react-datepicker';
import { connect } from 'react-redux';
import { activityWithDatePicker } from './activityWithDatePicker';
import { activityWithSuggestedActions } from './activityWithSuggestedActions';
import { classList, doCardAction, IDoCardAction } from './Chat';
import { getAvailableTimes } from './getAvailableTimes';
import { HScroll } from './HScroll';
import { ChatState } from './Store';
import { ChatActions, sendMessage } from './Store';

export interface MessagePaneProps {
    activityWithSuggestedActions: Message;
    activityWithDatePicker: Message;
    // activityWithDateAndTimePicker: Message;

    takeSuggestedAction: (message: Message) => any;
    selectDate: (date: moment.Moment) => any;
    submitDate: (Message: Message) => any;
    sendMessage: (inputText: string) => void;

    children: React.ReactNode;
    doCardAction: IDoCardAction;
}

export interface MessageWithDate extends Message {
    selectedDate: moment.Moment;
}

const MessagePaneView = (props: MessagePaneProps) =>
    <div className={ classList('wc-message-pane', props.activityWithSuggestedActions && 'show-actions' ) }>
        { props.children }
        <div className="wc-suggested-actions">
            <SuggestedActions { ...props } />
        </div>
        <div className="gd-date-picker">
            <DatePicker { ...props } />
        </div>
    </div>;

class SuggestedActions extends React.Component<MessagePaneProps, {}> {
    constructor(props: MessagePaneProps) {
        super(props);
    }

    actionClick(e: React.MouseEvent<HTMLButtonElement>, cardAction: CardAction) {

        // "stale" actions may be displayed (see shouldComponentUpdate), do not respond to click events if there aren't actual actions
        if (!this.props.activityWithSuggestedActions) { return; }

        this.props.takeSuggestedAction(this.props.activityWithSuggestedActions);
        this.props.doCardAction(cardAction.type, cardAction.value);
        e.stopPropagation();
    }

    shouldComponentUpdate(nextProps: MessagePaneProps) {
        // update only when there are actions. We want the old actions to remain displayed as it animates down.
        return !!nextProps.activityWithSuggestedActions;
    }

    render() {
        if (!this.props.activityWithSuggestedActions) { return null; }

        return (
            <HScroll
                prevSvgPathData="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z"
                nextSvgPathData="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"
                scrollUnit="page"
            >
                <ul>{ this.props.activityWithSuggestedActions.suggestedActions.actions.map((action, index) =>
                    <li key={ index }>
                        <button type="button" onClick={e => this.actionClick(e, action) } title={ action.title }>
                            { action.title }
                        </button>
                    </li>
                ) }</ul>
            </HScroll>
        );
    }
}

export interface DatePickerState {
    startDate: moment.Moment;
    dateSelected: boolean;
    avaiableTimes: AvailableTime[];
}

export interface AvailableTime {
    from: string;
    to: string;
}

export interface EntityType {
    node_type: string;
    availableTimes: AvailableTime[];
    customAttributes: string[];
    options: string[];
}

class DatePicker extends React.Component<MessagePaneProps, DatePickerState> {
    constructor(props: MessagePaneProps) {
        super(props);
        this.state = {
            startDate: moment(),
            dateSelected: false,
            avaiableTimes: []
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleDateChange(date: moment.Moment) {
        this.setState({
            startDate: date,
            dateSelected: true,
            avaiableTimes: getAvailableTimes(this.props.activityWithDatePicker, date.format(('YYYY-mm-DD')))
            },
            () => this.props.selectDate(date)
        );

        document.addEventListener('keypress', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): any {
        if (!this.state.dateSelected) { return; }

        if (e.key === 'Enter') {
            this.props.submitDate(this.props.activityWithDatePicker);
            this.props.sendMessage(this.state.startDate.format('MMMM D, YYYY'));
            document.removeEventListener('keypress', this.handleKeyDown.bind(this));
        }
    }

    clickToSubmitDate(e: React.MouseEvent<HTMLButtonElement>) {

        if (!this.props.activityWithDatePicker) { return; }
        if (!this.state.dateSelected) { return; }

        this.props.submitDate(this.props.activityWithDatePicker);
        this.props.sendMessage(this.state.startDate.format('MMMM D, YYYY'));

        document.removeEventListener('keypress', this.handleKeyDown.bind(this));

        e.stopPropagation();
    }

    render() {
        console.log('Rendering datepicker');

        return (
            <div>
                <div className="gd-selected-date-container">
                    <span className="gd-selected-date">{this.state.startDate.format('MMMM D, YYYY')}</span>
                </div>
               <ReactDatePicker
                    startDate={this.state.startDate}
                    selected={this.state.startDate}
                    onChange={date => this.handleDateChange(date)}
                    inline={true}
                    fixedHeight
                    tabIndex={1}
                    dateFormat="DD-MMM HH:mm"
                    />
               <button type="button" className="gd-submit-date-button" onClick={e => this.clickToSubmitDate(e) } title="Submit">
                    Press enter to submit
                </button>
            </div>
        );
    }
}

export const MessagePane = connect(
    (state: ChatState) => ({
        // passed down to MessagePaneView
        activityWithSuggestedActions: activityWithSuggestedActions(state.history.activities),
        activityWithDatePicker: activityWithDatePicker(state.history.activities),
        // only used to create helper functions below
        botConnection: state.connection.botConnection,
        user: state.connection.user,
        locale: state.format.locale
    }), {
        takeSuggestedAction: (message: Message) => ({ type: 'Take_SuggestedAction', message } as ChatActions),
        selectDate: (date: moment.Moment) => ({ type: 'Select_Date', date: date.format('DD MMM YYYY') } as ChatActions),
        submitDate: (message: MessageWithDate) => ({ type: 'Submit_Date', message } as ChatActions),
        // only used to create helper functions below
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): MessagePaneProps => ({
        // from stateProps
        activityWithSuggestedActions: stateProps.activityWithSuggestedActions,
        activityWithDatePicker: stateProps.activityWithDatePicker,

        // from dispatchProps
        takeSuggestedAction: dispatchProps.takeSuggestedAction,
        selectDate: dispatchProps.selectDate,
        submitDate: dispatchProps.submitDate,
        sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
        // from ownProps
        children: ownProps.children,
        // helper functions
        doCardAction: doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage)
    })
)(MessagePaneView);
