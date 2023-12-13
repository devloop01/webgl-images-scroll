import { WebGLRenderer, PerspectiveCamera, Scene, PlaneGeometry } from "three";
import Stats from "stats-gl";
import Lenis from "@studio-freight/lenis";
import { GlImagesStrip } from "./GlImageStrip";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const shuffle = (array) => array.toSorted(() => Math.random() - 0.5);

// images from: https://unsplash.com/@resourcedatabase
const imageUrls = [
  "/images/image-1.jpg",
  "/images/image-2.jpg",
  "/images/image-3.jpg",
  "/images/image-4.jpg",
  "/images/image-5.jpg",
  "/images/image-6.jpg",
];

export class App {
  constructor({ canvas }) {
    this.canvas = canvas;

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.rafId = 0;

    this.stats = new Stats({ minimal: true });
    document.body.appendChild(this.stats.dom);

    sleep(import.meta.env.DEV ? 10 : 1000).then(() => {
      this.initSmoothScroll();
      this.initGl();
      this.onResize();
      this.createGlImageStrip();
      this.addEventListeners();
      this.render();
    });
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

  createGlImageStrip() {
    const planeGeometry = new PlaneGeometry(1, 1, 32, 32);

    this.glImagesStrip = [];

    const props = {
      geometry: planeGeometry,
      scene: this.scene,
      screen: this.screen,
      viewport: this.viewport,
    };

    const offsetX = 0;

    this.glImagesStrip.push(
      new GlImagesStrip({
        ...props,
        parentElement: document.querySelector(".images-strip-1"),
        scrollDirection: -1,
        offsetX: offsetX * -1,
      }),
      new GlImagesStrip({
        ...props,
        parentElement: document.querySelector(".images-strip-2"),
        scrollDirection: 1,
        offsetX: 0,
      }),
      new GlImagesStrip({
        ...props,
        parentElement: document.querySelector(".images-strip-3"),
        scrollDirection: -1,
        offsetX,
      })
    );
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

    if (this.glImagesStrip) {
      this.glImagesStrip.forEach((glImageStrip) =>
        glImageStrip.onResize({
          screen: this.screen,
          viewport: this.viewport,
        })
      );
    }
  }

  onScroll(scrollEvent) {
    if (this.glImagesStrip) {
      this.glImagesStrip.forEach((glImageStrip) => glImageStrip.onScroll(scrollEvent));
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
