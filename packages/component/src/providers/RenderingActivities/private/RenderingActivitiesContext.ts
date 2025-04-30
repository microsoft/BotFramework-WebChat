import createContextAndHook from '../../createContextAndHook';
import { type ActivityWithRenderer } from '../ActivityWithRenderer';

type RenderingActivitiesContextType = Readonly<{
  activitiesWithRenderer: readonly ActivityWithRenderer[];
  renderingActivityKeysState: readonly [readonly string[]];
}>;

const { contextComponentType, useContext } =
  createContextAndHook<RenderingActivitiesContextType>('RenderingActivitiesContext');

export default contextComponentType;
export { useContext as useRenderingActivitiesContext, type RenderingActivitiesContextType };
