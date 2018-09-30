import { Activity, CardAction, Message} from 'botframework-directlinejs';
import * as moment from 'moment';
import * as React from 'react';
import ReactDatePicker from 'react-datepicker';
import { connect } from 'react-redux';
import { getAvailableTimes } from './getAvailableTimes';
import { ChatState } from './Store';
import { ChatActions, sendMessage } from './Store';

export interface Node {
    node_type: string;
    availableTimes: string[];
    custom_attributes: string[];
    options: string[];
}

interface DatePickerProps {
    submitDate: () => any;
    selectDate: (date: moment.Moment) => any;
    sendMessage: (inputText: string) => void;
    node: Node;
    withTime: boolean;
}

export interface MessageWithDate extends Message {
    selectedDate: moment.Moment;
}

export interface DatePickerState {
    startDate: moment.Moment;
    endDate: moment.Moment;
    dateSelected: boolean;
    selectChoice: string;
    showTimeSelectClass: string;
    withRange: boolean;
    withTime: boolean;
}

const dateFormat = 'MMMM D, YYYY';
const dateFormatWithTime = 'MMMM D, YYYY hh:mm A';

/**
 * Date picker card which renders in response to node of types 'date' and 'handoff'
 * Used for date(time) selection
 */
class DatePicker extends React.Component<DatePickerProps, DatePickerState> {
    constructor(props: DatePickerProps) {
        super(props);

        this.state = {
            startDate: null,
            endDate: null,
            dateSelected: false,
            selectChoice: 'endDate',
            withRange: props.node.custom_attributes.includes('range'),
            withTime: props.withTime || props.node.custom_attributes.includes('time') || props.node.node_type === 'handoff',
            showTimeSelectClass: 'hide-time-select'
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Handles date changing when either selecting a range
     * or just a single date
     * @param date
     */
    handleDateChange(date: moment.Moment) {
        const { withRange } = this.state;

        if (withRange) {
            if (this.state.selectChoice === 'endDate') {
                return this.setState({
                    selectChoice: 'startDate',
                    endDate: date,
                    dateSelected: true
                });
            }

            this.setState({
                selectChoice: 'endDate',
                startDate: date,
                dateSelected: true
            });
        } else {
            this.setState({
                startDate: date,
                dateSelected: true
            });
        }

    }

    private handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): any {
        if (!this.state.dateSelected) { return; }

        if (e.key === 'Enter') {
            this.props.submitDate();
            this.props.sendMessage(this.state.startDate.format(this.state.withTime ? dateFormatWithTime : dateFormat));
            document.removeEventListener('keypress', this.handleKeyDown.bind(this));
        }
    }

    clickToSubmitDate(e: React.MouseEvent<HTMLButtonElement>) {
        if (!this.state.dateSelected) { return; }

        // this.props.submitDate();
        this.props.sendMessage(this.state.startDate.format(this.state.withTime ? dateFormatWithTime : dateFormat));

        document.removeEventListener('keypress', this.handleKeyDown.bind(this));

        e.stopPropagation();
    }

    render() {
        const { startDate, endDate, withTime } = this.state;
        const { node } = this.props;
        const isHandoff = node.node_type === 'handoff';

        return (
            <div className={`gd-date-picker ${withTime && 'withTime'}`}>
                <div className="gd-selected-date-container">
                    <span className="gd-selected-date">{startDate ? startDate.format('MMMM D, YYYY') : 'Select a date'}</span>

                    {(withTime && startDate) &&
                    <span className="gd-selected-time">at {startDate && startDate.format('hh:mm A')}</span>
                }
                </div>

                <ReactDatePicker
                    endDate={this.state.endDate}
                    startDate={this.state.startDate}
                    selected={this.state.startDate}
                    onChange={date => this.handleDateChange(date)}
                    inline={true}
                    minDate={isHandoff && moment()}
                    excludeTimes={getAvailableTimes(node)}
                    tabIndex={1}
                    dateFormat={withTime ? dateFormatWithTime : dateFormat}
                    showTimeSelect={withTime}
                />

                <button type="button" className="gd-submit-date-button" onClick={e => this.clickToSubmitDate(e) } title="Submit">
                    Press enter to submit
                </button>
            </div>
        );
    }
}

export const DatePickerCard = connect(
    (state: ChatState) => ({
        // passed down to MessagePaneView
        locale: state.format.locale,
        user: state.connection.user
    }), {
        selectDate: (date: moment.Moment) => ({ type: 'Select_Date', date: date.format('DD MMM YYYY') } as ChatActions),
        submitDate: () => ({ type: 'Submit_Date' } as ChatActions),
        // only used to create helper functions below
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): DatePickerProps => ({
        // from stateProps
        node: ownProps.node,
        withTime: ownProps.withTime,
        // from dispatchProps
        selectDate: dispatchProps.selectDate,
        submitDate: dispatchProps.submitDate,
        sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale)
    })
)(DatePicker);
