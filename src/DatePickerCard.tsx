import * as moment from 'moment';
import * as React from 'react';
import ReactDatePicker from 'react-datepicker';
import { getAvailableTimes } from './getAvailableTimes';
import { MessagePaneProps } from './MessagePane';

export interface DatePickerState {
    startDate: moment.Moment;
    endDate: moment.Moment;
    dateSelected: boolean;
    selectChoice: string;
    availableTimes: AvailableTime[];
}

export interface AvailableTime {
    from: string;
    to: string;
}

export class DatePickerCard extends React.Component<MessagePaneProps, DatePickerState> {
    constructor(props: MessagePaneProps) {
        super(props);
        this.state = {
            startDate: moment(),
            endDate: moment().add(1, 'days'),
            dateSelected: false,
            selectChoice: 'endDate',
            availableTimes: []
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleDateChange(date: moment.Moment) {
        if (this.state.selectChoice === 'endDate') {
            return this.setState({
                selectChoice: 'startDate',
                endDate: date
            });
        }

        this.setState({
            selectChoice: 'endDate',
            startDate: date
        });
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
        return (
            <div>
                <div className="gd-selected-date-container">
                    <span className="gd-selected-date">{this.state.startDate.format('MMMM D, YYYY')}</span>
                </div>
                <ReactDatePicker
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    selected={this.state.startDate}
                    onChange={date => this.handleDateChange(date)}
                    inline={true}
                    fixedHeight
                    tabIndex={1}
                    dateFormat="DD-MMM HH:mm"
                    showTimeSelect

                />
            </div>
        );
    }
}
