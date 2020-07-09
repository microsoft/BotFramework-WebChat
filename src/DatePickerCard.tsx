import { Activity, CardAction, DirectLineOptions, Message} from 'botframework-directlinejs';
import * as moment from 'moment';
import * as React from 'react';
import { FaCaretLeft } from 'react-icons/fa';
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
    timeSelected: boolean;
    selectChoice: string;
    showTimeSelectClass: string;
    withRange: boolean;
    withTime: boolean;
    includedTimes: moment.Moment[];
    monthAvailabilities: any;
    loading: boolean;
    duration: number;
}

const dateFormat = 'MMMM D, YYYY';
export const dateFormatWithTime = 'MMMM D, YYYY hh:mmA Z';
const appointmentBuffer = 30; // minutes

/**
 * Getting all the times which are not between the availability times
 */
const getIncludedTimes = (availabilities: any, interval: number, date: moment.Moment) => {
    const periodsInADay = moment.duration(1, 'day').as('minutes');

    const includedTimes = [];
    const startTimeMoment = moment('00:00', 'hh:mm');
    const dateCopy = date.clone().startOf('day');
    for (let i: number = 0; i <= periodsInADay; i += interval) {
        startTimeMoment.add(i === 0 ? 0 : interval, 'minutes');
        dateCopy.add(i === 0 ? 0 : interval, 'minutes');
        const includeTime = availabilities.some((avail: any) => {
            const beforeTime = moment(moment(avail.start_time).format('HH:mm'), 'hh:mm');
            const afterTime = moment(moment(avail.end_time).format('HH:mm'), 'hh:mm');
            const isFuture = dateCopy.isAfter(moment().add(appointmentBuffer, 'minutes'));
            const startTimeCheck = startTimeMoment.isBetween(beforeTime, afterTime, undefined, '[]');
            const endTimeMoment = startTimeMoment.clone().add(interval, 'minutes');
            const endTimeCheck = endTimeMoment.isBetween(beforeTime, afterTime, undefined, '[]');
            return isFuture && startTimeCheck && endTimeCheck;
        });
        if (includeTime) {
          includedTimes.push(startTimeMoment.format('hh:mm A'));
        }
    }

    return includedTimes.map(time => moment(time, 'hh:mm A'));
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
            timeSelected: false,
            selectChoice: 'endDate',
            withRange: props.node.custom_attributes.includes('range'),
            withTime: props.withTime || props.node.custom_attributes.includes('time') || props.node.node_type === 'handoff',
            showTimeSelectClass: 'hide-time-select',
            includedTimes: [],
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
        const startDate = date.clone().startOf('week').format('YYYY-MM-DD');
        const endDate = date.clone().endOf('week').format('YYYY-MM-DD');

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
                    const includedTime = getIncludedTimes(allAvailabilities[getAvailForDate.format('YYYY-MM-DD')], appointmentDuration, date);
                    this.setState({
                        startDate: dateAvailabilitySelected ? date : this.state.startDate,
                        dateSelected: dateAvailabilitySelected ? true : this.state.dateSelected,
                        monthAvailabilities: allAvailabilities,
                        includedTimes: includedTime,
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

    /**
     * Handles date changing when either selecting a range
     * or just a single date
     * @param date
     */
    handleDateChange(date: moment.Moment, withTime: boolean) {
        const { withRange, startDate } = this.state;
        const { node } = this.props;

        if (withRange) {
            if (this.state.selectChoice === 'endDate') {
                return this.setState({
                    selectChoice: 'startDate',
                    endDate: date,
                    dateSelected: true,
                    timeSelected: withTime
                });
            }

            this.setState({
                selectChoice: 'endDate',
                startDate: date,
                dateSelected: true,
                timeSelected: withTime
            });
        } else {
            if (node.node_type === 'handoff') {
                if (this.state.monthAvailabilities) {
                    const includedTime = getIncludedTimes(this.state.monthAvailabilities[date.format('YYYY-MM-DD')], this.state.duration, date);
                    this.setState({
                        startDate: date,
                        dateSelected: true,
                        includedTimes: includedTime ? includedTime : [],
                        timeSelected: withTime
                    });
                } else {
                    this.setState({
                        startDate: date,
                        dateSelected: true,
                        timeSelected: withTime
                    });
                }
            } else {
                this.setState({
                    startDate: date,
                    dateSelected: true,
                    timeSelected: withTime
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
        if (!this.state.dateSelected || !this.state.timeSelected) { return; }

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

    availabilitiesExistOnDay = (day: string) => {
      const date = moment(day);
      return date.dayOfYear() >= moment().dayOfYear() && getIncludedTimes(this.state.monthAvailabilities[date.format('YYYY-MM-DD')], this.state.duration, date).length > 0;
    }

    getUsersTimeZone = () => {
      return Intl.DateTimeFormat('en-US', { timeZoneName: 'short'}).format(new Date()).split(' ').pop();
    }

    renderDayPicker = () => {
      const keys = this.state.monthAvailabilities ? Object.keys(this.state.monthAvailabilities) : [];
      const startDate = this.state.monthAvailabilities ? moment(keys[0]) : undefined;
      const endDate = this.state.monthAvailabilities ? moment(keys[keys.length - 1]) : undefined;

      return (
        <div className="gd-date-picker-inner-container">
          <div className="gd-date-picker-inner-header">
            <span className="gd-date-picker-inner-header-date-range"></span>
          </div>
          <div className="gd-date-picker-select-header">
            <span>Select a Day</span>
            <span>{this.getUsersTimeZone()}</span>
          </div>
          <div className="gd-date-picker-days-container">
          {this.state.monthAvailabilities && !this.state.loading &&
            keys.map(date =>
              this.availabilitiesExistOnDay(date) && <button
                className="gd-date-picker-select-day"
                onClick={e => this.handleDateChange(moment(date), false)}
                key={date}
              >
                {moment(date).format('dddd MMMM Do, YYYY')}
              </button>
            )}
            {this.state.loading &&
              <div className="gd-date-picker-loading-container">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45"/>
                </svg>
              </div>
            }
            </div>
            <div className="gd-date-picker-navigation">
              {startDate > moment() && <button
                className="gd-date-picker-prev"
                disabled={this.state.loading}
                onClick={e => this.getAvailableTimes(startDate.subtract(1, 'days'), true)}
              >Prev</button>}
              <button
                className="gd-date-picker-next"
                disabled={this.state.loading}
                onClick={e => this.getAvailableTimes(endDate.add(1, 'days'), true)}
              >Next</button>
            </div>
        </div>

      );
    }

    renderHourPicker = () => {
      const { includedTimes, startDate, timeSelected } = this.state;

      return (
        <div className="gd-date-picker-inner-container gd-date-picker-inner-container-hours">
          <div className="gd-date-picker-inner-header">
            <div
              className="gd-date-picker-hours-back"
            >
              <FaCaretLeft onClick={(e: React.MouseEvent<SVGElement>) => this.setState({
                ...this.state,
                dateSelected: false,
                timeSelected: false,
                startDate: null
              })}/>
            </div>
            <span className="gd-date-picker-inner-header-selected-day">{timeSelected ? startDate.format('MM/DD/YYYY hh:mm A') : startDate.format('MM/DD/YYYY')}</span>
          </div>
          <div className="gd-date-picker-select-header">
            <span>Select a Time</span>
            <span>{this.getUsersTimeZone()}</span>
          </div>
          <div className="gd-date-picker-hours-container">
            {includedTimes.map(time =>
              <button
                className="gd-date-picker-select-hour"
                key={time.format('hh:mm A')}
                onClick={e => {
                  this.handleDateChange(moment(startDate.format('DD MMM YYYY') + ' ' + time.format('hh:mm A')), true);
                }}
              >{time.format('hh:mm A')}</button>
            )}
          </div>
        </div>
      );
    }

    render() {
        const { startDate, endDate, withTime, loading, dateSelected, duration } = this.state;
        const { node } = this.props;
        const isHandoff = node.node_type === 'handoff';

        return (
            <div className={`gd-date-picker ${withTime && 'withTime'}`}>
                <div className="gd-date-picker-header">
                    <span className="gd-header-schedule-meeting">Schedule a Meeting</span>
                    <span className="gd-header-duration">{`${duration} Minutes`}</span>
                </div>
                {!dateSelected && this.renderDayPicker()}
                {dateSelected && this.renderHourPicker()}
                <button type="button" className="gd-submit-date-button" onClick={e => this.clickToSubmitDate(e) } title="Submit">
                    Schedule Meeting
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
