import { LinearFilter, Mesh, ShaderMaterial, TextureLoader } from "three";
import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";

const textureLoader = new TextureLoader();

const planeMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
});

export class GlImage {
  constructor({ element, geometry, scene, screen, viewport, parentHeight }) {
    this.element = element;
    this.image = element;

    this.geometry = geometry;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;

    this.parentHeight = parentHeight;

    this.offsetY = 0;

    this.init();
    this.createBounds();
    this.onResize();
  }

  init() {
    const material = planeMaterial.clone();

    material.uniforms = {
      uTexture: { value: 0 },
      uPlaneSize: { value: [0, 0] },
      uTextureSize: { value: [0, 0] },
      uVelo: { value: 0 },
      uScale: { value: 1 },
    };

    textureLoader.load(this.image.src, (texture) => {
      texture.minFilter = LinearFilter;
      texture.generateMipmaps = false;
      material.uniforms.uTexture.value = texture;

      material.uniforms.uTextureSize.value = [
        texture.image.naturalWidth,
        texture.image.naturalHeight,
      ];
    });

    this.mesh = new Mesh(this.geometry, material);
    // this.scene.add(this.mesh);
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();

    this.mesh.material.uniforms.uPlaneSize.value = [this.mesh.scale.x, this.mesh.scale.y];
  }

  updateScale() {
    this.mesh.scale.x = (this.viewport.width * this.bounds.width) / this.screen.width;
    this.mesh.scale.y = (this.viewport.height * this.bounds.height) / this.screen.height;
  }

  updateX(x = 0) {
    this.mesh.position.x =
      -(this.viewport.width / 2) +
      this.mesh.scale.x / 2 +
      ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
  }

  updateY(y = 0) {
    this.mesh.position.y =
      this.viewport.height / 2 -
      this.mesh.scale.y / 2 -
      ((this.bounds.top - y) / this.screen.height) * this.viewport.height -
      this.offsetY;
  }

  update(y, vel = 0, dir = 0) {
    this.updateScale();
    this.updateX();
    this.updateY(y);

    const maxVel = Math.min(Math.abs(vel), 15) * dir;
    this.mesh.material.uniforms.uVelo.value = maxVel * 0.02;
    this.mesh.material.uniforms.uScale.value = 1 - Math.abs(maxVel * 0.001);

    const meshOffset = this.mesh.scale.y / 2;
    const viewportOffset = this.viewport.height / 2;

    let isBefore = this.mesh.position.y + meshOffset < -viewportOffset;
    let isAfter = this.mesh.position.y - meshOffset > viewportOffset;

    // dir: -1 = up, 1 = down

    if (isBefore) {
      this.offsetY -= this.parentHeight;
      isBefore = false;
      isAfter = false;
    }

    if (isAfter) {
      this.offsetY += this.parentHeight;
      isBefore = false;
      isAfter = false;
    }
  }

  onResize({ screen, viewport, parentHeight } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;
    if (parentHeight) this.parentHeight = parentHeight;

    this.offsetY = 0;
    this.createBounds();
  }
}
