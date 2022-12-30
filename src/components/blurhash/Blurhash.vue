<template>
  <canvas
    ref="canvas"
    class="blurhash"
  />
</template>

<script>
import { decode } from "blurhash";

export default {
  name: 'Blurhash',
  props: {
    hash: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    punch: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      canvas: null,
      ctx: null,
    };
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1024;
    this.canvas.height = 512;
    this.draw();
  },
  methods: {
    draw() {
      const pixels = decode(this.hash, this.width, this.height, this.punch);
      const imageData = this.ctx.createImageData(this.width, this.height);
      imageData.data.set(pixels);
      this.ctx.putImageData(imageData, 0, 0);
      fetch("/static/blurhash-overlay.png")
        .then((response) => response.blob())
        .then((blob) => {
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          img.onload = () => {
            this.ctx.drawImage(img, 0, 0, this.width, this.height);
          };
        });
    },
  }
}
</script>

<style scoped>

</style>
