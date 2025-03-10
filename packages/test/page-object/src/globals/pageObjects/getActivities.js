import { getState } from '../testHelpers/createStore';

export default function getActivities() {
  return getState().activities;
}
