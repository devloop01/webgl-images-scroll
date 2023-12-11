<script lang="ts">
  import Lenis from "@studio-freight/lenis";
  import { onMount } from "svelte";

  const imagesUrls = [
    "/images/image-1.jpg",
    "/images/image-2.jpg",
    "/images/image-3.jpg",
    "/images/image-4.jpg",
    "/images/image-5.jpg",
    "/images/image-6.jpg",
  ];

  let rafId = 0;
  let lenis = new Lenis({
    smoothTouch: true,
  });

  onMount(() => {
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
    };
  });
</script>

<!-- images from: https://unsplash.com/@resourcedatabase -->

<div class="container">
  <div class="images">
    {#each imagesUrls as url, index}
      <div class="image__wrapper">
        <img src={url} alt="image {index}" />
      </div>
    {/each}
  </div>
</div>

<canvas class="webgl"></canvas>

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
    /* opacity: 0; */
    pointer-events: none;
  }

  canvas.webgl {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
  }
</style>
