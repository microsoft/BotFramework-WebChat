import { custom, enumType, maxValue, minValue, number, optional, string, union, url } from 'valibot';

import { ActionStatusType } from '../../../../types/external/OrgSchema/ActionStatusType';
import exactString from './exactString';
import thing from './thing';

// This is stricter than Schema.org and our TypeScript types.
// Enforcing some rules to make sure the attachment received has all fields we need.
const reviewActionSchema = thing(
  'ReviewAction',
  {
    actionStatus: optional(
      enumType(
        [
          ActionStatusType.ActiveActionStatus,
          ActionStatusType.CompletedActionStatus,
          ActionStatusType.FailedActionStatus,
          ActionStatusType.PotentialActionStatus
        ],
        '"actionStatus" must be one of the ActionStatusType'
      )
    ),
    description: optional(string('"description" must be of type string')),
    resultReview: optional(
      thing('Review', {
        reviewRating: optional(
          thing('Rating', {
            ratingValue: optional(
              number(`"resultReview.reviewRating.ratingValue" must be of type "number" and between 1 and 5`, [
                minValue(1),
                // Rating is between 1 and 5.
                // eslint-disable-next-line no-magic-numbers
                maxValue(5)
              ])
            ),
            'ratingValue-input': optional(
              thing('PropertyValueSpecification', {
                valueName: optional(
                  string(`"resultReview.reviewRating['ratingValue-input'].valueName" must be of type string`)
                )
              })
            )
          })
        )
      })
    ),
    target: optional(
      union(
        [
          thing('EntryPoint', {
            actionPlatform: exactString(
              'https://directline.botframework.com',
              `"target.actionPlatform" must be "https://directline.botframework.com"`
            ),
            urlTemplate: string([url(`"target.urlTemplate" must be a URL`)])
          }),
          string([url()])
        ],
        '"target" must be of type "EntryPoint" or URL'
      )
    )
  },
  [
    custom(
      input => input.actionStatus === ActionStatusType.CompletedActionStatus || !!input.target,
      '"target" must be present if "actionStatus" is not "CompletedActionStatus"'
    )
  ]
);

export default reviewActionSchema;
