/* eslint no-empty-pattern: "off" */

export default function createSuggestedActionsStyle({ paddingRegular, suggestedActionLayout }) {
  if (suggestedActionLayout === 'stacked') {
    return {
      paddingBottom: paddingRegular / 2,
      paddingLeft: paddingRegular / 2,
      paddingRight: paddingRegular / 2,
      paddingTop: paddingRegular / 2
    };
  }

  return {
    paddingBottom: paddingRegular / 2,
    paddingTop: paddingRegular / 2
  };
}
