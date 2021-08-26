import { EventDispatcher } from 'three';

import { ScrollValues, UpdateInfo, Bounds } from '../types';

interface Constructor {
  domEl: HTMLElement;
  scrollValues: ScrollValues;
}

export class InfinityScrollHtmlEl extends EventDispatcher {
  _elBounds: DOMRect | null = null;
  _parentBounds: DOMRect | null = null;
  _scrollValues: ScrollValues;
  _domEl: HTMLElement;
  _extra = 0;
  _rendererBounds: Bounds = { height: 100, width: 100 };

  constructor({ domEl, scrollValues }: Constructor) {
    super();

    this._scrollValues = scrollValues; //Passed as a reference obj for better performance
    this._domEl = domEl;
    this._updateSizes();
  }

  _updateSizes() {
    this._domEl.style.transform = ` translateX(${0}px)`;

    this._elBounds = this._domEl.getBoundingClientRect();

    if (this._domEl.parentElement) {
      this._parentBounds = this._domEl.parentElement?.getBoundingClientRect();
    }
  }

  set rendererBounds(bounds: Bounds) {
    this._rendererBounds = bounds;
    this._extra = 0;
    this._updateSizes();
  }

  update(updateInfo: UpdateInfo) {
    if (this._parentBounds && this._elBounds) {
      const newTranslate = this._scrollValues.current.y * 1.2;
      const positionY = this._elBounds.y;
      const height = this._elBounds.height;
      const wrapperHeight = this._parentBounds.height;

      this._domEl.style.transform = ` translateX(${
        newTranslate + this._extra
      }px)`;

      if (this._scrollValues.direction.y === 'up') {
        const y = positionY + height - newTranslate - this._extra;
        if (y < 0) {
          this._extra -= wrapperHeight;
        }
      } else if (this._scrollValues.direction.y === 'down') {
        const y = positionY + height - newTranslate - this._extra;

        if (y > this._rendererBounds.height + height) {
          this._extra += wrapperHeight;
        }
      }
    }
  }
}