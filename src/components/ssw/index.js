import { lazy } from 'react';

// Interactive figures that articles can place with a line like [[widget:ssw-heat-wall]].
export const WIDGETS = {
  'ssw-heat-wall': lazy(() => import('./HeatWall')),
  'ssw-rope-waves': lazy(() => import('./RopeWaves')),
  'ssw-explorer': lazy(() => import('./Explorer')),
};
