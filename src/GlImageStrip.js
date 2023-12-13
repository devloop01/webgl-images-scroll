import { Group } from "three";
import { GlImage } from "./GlImage";

export class GlImagesStrip {
  constructor({
    parentElement,
    domImages,
    geometry,
    scene,
    screen,
    viewport,
    parentHeight,
    scrollDirection,
    offsetX,
  }) {
    this.parentElement = parentElement;
    this.domImages = [...this.parentElement.querySelectorAll("img")];

    this.geometry = geometry;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;

    this.parentHeight = parentHeight;
    this.scrollDirection = scrollDirection;
    this.offsetX = offsetX;

    this.scrollY = 0;

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
    this.glStrip.position.x = this.offsetX;
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

  onScroll(scrollEvent) {
    const vel = scrollEvent.velocity;
    this.scrollY += vel * this.scrollDirection;
    const dir = scrollEvent.direction * this.scrollDirection;

    if (this.glImages) {
      this.glImages.forEach((glImage) => glImage.update(this.scrollY, vel, dir));
    }
  }
}
