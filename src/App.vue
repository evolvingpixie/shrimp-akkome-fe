<template>
  <div
    id="app-loaded"
    :style="bgStyle"
  >
    <div
      id="app_bg_wrapper"
      class="app-bg-wrapper"
    />
    <MobileNav class="navbar" v-if="isMobileLayout" />
    <DesktopNav class="navbar" v-else />
    <div class="app-bg-wrapper app-container-wrapper" />
    <div
      id="content"
      class="app-layout container"
    >
      <div class="underlay"/>
      <div
        class="column -scrollable -mini mobile-hidden"
        :style="sidebarAlign"
      >
        <user-panel />
        <div v-if="!isMobileLayout">
          <nav-panel />
          <instance-specific-panel v-if="showInstanceSpecificPanel" />
          <features-panel v-if="!currentUser && showFeaturesPanel" />
          <who-to-follow-panel v-if="currentUser && suggestionsEnabled" />
          <notifications v-if="currentUser" />
        </div>
      </div>
      <div class="column main">
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
      <media-modal />
    </div>
    <shout-panel
      v-if="currentUser && shout && !hideShoutbox"
      :floating="true"
      class="floating-shout mobile-hidden"
      :class="{ 'left': shoutboxPosition }"
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
