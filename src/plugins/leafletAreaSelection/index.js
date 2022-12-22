import { Util, Control } from 'leaflet';
import { DrawAreaSelection, drawAreaSelection } from './control';

Util.extend(Control, {
  DrawAreaSelection,
  drawAreaSelection,
});

export { DrawAreaSelection, drawAreaSelection };
