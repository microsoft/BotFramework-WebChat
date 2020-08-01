/* eslint no-empty-pattern: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function createSuggestedActionsStyle({
  paddingRegular,
  suggestedActionLayout,
  suggestedActionsStackedHeight,
  suggestedActionsStackedOverflow
}) {
  if (suggestedActionLayout === 'stacked') {
    return {
      height: suggestedActionsStackedHeight || 'auto',
      overflowY: suggestedActionsStackedOverflow || 'auto',
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
