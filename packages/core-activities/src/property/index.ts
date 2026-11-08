// A small entry point: the local ID and position readers only. Core's `graph.js` entry (`createGraphFromStore()`) imports
// it, so whatever bundles that entry (e.g. `api-graph`) does not get the rest of the activities core.
export { getLocalIdFromActivity } from './LocalId';
export { getPositionFromActivity } from './Position';
