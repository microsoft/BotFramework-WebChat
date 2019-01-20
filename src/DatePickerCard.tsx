import { Activity, CardAction, DirectLineOptions, Message} from 'botframework-directlinejs';
import * as moment from 'moment';
import * as React from 'react';
import ReactDatePicker from 'react-datepicker';
import { connect } from 'react-redux';
import { availableTimes  } from './api/bot';
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
    gid: string;
    directLine?: DirectLineOptions;
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
    excludedTimes: moment.Moment[];
    monthAvailabilities: any;
}

const dateFormat = 'MMMM D, YYYY';
const dateFormatWithTime = 'MMMM D, YYYY hh:mmA Z';

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
            showTimeSelectClass: 'hide-time-select',
            excludedTimes: null,
            monthAvailabilities: null
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        this.getAvailableTimes( moment() );
    }

    /** Setting the availabilities and excluded times for provide date */

    getAvailableTimes = ( date: moment.Moment ) => {
        const {
            node,
            gid,
            directLine
        } = this.props;
        const conversationId = window.localStorage.getItem('msft_conversation_id');
        const startDate = date.startOf('month').format('YYYY-MM-DD');
        const endDate = date.endOf('month').format('YYYY-MM-DD');

        if (!node) {
            return;
        }
        if (node && node.node_type === 'handoff') {
            availableTimes(gid, directLine.secret, conversationId, startDate, endDate)
                .then((res: any) => {
                    const allAvailabilities = this.mapAvailabilitiesDateWise(res.data);
                    const excludedTime = this.getExcludedTimes(allAvailabilities[date.format('YYYY-MM-DD')], 30);
                    this.setState({
                        monthAvailabilities: allAvailabilities,
                        excludedTimes: excludedTime
                });
            });
        }
        return;
    }

    /** Datewise availability array */

    mapAvailabilitiesDateWise = (availabilities: any) => {
        const mergeAvailability = [ ...availabilities.recurring, ...availabilities.single ];
        const dateWiseAvailabilities = mergeAvailability.reduce((nodeAccumulator, avail) => ({
                ...nodeAccumulator,
                [avail.date]: nodeAccumulator[avail.date] && nodeAccumulator[avail.date].length > 0 ? [ ...nodeAccumulator[avail.date], ...avail.availabilities ] : [ ...avail.availabilities ]
        }), {});

        return dateWiseAvailabilities;
     }

    /**
     * Getting all the times which are not between the availability times
     */
    getExcludedTimes = (availabilities: any, interval: number) => {
        if (!availabilities) {
            return null;
        }

        const periodsInADay = moment.duration(1, 'day').as('minutes');

        const excludedTimes = [];
        const startTimeMoment = moment('00:00', 'hh:mm');
        for (let i: number = 0; i <= periodsInADay; i += interval) {
            startTimeMoment.add(i === 0 ? 0 : interval, 'minutes');
            const excludeTime = availabilities.some((avail: any) => {
                const beforeTime = moment(moment(avail.start_time).utc().format('HH:mm'), 'hh:mm');
                const afterTime = moment(moment(avail.end_time).utc().format('HH:mm'), 'hh:mm');
                return startTimeMoment.isBetween(beforeTime, afterTime, 'hours', '[]') && startTimeMoment.isBetween(beforeTime, afterTime, 'minutes', '[]');
            });
            if (!excludeTime) {
                excludedTimes.push(startTimeMoment.format('hh:mm A'));
            }
        }

        return excludedTimes.map(time => moment(time, 'hh:mm A'));
    }
    /** Handling the month change */
    handleMonthChange = ( date: moment.Moment ) => {
        this.getAvailableTimes(date);
    }

    /**
     * Handles date changing when either selecting a range
     * or just a single date
     * @param date
     */
    handleDateChange(date: moment.Moment) {
        const { withRange, startDate } = this.state;
        const { node } = this.props;

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
            const excludedTime = (node.node_type === 'handoff') ? (startDate && startDate.month() !== date.month()) ? this.getAvailableTimes(date) : this.state.monthAvailabilities && this.getExcludedTimes(this.state.monthAvailabilities[date.format('YYYY-MM-DD')], 30) : null;
            this.setState({
                startDate: date,
                dateSelected: true,
                excludedTimes: excludedTime ? excludedTime : []
            });
        }

    }

    private handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): any {
        if (!this.state.dateSelected) { return; }

        if (e.key === 'Enter') {
            this.props.submitDate();
            this.props.sendMessage(this.getDateText());
            document.removeEventListener('keypress', this.handleKeyDown.bind(this));
        }
    }

    getDateText = () => {
        let endDate = '';
        const startDate = this.state.startDate.format(this.state.withTime ? dateFormatWithTime : dateFormat);
        if (this.state.withRange && this.state.endDate) {
             endDate = '~' + this.state.endDate.format(this.state.withTime ? dateFormatWithTime : dateFormat);
        }
        return (startDate + endDate);
    }

    clickToSubmitDate(e: React.MouseEvent<HTMLButtonElement>) {
        if (!this.state.dateSelected) { return; }

        // this.props.submitDate();
        this.props.sendMessage(this.getDateText());

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
                    onMonthChange={e => this.handleMonthChange(e)}
                    inline={true}
                    minDate={isHandoff && moment()}
                    excludeTimes={this.state.excludedTimes}
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
        sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
        gid: ownProps.gid,
        directLine: ownProps.directLine
    })
)(DatePicker);
