<template>
  <div
    id="app-loaded"
    :style="bgStyle"
  >
    <div
      id="app_bg_wrapper"
      class="app-bg-wrapper"
    />
    <MobileNav v-if="layoutType === 'mobile'" />
    <DesktopNav v-else />
    <Notifications v-if="currentUser" />
    <div
      id="content"
      class="app-layout container"
      :class="classes"
    >
      <div class="underlay"/>
      <div id="sidebar" class="column -scrollable" :class="{ '-show-scrollbar': showScrollbars }">
        <user-panel />
        <template v-if="layoutType !== 'mobile'">
          <nav-panel />
          <instance-specific-panel v-if="showInstanceSpecificPanel" />
          <features-panel v-if="!currentUser && showFeaturesPanel" />
          <who-to-follow-panel v-if="currentUser && suggestionsEnabled" />
          <div id="notifs-sidebar" />
        </template>
      </div>
      <div id="main-scroller" class="column main" :class="{ '-full-height': isChats }">
        <div
          v-if="!currentUser"
          class="login-hint panel panel-default"
        >
          <router-link
            :to="{ name: 'login' }"
            class="panel-body"
          >
            {{ $t("login.hint") }}
          </router-link>
        </div>
        <router-view />
      </div>
      <div id="notifs-column" class="column -scrollable" :class="{ '-show-scrollbar': showScrollbars }"/>
    </div>
    <media-modal />
    <shout-panel
      v-if="currentUser && shout && !hideShoutbox"
      :floating="true"
      class="floating-shout mobile-hidden"
      :class="{ '-left': shoutboxPosition }"
    />
    <MobilePostStatusButton />
    <UserReportingModal />
    <PostStatusModal />
    <SettingsModal />
    <div id="modal" />
    <GlobalNoticeList />
  </div>
</template>

<script src="./App.js"></script>
<style lang="scss" src="./App.scss"></style>
