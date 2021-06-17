<template>
  <div
    class="Gallery"
    ref="galleryContainer"
    :class="{ '-long': tooManyAttachments && hidingLong  }"
  >
    <div class="gallery-rows">
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="gallery-row"
        :style="rowStyle(row)"
        :class="{ '-audio': row.audio, '-minimal': row.minimal }"
      >
        <div class="gallery-row-inner">
          <attachment
            v-for="attachment in row.items"
            class="gallery-item"
            :key="attachment.id"
            :nsfw="nsfw"
            :attachment="attachment"
            :allow-play="false"
            :size="size"
            :editable="editable"
            :remove="removeAttachment"
            :edit="editAttachment"
            :description="descriptions && descriptions[attachment.id]"
            :hideDescription="tooManyAttachments && hidingLong"
            :style="itemStyle(attachment.id, row.items)"
            @setMedia="onMedia"
            @naturalSizeLoad="onNaturalSizeLoad"
          />
        </div>
      </div>
    </div>
    <div
      v-if="tooManyAttachments"
      class="many-attachments"
    >
      <div class="many-attachments-text">
        {{ $t("status.many_attachments", { number: attachments.length })}}
      </div>
      <div class="many-attachments-buttons">
        <span
          v-if="!hidingLong"
          class="many-attachments-button"
        >
          <button
            class="button-unstyled -link"
            @click="toggleHidingLong(true)"
          >
            {{ $t("status.collapse_attachments") }}
          </button>
        </span>
        <span
          v-if="hidingLong"
          class="many-attachments-button"
        >
          <button
            class="button-unstyled -link"
            @click="toggleHidingLong(false)"
          >
            {{ $t("status.show_all_attachments") }}
          </button>
        </span>
        <span
          class="many-attachments-button"
          v-if="hidingLong"
        >
          <button
            class="button-unstyled -link"
            @click="openGallery"
          >
            {{ $t("status.open_gallery") }}
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script src='./gallery.js'></script>

<style lang="scss">
@import '../../_variables.scss';

.Gallery {
  .gallery-rows {
    display: flex;
    flex-direction: column;
  }

  .gallery-row {
    position: relative;
    height: 0;
    width: 100%;
    flex-grow: 1;
    margin-top: 0.5em;
  }

  &.-long {
    .gallery-rows {
      max-height: 25em;
      overflow: hidden;
      mask:
        linear-gradient(to top, white, transparent) bottom/100% 70px no-repeat,
        linear-gradient(to top, white, white);

      /* Autoprefixed seem to ignore this one, and also syntax is different */
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
  }

  .many-attachments-text {
    text-align: center;
    line-height: 2;
  }

  .many-attachments-buttons {
    display: flex;
  }

  .many-attachments-button {
    display: flex;
    flex: 1;
    justify-content: center;
    line-height: 2;

    button {
      padding: 0 2em;
    }
  }

  .gallery-row {

    &.-minimal {
      height: auto;

      .gallery-row-inner {
        position: relative;
      }
    }
  }

  .gallery-row-inner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: stretch;
  }

  .gallery-item {
    margin: 0 0.5em 0 0;
    flex-grow: 1;
    height: 100%;
    box-sizing: border-box;
    // to make failed images a bit more noticeable on chromium
    min-width: 2em;
    &:last-child {
      margin: 0;
    }
  }
}
</style>
