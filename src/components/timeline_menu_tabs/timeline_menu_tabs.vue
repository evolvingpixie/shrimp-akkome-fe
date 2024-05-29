<template>
  <div
    v-if="currentUser || !privateMode"
    class="nav-items timeline-menu-tabs"
  >
    <router-link
      v-if="currentUser"
      :to="{ name: 'friends' }"
      class="nav-icon"
    >
      <FAIcon
        fixed-width
        class="fa-scale-110 fa-old-padding"
        icon="home"
        :title="$t('nav.home_timeline_description')"
      />
    </router-link>
    <router-link
      v-if="publicTimelineVisible"
      :to="{ name: 'public-timeline' }"
      class="nav-icon"
    >
      <FAIcon
        fixed-width
        class="fa-scale-110 fa-old-padding"
        icon="users"
        :title="$t('nav.public_timeline_description')"
      />
    </router-link>
    <router-link
      v-if="bubbleTimelineVisible"
      :to="{ name: 'bubble-timeline' }"
      class="nav-icon"
    >
      <FAIcon
        fixed-width
        class="fa-scale-110 fa-old-padding"
        :icon="['far', 'circle']"
        :title="$t('nav.bubble_timeline_description')"
      />
    </router-link>
    <router-link
      v-if="federatedTimelineVisible"
      :to="{ name: 'public-external-timeline' }"
      class="nav-icon"
    >
      <FAIcon
        fixed-width
        class="fa-scale-110 fa-old-padding"
        icon="globe"
        :title="$t('nav.twkn_timeline_description')"
      />
    </router-link>
    <span class="timeline-title">{{ timelineName() }}</span>
  </div>
</template>

<script src="./timeline_menu_tabs.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.timeline-menu-tabs {
  .nav-icon {
    margin-left: 0.7em;
    width: 2em;
    height: 100%;
    text-align: center;

    &.router-link-active {
      border-bottom: 2px solid var(--selectedMenuText, $fallback--text);
      padding-bottom: 0.8em;

      .svg-inline--fa {
        font-weight: bolder;
        color: $fallback--text;
        color: var(--selectedMenuText, $fallback--text);
        --lightText: var(--selectedMenuLightText, $fallback--lightText);
      }
    }
  }

  .timeline-title {
    margin-left: 1em;
    font-size: 1.2em;
    font-weight: bold;
    color: var(--selectedMenuText, $fallback--text);
    color: var(--selectedMenuText, $fallback--text);
    --lightText: var(--selectedMenuLightText, $fallback--lightText);
  }

  @media all and (max-width: 900px) {
    .timeline-title {
      display: none;
    }
  }
}
</style>
