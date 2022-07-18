<template>
  <div class="announcement-editor">
    <textarea
      ref="textarea"
      v-model="announcement.content"
      class="post-textarea"
      rows="1"
      cols="1"
      :placeholder="$t('announcements.post_placeholder')"
      :disabled="disabled"
    />
    <span class="announcement-metadata">
      <label for="announcement-start-time">{{ $t('announcements.start_time_prompt') }}</label>
      <input
        id="announcement-start-time"
        v-model="announcement.startsAt"
        :type="announcement.allDay ? 'date' : 'datetime-local'"
        :disabled="disabled"
      >
    </span>
    <span class="announcement-metadata">
      <label for="announcement-end-time">{{ $t('announcements.end_time_prompt') }}</label>
      <input
        id="announcement-end-time"
        v-model="announcement.endsAt"
        :type="announcement.allDay ? 'date' : 'datetime-local'"
        :disabled="disabled"
      >
    </span>
    <span class="announcement-metadata">
      <Checkbox
        id="announcement-all-day"
        v-model="announcement.allDay"
        :disabled="disabled"
      />
      <label for="announcement-all-day">{{ $t('announcements.all_day_prompt') }}</label>
    </span>
  </div>
</template>

<script src="./announcement_editor.js"></script>

<style lang="scss">
.announcement-editor {
  display: flex;
  align-items: stretch;
  flex-direction: column;

  .announcement-metadata {
    margin-top: 0.5em;
  }

  .post-textarea {
    resize: vertical;
    height: 10em;
    overflow: none;
    box-sizing: content-box;
  }
}
</style>
