<template>
  <div class="panel panel-default announcements-page">
    <div class="panel-heading">
      <span>
        {{ $t('announcements.page_header') }}
      </span>
    </div>
    <div class="panel-body">
      <section
        v-if="currentUser && currentUser.role === 'admin'"
      >
        <div class="post-form">
          <div class="heading">
            <h4>{{ $t('announcements.post_form_header') }}</h4>
          </div>
          <div class="body">
            <announcement-editor
              :announcement="newAnnouncement"
              :disabled="posting"
            />
          </div>
          <div class="footer">
            <button
              class="btn button-default post-button"
              :disabled="posting"
              @click.prevent="postAnnouncement"
            >
              {{ $t('announcements.post_action') }}
            </button>
            <div
              v-if="error"
              class="alert error"
            >
              {{ $t('announcements.post_error', { error }) }}
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
      </section>
      <section
        v-for="announcement in announcements"
        :key="announcement.id"
      >
        <announcement
          :announcement="announcement"
        />
      </section>
    </div>
  </div>
</template>

<script src="./announcements_page.js"></script>

<style lang="scss">
@import "../../variables";

.announcements-page {
  .post-form {
    padding: var(--status-margin, $status-margin);

    .heading, .body {
      margin-bottom: var(--status-margin, $status-margin);
    }

    .post-button {
      min-width: 10em;
    }
  }
}
</style>
