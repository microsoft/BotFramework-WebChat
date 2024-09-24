import { useContext } from 'react';
import ActivityListenerContext from './Context';

export default function useActivityListenerContext() {
  return useContext(ActivityListenerContext);
}
