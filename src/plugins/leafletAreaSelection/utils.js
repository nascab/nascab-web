import { Browser, DomUtil } from 'leaflet';
import styles from './styles.module.css';

export function toCamelCase(name) {
  return name
    .split('-')
    .map((s, index) => (index === 0 ? s : `${s[0].toUpperCase()}${s.substring(1)}`))
    .join('');
}

export function cls(name, additionalClasses = '') {
  const clsName = toCamelCase(name);
  if (styles[clsName]) {
    return additionalClasses
      ? `${styles[clsName]} ${name} ${additionalClasses}`
      : `${styles[clsName]} ${name}`;
  }
  // Fallback to just return name and maybe additional classes
  return additionalClasses ? `${name} ${additionalClasses}` : name;
}

export function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * Like original DomUtil.setPosition, but takes an optional offset
 * @param {DOMElement} el
 * @param {Point} point
 */
export function setPosition(el, point, offset = null) {
  const nextPoint = offset ? point.add(offset) : point;
  el._leaflet_pos = nextPoint;

  if (Browser.any3d) {
    DomUtil.setTransform(el, nextPoint);
  } else {
    el.style.left = nextPoint.x + 'px';
    el.style.top = nextPoint.y + 'px';
  }
}

export const CLICK_EVT = Browser.mobile ? 'touchend' : 'click';

// This still needed due to bad Leaflet bug on Safari. See https://github.com/Leaflet/Leaflet/issues/7255
export function isTrustedEvent(event) {
  return event.isTrusted || window.Cypress;
}
