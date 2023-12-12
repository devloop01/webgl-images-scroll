import { WebGLRenderer, PerspectiveCamera, Scene, PlaneGeometry } from "three";
import Stats from "stats-gl";
import Lenis from "@studio-freight/lenis";
import { GlImage } from "./GlImage";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// images from: https://unsplash.com/@resourcedatabase

export class App {
  constructor({ canvas }) {
    this.canvas = canvas;

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.domImages = [...document.querySelectorAll(".images img")];
    this.imagesParent = document.querySelector(".images");

    this.scrollY = 0;
    this.rafId = 0;

    this.stats = new Stats({ minimal: true });
    document.body.appendChild(this.stats.dom);

    this.initSmoothScroll();
    this.initGl();
    this.onResize();
    this.createGlImages();
    this.addEventListeners();
    this.render();
  }

  initSmoothScroll() {
    this.lenis = new Lenis({
      smoothTouch: true,
      infinite: true,
    });
  }

  initGl() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setClearColor(0xffffff, 1);

    this.camera = new PerspectiveCamera(45, this.screen.width / this.screen.height, 0.1, 1000);
    this.camera.position.z = 10;

    this.scene = new Scene();
  }

  createGlImages() {
    const planeGeometry = new PlaneGeometry(1, 1, 32, 32);

    sleep(1000).then(() => {
      console.log("gl images");
      this.glImages = this.domImages.map((element) => {
        return new GlImage({
          element,
          geometry: planeGeometry,
          scene: this.scene,
          screen: this.screen,
          viewport: this.viewport,
          parentHeight: this.imagesParentHeight,
        });
      });
    });
  }

  render() {
    this.stats.init(this.renderer);

    const raf = (time) => {
      this.lenis.raf(time);
      this.rafId = requestAnimationFrame(raf);

      this.renderer.render(this.scene, this.camera);
      this.stats.update();
    };

    this.rafId = requestAnimationFrame(raf);
  }

  onResize() {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    this.calculateViewport();

    const parentBounds = this.imagesParent.getBoundingClientRect();
    this.imagesParentHeight = (this.viewport.height * parentBounds.height) / this.screen.height;

    if (this.glImages) {
      this.glImages.forEach((glImage) =>
        glImage.onResize({
          screen: this.screen,
          viewport: this.viewport,
          parentHeight: this.imagesParentHeight,
        })
      );
    }
  }

  onScroll(scrollEvent) {
    const vel = scrollEvent.velocity;
    this.scrollY += vel;

    if (this.glImages) {
      this.glImages.forEach((glImage) => glImage.update(this.scrollY, vel, scrollEvent.direction));
    }
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    this.lenis.on("scroll", this.onScroll.bind(this));
  }

  calculateViewport() {
    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      height,
      width,
    };
  }
}
