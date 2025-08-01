import updateIn from 'simple-update-in';

// TODO: [P4] We should add a notice for people who want to use "styleSet" instead of "styleOptions".
//       "styleSet" is actually CSS stylesheet and it is based on the DOM tree.
//       DOM tree may change from time to time, thus, maintaining "styleSet" becomes a constant effort.
export default function patchStyleOptionsFromDeprecatedProps(styleOptions) {
  if (styleOptions.slowConnectionAfter < 0) {
    console.warn('Web Chat: "slowConnectionAfter" cannot be negative, will set to 0.');

    styleOptions = updateIn(styleOptions, ['slowConnectionAfter'], () => 0);
  }

  // Rectify deprecated "hideUploadButton" into "disableFileUpload"
  if (styleOptions.hideUploadButton !== undefined) {
    console.warn('Web Chat: "hideUploadButton" is deprecated. Please use "disableFileUpload" instead.');

    styleOptions = updateIn(styleOptions, ['disableFileUpload'], () => !!styleOptions.hideUploadButton);
  }

  return styleOptions;
}
