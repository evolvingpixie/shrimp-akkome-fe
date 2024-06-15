<template>
  <nav
    id="nav"
    class="DesktopNav"
    :class="{ '-logoLeft': logoLeft }"
    @click="scrollToTop()"
  >
    <div
      class="inner-nav"
      :class="{ '-wide': showWiderShortcuts }"
    >
      <div class="item nav-left-wrapper">
        <router-link
          class="site-brand"
          :to="{ name: 'root' }"
          active-class="home"
        >
          <img
            v-if="!hideSiteFavicon"
            class="favicon"
            src="/favicon.png"
          >
          <span
            v-if="!hideSiteName"
            class="site-name"
          >
            {{ sitename }}
          </span>
        </router-link>
        <div
          v-if="(currentUser || !privateMode) && showNavShortcuts"
          class="nav-items left"
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
              :title="$t('nav.home_timeline')"
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
              :title="$t('nav.public_tl')"
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
              icon="circle"
              :title="$t('nav.bubble_timeline')"
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
              :title="$t('nav.twkn')"
            />
          </router-link>
        </div>
      </div>
      <router-link
        class="logo"
        :to="{ name: 'root' }"
        :style="logoBgStyle"
      >
        <div
          class="mask"
          :style="logoMaskStyle"
        />
        <img
          :src="logo"
          :style="logoStyle"
        >
      </router-link>
      <div class="item right actions">
        <search-bar
          v-if="currentUser || !privateMode"
          @toggled="onSearchBarToggled"
          @click.stop
        />
        <div
          v-if="(currentUser || !privateMode) && showNavShortcuts"
          class="nav-items right"
        >
          <router-link
            v-if="currentUser"
            class="nav-icon"
            :to="{ name: 'interactions', params: { username: currentUser.screen_name } }"
          >
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="bolt"
              :title="$t('nav.interactions')"
            />
          </router-link>
          <router-link
            v-if="currentUser"
            :to="{ name: 'lists' }"
            class="nav-icon"
          >
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="list"
              :title="$t('nav.lists')"
            />
          </router-link>
          <router-link
            v-if="currentUser"
            :to="{ name: 'bookmarks' }"
            class="nav-icon"
          >
            <FAIcon
              fixed-width
              class="fa-scale-110 fa-old-padding"
              icon="bookmark"
              :title="$t('nav.bookmarks')"
            />
          </router-link>
        </div>
        <button
          class="button-unstyled nav-icon"
          @click.stop="openSettingsModal"
        >
          <FAIcon
            fixed-width
            class="fa-scale-110 fa-old-padding"
            icon="cog"
            :title="$t('nav.preferences')"
          />
        </button>
        <button
          v-if="currentUser && currentUser.role === 'admin' || currentUser.role === 'moderator'"
          class="button-unstyled nav-icon"
          @click.stop="openModModal"
        >
          <FAIcon
            fixed-width
            class="fa-scale-110 fa-old-padding"
            icon="user-tie"
            :title="$t('nav.moderation')"
          />
        </button>
        <a
          v-if="currentUser && currentUser.role === 'admin'"
          href="/pleroma/admin/#/login-pleroma"
          class="nav-icon"
          target="_blank"
          @click.stop
        >
          <FAIcon
            fixed-width
            class="fa-scale-110 fa-old-padding"
            icon="tachometer-alt"
            :title="$t('nav.administration')"
          />
        </a>
      </div>
    </div>
    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmLogout"
        :title="$t('login.logout_confirm_title')"
        :confirm-text="$t('login.logout_confirm_accept_button')"
        :cancel-text="$t('login.logout_confirm_cancel_button')"
        @accepted="doLogout"
        @cancelled="hideConfirmLogout"
      >
        {{ $t('login.logout_confirm') }}
      </confirm-modal>
    </teleport>
  </nav>
</template>
<script src="./desktop_nav.js"></script>

<style src="./desktop_nav.scss" lang="scss"></style>
