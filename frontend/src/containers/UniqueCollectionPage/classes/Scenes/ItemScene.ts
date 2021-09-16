import * as THREE from 'three';

import { UpdateInfo, CardItemProps, Bounds } from '../types';
import { InteractiveScene } from './InteractiveScene';
import { MouseMove } from '../Singletons/MouseMove';
import { CardItem3DAnimated } from '../Components/CardItem3DAnimated';
import { TextureItems } from '../types';

interface Constructor {
  camera: THREE.PerspectiveCamera;
  mouseMove: MouseMove;
}

export class ItemScene extends InteractiveScene {
  _planeGeometry = new THREE.PlaneGeometry(1, 1, 50, 50);
  _items3D: CardItem3DAnimated[] = [];
  _textureItems: TextureItems = {};
  _collectionWrapper: HTMLDivElement;
  _collectionWrapperRect: DOMRect;
  _imageWrapper: HTMLDivElement | null = null;
  _imageWrapperClientWidth = 1;
  _imageWrapperMarginRight = 1;

  constructor({ camera, mouseMove }: Constructor) {
    super({ camera, mouseMove });

    this._collectionWrapper = Array.from(
      document.querySelectorAll('[data-collection-wrapper="wrapper"]'),
    )[0] as HTMLDivElement;

    this._collectionWrapperRect = this._collectionWrapper.getBoundingClientRect();
  }

  _onItemClick = (e: THREE.Event) => {};

  _destroyItems() {
    this._items3D.forEach(item => {
      item.destroy();
      this.remove(item);
      item.removeEventListener('click', this._onItemClick);
    });
    this._items3D = [];
  }

  _onResize = () => {
    this._collectionWrapperRect = this._collectionWrapper.getBoundingClientRect();
    this._measureImageWrapper();
    if (this._items3D) {
      this._items3D.forEach(item => {
        item.onResize();
      });
    }
  };

  _addListeners() {
    super._addListeners();
    window.addEventListener('resize', this._onResize);
  }

  _removeListeners() {
    super._removeListeners();
    window.removeEventListener('resize', this._onResize);
  }

  _measureImageWrapper() {
    if (this._imageWrapper) {
      this._imageWrapperClientWidth = this._imageWrapper.clientWidth;
      const elStyle = getComputedStyle(this._imageWrapper);
      this._imageWrapperMarginRight = parseFloat(elStyle.marginRight);
    }
  }

  set items(items: CardItemProps[]) {
    this._destroyItems();

    items &&
      items.forEach((item, key) => {
        //Fetch elements DOM representations
        const domEl = Array.from(
          document.querySelectorAll(`[data-src="${item.item.image.url}"]`),
        )[0] as HTMLElement;

        if (!this._imageWrapper) {
          this._imageWrapper = domEl as HTMLDivElement;
          this._measureImageWrapper();
        }

        const item3D = new CardItem3DAnimated({
          geometry: this._planeGeometry,
          cardItem: item,
          domEl,
        });
        this._items3D.push(item3D);
        this.add(item3D);
      });

    this._items3D.forEach(item => {
      item.addEventListener('click', this._onItemClick);
    });
  }

  set rendererBounds(bounds: Bounds) {
    super.rendererBounds = bounds;

    this._items3D.forEach(item => {
      item.rendererBounds = this._rendererBounds;
    });
  }

  set textureItems(textureItems: TextureItems) {
    this._textureItems = textureItems;

    this._items3D.forEach(el => {
      el.textureItem = this._textureItems[el.cardItem.item.image.url];
    });
  }

  update(updateInfo: UpdateInfo) {
    super.update(updateInfo);
    this._items3D.forEach(item => {
      item.update(updateInfo);
    });
  }

  destroy() {
    super.destroy();
    this._destroyItems();
    this._planeGeometry.dispose();
  }
}