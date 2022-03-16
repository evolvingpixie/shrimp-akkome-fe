<template>
  <div :label="$t('settings.notifications')">
    <div class="setting-item">
      <h2>{{ $t('settings.notification_setting_filters') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="serverSide_blockNotificationsFromStrangers">
            {{ $t('settings.notification_setting_block_from_strangers') }}
          </BooleanSetting>
        </li>
        <li class="select-multiple">
          <span class="label">{{ $t('settings.notification_visibility') }}</span>
          <ul class="option-list">
            <li>
              <BooleanSetting path="notificationVisibility.likes">
                {{ $t('settings.notification_visibility_likes') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="notificationVisibility.repeats">
                {{ $t('settings.notification_visibility_repeats') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="notificationVisibility.follows">
                {{ $t('settings.notification_visibility_follows') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="notificationVisibility.mentions">
                {{ $t('settings.notification_visibility_mentions') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="notificationVisibility.moves">
                {{ $t('settings.notification_visibility_moves') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="notificationVisibility.emojiReactions">
                {{ $t('settings.notification_visibility_emoji_reactions') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div
      v-if="expertLevel > 0"
      class="setting-item"
    >
      <h2>{{ $t('settings.notification_setting_privacy') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting
            path="webPushNotifications"
            expert="1"
          >
            {{ $t('settings.enable_web_push_notifications') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="serverSide_webPushHideContents"
            expert="1"
          >
            {{ $t('settings.notification_setting_hide_notification_contents') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
    <div class="setting-item">
      <p>{{ $t('settings.notification_mutes') }}</p>
      <p>{{ $t('settings.notification_blocks') }}</p>
    </div>
  </div>
</template>

<script src="./notifications_tab.js"></script>
<!-- <style lang="scss" src="./profile.scss"></style> -->
