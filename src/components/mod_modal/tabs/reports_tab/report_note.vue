<template>
  <div class="report-note">
    <div class="note-header">
      <div class="note-author">
        <UserAvatar
          class="small-avatar"
          :user="user"
        />
        {{ user.screen_name }}
      </div>
      <div class="header-right">
        <Timeago
          class="faint"
          :time="created_at"
          :auto-update="60"
          :long-format="true"
          :with-direction="true"
        />
        <button
          class="btn button-default"
          @click.stop="showDeleteDialog"
        >
          {{ $t('moderation.reports.delete_note') }}
        </button>
      </div>
    </div>
    <div class="note-content">
      {{ content }}
    </div>
    <confirm-modal
      v-if="showingDeleteDialog"
      :title="$t('moderation.reports.delete_note_title')"
      :confirm-text="$t('moderation.reports.delete_note_accept')"
      :cancel-text="$t('moderation.reports.delete_note_cancel')"
      @accepted="deleteNoteFromReport"
      @cancelled="hideDeleteDialog"
    >
      {{ $t('moderation.reports.delete_note_confirm') }}
    </confirm-modal>
  </div>
</template>

<script src="./report_note.js"></script>
