<template>
  <div class="announcement">
    <div class="heading">
      <h4>{{ $t('announcements.title') }}</h4>
    </div>
    <div class="body">
      <rich-content
        v-if="!editing"
        :html="content"
        :emoji="announcement.emojis"
        :handle-links="true"
      />
      <announcement-editor
        v-else
        :announcement="editedAnnouncement"
      />
    </div>
    <div class="footer">
      <div
        v-if="!editing"
        class="times"
      >
        <span v-if="publishedAt">
          {{ $t('announcements.published_time_display', { time: publishedAt }) }}
        </span>
        <span v-if="startsAt">
          {{ $t('announcements.start_time_display', { time: startsAt }) }}
        </span>
        <span v-if="endsAt">
          {{ $t('announcements.end_time_display', { time: endsAt }) }}
        </span>
      </div>
      <div
        v-if="!editing"
        class="actions"
      >
        <button
          v-if="currentUser"
          class="btn button-default"
          :class="{ toggled: isRead }"
          :disabled="inactive"
          :title="inactive ? $t('announcements.inactive_message') : ''"
          @click="markAsRead"
        >
          {{ $t('announcements.mark_as_read_action') }}
        </button>
        <button
          v-if="currentUser && currentUser.role === 'admin'"
          class="btn button-default"
          @click="enterEditMode"
        >
          {{ $t('announcements.edit_action') }}
        </button>
        <button
          v-if="currentUser && currentUser.role === 'admin'"
          class="btn button-default"
          @click="deleteAnnouncement"
        >
          {{ $t('announcements.delete_action') }}
        </button>
      </div>
      <div
        v-else
        class="actions"
      >
        <button
          class="btn button-default"
          @click="submitEdit"
        >
          {{ $t('announcements.submit_edit_action') }}
        </button>
        <button
          class="btn button-default"
          @click="cancelEdit"
        >
          {{ $t('announcements.cancel_edit_action') }}
        </button>
        <div
          v-if="editing && editError"
          class="alert error"
        >
          {{ $t('announcements.edit_error', { error }) }}
          <button
            class="button-unstyled"
            @click="clearError"
          >
            <FAIcon
              class="fa-scale-110 fa-old-padding"
              icon="times"
              :title="$t('announcements.close_error')"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./announcement.js"></script>

<style lang="scss">
@import "../../variables";

.announcement {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--border, $fallback--border);
  border-radius: 0;
  padding: var(--status-margin, $status-margin);

  .heading, .body {
    margin-bottom: var(--status-margin, $status-margin);
  }

  .footer {
    display: flex;
    flex-direction: column;
    .times {
      display: flex;
      flex-direction: column;
    }
  }

  .footer .actions {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;

    .btn {
      flex: 1;
      margin: 1em;
      max-width: 10em;
    }
  }
}
</style>
