<template>
  <div :label="$t('settings.filtering')">
    <div class="setting-item">
      <h2>{{ $t('settings.posts') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="hideFilteredStatuses">
            {{ $t('settings.hide_filtered_statuses') }}
          </BooleanSetting>
          <ul
            class="setting-list suboptions"
            :class="[{disabled: !streaming}]"
          >
            <li>
              <BooleanSetting
                :disabled="hideFilteredStatuses"
                path="hideWordFilteredPosts"
              >
                {{ $t('settings.hide_wordfiltered_statuses') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting
                :disabled="hideFilteredStatuses"
                v-if="user"
                path="hideMutedThreads"
              >
                {{ $t('settings.hide_muted_threads') }}
              </BooleanSetting>
            </li>
            <li>
              <BooleanSetting
                :disabled="hideFilteredStatuses"
                v-if="user"
                path="hideMutedPosts"
              >
                {{ $t('settings.hide_muted_posts') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting path="hidePostStats" expert="1">
            {{ $t('settings.hide_post_stats') }}
          </BooleanSetting>
        </li>
        <ChoiceSetting
          id="replyVisibility"
          path="replyVisibility"
          :options="replyVisibilityOptions"
          v-if="user"
        >
          {{ $t('settings.replies_in_timeline') }}
        </ChoiceSetting>
        <li>
          <h3>{{ $t('settings.wordfilter') }}</h3>
          <textarea
            id="muteWords"
            v-model="muteWordsString"
            class="resize-height"
          />
          <div>{{ $t('settings.filtering_explanation') }}</div>
        </li>
        <h3>{{ $t('settings.attachments') }}</h3>
        <li v-if="expertLevel > 0">
          <label for="maxThumbnails">
            {{ $t('settings.max_thumbnails') }}
          </label>
          <input
            id="maxThumbnails"
            path.number="maxThumbnails"
            class="number-input"
            type="number"
            min="0"
            step="1"
          >
        </li>
        <li>
          <BooleanSetting path="hideAttachments">
            {{ $t('settings.hide_attachments_in_tl') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="hideAttachmentsInConv">
            {{ $t('settings.hide_attachments_in_convo') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
    <div class="setting-item" v-if="expertLevel > 0">
      <h2>{{ $t('settings.user_profiles') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="hideUserStats">
            {{ $t('settings.hide_user_stats') }}
          </BooleanSetting>
        </li>
      </ul>
    </div>
  </div>
</template>
<script src="./filtering_tab.js"></script>
