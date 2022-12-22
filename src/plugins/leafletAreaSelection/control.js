import { DomUtil, Control, Util, Point, Browser } from 'leaflet';
import { createPane, removeEndClickArea, PANE_NAME } from './drawing-pane';
import { cls, setPosition } from './utils';
import {
  onActivate,
  onAddMarker,
  onAddPoint,
  onDraggingRectEnd,
  onMouseMove,
  onPolygonCreationEnd,
  onRemoveMarker,
  onUpdateGhostPoints,
  onUpdatePolygon,
} from './events';

// import buttonImage from './images/area-icon.png';

export const DrawAreaSelection = Control.extend({
  options: {
    // activate automatically area selection on plugin load
    active: false,
    // partially fade the map when draw phase is activated
    fadeOnActivation: true,
    /* ******* callbacks ******* */
    // callback called when draw phase is complete and at every polygon adjustement
    onPolygonReady: (polygon, control) => {},
    // callback called when draw phase is complete and double-click is performed on the final polygon
    onPolygonDblClick: (polygon, control, event) => {},
    // callback called when user press the activation button
    onButtonActivate: (control, event) => {},
    // callback called when user press the button to deactivate (not called when the plugin deactivate itself automatically)
    onButtonDeactivate: (polygon, control, event) => {},
  },

  initialize: function (options = {}) {
    Util.setOptions(this, options);
    this._map = null;
    // lifecycle phases: one of inactive, draw, adjust
    this.phase = options.active ? 'draw' : 'inactive';
    this.mapMoving = false;
    // map if in phase of drawing a rectangle
    this.rectDrawing = false;
    // where user started to draw a rect
    this.rectDrawStart = null;
    this.rectDrawEnd = null;
    // the dragging rect, composed by two lines
    this.draggingRect = null;
    // edge markers used for drawing, next dragging the polygon
    this.markers = [];
    // fake markers used for adding rings to the polygon
    this.ghostMarkers = [];
    // The actual polygon draw
    this.polygon = null;
    // on drawing phase: a line from the last drawn point to the first ones
    this.closeLine = null;

    this._mapMoveStart = this._mapMoveStart.bind(this);
    this._mapMoveEnd = this._mapMoveEnd.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
  },

  onAdd: function (map) {
    this._container = DomUtil.create('div', cls('leaflet-area-selector-control'));
    this.activateButton = DomUtil.create('button', '', this._container);
    // this.activateButton.style.backgroundImage = `url('${buttonImage}')`;
    this.activateButton.setAttribute('aria-label', 'Draw shape');
    this.activateButton.setAttribute('aria-describedby', 'draw-panel-help');
    this.activateButton.addEventListener('click', onActivate.bind(this));
    this.activateButton.addEventListener('dblclick', (event) => {
      event.stopPropagation();
    });
    this.options.active
      ? this.activateButton.classList.add('active')
      : this.activateButton.classList.remove('active');
    this._map = map;
    const pane = createPane(map, this.options);
    this.addUserHelpPanel(pane);
    map.getContainer().addEventListener('mousemove', this._handleMouseMove);
    map.on('movestart', this._mapMoveStart);
    map.on('moveend', this._mapMoveEnd);
    map.on('as:point-add', onAddPoint.bind(this));
    map.on('as:marker-add', onAddMarker.bind(this));
    map.on('as:marker-remove', onRemoveMarker.bind(this));
    map.on('as:creation-end', onPolygonCreationEnd.bind(this));
    map.on('as:update-polygon', onUpdatePolygon.bind(this));
    map.on('as:update-ghost-points', onUpdateGhostPoints.bind(this));
    map.on('as:dragging-rect-end', onDraggingRectEnd.bind(this));
    return this._container;
  },

  onRemove: function (map) {
    map.getContainer().removeEventListener('mousemove', this._handleMouseMove);
    map.off('movestart', this._mapMoveStart);
    map.off('moveend', this._mapMoveEnd);
    map.off('as:point-add');
    map.off('as:marker-add');
    map.off('as:marker-remove');
    map.off('as:creation-end');
    map.off('as:update-polygon');
    map.off('as:update-ghost-points');
    map.off('as:dragging-rect-end');
  },

  getMap: function () {
    return this._map;
  },

  onPolygonReady: function () {
    this.options.onPolygonReady(this.polygon, this);
  },

  onPolygonDblClick: function (ev) {
    this.options.onPolygonDblClick(this.polygon, this, ev);
  },

  addUserHelpPanel(pane) {
    const panel = DomUtil.create('div', cls('draw-pane-help'));
    panel.setAttribute('id', 'draw-panel-help');
    panel.setAttribute('role', 'tooltip');
    const help = `Define a polygon by clicking of the map to define vertexes${
      Browser.mobile ? `.` : ` or click-and-drag to obtain a rectangular shape.`
    }`;
    panel.textContent = '';

    pane.appendChild(panel);
  },

  setPhase(phase, forceClear = false) {
    this.phase = phase;
    this.options.active = phase === 'draw';
    // If we didn't finished to fill a polygon, let's clear all
    if (forceClear || this.phase === 'draw') {
      this.clearGhostMarkers();
      this.clearMarkers();
      this.clearPolygon();
    }
    const pane = this._map.getPane(PANE_NAME);
    const container = pane.parentNode;
    this.options.active
      ? container.classList.remove('inactive')
      : container.classList.add('inactive');
  },

  _mapMoveStart: function () {
    if (!this.options.active) {
      return;
    }
    this.mapMoving = true;
  },

  _mapMoveEnd: function () {
    if (!this.options.active) {
      return;
    }
    const map = this._map;
    requestAnimationFrame(() => {
      this.mapMoving = false;
    });
    // Re-position end of selection HTML element
    const pane = map.getPane(PANE_NAME);
    const touchMarker = pane.querySelector('.end-selection-area');
    if (touchMarker) {
      const firstMarker = this.markers[0].marker;
      const bbox = touchMarker.getBoundingClientRect();
      const point = map.latLngToContainerPoint(firstMarker.getLatLng());
      setPosition(touchMarker, point, new Point(-bbox.width / 2, -bbox.height / 2));
    }
  },

  hoverClosePoint: function (event) {
    if (this.markers.length > 2 && this.closeLine) {
      this.closeLine.removeFrom(this._map);
    }
  },

  outClosePoint: function (event) {
    if (this.closeLine) {
      this.closeLine.addTo(this._map);
    }
  },

  clearMarkers: function () {
    this.markers.forEach(({ marker }) => {
      marker.removeFrom(this._map);
    });
    this.markers = [];
  },

  clearGhostMarkers: function () {
    this.ghostMarkers.forEach(({ marker }) => {
      marker.removeFrom(this._map);
    });
    this.ghostMarkers = [];
  },

  clearPolygon: function () {
    this.polygon && this.polygon.removeFrom(this._map);
    this.polygon = null;
    this.closeLine && this.closeLine.removeFrom(this._map);
    this.closeLine = null;
  },

  deactivate: function () {
    removeEndClickArea(this);
    this.activateButton.classList.remove('active');
    this._map.getContainer().classList.remove('drawing-area');
    this.setPhase('inactive', true);
	 this._map.dragging.enable();
  },

  activate: function () {
    // When activating the plugin we'll disable dragging temporarely (in case we are drawing a rect)
    this._map.dragging.disable();
    this.activateButton.classList.add('active');
    this._map.getContainer().classList.add('drawing-area');
    this.setPhase('draw', true);
  },

  _handleMouseMove: function (event) {
    if (!this.options.active) {
      return;
    }
    onMouseMove.bind(this)(event);
  },
});

export const drawAreaSelection = function (options = {}) {
  return new DrawAreaSelection(options);
};
