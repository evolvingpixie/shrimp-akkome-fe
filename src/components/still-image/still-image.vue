<template>
  <div
    ref="still-image"
    class="still-image"
    :class="{ animated: animated }"
    :style="style"
  >
    <div
      v-if="animated && imageTypeLabel"
      class="image-type-label">
        {{ imageTypeLabel }}
    </div>
    <canvas
      v-if="animated"
      ref="canvas"
    />
    <!-- NOTE: key is required to force to re-render img tag when src is changed -->
    <img
      ref="src"
      :key="src"
      :alt="alt"
      :title="alt"
      :src="src"
      :referrerpolicy="referrerpolicy"
      @load="onLoad"
      @error="onError"
    >
    <slot />
  </div>
</template>

<script src="./still-image.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.still-image {
  position: relative;
  line-height: 0;
  overflow: hidden;
  display: inline-flex;
  align-items: center;

  canvas {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    visibility: var(--_still-image-canvas-visibility, visible);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;

    &::before {
      line-height: 20px;
    }
  }

  .image-type-label {
    position: absolute;
    top: 0.25em;
    left: 0.25em;
    line-height: 1;
    font-size: 0.6em;
    background: rgba(127, 127, 127, 0.5);
    color: #fff;
    padding: 2px 4px;
    border-radius: var(--tooltipRadius, $fallback--tooltipRadius);
    z-index: 2;
    visibility: var(--_still-image-label-visibility, visible);
  }

  &.animated {
    &:hover canvas {
      display: none;
    }

    &:hover .image-type-label {
      visibility: var(--_still-image-label-visibility, hidden);
    }

    img {
      visibility: var(--_still-image-img-visibility, hidden);
    }

    &:hover img {
      visibility: visible;
    }
  }
}
</style>
