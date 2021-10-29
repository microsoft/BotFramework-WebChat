import updateIn from 'simple-update-in';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.
export default function patchStyleOptionsFromDeprecatedProps(
  styleOptions,
  { groupTimestamp: groupTimestampFromProps, sendTimeout: sendTimeoutFromProps }
) {
  if (typeof groupTimestampFromProps !== 'undefined' && typeof styleOptions.groupTimestamp === 'undefined') {
    console.warn(
      'Web Chat: "groupTimestamp" has been moved to "styleOptions". This deprecation migration will be removed on or after January 1 2022.'
    );

    styleOptions = updateIn(styleOptions, ['groupTimestamp'], () => groupTimestampFromProps);
  }

  if (typeof sendTimeoutFromProps !== 'undefined' && typeof styleOptions.sendTimeout === 'undefined') {
    console.warn(
      'Web Chat: "sendTimeout" has been moved to "styleOptions". This deprecation migration will be removed on or after January 1 2022.'
    );

    styleOptions = updateIn(styleOptions, ['sendTimeout'], () => sendTimeoutFromProps);
  }

  if (styleOptions.slowConnectionAfter < 0) {
    console.warn('Web Chat: "slowConnectionAfter" cannot be negative, will set to 0.');

    styleOptions = updateIn(styleOptions, ['slowConnectionAfter'], () => 0);
  }

  return styleOptions;
}
