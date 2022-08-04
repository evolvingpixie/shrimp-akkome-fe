<template>
  <div
    class="sticker-picker"
  >
    <tab-switcher
      class="tab-switcher"
      :render-only-focused="true"
      scrollable-tabs
    >
      <div
        v-for="stickerpack in pack"
        :key="stickerpack.path"
        :image-tooltip="stickerpack.meta.title"
        :image="stickerpack.path + stickerpack.meta.tabIcon"
        class="sticker-picker-content"
      >
        <div
          v-for="sticker in stickerpack.meta.stickers"
          :key="sticker"
          class="sticker"
          @click.stop.prevent="pick(stickerpack.path + sticker, stickerpack.meta.title)"
        >
          <img
            :src="stickerpack.path + sticker"
          >
        </div>
      </div>
    </tab-switcher>
  </div>
</template>

<script src="./sticker_picker.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.sticker-picker {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  left: 0;
  margin: 0 !important;
  background-color: $fallback--bg;
  background-color: var(--popover, $fallback--bg);
  color: $fallback--link;
  color: var(--popoverText, $fallback--link);
  --lightText: var(--popoverLightText, $fallback--faint);
  --faint: var(--popoverFaintText, $fallback--faint);
  --faintLink: var(--popoverFaintLink, $fallback--faint);
  --lightText: var(--popoverLightText, $fallback--lightText);
  --icon: var(--popoverIcon, $fallback--icon);

  .contents {
    min-height: 250px;
    .sticker-picker-content {
      display: flex;
      flex-wrap: wrap;
      padding: 0 4px;
      .sticker {
        display: flex;
        flex: 1 1 auto;
        margin: 4px;
        width: 56px;
        height: 56px;
        img {
          height: 100%;
          &:hover {
            filter: drop-shadow(0 0 5px var(--accent, $fallback--link));
          }
        }
      }
    }
  }
}

</style>
