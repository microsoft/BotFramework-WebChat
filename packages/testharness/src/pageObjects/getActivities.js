import { getState } from '../utils/createStore';

export default function getActivities() {
  return getState().activities;
}
