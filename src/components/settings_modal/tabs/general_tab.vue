<template>
  <div :label="$t('settings.general')">
    <div class="setting-item">
      <ul class="setting-list">
        <li>
          <interface-language-switcher
            :prompt-text="$t('settings.interfaceLanguage')"
            :language="language"
            :set-language="val => language = val"
          />
        </li>
        <li
          v-if="user && (settingsProfiles.length > 0)"
        >
          <h2>{{ $t('settings.settings_profile') }}</h2>
          <p>
            {{ $t('settings.settings_profile_currently', { name: settingsProfile, version: settingsVersion }) }}
            <button
              class="btn button-default"
              @click="forceSync()"
            >
              {{ $t('settings.settings_profile_force_sync') }}
            </button>
          </p>
          <div
            @click="toggleExpandedSettings"
          >
            <template
              v-if="profilesExpanded"
            >
              <button class="btn button-default">
                {{ $t('settings.settings_profiles_unshow') }}
              </button>
            </template>
            <template
              v-else
            >
              <button class="btn button-default">
                {{ $t('settings.settings_profiles_show') }}
              </button>
            </template>
          </div>
          <br>
          <template
            v-if="profilesExpanded"
          >

            <div
              v-for="profile in settingsProfiles"
              :key="profile.id"
              class="settings-profile"
            >
              <h4>{{ profile.name }} ({{ profile.version }})</h4>
              <template
                v-if="settingsProfile === profile.name"
              >
                {{ $t('settings.settings_profile_in_use') }}
              </template>
              <template
                v-else
              >
                <button
                  class="btn button-default"
                  @click="loadSettingsProfile(profile.name)"
                >
                  {{ $t('settings.settings_profile_use') }}
                </button>
                <button
                  class="btn button-default"
                  @click="deleteSettingsProfile(profile.name)"
                >
                  {{ $t('settings.settings_profile_delete') }}
                </button>
              </template>
            </div>
            <button class="btn button-default" @click="refreshProfiles()">
              {{ $t('settings.settings_profiles_refresh') }}
              <FAIcon icon="sync" @click="refreshProfiles()" />
            </button>
            <h3>{{ $t('settings.settings_profile_creation') }}</h3>
            <label for="settings-profile-new-name">
              {{ $t('settings.settings_profile_creation_new_name_label') }}
            </label>
            <input v-model="newProfileName" id="settings-profile-new-name">
            <button
              class="btn button-default"
              @click="createSettingsProfile"
            >
              {{ $t('settings.settings_profile_creation_submit') }}
            </button>
          </template>
        </li>
      </ul>
    </div>

    <div class="setting-item">
      <h2>{{ $t('settings.interface') }}</h2>
      <ul class="setting-list">
        <li v-if="instanceSpecificPanelPresent">
          <BooleanSetting path="hideISP">
            {{ $t('settings.hide_isp') }}
          </BooleanSetting>
        </li>
        <li v-if="instanceWallpaperUsed">
          <BooleanSetting path="hideInstanceWallpaper">
            {{ $t('settings.hide_wallpaper') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="hideSiteFavicon"
            expert="1"
          >
            {{ $t('settings.hide_site_favicon') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="hideSiteName"
            expert="1"
          >
            {{ $t('settings.hide_site_name') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="showNavShortcuts"
            expert="1"
          >
            {{ $t('settings.show_nav_shortcuts') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="showPanelNavShortcuts"
            expert="1"
          >
            {{ $t('settings.show_panel_nav_shortcuts') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="showWiderShortcuts"
            expert="1"
          >
            {{ $t('settings.show_wider_shortcuts') }}
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
          <BooleanSetting
            path="useStreamingApi"
            expert="1"
          >
            {{ $t('settings.useStreamingApi') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="virtualScrolling"
            expert="1"
          >
            {{ $t('settings.virtual_scrolling') }}
          </BooleanSetting>
        </li>

        <li>
          <BooleanSetting path="renderMisskeyMarkdown">
            {{ $t('settings.render_mfm') }}
          </BooleanSetting>
          <ul
            class="setting-list suboptions"
          >
            <li>
              <BooleanSetting
                path="renderMfmOnHover"
                :disabled="!renderMisskeyMarkdown"
              >
                {{ $t('settings.render_mfm_on_hover') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
        <li>
          <ChoiceSetting
            id="userProfileDefaultTab"
            path="userProfileDefaultTab"
            :options="userProfileDefaultTabOptions"
          >
            {{ $t('settings.user_profile_default_tab') }}
          </ChoiceSetting>
        </li>
        <li>
          <ChoiceSetting
            v-if="user && (translationLanguages.length > 0)"
            id="translationLanguage"
            path="translationLanguage"
            :options="translationLanguages"
          >
            {{ $t('settings.translation_language') }}
          </ChoiceSetting>
        </li>
        <li>
          <BooleanSetting
            path="alwaysShowNewPostButton"
            expert="1"
          >
            {{ $t('settings.always_show_post_button') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="autohideFloatingPostButton"
            expert="1"
          >
            {{ $t('settings.autohide_floating_post_button') }}
          </BooleanSetting>
        </li>
        <li>
          <h3>{{ $t('settings.columns') }}</h3>
        </li>
        <li>
          <BooleanSetting path="disableStickyHeaders">
            {{ $t('settings.disable_sticky_headers') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="showScrollbars">
            {{ $t('settings.show_scrollbars') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="sidebarRight">
            {{ $t('settings.right_sidebar') }}
          </BooleanSetting>
        </li>
        <li>
          <ChoiceSetting
            v-if="user"
            id="thirdColumnMode"
            path="thirdColumnMode"
            :options="thirdColumnModeOptions"
          >
            {{ $t('settings.third_column_mode') }}
          </ChoiceSetting>
        </li>
        <li>
          <h3>{{ $t('settings.confirmation_dialogs') }}</h3>
        </li>
        <li class="select-multiple">
          <span class="label">{{ $t('settings.confirm_dialogs') }}</span>
          <ul class="option-list">
            <li>
              <BooleanSetting path="modalOnRepeat">
                {{ $t('settings.confirm_dialogs_repeat') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnUnfollow">
                {{ $t('settings.confirm_dialogs_unfollow') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnBlock">
                {{ $t('settings.confirm_dialogs_block') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnMute">
                {{ $t('settings.confirm_dialogs_mute') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnDelete">
                {{ $t('settings.confirm_dialogs_delete') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnApproveFollow">
                {{ $t('settings.confirm_dialogs_approve_follow') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting path="modalOnDenyFollow">
                {{ $t('settings.confirm_dialogs_deny_follow') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.post_look_feel') }}</h2>
      <ul class="setting-list">
        <li>
          <ChoiceSetting
            id="conversationDisplay"
            path="conversationDisplay"
            :options="conversationDisplayOptions"
          >
            {{ $t('settings.conversation_display') }}
          </ChoiceSetting>
        </li>
        <ul
          v-if="conversationDisplay !== 'linear'"
          class="setting-list suboptions"
        >
          <li>
            <BooleanSetting path="conversationTreeAdvanced">
              {{ $t('settings.tree_advanced') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting
              path="conversationTreeFadeAncestors"
              :expert="1"
            >
              {{ $t('settings.tree_fade_ancestors') }}
            </BooleanSetting>
          </li>
          <li>
            <IntegerSetting
              path="maxDepthInThread"
              :min="3"
              :expert="1"
            >
              {{ $t('settings.max_depth_in_thread') }}
            </IntegerSetting>
          </li>
          <li>
            <ChoiceSetting
              id="conversationOtherRepliesButton"
              path="conversationOtherRepliesButton"
              :options="conversationOtherRepliesButtonOptions"
              :expert="1"
            >
              {{ $t('settings.conversation_other_replies_button') }}
            </ChoiceSetting>
          </li>
        </ul>
        <li>
          <BooleanSetting path="collapseMessageWithSubject">
            {{ $t('settings.collapse_subject') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="emojiReactionsOnTimeline"
            expert="1"
          >
            {{ $t('settings.emoji_reactions_on_timeline') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            v-if="user"
            path="serverSide_stripRichContent"
            expert="1"
          >
            {{ $t('settings.no_rich_text_description') }}
          </BooleanSetting>
        </li>
        <h3>{{ $t('settings.attachments') }}</h3>
        <li>
          <BooleanSetting
            path="useContainFit"
            expert="1"
          >
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
              expert="1"
              :disabled="!hideNsfw"
            >
              {{ $t('settings.preload_images') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting
              path="useBlurhash"
              expert="1"
              :disabled="!hideNsfw"
            >
              {{ $t('settings.use_blurhash') }}
            </BooleanSetting>
          </li>
          <li>
            <BooleanSetting
              path="useOneClickNsfw"
              expert="1"
              :disabled="!hideNsfw"
            >
              {{ $t('settings.use_one_click_nsfw') }}
            </BooleanSetting>
          </li>
        </ul>
        <li>
          <BooleanSetting
            path="loopVideo"
            expert="1"
          >
            {{ $t('settings.loop_video') }}
          </BooleanSetting>
          <ul
            class="setting-list suboptions"
            :class="[{disabled: !streaming}]"
          >
            <li>
              <BooleanSetting
                path="loopVideoSilentOnly"
                expert="1"
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
          <BooleanSetting
            path="playVideosInModal"
            expert="1"
          >
            {{ $t('settings.play_videos_in_modal') }}
          </BooleanSetting>
        </li>
        <h3>{{ $t('settings.mention_links') }}</h3>
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
          <li v-if="mentionLinkDisplay === 'short'">
            <BooleanSetting
              path="mentionLinkShowTooltip"
              expert="1"
            >
              {{ $t('settings.mention_link_show_tooltip') }}
            </BooleanSetting>
          </li>
        </ul>
        <li>
          <BooleanSetting path="mentionLinkShowAvatar">
            {{ $t('settings.mention_link_show_avatar') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="mentionLinkFadeDomain"
            expert="1"
          >
            {{ $t('settings.mention_link_fade_domain') }}
          </BooleanSetting>
        </li>
        <li v-if="user">
          <BooleanSetting
            path="mentionLinkBoldenYou"
            expert="1"
          >
            {{ $t('settings.mention_link_bolden_you') }}
          </BooleanSetting>
        </li>
        <h3 v-if="expertLevel > 0">
          {{ $t('settings.fun') }}
        </h3>
        <li>
          <BooleanSetting
            path="greentext"
            expert="1"
          >
            {{ $t('settings.greentext') }}
          </BooleanSetting>
        </li>
        <li v-if="user">
          <BooleanSetting
            path="mentionLinkShowYous"
            expert="1"
          >
            {{ $t('settings.show_yous') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>

    <div
      v-if="user"
      class="setting-item"
    >
      <h2>{{ $t('settings.composing') }}</h2>
      <ul class="setting-list">
        <li>
          <label for="default-vis">
            {{ $t('settings.default_vis') }} <ServerSideIndicator :server-side="true" />
            <ScopeSelector
              class="scope-selector"
              :user-default="serverSide_defaultScope"
              :initial-scope="serverSide_defaultScope"
              :on-scope-change="changeDefaultScope"
            />
          </label>
        </li>
        <li>
          <BooleanSetting path="sensitiveByDefault">
            {{ $t('settings.sensitive_by_default') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="sensitiveIfSubject">
            {{ $t('settings.sensitive_if_subject') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="alwaysShowSubjectInput"
            expert="1"
          >
            {{ $t('settings.subject_input_always_show') }}
          </BooleanSetting>
        </li>
        <li>
          <ChoiceSetting
            id="subjectLineBehavior"
            path="subjectLineBehavior"
            :options="subjectLineOptions"
            expert="1"
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
          <BooleanSetting
            path="alwaysShowNewPostButton"
            expert="1"
          >
            {{ $t('settings.always_show_post_button') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="autohideFloatingPostButton"
            expert="1"
          >
            {{ $t('settings.autohide_floating_post_button') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting
            path="padEmoji"
            expert="1"
          >
            {{ $t('settings.pad_emoji') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./general_tab.js"></script>
<style lang="scss">
.settings-profile {
  margin-bottom: 1em;
}

#settings-profile-new-name {
  margin-left: 1em;
  margin-right: 1em;
}
</style>
