<template>
  <div :label="$t('settings.general')">
    <div class="setting-item">
      <h2>{{ $t('settings.interface') }}</h2>
      <ul class="setting-list">
        <li>
          <interface-language-switcher />
        </li>
        <li v-if="instanceSpecificPanelPresent">
          <BooleanSetting path="hideISP">
            {{ $t('settings.hide_isp') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="sidebarRight">
            {{ $t('settings.right_sidebar') }}
          </BooleanSetting>
        </li>
        <li v-if="instanceWallpaperUsed">
          <BooleanSetting path="hideInstanceWallpaper">
            {{ $t('settings.hide_wallpaper') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="stopGifs">
            {{ $t('settings.stop_gifs') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="streaming">
            {{ $t('settings.streaming') }}
          </BooleanSetting>
          <ul
            class="setting-list suboptions"
            :class="[{disabled: !streaming}]"
          >
            <li>
              <BooleanSetting
                path="pauseOnUnfocused"
                :disabled="!streaming"
              >
                {{ $t('settings.pause_on_unfocused') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting path="useStreamingApi">
            {{ $t('settings.useStreamingApi') }}
            <br>
            <small>
              {{ $t('settings.useStreamingApiWarning') }}
            </small>
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="virtualScrolling">
            {{ $t('settings.virtual_scrolling') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="autohideFloatingPostButton">
            {{ $t('settings.autohide_floating_post_button') }}
          </BooleanSetting>
        </li>
        <li v-if="instanceShoutboxPresent">
          <BooleanSetting path="hideShoutbox">
            {{ $t('settings.hide_shoutbox') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.post_look_feel') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="collapseMessageWithSubject">
            {{ $t('settings.collapse_subject') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="emojiReactionsOnTimeline">
            {{ $t('settings.emoji_reactions_on_timeline') }}
          </BooleanSetting>
        </li>
        <h3>{{ $t('settings.attachments') }}</h3>
        <li>
          <BooleanSetting path="useContainFit">
            {{ $t('settings.use_contain_fit') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="hideNsfw">
            {{ $t('settings.nsfw_clickthrough') }}
          </BooleanSetting>
        </li>
        <ul class="setting-list suboptions">
          <li>
            <BooleanSetting
              path="preloadImage"
              :disabled="!hideNsfw"
            >
              {{ $t('settings.preload_images') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting
              path="useOneClickNsfw"
              :disabled="!hideNsfw"
            >
              {{ $t('settings.use_one_click_nsfw') }}
            </BooleanSetting>
          </li>
        </ul>
        <li>
          <BooleanSetting path="loopVideo">
            {{ $t('settings.loop_video') }}
          </BooleanSetting>
          <ul
            class="setting-list suboptions"
            :class="[{disabled: !streaming}]"
          >
            <li>
              <BooleanSetting
                path="loopVideoSilentOnly"
                :disabled="!loopVideo || !loopSilentAvailable"
              >
                {{ $t('settings.loop_video_silent_only') }}
              </BooleanSetting>
              <div
                v-if="!loopSilentAvailable"
                class="unavailable"
              >
                <FAIcon icon="globe" />! {{ $t('settings.limited_availability') }}
              </div>
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting path="playVideosInModal">
            {{ $t('settings.play_videos_in_modal') }}
          </BooleanSetting>
        </li>
        <h3>{{ $t('settings.fun') }}</h3>
        <li>
          <BooleanSetting path="greentext">
            {{ $t('settings.greentext') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="mentionLinkShowYous">
            {{ $t('settings.show_yous') }}
          </BooleanSetting>
        </li>
        <li>
          <ChoiceSetting
            id="mentionLinkDisplay"
            path="mentionLinkDisplay"
            :options="mentionLinkDisplayOptions"
          >
            {{ $t('settings.mention_link_display') }}
          </ChoiceSetting>
        </li>
        <ul
          class="setting-list suboptions"
        >
          <li
            v-if="mentionLinkDisplay === 'short'"
          >
            <BooleanSetting path="mentionLinkShowTooltip">
              {{ $t('settings.mention_link_show_tooltip') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting path="useAtIcon">
              {{ $t('settings.use_at_icon') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting path="mentionLinkShowAvatar">
              {{ $t('settings.mention_link_show_avatar') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting path="mentionLinkFadeDomain">
              {{ $t('settings.mention_link_fade_domain') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting path="mentionLinkBoldenYou">
              {{ $t('settings.mention_link_bolden_you') }}
            </BooleanSetting>
          </li>
        </ul>
      </ul>
    </div>

    <div class="setting-item">
      <h2>{{ $t('settings.composing') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="scopeCopy">
            {{ $t('settings.scope_copy') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="alwaysShowSubjectInput">
            {{ $t('settings.subject_input_always_show') }}
          </BooleanSetting>
        </li>
        <li>
          <ChoiceSetting
            id="subjectLineBehavior"
            path="subjectLineBehavior"
            :options="subjectLineOptions"
          >
            {{ $t('settings.subject_line_behavior') }}
          </ChoiceSetting>
        </li>
        <li v-if="postFormats.length > 0">
          <ChoiceSetting
            id="postContentType"
            path="postContentType"
            :options="postContentOptions"
          >
            {{ $t('settings.post_status_content_type') }}
          </ChoiceSetting>
        </li>
        <li>
          <BooleanSetting path="minimalScopesMode">
            {{ $t('settings.minimal_scopes_mode') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="sensitiveByDefault">
            {{ $t('settings.sensitive_by_default') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="alwaysShowNewPostButton">
            {{ $t('settings.always_show_post_button') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="autohideFloatingPostButton">
            {{ $t('settings.autohide_floating_post_button') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="padEmoji">
            {{ $t('settings.pad_emoji') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>

    <div class="setting-item">
      <h2>{{ $t('settings.notifications') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="webPushNotifications">
            {{ $t('settings.enable_web_push_notifications') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./general_tab.js"></script>
