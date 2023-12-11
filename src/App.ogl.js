import { Renderer, Camera, Transform, Mesh, Plane, Program, TextureLoader, Vec2 } from "ogl";
import Stats from "stats-gl";
import Lenis from "@studio-freight/lenis";
import { radToDeg } from "./utils";
import baseVertex from "./shaders/vertex.glsl?raw";
import fragment from "./shaders/fragment.glsl?raw";

const vertex = /*glsl*/ `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  ${baseVertex}
`;

export class App {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.initialized = false;

    this.domImages = [...document.querySelectorAll(".images img")];

    this.glImages = [];

    this.rafId = 0;

    this.init();
  }

  init() {
    this.stats = new Stats({ minimal: true });
    document.body.appendChild(this.stats.dom);

    this.initSmoothScroll();
    this.initOgl();
    this.addEventListeners();

    this.render();
  }

  initSmoothScroll() {
    this.lenis = new Lenis({
      smoothTouch: true,
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

    setTimeout(() => {
      this.createGlImages();
    }, 100);
  }

  _calculateFov(height, camZ) {
    return 2 * radToDeg(Math.atan(height / 2 / camZ));
  }

  createGlImages() {
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

      //   mesh.position.y += -height * index * 1.1;

      mesh.setParent(this.scene);

      this.glImages.push(mesh);
    });
  }

  render() {
    this.stats.init(this.gl);

    const raf = (time) => {
      this.lenis.raf(time);

      this.rafId = requestAnimationFrame(raf);

      this.renderer.render({ scene: this.scene, camera: this.camera });
      this.stats.update();
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
    this.glImages.forEach((image) => {
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
