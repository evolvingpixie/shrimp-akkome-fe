<template>
  <div class="StatusContent">
    <slot name="header" />
    <StatusBody
      :status="status"
      :single-line="singleLine"
      :hide-mentions="hideMentions"
      @parseReady="$emit('parseReady', $event)"
    >
      <div v-if="status.poll && status.poll.options">
        <poll :base-poll="status.poll" />
      </div>

      <gallery
        class="attachments media-body"
        v-if="status.attachments.length !== 0"
        :nsfw="nsfwClickthrough"
        :attachments="status.attachments"
        :set-media="setMedia()"
        :size="attachmentSize"
        @play="$emit('mediaplay', attachment.id)"
        @pause="$emit('mediapause', attachment.id)"
      />

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
}
</style>
