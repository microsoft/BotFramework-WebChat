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

    // console.log('🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️', { addedActivities });

    for (const activity of addedActivities) {
      graph.act(graph =>
        graph.upsert({
          '@context': 'https://schema.org',

          // TODO: [P0] Maybe we should do keyer here, maybe UUID here.
          '@id': `_:${activity.id}`,

          // TODO: [P0] We should allowlist types.
          '@type': ['Message', `urn:microsoft:webchat:direct-line-activity:type:${activity.type}`],

          encodingFormat:
            'textFormat' in activity && activity.textFormat !== 'markdown' ? 'text/plain' : 'text/markdown',

          // TODO: [P0] Will activity.id be null here?
          identifier: [
            ...(activity.id ? [`urn:microsoft:webchat:direct-line-activity:id:${activity.id}`] : []),
            ...(typeof activity.channelData.clientActivityID === 'string'
              ? [`urn:microsoft:webchat:client-activity-id:${activity.channelData.clientActivityID}`]
              : [])
          ],

          position: activity.channelData['webchat:sequence-id'],

          sender: {
            '@id':
              activity.from.role === 'bot'
                ? othersAudience['@id']
                : activity.from.role === 'user'
                  ? selfAudience['@id']
                  : channelAudience['@id']
          },

          // sender:
          //   activity.from.role === 'bot'
          //     ? othersAudience
          //     : activity.from.role === 'user'
          //       ? selfAudience
          //       : channelAudience,
          text: ('text' in activity && typeof activity.text === 'string' && activity.text) || undefined,

          'urn:microsoft:webchat:direct-line-activity:raw-json': [{ '@type': '@json', '@value': activity }]
        })
      );
    }

    prevActivities = activities;
  });

  return graph;
}

export default createGraphFromStore;
