import { DivIcon, Marker, Point, Polygon, Polyline, DomEvent, LayerGroup } from 'leaflet';
import { cls, isTrustedEvent, CLICK_EVT } from './utils';
import { addEndClickArea, removeEndClickArea } from './drawing-pane';

function doNothingHandler(event) {
  event.originalEvent.preventDefault();
  event.originalEvent.stopPropagation();
}

/**
 * Event handler reacting to an add point action
 * @param {MouseEvent|TouchEvent} event
 */
export function onAddPoint(event) {
  // Default behavior while dragging
  if (this.mapMoving) {
    return;
  }
  const map = this.getMap();
  let { clientX, clientY } = event;
  // Touch device
  if (clientX === undefined && clientY === undefined) {
    const touch = event.changedTouches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  }
  // We were drawing a rect, so we don't perform the canonical action and we stop here
  if (this.rectDrawing && this.rectDrawEnd !== null) {
    map.fire('as:dragging-rect-end');
    return;
  }

  const { index = null } = event;
  const container = map.getContainer();
  const bbox = container.getBoundingClientRect();
  const x = clientX - bbox.left;
  const y = clientY - bbox.top;
  if (this.markers.length === 0) {
    // this is the first point: let's add a sensible click area on the pane too
    addEndClickArea(this, [x, y]);
  }
  const point = new Point(x, y);
  const icon = new DivIcon({
    className: cls('area-select-marker'),
    iconSize: [16, 16],
  });
  const marker = new Marker(map.containerPointToLatLng(point), {
    icon,
    draggable: true,
  });
  const _onMarkerDrag = onMarkerDrag.bind(this);
  marker.on('drag', _onMarkerDrag(index === null ? this.markers.length : index));
  marker.on('dragstart', (event) => {
    event.target.getElement().classList.add('active');
  });
  marker.on('dragend', (event) => {
    event.target.getElement().classList.remove('active');
    requestAnimationFrame(() => {
      this.onPolygonReady();
    });
  });
  const newEdge = {
    marker,
    index,
  };
  marker.on(
    'dblclick',
    ((length) => (event) => {
      event.originalEvent.stopPropagation();
      map.fire('as:marker-remove', {
        ...newEdge,
        index: index === null ? length : index,
      });
    })(this.markers.length)
  );
  marker.on(CLICK_EVT, doNothingHandler);
  marker.addTo(map);
  map.fire('as:marker-add', newEdge);
  // If this point as not been added at the end, we need to update even handlers HOC params to update index
  if (index !== null) {
    for (let i = index + 1; i < this.markers.length; i++) {
      this.markers[i].marker.off('drag');
      this.markers[i].marker.on('drag', _onMarkerDrag(i));
      this.markers[i].marker.off(CLICK_EVT);
      this.markers[i].marker.on(CLICK_EVT, doNothingHandler);
      this.markers[i].marker.off('dblclick');
      this.markers[i].marker.on('dblclick', (event) => {
        map.fire('as:marker-remove', {
          ...this.markers[i],
          index: i,
        });
      });
    }
  }
}

export function onAddMarker({ index = null, ...rest }) {
  const map = this.getMap();
  const edge = {
    marker: rest.marker,
  };
  const { markers } = this;
  if (index === null) {
    markers.push(edge);
  } else {
    markers.splice(index, 0, edge);
  }
  const enoughPoints = markers.length >= 3;
  if (this.phase === 'draw') {
    if (!enoughPoints) {
      markers.forEach(({ marker }) => {
        const icon = marker.getIcon();
        icon.options.className = cls('area-select-marker', 'invalid');
        marker.setIcon(icon);
      });
    } else if (markers.length === 3) {
      // Restore colors
      markers.forEach(({ marker }, index) => {
        const icon = marker.getIcon();
        icon.options.className = cls('area-select-marker', index === 0 ? 'start-marker' : null);
        marker.setIcon(icon);
      });
    }
  }
  map.fire('as:update-polygon');
  if (this.phase === 'adjust') {
    map.fire('as:update-ghost-points');
    this.onPolygonReady();
  }

  if (this.phase === 'draw') {
    // close line
    if (this.closeLine) {
      map.removeLayer(this.closeLine);
    }
    if (enoughPoints) {
      this.closeLine = new Polyline(
        [markers[0].marker.getLatLng(), markers[markers.length - 1].marker.getLatLng()],
        {
          weight: 3,
          color: '#c0c0c0',
          className: 'areaCloseLine',
        }
      );
      map.addLayer(this.closeLine);
    }
  }
}

