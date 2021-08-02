<template>
  <Modal
    v-if="showing"
    class="media-modal-view"
    @backdropClicked="hide"
  >
    <div class="modal-image-container">
      <PinchZoom
        options="pinchZoomOptions"
        class="modal-image-container-inner"
        selector=".modal-image"
        allow-pan-min-scale="1"
        min-scale="1"
        reset-to-min-scale-limit="1.2"
        reach-min-scale-strategy="reset"
        stop-propagate-handled="stop-propgate-handled"
        :inner-class="'modal-image-container-inner'"
      >
        <img
          v-if="type === 'image'"
          :class="{ loading }"
          class="modal-image"
          :src="currentMedia.url"
          :alt="currentMedia.description"
          :title="currentMedia.description"
          @load="onImageLoaded"
        >
      </PinchZoom>
    </div>
    <VideoAttachment
      v-if="type === 'video'"
      class="modal-image"
      :attachment="currentMedia"
      :controls="true"
    />
    <audio
      v-if="type === 'audio'"
      class="modal-image"
      :src="currentMedia.url"
      :alt="currentMedia.description"
      :title="currentMedia.description"
      controls
    />
    <Flash
      v-if="type === 'flash'"
      class="modal-image"
      :src="currentMedia.url"
      :alt="currentMedia.description"
      :title="currentMedia.description"
    />
    <button
      v-if="canNavigate"
      :title="$t('media_modal.previous')"
      class="modal-view-button-arrow modal-view-button-arrow--prev"
      @click.stop.prevent="goPrev"
    >
      <FAIcon
        class="arrow-icon"
        icon="chevron-left"
      />
    </button>
    <button
      v-if="canNavigate"
      :title="$t('media_modal.next')"
      class="modal-view-button-arrow modal-view-button-arrow--next"
      @click.stop.prevent="goNext"
    >
      <FAIcon
        class="arrow-icon"
        icon="chevron-right"
      />
    </button>
    <span
      v-if="description"
      class="description"
    >
      {{ description }}
    </span>
    <span
      class="counter"
    >
      {{ $tc('media_modal.counter', currentIndex + 1, { current: currentIndex + 1, total: media.length }) }}
    </span>
    <span
      v-if="loading"
      class="loading-spinner"
    >
      <FAIcon
        spin
        icon="circle-notch"
        size="5x"
      />
    </span>
  </Modal>
</template>

<script src="./media_modal.js"></script>

<style lang="scss">
.modal-view.media-modal-view {
  z-index: 1001;
  flex-direction: column;

  .modal-view-button-arrow {
    opacity: 0.75;

    &:focus,
    &:hover {
      outline: none;
      box-shadow: none;
    }

    &:hover {
      opacity: 1;
    }
  }
  overflow: hidden;
}

.media-modal-view {
  @keyframes media-fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

.modal-image-container {
  display: flex;
  overflow: hidden;
  align-items: center;
  flex-direction: column;
  max-width: 90%;
  max-height: 95%;
  flex-grow: 1;

  &-inner {
    width: 100%;
    height: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  min-width: 0;
  min-height: 0;
  box-shadow: 0px 5px 15px 0 rgba(0, 0, 0, 0.5);
  image-orientation: from-image; // NOTE: only FF supports this
  animation: 0.1s cubic-bezier(0.7, 0, 1, 0.6) media-fadein;
}

//.modal-image {
//  height: 90vh;
//  width: 100%;
//}

  .description,
  .counter {
    /* Hardcoded since background is also hardcoded */
    color: white;
    margin-top: 1em;
    text-shadow: 0 0 10px black, 0 0 10px black;
    padding: 0.2em 2em;
  }

  .description {
    flex: 0 0 auto;
    overflow-y: auto;
    min-height: 1em;
    max-width: 500px;
    max-height: 9.5em;
    word-break: break-all;
  }

  .modal-image {
    max-width: 90%;
    max-height: 90%;
    box-shadow: 0px 5px 15px 0 rgba(0, 0, 0, 0.5);
    image-orientation: from-image; // NOTE: only FF supports this
    animation: 0.1s cubic-bezier(0.7, 0, 1, 0.6) media-fadein;

    &.loading {
      opacity: 0.5;
    }
  }

  .loading-spinner {
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
      color: white;
    }
  }

  .modal-view-button-arrow {
    position: absolute;
    display: block;
    top: 50%;
    margin-top: -50px;
    width: 70px;
    height: 100px;
    border: 0;
    padding: 0;
    opacity: 0;
    box-shadow: none;
    background: none;
    appearance: none;
    overflow: visible;
    cursor: pointer;
    transition: opacity 333ms cubic-bezier(.4,0,.22,1);

    .arrow-icon {
      position: absolute;
      top: 35px;
      height: 30px;
      width: 32px;
      font-size: 14px;
      line-height: 30px;
      color: #FFF;
      text-align: center;
      background-color: rgba(0,0,0,.3);
    }

    &--prev {
      left: 0;
      .arrow-icon {
        left: 6px;
      }
    }

    &--next {
      right: 0;
      .arrow-icon {
        right: 6px;
      }
    }
  }
}
</style>
