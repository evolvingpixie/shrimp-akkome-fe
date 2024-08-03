<template>
  <ul>
    <li v-if="currentUser">
      <router-link
        class="menu-item"
        :to="{ name: 'friends' }"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 fa-old-padding "
          icon="home"
        />
        <span
          :title="$t('nav.home_timeline_description')"
          :aria-label="$t('nav.home_timeline_description')"
        >{{ $t("nav.home_timeline") }}</span>
      </router-link>
    </li>
    <li v-if="bubbleTimelineVisible">
      <router-link
        class="menu-item"
        :to="{ name: 'bubble-timeline' }"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 fa-old-padding "
          :icon="['far', 'circle']"
        />
        <span
          :title="$t('nav.bubble_timeline_description')"
          :aria-label="$t('nav.bubble_timeline_description')"
        >{{ $t("nav.bubble_timeline") }}</span>
      </router-link>
    </li>
    <li v-if="publicTimelineVisible">
      <router-link
        class="menu-item"
        :to="{ name: 'public-timeline' }"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 fa-old-padding "
          icon="users"
        />
        <span
          :title="$t('nav.public_timeline_description')"
          :aria-label="$t('nav.public_timeline_description')"
        >{{ $t("nav.public_tl") }}</span>
      </router-link>
    </li>
    <li v-if="federatedTimelineVisible">
      <router-link
        class="menu-item"
        :to="{ name: 'public-external-timeline' }"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 fa-old-padding "
          icon="globe"
        />
        <span
          :title="$t('nav.twkn_timeline_description')"
          :aria-label="$t('nav.twkn_timeline_description')"
        >{{ $t("nav.twkn") }}</span>
      </router-link>
    </li>
    <li v-if="currentUser">
      <router-link
        class="menu-item"
        :to="{ name: 'bookmarks'}"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 fa-old-padding "
          icon="bookmark"
        />
        <span
          :title="$t('nav.bookmarks')"
          :aria-label="$t('nav.bookmarks')"
        >{{ $t("nav.bookmarks") }}</span>
      </router-link>
    </li>
    <li v-if="currentUser">
      <router-link
        class="menu-item"
        :to="{ name: 'dms', params: { username: currentUser.screen_name } }"
      >
        <FAIcon
          fixed-width
          class="fa-scale-110 fa-old-padding "
          icon="envelope"
        />
        <span
          :title="$t('nav.dms')"
          :aria-label="$t('nav.dms')"
        >{{ $t("nav.dms") }}</span>
      </router-link>
    </li>
  </ul>
</template>

<script src="./timeline_menu_content.js"></script>

<style lang="scss">
@import "../../_variables.scss";
.timeline-desc {
  text-decoration: none;
  color: var(--text, $fallback--text);
  padding-left: 1em;
  display: block;
  background-color: scale(var(--bg, $fallback--bg), 0.1);
  padding-bottom: 0.4em;
}
</style>
