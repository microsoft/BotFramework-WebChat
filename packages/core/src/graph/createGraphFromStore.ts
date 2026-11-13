import { SlantGraph, SlantNodeSchema, type GraphSubscriber } from '@msinternal/botframework-webchat-core-graph';
import { parse } from 'valibot';
import type createStore from '../createStore';
import { getLocalIdFromActivity } from '../reducers/activities/sort/property/LocalId';
import { getPositionFromActivity } from '../reducers/activities/sort/property/Position';
import type { Activity } from '../reducers/activities/sort/types';

function createGraphFromStore(store: ReturnType<typeof createStore>): SlantGraph {
  const graph = new SlantGraph();
  const actOnGraph = graph.act.bind(graph);
  let prevActivities: readonly Activity[] | undefined;
  let transacting = false;

  // act() is not re-entrant: reads inside a transaction (e.g. by middleware) must not catch up with the store.
  const transact: typeof graph.act = fn => {
    transacting = true;

    try {
      actOnGraph(fn);
    } finally {
      transacting = false;
    }
  };

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

  const handleStoreChange = () => {
    const { activities }: { activities: readonly Activity[] } = store.getState();

    if (Object.is(activities, prevActivities)) {
      return;
    }

    const activitySet = new Set(activities);
    const prevActivitySet = new Set(prevActivities);

    // TODO: [P*] Supports deleting node from the graph.
    const addedActivities = activitySet.difference(prevActivitySet);

    transact(graph => {
      for (const activity of addedActivities) {
        const {
          from: { role }
        } = activity;

        const localId = getLocalIdFromActivity(activity);
        const position = getPositionFromActivity(activity);

        // TODO: Should use Person and more specific than just "Others".
        const sender =
          role === 'bot'
            ? { '@id': othersAudience['@id'] }
            : role === 'user'
              ? { '@id': selfAudience['@id'] }
              : role === 'channel'
                ? { '@id': channelAudience['@id'] }
                : undefined;

        if (activity.type === 'message' || activity.type === 'typing') {
          // TODO: [P*] If this is livestreaming, add isPartOf to indicate the livestream head.
          graph.upsert({
            '@context': 'https://schema.org',

            '@id': localId,
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
            '@id': localId,
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
  };

  // Activities already in the store (e.g. rehydrated) are added now, not on the first subscription.
  handleStoreChange();

  // Follows the store only while the graph has subscribers: a graph nobody subscribes to (e.g. after unmount, or from a
  // render that never committed) does not stay subscribed to the store.
  const subscribeToGraph = graph.subscribe.bind(graph);
  const getGraphState = graph.getState.bind(graph);
  const subscribers = new Set<GraphSubscriber>();
  let unsubscribeFromStore: (() => void) | undefined;

  // Catches up with changes made while the graph has no subscribers, e.g. when a hidden <Activity> (React 19.2+) ran the
  // cleanup of effects and renders before subscribing again. Returns the same state until the store activities change.
  graph.getState = () => {
    unsubscribeFromStore || transacting || handleStoreChange();

    return getGraphState();
  };

  // Catches up before a transaction, so its middleware sees the activities, e.g. to link nodes to them.
  graph.act = fn => {
    unsubscribeFromStore || handleStoreChange();
    transact(fn);
  };

  graph.subscribe = subscriber => {
    const unsubscribe = subscribeToGraph(subscriber);

    subscribers.add(subscriber);
    unsubscribeFromStore ||= store.subscribe(handleStoreChange);

    // Catches up with changes made while the graph had no subscribers.
    handleStoreChange();

    return () => {
      unsubscribe();
      subscribers.delete(subscriber);

      if (!subscribers.size) {
        unsubscribeFromStore?.();
        unsubscribeFromStore = undefined;
      }
    };
  };

  return graph;
}

export default createGraphFromStore;
