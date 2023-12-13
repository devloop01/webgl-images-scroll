import { Group } from "three";
import { GlImage } from "./GlImage";

export class GlImagesStrip {
  constructor({ parentElement, geometry, scene, screen, viewport, parentHeight, scrollDirection }) {
    this.parentElement = parentElement;
    this.domImages = [...this.parentElement.querySelectorAll("img")];

    this.geometry = geometry;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;

    this.parentHeight = parentHeight;
    this.scrollDirection = scrollDirection;

    this.scrollY = 0;
    this.scrollSpeedOffset = 1 + Math.random() * 0.25;

    this.onResize();
    this.createGlImages();
  }

  createGlImages() {
    this.glStrip = new Group();

    this.glImages = this.domImages.map((element) => {
      return new GlImage({
        element,
        geometry: this.geometry,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        parentHeight: this.parentHeight,
      });
    });

    this.glStrip.add(...this.glImages.map((glImage) => glImage.mesh));
    this.scene.add(this.glStrip);
  }

  update(scrollEvent) {
    const vel = scrollEvent.velocity;
    this.scrollY += vel * this.scrollDirection * this.scrollSpeedOffset;
    const dir = (scrollEvent.direction || 0) * this.scrollDirection;

    if (this.glImages) {
      this.glImages.forEach((glImage) => glImage.update(this.scrollY, vel, dir));
    }
  }

  onResize({ screen, viewport } = {}) {
    const parentBounds = this.parentElement.getBoundingClientRect();
    this.parentHeight = (this.viewport.height * parentBounds.height) / this.screen.height;

    if (this.glImages) {
      this.glImages.forEach((glImage) =>
        glImage.onResize({ screen, viewport, parentHeight: this.parentHeight })
      );
    }
  }
}
