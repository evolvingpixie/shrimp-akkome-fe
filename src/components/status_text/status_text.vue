<template>
  <div class="StatusText">
    <div
      v-if="status.summary_html"
      class="summary-wrapper"
      :class="{ 'tall-subject': (longSubject && !showingLongSubject) }"
    >
      <RichContent
        class="media-body summary"
        :html="status.summary_raw_html"
        :emoji="status.emojis"
        @click.prevent="linkClicked"
      />
      <button
        v-if="longSubject && showingLongSubject"
        class="button-unstyled -link tall-subject-hider"
        @click.prevent="showingLongSubject=false"
        >
        {{ $t("status.hide_full_subject") }}
      </button>
      <button
        v-else-if="longSubject"
        class="button-unstyled -link tall-subject-hider"
        :class="{ 'tall-subject-hider_focused': focused }"
        @click.prevent="showingLongSubject=true"
      >
        {{ $t("status.show_full_subject") }}
      </button>
    </div>
    <div
      :class="{'tall-status': hideTallStatus}"
      class="status-content-wrapper"
      >
      <button
        v-if="hideTallStatus"
        class="button-unstyled -link tall-status-hider"
        :class="{ 'tall-status-hider_focused': focused }"
        @click.prevent="toggleShowMore"
      >
        {{ $t("general.show_more") }}
      </button>
      <RichContent
        v-if="!hideSubjectStatus"
        :class="{ 'single-line': singleLine }"
        class="status-content media-body"
        :html="postBodyHtml"
        :emoji="status.emojis"
        :handleLinks="true"
        @click.prevent="linkClicked"
        />
      <button
        v-if="hideSubjectStatus"
        class="button-unstyled -link cw-status-hider"
        @click.prevent="toggleShowMore"
        >
        {{ $t("status.show_content") }}
        <FAIcon
          v-if="attachmentTypes.includes('image')"
          icon="image"
          />
        <FAIcon
          v-if="attachmentTypes.includes('video')"
          icon="video"
          />
        <FAIcon
          v-if="attachmentTypes.includes('audio')"
          icon="music"
          />
        <FAIcon
          v-if="attachmentTypes.includes('unknown')"
          icon="file"
          />
        <FAIcon
          v-if="status.poll && status.poll.options"
          icon="poll-h"
          />
        <FAIcon
          v-if="status.card"
          icon="link"
          />
      </button>
      <button
        v-if="showingMore && !fullContent"
        class="button-unstyled -link status-unhider"
        @click.prevent="toggleShowMore"
        >
        {{ tallStatus ? $t("general.show_less") : $t("status.hide_content") }}
      </button>
    </div>
    <div v-if="!hideSubjectStatus">
      <slot/>
    </div>
  </div>
</template>
<script src="./status_text.js" ></script>
