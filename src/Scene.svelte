<script lang="ts">
  import { TextureLoader } from "three";
  import { T, useLoader } from "@threlte/core";
  import { radToDeg } from "three/src/math/MathUtils.js";
  import vertexShader from "./shaders/vertex.glsl?raw";
  import fragmentShader from "./shaders/fragment.glsl?raw";

  export let imageRefs: HTMLImageElement[] = [];

  export let dimensions: { width: number; height: number };

  let z = 100;
  $: fov = 2 * radToDeg(Math.atan(dimensions.height / 2 / z));

  const loader = useLoader(TextureLoader);
</script>

<T.PerspectiveCamera makeDefault {fov} position.z={z} />

{#each imageRefs as domImage}
  {@const tex = loader.load(domImage.src)}
  {#await tex then texture}
    {@const { width, height, top, left } = domImage.getBoundingClientRect()}
    {@const xPos = left - dimensions.width / 2 + width / 2}
    {@const yPos = -top + dimensions.height / 2 - height / 2}
    <T.Mesh scale={[width, height, 1]} position={[xPos, yPos, 0]}>
      <T.PlaneGeometry args={[1, 1, 32, 32]} />
      <T.ShaderMaterial
        {vertexShader}
        {fragmentShader}
        uniforms={{
          uTexture: { value: texture },
          uPlaneSize: { value: [width, height] },
          uTextureSize: { value: [texture.image.naturalWidth, texture.image.naturalHeight] },
          uVelo: { value: 0 },
          uScale: { value: 1 },
        }}
      />
    </T.Mesh>
  {/await}
{/each}
