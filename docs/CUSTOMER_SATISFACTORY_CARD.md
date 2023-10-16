# Customer Satisfactory Card (CSAT card)

> This is related to PR [#4899](https://github.com/microsoft/BotFramework-WebChat/pull/4899).

## Description

Power Virtual Agents and many customers implemented customer satisfactory (CSAT) cards using Adaptive Cards. However, as Adaptive Cards is designed for general purpose. Thus, the accessibility experience is not great for CSAT cards.

We are adding new attachment renderer for CSAT cards by leveraging https://schema.org/ReviewAction.

![image](https://github.com/microsoft/BotFramework-WebChat/assets/1622400/d60092de-3f71-4914-8a08-5f16128ea9e2)

![image](https://github.com/microsoft/BotFramework-WebChat/assets/1622400/902dffff-a2fe-4163-8182-0a58969f0f33)

## Design

We are using https://schema.org/ReviewAction for the representation of the CSAT card. The following is excerpt of the activity containing the CSAT card.

```json
{
   "type": "message",
   "attachments": [
      {
         "content": {
            "@context": "https://schema.org",
            "@type": "ReviewAction",
            "actionStatus": "PotentialActionStatus",
            "description": "Great! Please rate your experience.",
            "resultReview": {
               "@type": "Review",
               "reviewRating": {
                  "@type": "Rating",
                  "ratingValue-input": {
                     "@type": "PropertyValueSpecification",
                     "valueName": "rate"
                  }
               }
            },
            "target": {
               "@type": "EntryPoint",
               "actionPlatform": "https://directline.botframework.com",
               "urlTemplate": "ms-directline-postback:?value={rate}"
            }
         },
         "contentType": "application/ld+json"
      }
   ]
}
```

### Explanation of fields

| Property                                                           | Description                                                                                                                                  |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `content['@context']`                                              | Must be `"https://schema.org"`.                                                                                                              |
| `content['@type']`                                                 | Must be [`"ReviewAction"`](https://schema.org/ReviewAction).                                                                                 |
| `content.actionStatus`                                             | If value is [`"CompletedActionStatus"`](https://schema.org/ActionStatusType), the card is submitted. Otherwise, the card is ready to submit. |
| `content.description`                                              | Text of prompting the user for rating.                                                                                                       |
| `content.resultReview['@type']`                                    | Must be [`"Review"`](https://schema.org/Review).                                                                                             |
| `content.resultReview.reviewRating['@type']`                       | Must be [`"Rating"`](https://schema.org/Rating).                                                                                             |
| `content.resultReview.reviewRating.ratingValue`                    | Initial value of rating, must be `1` to `5` or `undefined`, default to `undefined`.                                                          |
| `content.resultReview.reviewRating['ratingValue-input']`           | How `ratingValue` should be used as "input" parameters (a.k.a. request body). See https://schema.org/docs/actions.html for details.          |
| `content.resultReview.reviewRating['ratingValue-input']['@type']`  | Must be [`"PropertyValueSpecification"`](https://schema.org/PropertyValueSpecification).                                                     |
| `content.resultReview.reviewRating['ratingValue-input'].valueName` | The name used in URL template.                                                                                                               |
| `content.target`                                                   | Must be URL or thing of `"EntryPoint"`.                                                                                                      |
| `content.target['@type']`                                          | Must be [`"EntryPoint"`](https://schema.org/EntryPoint).                                                                                     |
| `content.target.actionPlatform`                                    | Must be `"https://directline.botframework.com"`.                                                                                             |
| `content.target.urlTemplate`                                       | [RFC 6570 URL template](https://datatracker.ietf.org/doc/html/rfc6570) to send the action, see below.                                        |
| `contentType`                                                      | Must be `"application/ld+json"`.                                                                                                             |

Current designs and limitations:

-  Subclasses are not supported. `resultReview` must be thing of [`"Review"`](https://schema.org/Review). [`"UserReview"`](https://schema.org/UserReview) and other subclass of `"Review"` is not supported
-  Rating must be 1 to 5 stars. [`resultReview.reviewRating.bestRating`](https://schema.org/bestRating) and [`resultReview.reviewRating.worstRating`](https://schema.org/worstRating) are ignored
-  If `actionStatus` is [`CompletedActionStatus`](https://schema.org/ActionStatusType), it indicates the review is submitted, thus, `target` is optional. Otherwise, review should be submittable and `target` must be specified
-  Despite `target` could be a non-templated URL, it is highly recommended `target` is a thing of [`EntryPoint`](https://schema.org/EntryPoint)

### Target URL

> Currently, only `ratingValue-input` is supported. In the future, all fields in the Thing will be supported.

When the user change the rating, it will change the `resultReview.reviewRating.ratingValue`. In Schema.org actions, the `ratingValue-input` will be used to describe how the `ratingValue` is used in the request body of the action.

In the example payload, `ratingValue-input.valueName` is `rate`. When filling the `target.urlTemplate`, it will replace the variable `rate` with the user rating.

If the user rated 4, the URL template will be expanded as by replacing variable `rate` with `4`:

```diff
- ms-directline-postback:?value={rate}
+ ms-directline-postback:?value=4
```

Thus, the postback activity payload will become:

```json
{
   "channelData": {
      "postBack": true
   },
   "text": "4",
   "type": "message"
}
```

> Note: when using postback for a string value, it will send via `text` field.

Followings are supported protocol and their query parameters:

| Protocol                     | Parameters    | Description                                                                                                                           |
| ---------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ms-directline-postback:`    | `value`       | If `valuetype` is `application/json`, will send as JSON via `activity.value`, otherwise, will send as string via `activity.text`.     |
| `ms-directline-postback:`    | `valuetype`   | If `value` is a complex object, specify "application/json". This is not recommended because non-compliance with Direct Line protocol. |
| `ms-directline-imback:`      | `title`       | Send as string via `activity.text`.                                                                                                   |
| `ms-directline-imback:`      | `value`       | If `title` parameter is not specified, will send this value as `activity.text`.                                                       |
| `ms-directline-messageback:` | `value`       | Send as complex object via `activity.value`.                                                                                          |
| `ms-directline-messageback:` | `text`        | Send as string via `activity.text`.                                                                                                   |
| `ms-directline-messageback:` | `displaytext` | String to display as in the sent message.                                                                                             |

> `http:`/`https:` are not supported at the moment.

> For details of parameters, please refer to [Direct Line Activity spec](https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md).
