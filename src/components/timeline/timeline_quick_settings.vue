<template>
  <Popover
    trigger="click"
    class="TimelineQuickSettings"
    :bound-to="{ x: 'container' }"
  >
    <template #content>
      <div class="dropdown-menu">
        <div v-if="loggedIn">
          <button
            class="button-default dropdown-item"
            @click="replyVisibilityAll = true"
          >
            <span
              class="menu-checkbox -radio"
              :class="{ 'menu-checkbox-checked': replyVisibilityAll }"
            />{{ $t('settings.reply_visibility_all') }}
          </button>
          <button
            class="button-default dropdown-item"
            @click="replyVisibilityFollowing = true"
          >
            <span
              class="menu-checkbox -radio"
              :class="{ 'menu-checkbox-checked': replyVisibilityFollowing }"
            />{{ $t('settings.reply_visibility_following_short') }}
          </button>
          <button
            class="button-default dropdown-item"
            @click="replyVisibilitySelf = true"
          >
            <span
              class="menu-checkbox -radio"
              :class="{ 'menu-checkbox-checked': replyVisibilitySelf }"
            />{{ $t('settings.reply_visibility_self_short') }}
          </button>
          <div
            role="separator"
            class="dropdown-divider"
          />
        </div>
        <button
          class="button-default dropdown-item"
          @click="muteBotStatuses = !muteBotStatuses"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': muteBotStatuses }"
          />{{ $t('settings.mute_bot_posts') }}
        </button>
        <button
          class="button-default dropdown-item"
          @click="hideMedia = !hideMedia"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': hideMedia }"
          />{{ $t('settings.hide_media_previews') }}
        </button>
        <button
          class="button-default dropdown-item"
          @click="hideMutedPosts = !hideMutedPosts"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': hideMutedPosts }"
          />{{ $t('settings.hide_all_muted_posts') }}
        </button>
        <button
          class="button-default dropdown-item dropdown-item-icon"
          @click="openTab('filtering')"
        >
          <FAIcon icon="font" />{{ $t('settings.word_filter') }}
        </button>
        <button
          class="button-default dropdown-item dropdown-item-icon"
          @click="openTab('general')"
        >
          <FAIcon icon="wrench" />{{ $t('settings.more_settings') }}
        </button>
      </div>
    </template>
    <template #trigger>
      <button class="button-unstyled">
        <FAIcon icon="filter" />
      </button>
    </template>
  </Popover>
</template>

<script src="./timeline_quick_settings.js"></script>

<style lang="scss">

.TimelineQuickSettings {

  > button {
    line-height: 100%;
    height: 100%;
    width: var(--__panel-heading-height-inner);
    text-align: center;

    svg {
      font-size: 1.2em;
    }
  }
}

</style>
