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
    conversationId: string;
    updateInput: (disable: boolean, placeholder: string) => void;
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
    loading: boolean;
    duration: number;
}

const dateFormat = 'MMMM D, YYYY';
const dateFormatWithTime = 'MMMM D, YYYY hh:mmA Z';
const appointmentBuffer = 30; // minutes

/**
 * Getting all the times which are not between the availability times
 */
const getExcludedTimes = (availabilities: any, interval: number, date: moment.Moment) => {
    const periodsInADay = moment.duration(1, 'day').as('minutes');

    const excludedTimes = [];
    const startTimeMoment = moment('00:00', 'hh:mm');
    const dateCopy = date.clone().startOf('day');
    for (let i: number = 0; i <= periodsInADay; i += interval) {
        startTimeMoment.add(i === 0 ? 0 : interval, 'minutes');
        dateCopy.add(i === 0 ? 0 : interval, 'minutes');
        const excludeTime = availabilities.some((avail: any) => {
            const beforeTime = moment(moment(avail.start_time).utc().format('HH:mm'), 'hh:mm');
            const afterTime = moment(moment(avail.end_time).utc().format('HH:mm'), 'hh:mm');
            const isFuture = dateCopy.isAfter(moment().utc().add(appointmentBuffer, 'minutes'));
            return isFuture && startTimeMoment.isBetween(beforeTime, afterTime, 'hours', '[]') && startTimeMoment.isBetween(beforeTime, afterTime, 'minutes', '[)');
        });
        if (!excludeTime) {
            excludedTimes.push(startTimeMoment.format('hh:mm A'));
        }
    }

    return excludedTimes.map(time => moment(time, 'hh:mm A'));
};

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
            excludedTimes: [],
            monthAvailabilities: null,
            loading: true,
            duration: 30
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        this.props.updateInput(
            true,
            'Please select Date, or skip above.'
        );
        this.getAvailableTimes( moment(), true );
    }

    componentWillUnmount() {
        this.props.updateInput(false, null);
    }

    /** Setting the availabilities and excluded times for provide date */
    getAvailableTimes = ( date: moment.Moment, changeExcludeTime: boolean ) => {
        const {
            node,
            gid,
            directLine,
            conversationId
        } = this.props;
        const startDate = date.clone().startOf('month').format('YYYY-MM-DD');
        const endDate = date.clone().endOf('month').format('YYYY-MM-DD');

        if (!node) {
            return;
        }
        if (node && node.node_type === 'handoff') {
            const dateAvailabilitySelected = changeExcludeTime && this.state.startDate;
            this.setState({loading: true});
            availableTimes(gid, directLine.secret, conversationId, startDate, endDate)
                .then((res: any) => {
                    const allAvailabilities = this.mapAvailabilitiesDateWise(res.data);
                    let getAvailForDate = date;

                    if (!changeExcludeTime && (this.state.startDate && this.state.startDate.month() === date.month())) {
                        getAvailForDate = this.state.startDate;
                    }
                    const minuteString = +res.data.duration.split(':')[1];
                    const hourString = +res.data.duration.split(':')[0];
                    const appointmentDuration = hourString * 60 + minuteString;
                    const excludedTime = getExcludedTimes(allAvailabilities[getAvailForDate.format('YYYY-MM-DD')], appointmentDuration, date);
                    this.setState({
                        startDate: dateAvailabilitySelected ? date : this.state.startDate,
                        dateSelected: dateAvailabilitySelected ? true : this.state.dateSelected,
                        monthAvailabilities: allAvailabilities,
                        excludedTimes: excludedTime,
                        loading: false,
                        duration: appointmentDuration
                    });
            })
            .catch((err: any) => {
                this.setState({
                    startDate: dateAvailabilitySelected ? date : this.state.startDate,
                    dateSelected: dateAvailabilitySelected ? true : this.state.dateSelected,
                    loading: false
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

    /** Handling the month change */
    handleMonthChange = ( date: moment.Moment ) => {
        this.getAvailableTimes(date, true);
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
            if (node.node_type === 'handoff') {
                if (startDate && startDate.month() !== date.month()) {
                    this.getAvailableTimes(date, true);
                } else if (this.state.monthAvailabilities) {
                    const excludedTime = getExcludedTimes(this.state.monthAvailabilities[date.format('YYYY-MM-DD')], this.state.duration, date);
                    this.setState({
                        startDate: date,
                        dateSelected: true,
                        excludedTimes: excludedTime ? excludedTime : []
                    });
                } else {
                    this.setState({
                        startDate: date,
                        dateSelected: true
                    });
                }
            } else {
                this.setState({
                    startDate: date,
                    dateSelected: true
                });
            }
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

    clickNoWorkableAppointment(e: React.MouseEvent<HTMLButtonElement>) {
        this.props.sendMessage('None of these appointments work for me');
        document.removeEventListener('keypress', this.handleKeyDown.bind(this));
        e.stopPropagation();
    }

    render() {
        const { startDate, endDate, withTime, loading } = this.state;
        const { node } = this.props;
        const isHandoff = node.node_type === 'handoff';

        return (
            <div className={`gd-date-picker ${withTime && 'withTime'}`}>
                <div className="gd-selected-date-container">
                    <span className="gd-selected-date">{loading ? 'Loading...' : startDate ? startDate.format('MMMM D, YYYY') : 'Select a date'}</span>
                    {(withTime && startDate) &&
                        <span className="gd-selected-time">at {startDate && startDate.format('hh:mm A')}</span>
                    }
                </div>

                <ReactDatePicker endDate={this.state.endDate}
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
                    timeIntervals={this.state.duration}
                />
                <button type="button" className="gd-no-workable-appointment" onClick={e => this.clickNoWorkableAppointment(e) } title="nomatch">
                    None of these appointments work for me
                </button>
                <button type="button" className="gd-submit-date-button" onClick={e => this.clickToSubmitDate(e) } title="Submit">
                    Submit
                </button>
            </div>
        );
    }
}

export const DatePickerCard = connect(
    (state: ChatState) => {
        return {
            // passed down to MessagePaneView
            locale: state.format.locale,
            user: state.connection.user,
            conversationId: state.connection.botConnection.conversationId
        };
    }, {
        selectDate: (date: moment.Moment) => ({ type: 'Select_Date', date: date.format('DD MMM YYYY') } as ChatActions),
        updateInput: (disable: boolean, placeholder: string) =>
          ({
              type: 'Update_Input',
              placeholder,
              disable,
              source: 'text'
          } as ChatActions),
        // only used to create helper functions below
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): DatePickerProps => {
        return {
            // from stateProps
            node: ownProps.node,
            withTime: ownProps.withTime,
            // from dispatchProps
            selectDate: dispatchProps.selectDate,
            submitDate: dispatchProps.submitDate,
            updateInput: dispatchProps.updateInput,
            sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
            gid: ownProps.gid,
            directLine: ownProps.directLine,
            conversationId: stateProps.conversationId
        };
    }
)(DatePicker);
