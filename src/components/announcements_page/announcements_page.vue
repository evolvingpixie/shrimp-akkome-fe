<template>
  <div class="panel panel-default announcements-page">
    <div class="panel-heading">
      <div class="title">
        {{ $t('announcements.page_header') }}
      </div>
    </div>
    <div class="panel-body">
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
