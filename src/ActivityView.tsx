import { Activity, Attachment, AttachmentLayout, DirectLineOptions } from 'botframework-directlinejs';
import * as moment from 'moment';
import * as React from 'react';
import { AttachmentView } from './Attachment';
import { Carousel } from './Carousel';
import { IDoCardAction } from './Chat';
import { ContactFormCard } from './ContactFormCard';
import { dateFormat, dateFormatWithTime, DatePickerCard } from './DatePickerCard';
import { DisclaimerCard } from './DisclaimerCard';
import { FileUploadCard } from './FileUploadCard';
import { FormattedText } from './FormattedText';
import { MultipleChoiceCard } from './MultipleChoiceCard';
import { FormatState, SizeState } from './Store';

const Attachments = (props: {
    attachments: Attachment[],
    attachmentLayout: AttachmentLayout,
    format: FormatState,
    size: SizeState,
    onCardAction: IDoCardAction,
    onImageLoad: () => void
}) => {
    const { attachments, attachmentLayout, ...otherProps } = props;
    if (!attachments || attachments.length === 0) {
        return null;
    }
    return attachmentLayout === 'carousel' ?
        <Carousel
            attachments={ attachments }
            { ...otherProps }
        />
    :
        <div className="wc-list">
            { attachments.map((attachment, index) =>
                <AttachmentView
                    key={ index }
                    attachment={ attachment }
                    format={ props.format }
                    onCardAction={ props.onCardAction }
                    onImageLoad={ props.onImageLoad }
                />
            ) }
        </div>;
};

export interface ActivityViewProps {
    format: FormatState;
    size: SizeState;
    activity: Activity;
    type?: string;
    onCardAction: IDoCardAction;
    onImageLoad: () => void;
    gid: string;
    directLine: DirectLineOptions;
}

export class ActivityView extends React.Component<ActivityViewProps, {}> {
    constructor(props: ActivityViewProps) {
        super(props);
    }

    shouldComponentUpdate(nextProps: ActivityViewProps) {
        // if the activity changed, re-render
        return this.props.activity !== nextProps.activity
        // if the format changed, re-render
            || this.props.format !== nextProps.format
        // if it's a carousel and the size changed, re-render
            || (this.props.activity.type === 'message'
                && this.props.activity.attachmentLayout === 'carousel'
                && this.props.size !== nextProps.size);
    }

    addFormattedKey = (currentText: string, key: string, json: { [key: string]: string }) => {
      if (!(key in json)) {
        return currentText;
      }
      const newLine = ' * ' + key + ': ' + json[key];
      if (currentText !== '') {
        return currentText.concat('\n', newLine);
      }
      return currentText.concat(newLine);
    }

    formatSelectedOptions = (json: { [key: string]: string[] }) => {
      const selected = json.selected;
      let frmt = '';
      selected.forEach(s => {
        frmt += ` * ${s}\n`;
      });
      return frmt;
    }

    parseDate = (date: string) => {
      const dateWithoutTime = moment(date, dateFormat, true);
      if (dateWithoutTime.isValid()) {
        return dateWithoutTime.format(dateFormat);
      }

      const dateWithTime = moment(date, dateFormatWithTime, true);
      if (dateWithTime.isValid()) {
        return dateWithTime.format('MMMM D, YYYY hh:mmA');
      }

      return undefined;
    }

    // specifically for contact response
    // but will format any json to display the key pairs set
    formatText = (text: string) => {
      if (text.includes('~')) { // date node withRange
        const splitDates = text.split('~');
        const date1 = this.parseDate(splitDates[0]);
        const date2 = this.parseDate(splitDates[1]);
        if (!!date1 && !!date2) {
          return `${date1} to ${date2}`;
        }
      }

      const date = this.parseDate(text);
      if (!!date) { // date node !withRange and handoff node
        return date;
      }

      try { // contact node
        const o = JSON.parse(text);
        let formattedText = '';
        if (o && typeof o === 'object') {
          if (('name' in o || 'email' in o || 'phone' in o)) {
            formattedText = this.addFormattedKey(formattedText, 'name', o);
            formattedText = this.addFormattedKey(formattedText, 'email', o);
            formattedText = this.addFormattedKey(formattedText, 'phone', o);
            return formattedText;
          } else if ('selected' in o) {
            return this.formatSelectedOptions(o);
          } else {
            return text;
          }
        } else {
          return text;
        }
      } catch (e) {
        return text;
      }
    }

    render() {
        const { activity, type, ...props } = this.props;
        const activityCopy: any = activity;
        const isDisclaimer = activityCopy.entities && activityCopy.entities.length > 0 && activityCopy.entities[0].node_type === 'disclaimer';

        if (type === 'message' && activity.type === 'message' && !isDisclaimer) {
            return (
                <div>
                    <FormattedText
                        text={ this.formatText(activity.text) }
                        format="markdown"
                        onImageLoad={ props.onImageLoad }
                    />
                    <Attachments
                        attachments={ activity.attachments }
                        attachmentLayout={ activity.attachmentLayout }
                        format={ props.format }
                        onCardAction={ props.onCardAction }
                        onImageLoad={ props.onImageLoad }
                        size={ props.size }
                    />
                </div>
            );
        } else if (activity.type === 'typing') {
            return <div className="wc-typing"/>;
        } else if (type === 'date' || type === 'handoff') {
            return (
                <DatePickerCard { ...props } node={activityCopy.entities[0]} />
            );
        } else if (type === 'file') {
            return (
                <FileUploadCard { ...props } node={activityCopy.entities[0]} />
            );
        } else if (type === 'imBack' && !isDisclaimer) {
            return (
                <MultipleChoiceCard { ...props } />
            );
        } else if (type === 'contact') {
            return (
                  <ContactFormCard { ...props } node={activityCopy.entities[0]} />
            );
        }
    }
}
