<template>
  <pinch-zoom
    class="pinch-zoom-parent"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </pinch-zoom>
</template>

<script src="./pinch_zoom.js"></script>
