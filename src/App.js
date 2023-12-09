import Lenis from "@studio-freight/lenis";
import { Renderer, Camera, Transform, Mesh, Plane, Program, Texture } from "ogl";
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
    this.lenis = new Lenis();
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
    this.domImages.map((image) => {
      const { width, height, top, left } = image.getBoundingClientRect();

      const texture = new Texture(this.gl);

      const program = new Program(this.gl, {
        vertex,
        fragment,
        uniforms: {
          uTexture: { value: texture },
          uTextureAspect: { value: 1 },
          uPlaneAspect: { value: width / height },
        },
      });

      const img = new Image();
      img.src = image.src;

      img.onload = () => {
        texture.image = img;
        program.uniforms.uTextureAspect.value = img.naturalWidth / img.naturalHeight;
      };

      const mesh = new Mesh(this.gl, {
        geometry: new Plane(this.gl, { width, height }),
        program,
      });

      mesh.position.x = left - this.dimensions.width / 2 + width / 2;
      mesh.position.y = -top + this.dimensions.height / 2 - height / 2;

      mesh.setParent(this.scene);

      this.images.push(mesh);
    });

    const updatePosition = () => {
      this.images.forEach((image) => {
        image.position.y += window.scrollY;
      });

      window.removeEventListener("scroll", updatePosition);
    };

    window.addEventListener("scroll", updatePosition);
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
    });
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    this.lenis.on("scroll", this.onScroll.bind(this));
  }
}
