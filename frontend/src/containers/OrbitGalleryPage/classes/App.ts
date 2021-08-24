import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

import { CreativeItem } from 'utils/types/strapi/CreativeItem';
import { GalleryItem3D } from './Components/GalleryItem3D';

import { MouseMove } from './Singletons/MouseMove';
import { Scroll } from './Singletons/Scroll';
import { GalleryScene } from './Scenes/GalleryScene';
import { Preloader } from './Singletons/Preloader';

export const DEFALUT_FPS = 60;
const DT_FPS = 1000 / DEFALUT_FPS;

export class App {
  _rendererWrapperEl: HTMLDivElement;
  _rafId: number | null = null;
  _isResumed = true;
  _lastFrameTime: number | null = null;
  _canvas: HTMLCanvasElement;
  _camera: THREE.PerspectiveCamera;
  _renderer: THREE.WebGLRenderer;
  _mouseMove = MouseMove.getInstance();
  _scroll = Scroll.getInstance();
  _preloader = new Preloader();
  _galleryScene: GalleryScene;

  constructor(rendererWrapperEl: HTMLDivElement, items: CreativeItem[]) {
    this._rendererWrapperEl = rendererWrapperEl;
    this._canvas = document.createElement('canvas');
    this._rendererWrapperEl.appendChild(this._canvas);
    this._camera = new THREE.PerspectiveCamera();

    this._renderer = new THREE.WebGLRenderer({
      canvas: this._canvas,
      antialias: true,
      alpha: true,
    });

    this._galleryScene = new GalleryScene({
      camera: this._camera,
      scroll: this._scroll,
      mouseMove: this._mouseMove,
    });

    this._galleryScene.items = Array.from(items).map((item, key) => {
      return { key, item };
    });

    this._onResize();
    this._addListeners();
    this._resumeAppFrame();

    this._preloader.images = items.map(item => {
      return item.image.url;
    });
  }

  _onResize = () => {
    const rendererBounds = this._rendererWrapperEl.getBoundingClientRect();
    const aspectRatio = rendererBounds.width / rendererBounds.height;
    this._camera.aspect = aspectRatio;

    //Set to match pixel size of the elements in three with pixel size of DOM elements
    this._camera.position.z = 50;
    this._camera.fov =
      2 *
      Math.atan(rendererBounds.height / 2 / this._camera.position.z) *
      (180 / Math.PI);

    this._renderer.setSize(rendererBounds.width, rendererBounds.height);
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._camera.updateProjectionMatrix();

    this._galleryScene.rendererBounds = rendererBounds;
  };

  _onVisibilityChange = () => {
    if (document.hidden) {
      this._stopAppFrame();
    } else {
      this._resumeAppFrame();
    }
  };

  _onAssetsLoaded = (e: THREE.Event) => {
    this._galleryScene.textureItems = (e.target as Preloader).textureItems;
  };

  _addListeners() {
    window.addEventListener('resize', this._onResize);
    window.addEventListener('visibilitychange', this._onVisibilityChange);
    this._preloader.addEventListener('loaded', this._onAssetsLoaded);
  }

  _removeListeners() {
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('visibilitychange', this._onVisibilityChange);
    this._preloader.removeEventListener('loaded', this._onAssetsLoaded);
  }

  _resumeAppFrame() {
    this._rafId = window.requestAnimationFrame(this._renderOnFrame);
    this._isResumed = true;
  }

  _renderOnFrame = (time: number) => {
    this._rafId = window.requestAnimationFrame(this._renderOnFrame);

    if (this._isResumed || !this._lastFrameTime) {
      this._lastFrameTime = window.performance.now();
      this._isResumed = false;
      return;
    }

    TWEEN.update(time);

    const delta = time - this._lastFrameTime;
    let slowDownFactor = delta / DT_FPS;

    //Rounded slowDown factor to the nearest integer reduces physics lags
    const slowDownFactorRounded = Math.round(slowDownFactor);

    if (slowDownFactorRounded >= 1) {
      slowDownFactor = slowDownFactorRounded;
    }
    this._lastFrameTime = time;

    this._mouseMove.update({ delta, slowDownFactor, time });
    this._scroll.update({ delta, slowDownFactor, time });
    this._galleryScene.update({ delta, slowDownFactor, time });

    this._renderer.render(this._galleryScene, this._camera);
  };

  _stopAppFrame() {
    if (this._rafId) {
      window.cancelAnimationFrame(this._rafId);
    }
  }

  setHoveredItem(item: GalleryItem3D | null) {
    if (this._galleryScene) {
      this._galleryScene.hoveredStoryItem = item;
    }
  }

  destroy() {
    if (this._canvas.parentNode) {
      this._canvas.parentNode.removeChild(this._canvas);
    }
    this._stopAppFrame();
    this._removeListeners();
  }
}
