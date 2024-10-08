<template>
  <div
    class="side-drawer-container"
    :class="{ 'side-drawer-container-closed': closed, 'side-drawer-container-open': !closed }"
  >
    <div
      class="side-drawer-darken"
      :class="{ 'side-drawer-darken-closed': closed}"
    />
    <div
      class="side-drawer"
      :class="{'side-drawer-closed': closed}"
      @touchstart="touchStart"
      @touchmove="touchMove"
    >
      <div
        class="side-drawer-heading"
        @click="toggleDrawer"
      >
        <UserCard
          v-if="currentUser"
          :user-id="currentUser.id"
          :hide-bio="true"
        />
        <div
          v-else
          class="side-drawer-logo-wrapper"
        >
          <img :src="logo">
          <span v-if="!hideSitename">{{ sitename }}</span>
        </div>
      </div>
      <ul>
        <li
          v-if="!currentUser"
          @click="toggleDrawer"
        >
          <router-link :to="{ name: 'login' }">
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="sign-in-alt"
            /> {{ $t("login.login") }}
          </router-link>
        </li>
        <li
          v-if="currentUser || !privateMode"
          @click="toggleDrawer"
        >
          <router-link :to="{ name: timelinesRoute }">
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="home"
            /> {{ $t("nav.timelines") }}
          </router-link>
        </li>
        <li
          v-if="currentUser"
          @click="toggleDrawer"
        >
          <router-link :to="{ name: 'lists' }">
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="list"
            /> {{ $t("nav.lists") }}
          </router-link>
        </li>
      </ul>
      <ul v-if="currentUser">
        <li @click="toggleDrawer">
          <router-link :to="{ name: 'interactions', params: { username: currentUser.screen_name } }">
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="bolt"
            /> {{ $t("nav.interactions") }}
          </router-link>
        </li>
        <li
          v-if="currentUser.locked"
          @click="toggleDrawer"
        >
          <router-link to="/friend-requests">
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="user-plus"
            /> {{ $t("nav.friend_requests") }}
            <span
              v-if="followRequestCount > 0"
              class="badge badge-notification"
            >
              {{ followRequestCount }}
            </span>
          </router-link>
        </li>
      </ul>
      <ul>
        <li
          v-if="currentUser || !privateMode"
          @click="toggleDrawer"
        >
          <router-link :to="{ name: 'search' }">
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="search"
            /> {{ $t("nav.search") }}
          </router-link>
        </li>
        <li
          v-if="currentUser && suggestionsEnabled"
          @click="toggleDrawer"
        >
          <router-link :to="{ name: 'who-to-follow' }">
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="user-plus"
            /> {{ $t("nav.who_to_follow") }}
          </router-link>
        </li>
        <li @click="toggleDrawer">
          <button
            class="button-unstyled -link -fullwidth"
            @click="openSettingsModal"
          >
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="cog"
            /> {{ $t("settings.settings") }}
          </button>
        </li>
        <li @click="toggleDrawer">
          <router-link :to="{ name: 'about'}">
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="info-circle"
            /> {{ $t("nav.about") }}
          </router-link>
        </li>
        <li
          v-if="currentUser && currentUser.role === 'admin' || currentUser.role === 'moderator'"
          @click="toggleDrawer"
        >
          <button
            class="button-unstyled -link -fullwidth"
            @click="openModModal"
          >
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="user-tie"
            /> {{ $t("nav.moderation") }}
          </button>
        </li>
        <li
          v-if="currentUser && currentUser.role === 'admin'"
          @click="toggleDrawer"
        >
          <a
            :href="'https://' + $store.getters.instanceDomain + '/admin/dashboard'"
            target="_blank"
          >
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="tachometer-alt"
            /> {{ $t("nav.administration") }}
          </a>
        </li>
        <li
          v-if="currentUser"
          @click="toggleDrawer"
        >
          <router-link
            :to="{ name: 'announcements' }"
          >
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="bullhorn"
            /> {{ $t("nav.announcements") }}
            <span
              v-if="unreadAnnouncementCount"
              class="badge badge-notification"
            >
              {{ unreadAnnouncementCount }}
            </span>
          </router-link>
        </li>
        <li
          v-if="currentUser"
          @click="toggleDrawer"
        >
          <button
            class="button-unstyled -link -fullwidth"
            @click="doLogout"
          >
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="sign-out-alt"
            /> {{ $t("login.logout") }}
          </button>
        </li>
      </ul>
    </div>
    <div
      class="side-drawer-click-outside"
      :class="{'side-drawer-click-outside-closed': closed}"
      @click.stop.prevent="toggleDrawer"
    />
  </div>
</template>

<script src="./side_drawer.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.side-drawer-container {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  transition-duration: 0s;
  transition-property: transform;
}

.side-drawer-container-open {
  transform: translate(0%);
}

.side-drawer-container-closed {
  transition-delay: 0.35s;
  transform: translate(-100%);
}

.side-drawer-darken {
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: -1;
  transition: 0.35s;
  transition-property: background-color;
  background-color: rgba(0, 0, 0, 0.5);
}

.side-drawer-darken-closed {
  background-color: rgba(0, 0, 0, 0);
}

.side-drawer-click-outside {
  flex: 1 1 100%;
}

.side-drawer {
  overflow-x: hidden;
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  @media (prefers-reduced-motion: reduce) {
    transition-timing-function: unset;
    transition: unset;
  }
  transition: 0.35s;
  transition-property: transform;
  margin: 0 0 0 -100px;
  padding: 0 0 1em 100px;
  width: 80%;
  max-width: 20em;
  flex: 0 0 80%;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
  box-shadow: var(--panelShadow);
  background-color: $fallback--bg;
  background-color: var(--popover, $fallback--bg);
  color: $fallback--link;
  color: var(--popoverText, $fallback--link);
  --faint: var(--popoverFaintText, $fallback--faint);
  --faintLink: var(--popoverFaintLink, $fallback--faint);
  --lightText: var(--popoverLightText, $fallback--lightText);
  --icon: var(--popoverIcon, $fallback--icon);

  .badge {
    margin-left: 10px;
  }
}

.side-drawer-logo-wrapper {
  display: flex;
  align-items: center;
  padding: 0.85em;

  img {
    flex: none;
    height: 50px;
    margin-right: 0.85em;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.side-drawer-click-outside-closed {
  flex: 0 0 0;
}

.side-drawer-closed {
  transform: translate(-100%);
}

.side-drawer-heading {
  background: transparent;
  flex-direction: column;
  align-items: stretch;
  display: flex;
  padding: 0;
  margin: 0;
}

.side-drawer ul {
  list-style: none;
  margin: 0;
  padding: 0;

  border-bottom: 1px solid;
  border-color: $fallback--border;
  border-color: var(--border, $fallback--border);
}

.side-drawer ul:last-child {
  border: 0;
}

.side-drawer li {
  padding: 0;

  a, button {
    box-sizing: border-box;
    display: block;
    height: 3em;
    line-height: 3em;
    padding: 0 0.7em;

    &:hover {
      background-color: $fallback--lightBg;
      background-color: var(--selectedMenuPopover, $fallback--lightBg);
      color: $fallback--text;
      color: var(--selectedMenuPopoverText, $fallback--text);
      --faint: var(--selectedMenuPopoverFaintText, $fallback--faint);
      --faintLink: var(--selectedMenuPopoverFaintLink, $fallback--faint);
      --lightText: var(--selectedMenuPopoverLightText, $fallback--lightText);
      --icon: var(--selectedMenuPopoverIcon, $fallback--icon);
    }
  }
}
</style>
