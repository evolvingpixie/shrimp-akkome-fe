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
      @parseReady="$emit('parseReady', $event)"
    >
      <div v-if="status.poll && status.poll.options">
        <Poll
          :base-poll="status.poll"
          :emoji="status.emojis"
        />
      </div>

      <gallery
        v-if="status.attachments.length !== 0"
        class="attachments media-body"
        :nsfw="nsfwClickthrough"
        :attachments="status.attachments"
        :limit="compact ? 1 : 0"
        :size="attachmentSize"
        @setMedia="onMedia"
        @play="$emit('mediaplay', attachment.id)"
        @pause="$emit('mediapause', attachment.id)"
      />

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
}
</style>
