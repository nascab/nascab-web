import { DomUtil, Point } from 'leaflet';
import { cls, insertAfter, setPosition, CLICK_EVT, isTrustedEvent } from './utils';

export const PANE_NAME = 'area-draw-selection';

function drawingPaneContainer(options) {
  const { active, fadeOnActivation } = options;
  const drawPane = DomUtil.create(
    'div',
    cls(
      'leaflet-map-overlay-pane',
      `leaflet-pane${active ? '' : ' inactive'}${fadeOnActivation ? ' fading-enabled' : ''}`
    )
  );
  return drawPane;
}

export function createPane(map, options) {
  const standardPanesContainer = map.getContainer().querySelector('.leaflet-map-pane');
  const overlayPanesContainer = drawingPaneContainer(options);
  insertAfter(overlayPanesContainer, standardPanesContainer);
  const pane = map.createPane(PANE_NAME, overlayPanesContainer);
  const handler = (event) => {
    // Non-sense, but required on Safari. Probably related to https://github.com/Leaflet/Leaflet/issues/7255
    if (!isTrustedEvent(event)) {
      return;
    }
    event.stopPropagation();
    map.fire('as:point-add', event);
  };
  pane.addEventListener(CLICK_EVT, handler);
  return pane;
}

export function addEndClickArea(control, [x, y]) {
  const map = control.getMap();
  const pane = map.getPane(PANE_NAME);
  const marker = DomUtil.create('div', cls('end-selection-area'), pane);
  const bbox = marker.getBoundingClientRect();
  marker.setAttribute('role', 'button');
  const handler = (event) => {
    // Non-sense, but required on Safari. Probably related to https://github.com/Leaflet/Leaflet/issues/7255
    if (!isTrustedEvent(event)) {
      return;
    }
    event.stopPropagation();
    map.fire('as:creation-end');
  };
  marker.addEventListener(CLICK_EVT, handler, {
    once: true,
  });
  marker.addEventListener('mouseenter', control.hoverClosePoint.bind(control));
  marker.addEventListener('mouseleave', control.outClosePoint.bind(control));
  setPosition(marker, new Point(x, y), new Point(-bbox.width / 2, -bbox.height / 2));
}

export function removeEndClickArea(control) {
  const map = control.getMap();
  const pane = map.getPane(PANE_NAME);
  const marker = pane.querySelector('.end-selection-area');
  if (marker) {
    marker.remove();
  }
}
