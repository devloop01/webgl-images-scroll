import { Renderer, Camera, Transform, Mesh, Plane, Program, TextureLoader, Vec2 } from "ogl";
import Lenis from "@studio-freight/lenis";
import { radToDeg } from "./utils";
import vertex from "./shaders/vertex.glsl?raw";
import fragment from "./shaders/fragment.glsl?raw";

export class App {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.initialized = false;

    this.domImages = [...document.querySelectorAll("img")];

    this.images = [];

    this.rafId = 0;

    this.init();
  }

  init() {
    this.initSmoothScroll();
    this.initOgl();
    this.addEventListeners();

    this.tick();
  }

  initSmoothScroll() {
    this.lenis = new Lenis({
      smoothTouch: true,
      // infinite: true,
    });
  }

  initOgl() {
    this.renderer = new Renderer({
      canvas: this.canvas,
      dpr: 2,
      antialias: true,
    });

    this.gl = this.renderer.gl;
    this.gl.clearColor(1, 1, 1, 1);

    const z = 100;
    const fov = this._calculateFov(this.dimensions.height, z);
    this.camera = new Camera(this.gl, { fov, far: 1000 });
    this.camera.position.z = z;

    this.scene = new Transform();

    this.onResize();
    this.createImages();
  }

  _calculateFov(height, camZ) {
    return 2 * radToDeg(Math.atan(height / 2 / camZ));
  }

  createImages() {
    const planeGeo = new Plane(this.gl, {
      width: 1,
      height: 1,
      widthSegments: 32,
      heightSegments: 32,
    });

    this.domImages.map((image, index) => {
      const { width, height, top, left } = image.getBoundingClientRect();

      const texture = TextureLoader.load(this.gl, {
        src: image.src,
        generateMipmaps: false,
      });

      const program = new Program(this.gl, {
        vertex,
        fragment,
        uniforms: {
          uTexture: { value: texture },
          uPlaneSize: { value: new Vec2(width, height) },
          uTextureSize: { value: new Vec2(image.naturalWidth, image.naturalHeight) },
          uVelo: { value: 0 },
          uScale: { value: 1 },
        },
      });

      const mesh = new Mesh(this.gl, {
        geometry: planeGeo,
        program,
      });

      mesh.scale.set(width, height, 1);

      mesh.position.x = left - this.dimensions.width / 2 + width / 2;
      mesh.position.y = -top + this.dimensions.height / 2 - height / 2;

      // mesh.position.y += -height * index * 1.05;

      console.log({ left, top }, { x: mesh.position.x, y: mesh.position.y });

      // mesh.position.y += window.scrollY;

      mesh.setParent(this.scene);

      this.images.push(mesh);
    });
  }

  tick() {
    const raf = (time) => {
      this.lenis.raf(time);

      this.rafId = requestAnimationFrame(raf);

      this.renderer.render({ scene: this.scene, camera: this.camera });
    };

    this.rafId = requestAnimationFrame(raf);
  }

  onResize() {
    this.dimensions.width = window.innerWidth;
    this.dimensions.height = window.innerHeight;

    this.renderer.setSize(this.dimensions.width, this.dimensions.height);
    this.camera.perspective({
      aspect: this.dimensions.width / this.dimensions.height,
    });
  }

  onScroll(scrollEvent) {
    this.images.forEach((image) => {
      image.position.y += scrollEvent.velocity;

      const maxVel = Math.min(Math.abs(scrollEvent.velocity), 50) * scrollEvent.direction;

      image.program.uniforms.uVelo.value = maxVel * 0.02;
      image.program.uniforms.uScale.value = 1 - Math.abs(maxVel * 0.001);
    });
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    this.lenis.on("scroll", this.onScroll.bind(this));
  }
}
