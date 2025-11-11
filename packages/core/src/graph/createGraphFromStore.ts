import { SlantGraph, SlantNodeSchema } from '@msinternal/botframework-webchat-core-graph';
import type { IterableElement } from 'type-fest';
import { parse } from 'valibot';
import type createStore from '../createStore';
import type createActivitiesReducer from '../reducers/createActivitiesReducer';

type Activity = IterableElement<ReturnType<ReturnType<typeof createActivitiesReducer>>>;

function createGraphFromStore(store: ReturnType<typeof createStore>): SlantGraph {
  const graph = new SlantGraph();
  let prevActivities: readonly Activity[] | undefined;

  // TODO: [P0] Except channel audience, we should be specific about all audience, e.g. name.
  const channelAudience = parse(SlantNodeSchema, {
    '@context': 'https://schema.org',
    '@id': '_:audience/channel',
    '@type': ['Audience'],
    audienceType: ['channel']
  });

  const othersAudience = parse(SlantNodeSchema, {
    '@context': 'https://schema.org',
    '@id': '_:audience/others',
    '@type': ['Audience'],
    audienceType: ['others']
  });

  const selfAudience = parse(SlantNodeSchema, {
    '@context': 'https://schema.org',
    '@id': '_:audience/user',
    '@type': ['Audience'],
    audienceType: ['self']
  });

  graph.act(graph => graph.upsert(othersAudience, channelAudience, selfAudience));

  store.subscribe(() => {
    const { activities }: { activities: readonly Activity[] } = store.getState();

    if (Object.is(activities, prevActivities)) {
      return;
    }

    const activitySet = new Set(activities);
    const prevActivitySet = new Set(prevActivities);

    // TODO: Delete node from the graph
    // const deleted = prevActivitySet.difference(activitySet);
    const addedActivities = activitySet.difference(prevActivitySet);

    // console.log('🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️', { activities, prevActivities });
    // throw new Error(`🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️ ${JSON.stringify(Array.from(addedActivities.values()), null, 2)}`);

    graph.act(graph => {
      for (const activity of addedActivities) {
        const {
          from: { role }
        } = activity;

        const permanentId = activity.channelData['webchat:internal:id'];
        const position = activity.channelData['webchat:internal:position'];

        // TODO: Should use Person and more specific than just "Others".
        const sender =
          role === 'bot'
            ? { '@id': othersAudience['@id'] }
            : role === 'user'
              ? { '@id': selfAudience['@id'] }
              : role === 'channel'
                ? { '@id': channelAudience['@id'] }
                : undefined;

        // TODO: [P*] "activity.id" could be null here, we should do the keyer here.
        if (activity.type === 'message' || activity.type === 'typing') {
          // TODO: [P*] If this is livestreaming, add isPartOf to indicate the livestream head.
          graph.upsert({
            '@context': 'https://schema.org',

            // TODO: [P0] Maybe we should do keyer here, maybe UUID here.
            '@id': `_:${permanentId}`,

            // TODO: [P0] We should allowlist types.
            '@type': ['Message', `urn:microsoft:webchat:direct-line-activity`],

            encodingFormat:
              'textFormat' in activity && activity.textFormat !== 'markdown' ? 'text/plain' : 'text/markdown',

            // TODO: [P0] activity.id could be null here.
            // TODO: [P0] Not sure if we need client activity ID here as we already have permanent ID.
            identifier: [
              ...(activity.id ? [`urn:microsoft:webchat:direct-line-activity:id:${activity.id}`] : []),
              ...(typeof activity.channelData.clientActivityID === 'string'
                ? [`urn:microsoft:webchat:client-activity-id:${activity.channelData.clientActivityID}`]
                : [])
            ],

            position,
            sender,
            text: ('text' in activity && typeof activity.text === 'string' && activity.text) || undefined,

            'urn:microsoft:webchat:direct-line-activity:raw-json': { '@type': '@json', '@value': activity },
            'urn:microsoft:webchat:direct-line-activity:type': activity.type
          });
        } else if (typeof activity.type === 'string') {
          graph.upsert({
            '@context': 'https://schema.org',
            '@id': `_:${permanentId}`,
            '@type': Object.freeze(['urn:microsoft:webchat:direct-line-activity']),
            identifier: activity.id && `urn:microsoft:webchat:direct-line-activity:id:${activity.id}`,
            position,
            sender,
            'urn:microsoft:webchat:direct-line-activity:raw-json': { '@type': '@json', '@value': activity },
            'urn:microsoft:webchat:direct-line-activity:type': activity.type
          });
        } else {
          console.warn(
            `botframework-webchat: Activity must have "type" with value of string, ignoring activity without proper "type" field.`,
            { activity }
          );
        }
      }
    });

    prevActivities = activities;
  });

  return graph;
}

export default createGraphFromStore;
