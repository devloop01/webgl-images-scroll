<script lang="ts">
  // @ts-ignore
  import Tempus from "@studio-freight/tempus";
  import Lenis from "@studio-freight/lenis";
  import { onMount } from "svelte";
  import { Canvas } from "@threlte/core";
  import Scene from "./Scene.svelte";

  const imageUrls = [
    "/images/image-1.jpg",
    "/images/image-2.jpg",
    "/images/image-3.jpg",
    "/images/image-4.jpg",
    "/images/image-5.jpg",
    "/images/image-6.jpg",
    //
    "/images/image-1.jpg",
    "/images/image-2.jpg",
    "/images/image-3.jpg",
    "/images/image-4.jpg",
    "/images/image-5.jpg",
    "/images/image-6.jpg",
  ];

  let dimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  let lenis = new Lenis({
    smoothTouch: true,
  });

  let imageRefs: HTMLImageElement[] = [];

  function tick(time: number) {
    lenis.raf(time);
  }

  onMount(() => {
    const unsubRaf = Tempus.add(tick, 0);

    lenis.on("scroll", (e: any) => {
      console.log(e.velocity);
    });

    return () => {
      unsubRaf();
    };
  });
</script>

<svelte:window
  on:resize={(e) => {
    dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    // lenis.resize();
  }}
/>

<!-- images from: https://unsplash.com/@resourcedatabase -->
<div class="container">
  <div class="images">
    {#each imageUrls as url, index (`${url}-${index}`)}
      <div class="image__wrapper">
        <img src={url} alt="image {index}" bind:this={imageRefs[index]} />
      </div>
    {/each}
  </div>
</div>

<Canvas renderMode="on-demand" size={{ width: dimensions.width, height: dimensions.height }}>
  <Scene {dimensions} {imageRefs} />
</Canvas>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    padding-top: 25dvh;
  }

  .images {
    display: grid;
    /* grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); */
    /* grid-template-rows: repeat(6, 300px); */
    grid-gap: 1rem;
  }

  .image__wrapper {
    max-height: 600px;
    height: 50dvw;
    position: relative;
    display: flex;
    &:nth-child(even) {
      justify-content: end;
    }
  }

  img {
    width: auto;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    pointer-events: none;
  }

  :global(canvas[data-engine]) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
  }
</style>
