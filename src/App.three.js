import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  PlaneGeometry,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  Mesh,
  LinearFilter,
} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import Lenis from "@studio-freight/lenis";
import { radToDeg } from "./utils";
import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";

const imagesUrls = [
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
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.initialized = false;

    this.glImages = [];

    this.rafId = 0;

    this.init();
  }

  init() {
    this.initSmoothScroll();
    this.initDomImages();
    this.initGl();
    this.addEventListeners();

    this.render();

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  initSmoothScroll() {
    this.lenis = new Lenis({
      smoothTouch: true,
      // infinite: true,
    });
  }

  initDomImages() {
    const imagesContainer = document.querySelector(".images");

    // [...imagesUrls].map((url) => {
    //   imagesContainer.innerHTML += /* html */ `
    //     <div class="image__wrapper">
    //       <img src="${url}" />
    //     </div>
    //   `;
    // });

    this.domImages = [...imagesContainer.querySelectorAll("img")];
  }

  initGl() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setClearColor(0xffffff, 1);

    const z = 100;
    const fov = this._calculateFov(this.dimensions.height, z);
    this.camera = new PerspectiveCamera(
      fov,
      this.dimensions.width / this.dimensions.height,
      0.1,
      1000
    );
    this.camera.position.z = z;

    this.scene = new Scene();

    this.onResize();

    setTimeout(() => {
      this.createGlImages();
    }, 100);
  }

  _calculateFov(height, camZ) {
    return 2 * radToDeg(Math.atan(height / 2 / camZ));
  }

  createGlImages() {
    const planeGeo = new PlaneGeometry(1, 1, 32, 32);
    const planeMat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
    });

    const loader = new TextureLoader();

    this.domImages.map((image, index) => {
      const { width, height, top, left } = image.getBoundingClientRect();

      // const width = Math.min(this.dimensions.width * 0.8, 420);
      // const height = width * 1.35;

      const mat = planeMat.clone();
      mat.uniforms = {
        uTexture: { value: 0 },
        uPlaneSize: { value: new Vector2(width, height) },
        uTextureSize: { value: new Vector2(0, 0) },
        uVelo: { value: 0 },
        uScale: { value: 1 },
      };

      loader.load(image.src, (texture) => {
        texture.minFilter = LinearFilter;
        texture.generateMipmaps = false;

        mat.uniforms.uTexture.value = texture;
        mat.uniforms.uTextureSize.value.set(
          texture.image.naturalWidth,
          texture.image.naturalHeight
        );
      });

      const mesh = new Mesh(planeGeo, mat);

      mesh.scale.set(width, height, 1);

      mesh.position.x = left - this.dimensions.width / 2 + width / 2;
      mesh.position.y = -top + this.dimensions.height / 2 - height / 2;

      // mesh.position.y += -height * index * 1.05;

      this.scene.add(mesh);

      this.glImages.push(mesh);
    });
  }

  render() {
    const raf = (time) => {
      this.lenis.raf(time);

      this.rafId = requestAnimationFrame(raf);

      this.stats.update();
      this.renderer.render(this.scene, this.camera);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  onResize() {
    this.dimensions.width = window.innerWidth;
    this.dimensions.height = window.innerHeight;

    this.renderer.setSize(this.dimensions.width, this.dimensions.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = this.dimensions.width / this.dimensions.height;
    this.camera.updateProjectionMatrix();
  }

  onScroll(scrollEvent) {
    this.glImages.forEach((image) => {
      image.position.y += scrollEvent.velocity;

      const maxVel = Math.min(Math.abs(scrollEvent.velocity), 50) * scrollEvent.direction;

      image.material.uniforms.uVelo.value = maxVel * 0.02;
      image.material.uniforms.uScale.value = 1 - Math.abs(maxVel * 0.001);
    });
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    this.lenis.on("scroll", this.onScroll.bind(this));
  }
}
