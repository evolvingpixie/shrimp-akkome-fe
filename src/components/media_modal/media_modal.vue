<template>
  <Modal
    v-if="showing"
    class="media-modal-view"
    @backdropClicked="hideIfNotSwiped"
  >
    <SwipeClick
      v-if="type === 'image'"
      ref="swipeClick"
      class="modal-image-container"
      :direction="swipeDirection"
      :threshold="swipeThreshold"
      @preview-requested="handleSwipePreview"
      @swipe-finished="handleSwipeEnd"
      @swipeless-clicked="hide"
    >
      <PinchZoom
        ref="pinchZoom"
        class="modal-image-container-inner"
        selector=".modal-image"
        reach-min-scale-strategy="reset"
        stop-propagate-handled="stop-propgate-handled"
        :allow-pan-min-scale="pinchZoomMinScale"
        :min-scale="pinchZoomMinScale"
        :reset-to-min-scale-limit="pinchZoomScaleResetLimit"
      >
        <img
          :class="{ loading }"
          class="modal-image"
          :src="currentMedia.url"
          :alt="currentMedia.description"
          :title="currentMedia.description"
          @load="onImageLoaded"
        >
      </PinchZoom>
    </SwipeClick>
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
      class="modal-view-button modal-view-button-arrow modal-view-button-arrow--prev"
      @click.stop.prevent="goPrev"
    >
      <FAIcon
        class="button-icon arrow-icon"
        icon="chevron-left"
      />
    </button>
    <button
      v-if="canNavigate"
      :title="$t('media_modal.next')"
      class="modal-view-button modal-view-button-arrow modal-view-button-arrow--next"
      @click.stop.prevent="goNext"
    >
      <FAIcon
        class="button-icon arrow-icon"
        icon="chevron-right"
      />
    </button>
    <button
      class="modal-view-button modal-view-button-hide"
      :title="$t('media_modal.hide')"
      @click.stop.prevent="hide"
    >
      <FAIcon
        class="button-icon"
        icon="times"
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
$modal-view-button-icon-height: 3em;
$modal-view-button-icon-half-height: calc(#{$modal-view-button-icon-height} / 2);
$modal-view-button-icon-width: 3em;
$modal-view-button-icon-margin: 0.5em;

.modal-view.media-modal-view {
  z-index: 9000;
  flex-direction: column;

  .modal-view-button-arrow,
  .modal-view-button-hide {
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
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
    flex-grow: 1;
    justify-content: center;

    &-inner {
      width: 100%;
      height: 100%;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }

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
    max-width: 100%;
    max-height: 100%;
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

  .modal-view-button {
    border: 0;
    padding: 0;
    opacity: 0;
    box-shadow: none;
    background: none;
    appearance: none;
    overflow: visible;
    cursor: pointer;
    transition: opacity 333ms cubic-bezier(.4,0,.22,1);
    height: $modal-view-button-icon-height;
    width: $modal-view-button-icon-width;

    .button-icon {
      position: absolute;
      height: $modal-view-button-icon-height;
      width: $modal-view-button-icon-width;
      font-size: 1rem;
      line-height: $modal-view-button-icon-height;
      color: #FFF;
      text-align: center;
      background-color: rgba(0,0,0,.3);
    }
  }

  .modal-view-button-arrow {
    position: absolute;
    display: block;
    top: 50%;
    margin-top: $modal-view-button-icon-half-height;
    width: $modal-view-button-icon-width;
    height: $modal-view-button-icon-height;

    .arrow-icon {
      position: absolute;
      top: 0;
      line-height: $modal-view-button-icon-height;
      color: #FFF;
      text-align: center;
      background-color: rgba(0,0,0,.3);
    }

    &--prev {
      left: 0;
      .arrow-icon {
        left: $modal-view-button-icon-margin;
      }
    }

    &--next {
      right: 0;
      .arrow-icon {
        right: $modal-view-button-icon-margin;
      }
    }
  }

  .modal-view-button-hide {
    position: absolute;
    top: 0;
    right: 0;
    .button-icon {
      top: $modal-view-button-icon-margin;
      right: $modal-view-button-icon-margin;
    }
  }
}
</style>
