export const defaultFeedbackEntities = {
  '@context': 'https://schema.org',
  '@id': '',
  '@type': 'Message',
  type: 'https://schema.org/Message',
  keywords: [],
  potentialAction: [
    {
      '@type': 'LikeAction',
      actionStatus: 'PotentialActionStatus'
    },
    {
      '@type': 'DislikeAction',
      actionStatus: 'PotentialActionStatus'
    }
  ]
};
