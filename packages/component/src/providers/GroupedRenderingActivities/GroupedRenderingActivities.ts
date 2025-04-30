import { type ActivityWithRenderer } from '../RenderingActivities/ActivityWithRenderer';

type GroupedRenderingActivities = Readonly<{
  activitiesWithRenderer: readonly ActivityWithRenderer[];
  children: readonly GroupedRenderingActivities[];
  key: string;
  type: string | false;
}>;

export { type GroupedRenderingActivities };