export function onRemoveMarker({ index = 0 }) {
  const map = this.getMap();
  const { markers } = this;
  const enoughPoints = markers.length > 3;
  if (!enoughPoints) {
    return;
  }
  const removed = this.markers.splice(index || 0, 1);
  removed[0].marker.removeFrom(map);
  map.fire('as:update-polygon');
  if (this.phase === 'adjust') {
    map.fire('as:update-ghost-points');
  }
  for (let i = index; i < this.markers.length; i++) {
    this.markers[i].marker.off('drag');
    this.markers[i].marker.on('drag', onMarkerDrag.bind(this)(i));
    this.markers[i].marker.off(CLICK_EVT);
    this.markers[i].marker.on(CLICK_EVT, doNothingHandler);
    this.markers[i].marker.off('dblclick');
    this.markers[i].marker.on('dblclick', (event) => {
      event.originalEvent.stopPropagation();
      map.fire('as:marker-remove', {
        ...this.markers[i],
        index: i,
      });
    });
  }
  this.onPolygonReady();
}

/**
 * Refresh the polygon on the map
 */
export function onUpdatePolygon() {
  const map = this.getMap();
  const { markers } = this;
  const enoughPoints = markers.length >= 3;
  const polygon = new Polygon(
    markers.map(({ marker }) => {
      return marker.getLatLng();
      // return map.containerPointToLatLng(point);
    }),
    {
      color: enoughPoints ? 'rgb(45, 123, 200)' : 'rgba(220, 53, 69, 0.7)',
      weight: 2,
      ...(!enoughPoints && { dashArray: '5, 10' }),
      className: 'drawing-area-poligon',
    }
  );
  polygon.on(CLICK_EVT, (ev) => {
    DomEvent.stopPropagation(ev);
  });

  polygon.on('dblclick', (ev) => {
    // Preventing zoom-on-doubleclick is not working. I'll leave hacky workarounds to user's implementation
    // See https://stackoverflow.com/questions/15406537/disable-map-zoom-on-circlemarker-double-click-in-leaflet
    DomEvent.stopPropagation(ev);
    this.onPolygonDblClick(ev);
    return false;
  });
  if (this.polygon) {
    map.removeLayer(this.polygon);
  }
  this.polygon = polygon;
  map.addLayer(this.polygon);
}

export function onUpdateGhostPoints() {
  const map = this.getMap();
  requestAnimationFrame(() => {
    this.clearGhostMarkers();
    const { markers, ghostMarkers } = this;
    markers.forEach((currentMarker, index) => {
      const nextMarker = markers[index + 1] ? markers[index + 1] : markers[0];
      const currentLatLng = currentMarker.marker.getLatLng();
      const nextLatLng = nextMarker.marker.getLatLng();
      const point = map.latLngToContainerPoint([
        (currentLatLng.lat + nextLatLng.lat) / 2,
        (currentLatLng.lng + nextLatLng.lng) / 2,
      ]);

      const icon = new DivIcon({
        className: cls('area-select-ghost-marker'),
        iconSize: [16, 16],
      });
      const marker = new Marker(map.containerPointToLatLng(point), {
        icon,
        draggable: true,
      });
      const newGhostMarker = {
        marker,
      };
      marker.on(CLICK_EVT, doNothingHandler);
      marker.on('dblclick', doNothingHandler);
      marker.on('dragstart', onGhostMarkerDragStart.bind(this)());
      marker.on('drag', onGhostMarkerDrag.bind(this)(ghostMarkers.length));
      marker.on('dragend', onGhostMarkerDragEnd.bind(this)(ghostMarkers.length));
      ghostMarkers.push(newGhostMarker);
      marker.addTo(map);
    });
  });
}

export function onPolygonCreationEnd() {
  const map = this.getMap();
  // We'll forcly enable the drag on the map (which will be just of the draw pane)
  map.dragging.enable();
  map.removeLayer(this.closeLine);
  this.closeLine = null;
  // Remove style for the final marker icon
  this.markers[0].marker.getElement().classList.remove('start-marker');
  this.setPhase('adjust');
  map.fire('as:update-ghost-points');
  this.onPolygonReady();
  removeEndClickArea(this);
}

/**
 * Plugin activation (button pressed)
 */
export function onActivate(event) {
  // Non-sense, but required on Safari. Probably related to https://github.com/Leaflet/Leaflet/issues/7255
  if (!isTrustedEvent(event)) {
    return;
  }
  const map = this.getMap();
  // storing if the dragging is enabled in the map
  this._dragStatus = map.dragging._enabled;

  // Let leave to custom callback any call to preventDefault, which will block normal button behaviors
  // event.preventDefault();
  event.stopPropagation();
  event.target.blur();
  // if current state is active, we need to deactivate
  const activeState = this.options.active || this.phase === 'adjust';
  if (activeState) {
    // Disable dragging if it was enabled before the activation
    if (!this._dragStatus) {
      map.dragging.disable();
    }

    // Calling user's specific event handler
    this.options.onButtonDeactivate(this.polygon, this, event);
    if (!event.defaultPrevented) {
      this.deactivate();
    }
  } else {
    // Calling user's specific event handler
    this.options.onButtonActivate(this, event);
    if (!event.defaultPrevented) {
      this.activate();
    }
  }
}

