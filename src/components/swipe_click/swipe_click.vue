<template>
  <div
    v-bind="$attrs"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @click="handleNativeClick"
  >
    <slot />
  </div>
</template>

<script src="./swipe_click.js"></script>
