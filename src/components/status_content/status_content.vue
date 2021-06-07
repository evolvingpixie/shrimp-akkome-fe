<template>
  <div class="StatusContent">
    <slot name="header" />
    <StatusText :status="status">
      <div v-if="status.poll && status.poll.options">
        <poll :base-poll="status.poll" />
      </div>

      <div
        v-if="status.attachments.length !== 0"
        class="attachments media-body"
      >
        <attachment
          v-for="attachment in nonGalleryAttachments"
          :key="attachment.id"
          class="non-gallery"
          :size="attachmentSize"
          :nsfw="nsfwClickthrough"
          :attachment="attachment"
          :allow-play="true"
          :set-media="setMedia()"
          @play="$emit('mediaplay', attachment.id)"
          @pause="$emit('mediapause', attachment.id)"
        />
        <gallery
          v-if="galleryAttachments.length > 0"
          :nsfw="nsfwClickthrough"
          :attachments="galleryAttachments"
          :set-media="setMedia()"
        />
      </div>

      <div
        v-if="status.card && !noHeading"
        class="link-preview media-body"
      >
        <link-preview
          :card="status.card"
          :size="attachmentSize"
          :nsfw="nsfwClickthrough"
        />
      </div>
    </StatusText>
    <slot name="footer" />
  </div>
</template>

<script src="./status_content.js" ></script>
<style lang="scss">
@import '../../_variables.scss';

$status-margin: 0.75em;

.StatusContent {
  flex: 1;
  min-width: 0;

  .status-content-wrapper {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
  }

  .tall-status {
    position: relative;
    height: 220px;
    overflow-x: hidden;
    overflow-y: hidden;
    z-index: 1;
    .status-content {
      min-height: 0;
      mask: linear-gradient(to top, white, transparent) bottom/100% 70px no-repeat,
            linear-gradient(to top, white, white);
      /* Autoprefixed seem to ignore this one, and also syntax is different */
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }
  }

  .tall-status-hider {
    display: inline-block;
    word-break: break-all;
    position: absolute;
    height: 70px;
    margin-top: 150px;
    width: 100%;
    text-align: center;
    line-height: 110px;
    z-index: 2;
  }

  .status-unhider, .cw-status-hider {
    width: 100%;
    text-align: center;
    display: inline-block;
    word-break: break-all;

    svg {
      color: inherit;
    }
  }

  video {
    max-width: 100%;
    max-height: 400px;
    vertical-align: middle;
    object-fit: contain;
  }

  .summary-wrapper {
    margin-bottom: 0.5em;
    border-style: solid;
    border-width: 0 0 1px 0;
    border-color: var(--border, $fallback--border);
    flex-grow: 0;
  }

  .summary {
    font-style: italic;
    padding-bottom: 0.5em;
  }

  .tall-subject {
    position: relative;
    .summary {
      max-height: 2em;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .tall-subject-hider {
    display: inline-block;
    word-break: break-all;
    // position: absolute;
    width: 100%;
    text-align: center;
    padding-bottom: 0.5em;
  }

  .status-content {
    &.single-line {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      height: 1.4em;
    }
  }
}

.greentext {
  color: $fallback--cGreen;
  color: var(--postGreentext, $fallback--cGreen);
}
</style>