export function onMarkerDrag(index) {
  const map = this.getMap();
  return (event) => {
    requestAnimationFrame(() => {
      map.fire('as:update-polygon');
      map.fire('as:update-ghost-points');
    });
  };
}

export function onGhostMarkerDrag(index) {
  const map = this.getMap();
  return (event) => {
    const { latlng } = event;
    requestAnimationFrame(() => {
      // Given a ghost point, markers to be used as edges are the one at +0 and +1
      const firstPoint = this.markers[index];
      const lastPoint = this.markers[index + 1] ? this.markers[index + 1] : this.markers[0];
      if (this.ghostPolygon) {
        map.removeLayer(this.ghostPolygon);
      }
      this.ghostPolygon = new Polygon(
        [firstPoint.marker.getLatLng(), latlng, lastPoint.marker.getLatLng()],
        {
          color: 'rgb(45, 123, 200)',
          weight: 2,
          opacity: 0.5,
          fillOpacity: 0.1,
          dashArray: '5, 10',
        }
      );
      map.addLayer(this.ghostPolygon);
      map.fire('as:update-polygon');
    });
  };
}

export function onGhostMarkerDragStart() {
  return (event) => {
    event.target.getElement().classList.add('active');
  };
}

export function onGhostMarkerDragEnd(index) {
  const map = this.getMap();
  return (event) => {
    const { target } = event;
    target.getElement().classList.remove('active');
    target.removeFrom(map);
    if (this.ghostPolygon) {
      map.removeLayer(this.ghostPolygon);
    }
    const newPoint = map.latLngToContainerPoint(target.getLatLng());
    const container = map.getContainer();
    const bbox = container.getBoundingClientRect();
    const fakeEvent = {
      clientX: newPoint.x + bbox.left,
      clientY: newPoint.y + bbox.top,
      index: index + 1,
    };
    map.fire('as:point-add', fakeEvent);
  };
}

export function onMouseMove(event) {
  if (!this.mapMoving && this.markers.length === 0 && event.which !== 0 && event.buttons === 1) {
    const map = this.getMap();
    if (!this.rectDrawing) {
      this.rectDrawStart = [event.clientX, event.clientY];
      const props = {
        weight: 2,
        color: '#8B4513',
        className: 'rect-progress-line',
        opacity: 0.6,
      };
      this.draggingRect = new LayerGroup()
        .addLayer(new Polyline([], props))
        .addLayer(new Polyline([], props))
        .addTo(map);
      this.rectDrawing = true;
      return;
    }
    this.rectDrawEnd = [event.clientX, event.clientY];
    const pointA = [this.rectDrawStart[0], event.clientY];
    const pointB = [event.clientX, this.rectDrawStart[1]];

    const layers = this.draggingRect.getLayers();
    layers[0].setLatLngs([
      map.mouseEventToLatLng({ clientX: this.rectDrawEnd[0], clientY: this.rectDrawEnd[1] }),
      map.mouseEventToLatLng({ clientX: pointA[0], clientY: pointA[1] }),
      map.mouseEventToLatLng({ clientX: this.rectDrawStart[0], clientY: this.rectDrawStart[1] }),
    ]);
    layers[1].setLatLngs([
      map.mouseEventToLatLng({ clientX: this.rectDrawEnd[0], clientY: this.rectDrawEnd[1] }),
      map.mouseEventToLatLng({ clientX: pointB[0], clientY: pointB[1] }),
      map.mouseEventToLatLng({ clientX: this.rectDrawStart[0], clientY: this.rectDrawStart[1] }),
    ]);
  }
}

export function onDraggingRectEnd() {
  this.rectDrawing = false;
  const vertex1 = { clientX: this.rectDrawStart[0], clientY: this.rectDrawStart[1] };
  const vertex2 = { clientX: this.rectDrawEnd[0], clientY: this.rectDrawStart[1] };
  const vertex3 = { clientX: this.rectDrawEnd[0], clientY: this.rectDrawEnd[1] };
  const vertex4 = { clientX: this.rectDrawStart[0], clientY: this.rectDrawEnd[1] };
  onAddPoint.bind(this)(vertex1);
  onAddPoint.bind(this)(vertex2);
  onAddPoint.bind(this)(vertex3);
  onAddPoint.bind(this)(vertex4);
  this._map.fire('as:creation-end');
  this.rectDrawStart = null;
  this.rectDrawEnd = null;
  this.draggingRect.removeFrom(this._map);
}
