<template>
  <div class="profile-tab">
    <div class="setting-item">
      <h2>{{ $t('settings.name_bio') }}</h2>
      <p>{{ $t('settings.name') }}</p>
      <EmojiInput
        v-model="newName"
        enable-emoji-picker
        :suggest="emojiSuggestor"
      >
        <input
          id="username"
          v-model="newName"
          class="name-changer"
        >
      </EmojiInput>
      <p>{{ $t('settings.bio') }}</p>
      <EmojiInput
        v-model="newBio"
        enable-emoji-picker
        :suggest="emojiUserSuggestor"
      >
        <textarea
          v-model="newBio"
          class="bio resize-height"
        />
      </EmojiInput>
      <p v-if="role === 'admin' || role === 'moderator'">
        <Checkbox v-model="showRole">
          <template v-if="role === 'admin'">
            {{ $t('settings.show_admin_badge') }}
          </template>
          <template v-if="role === 'moderator'">
            {{ $t('settings.show_moderator_badge') }}
          </template>
        </Checkbox>
      </p>
      <div v-if="maxFields > 0">
        <p>{{ $t('settings.profile_fields.label') }}</p>
        <div
          v-for="(_, i) in newFields"
          :key="i"
          class="profile-fields"
        >
          <EmojiInput
            v-model="newFields[i].name"
            enable-emoji-picker
            hide-emoji-button
            :suggest="userSuggestor"
          >
            <input
              v-model="newFields[i].name"
              :placeholder="$t('settings.profile_fields.name')"
            >
          </EmojiInput>
          <EmojiInput
            v-model="newFields[i].value"
            enable-emoji-picker
            hide-emoji-button
            :suggest="userSuggestor"
          >
            <input
              v-model="newFields[i].value"
              :placeholder="$t('settings.profile_fields.value')"
            >
          </EmojiInput>
          <button
            class="delete-field button-unstyled -hover-highlight"
            @click="deleteField(i)"
          >
            <!-- TODO something is wrong with v-show here -->
            <FAIcon
              v-if="newFields.length > 1"
              icon="times"
            />
          </button>
        </div>
        <button
          v-if="newFields.length < maxFields"
          class="add-field faint button-unstyled -hover-highlight"
          @click="addField"
        >
          <FAIcon icon="plus" />
          {{ $t("settings.profile_fields.add_field") }}
        </button>
      </div>
      <p>
        <Checkbox v-model="bot">
          {{ $t('settings.bot') }}
        </Checkbox>
      </p>
      <p>
        <ChoiceSetting
          id="userAcceptsDirectMessagesFrom"
          path="userAcceptsDirectMessagesFrom"
          :options="userAcceptsDirectMessagesFromOptions"
        >
          {{ $t('settings.user_accepts_direct_messages_from') }}
        </ChoiceSetting>
      </p>
      <p>
        <Checkbox v-model="expirePosts">
          {{ $t('settings.expire_posts_enabled') }}
        </Checkbox>
        <input
          v-model="newPostTTLDays"
          :disabled="!expirePosts"
          type="number"
          min="1"
          max="730"
          class="expire-posts-days"
          :placeholder="$t('settings.expire_posts_input_placeholder')"
        />
      </p>
      <p>

      </p>
      <p>
        <interface-language-switcher
          :prompt-text="$t('settings.email_language')"
          :language="emailLanguage"
          :set-language="val => emailLanguage = val"
        />
      </p>
      <button
        :disabled="newName && newName.length === 0"
        class="btn button-default"
        @click="updateProfile"
      >
        {{ $t('settings.save') }}
      </button>
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.avatar') }}</h2>
      <p class="visibility-notice">
        {{ $t('settings.avatar_size_instruction') }}
      </p>
      <div class="current-avatar-container">
        <img
          :src="user.profile_image_url_original"
          class="current-avatar"
        >
        <button
          v-if="!isDefaultAvatar && pickAvatarBtnVisible"
          :title="$t('settings.reset_avatar')"
          class="button-unstyled reset-button"
          @click="resetAvatar"
        >
          <FAIcon
            icon="times"
            type="button"
          />
        </button>
      </div>
      <p>{{ $t('settings.set_new_avatar') }}</p>
      <button
        v-show="pickAvatarBtnVisible"
        id="pick-avatar"
        class="button-default btn"
        type="button"
      >
        {{ $t('settings.upload_a_photo') }}
      </button>
      <image-cropper
        trigger="#pick-avatar"
        :submit-handler="submitAvatar"
        @open="pickAvatarBtnVisible=false"
        @close="pickAvatarBtnVisible=true"
      />
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.profile_banner') }}</h2>
      <div class="banner-background-preview">
        <img :src="user.cover_photo">
        <button
          v-if="!isDefaultBanner"
          class="button-unstyled reset-button"
          :title="$t('settings.reset_profile_banner')"
          @click="resetBanner"
        >
          <FAIcon
            icon="times"
            type="button"
          />
        </button>
      </div>
      <p>{{ $t('settings.set_new_profile_banner') }}</p>
      <img
        v-if="bannerPreview"
        class="banner-background-preview"
        :src="bannerPreview"
      >
      <div>
        <input
          type="file"
          @change="uploadFile('banner', $event)"
        >
      </div>
      <FAIcon
        v-if="bannerUploading"
        class="uploading"
        spin
        icon="circle-notch"
      />
      <button
        v-else-if="bannerPreview"
        class="btn button-default"
        @click="submitBanner(banner)"
      >
        {{ $t('settings.save') }}
      </button>
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.profile_background') }}</h2>
      <div class="banner-background-preview">
        <img :src="user.background_image">
        <button
          v-if="!isDefaultBackground"
          class="button-unstyled reset-button"
          :title="$t('settings.reset_profile_background')"
          @click="resetBackground"
        >
          <FAIcon
            icon="times"
            type="button"
          />
        </button>
      </div>
      <p>{{ $t('settings.set_new_profile_background') }}</p>
      <img
        v-if="backgroundPreview"
        class="banner-background-preview"
        :src="backgroundPreview"
      >
      <div>
        <input
          type="file"
          @change="uploadFile('background', $event)"
        >
      </div>
      <FAIcon
        v-if="backgroundUploading"
        class="uploading"
        spin
        icon="circle-notch"
      />
      <button
        v-else-if="backgroundPreview"
        class="btn button-default"
        @click="submitBackground(background)"
      >
        {{ $t('settings.save') }}
      </button>
    </div>
    <div class="setting-item">
      <h2>{{ $t('settings.account_privacy') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path="serverSide_locked">
            {{ $t('settings.lock_account_description') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="serverSide_discoverable">
            {{ $t('settings.discoverable') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="serverSide_allowFollowingMove">
            {{ $t('settings.allow_following_move') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="serverSide_hideFavorites">
            {{ $t('settings.hide_favorites_description') }}
          </BooleanSetting>
        </li>
        <li>
          <BooleanSetting path="serverSide_hideFollowers">
            {{ $t('settings.hide_followers_description') }}
          </BooleanSetting>
          <ul
            class="setting-list suboptions"
            :class="[{disabled: !serverSide_hideFollowers}]"
          >
            <li>
              <BooleanSetting
                path="serverSide_hideFollowersCount"
                :disabled="!serverSide_hideFollowers"
              >
                {{ $t('settings.hide_followers_count_description') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting path="serverSide_hideFollows">
            {{ $t('settings.hide_follows_description') }}
          </BooleanSetting>
          <ul
            class="setting-list suboptions"
            :class="[{disabled: !serverSide_hideFollows}]"
          >
            <li>
              <BooleanSetting
                path="serverSide_hideFollowsCount"
                :disabled="!serverSide_hideFollows"
              >
                {{ $t('settings.hide_follows_count_description') }}
              </BooleanSetting>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./profile_tab.js"></script>
<style lang="scss" src="./profile_tab.scss"></style>
