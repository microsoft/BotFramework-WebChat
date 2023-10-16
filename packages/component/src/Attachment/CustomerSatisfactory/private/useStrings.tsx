import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

const { useLocalizer } = hooks;

const RATING_PLURAL_IDS = {
  few: 'CSAT_RATING_FEW_ALT',
  many: 'CSAT_RATING_MANY_ALT',
  one: 'CSAT_RATING_ONE_ALT',
  other: 'CSAT_RATING_OTHER_ALT',
  two: 'CSAT_RATING_TWO_ALT'
};

export default function useStrings(): Readonly<{
  getRatingAltText: (rating: number) => string;
  submitButtonText: string;
  submittedText: string;
}> {
  const localize = useLocalizer();
  const localizeWithPlural = useLocalizer({ plural: true });

  const getRatingAltText = useCallback(
    (rating: number) => localizeWithPlural(RATING_PLURAL_IDS, rating),
    [localizeWithPlural]
  );

  const submitButtonText = localize('CSAT_SUBMIT_BUTTON_TEXT');
  const submittedText = localize('CSAT_SUBMITTED_TEXT');

  return Object.freeze({
    getRatingAltText,
    submitButtonText,
    submittedText
  } as const);
}
