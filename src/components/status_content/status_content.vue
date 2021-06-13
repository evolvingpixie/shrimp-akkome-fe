<template>
<div
  class="StatusContent"
  :class="{ '-compact': compact }"
>
    <slot name="header" />
    <StatusBody
      :status="status"
      :compact="compact"
      :single-line="singleLine"
      :hide-mentions="hideMentions"
      @parseReady="setHeadTailLinks"
    >
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
        v-if="status.card && !noHeading && !compact"
        class="link-preview media-body"
      >
        <link-preview
          :card="status.card"
          :size="attachmentSize"
          :nsfw="nsfwClickthrough"
        />
      </div>
    </StatusBody>
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
  &.-compact {
    flex {
      display: flex;
    }
  }
}
</style>
