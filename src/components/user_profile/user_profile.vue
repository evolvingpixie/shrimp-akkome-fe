<template>
  <div>
    <div
      v-if="user"
      class="user-profile panel panel-default"
    >
      <UserCard
        :user-id="userId"
        :switcher="true"
        :selected="timeline.viewing"
        :allow-zooming-avatar="true"
        rounded="top"
      />
      <div
        v-if="user.fields_html && user.fields_html.length > 0"
        class="user-profile-fields"
      >
        <dl
          v-for="(field, index) in user.fields_html"
          :key="index"
          class="user-profile-field"
        >
          <dt
            :title="user.fields_text[index].name"
            class="user-profile-field-name"
          >
            <RichContent
              :html="field.name"
              :emoji="user.emoji"
            />
          </dt>
          <dd
            :title="user.fields_text[index].value"
            class="user-profile-field-value"
          >
            <RichContent
              :html="field.value"
              :emoji="user.emoji"
            />
            <span
              v-if="field.verified_at"
              class="user-profile-field-validated"
            >
              <FAIcon
                icon="check-circle"
                :title="$t('user_profile.field_validated')"
              />
            </span>
          </dd>
        </dl>
      </div>
      <div
        v-if="currentUser && !isUs"
        class="note"
      >
        <textarea
          v-model="note"
          class="resize-height"
          :placeholder="$t('user_card.note')"
          @input="setNote"
        />
        <div
          v-show="noteLoading"
          class="preview-spinner"
        >
          <FAIcon
            class="fa-old-padding"
            spin
            icon="circle-notch"
          />
        </div>
      </div>
      <tab-switcher
        :active-tab="tab"
        :render-only-focused="true"
        :on-switch="onTabSwitch"
      >
        <Timeline
          key="statuses"
          :label="$t('user_card.statuses')"
          :count="user.statuses_count"
          :embedded="true"
          :title="$t('user_profile.timeline_title')"
          :timeline="timeline"
          timeline-name="user"
          :user-id="userId"
          :pinned-status-ids="user.pinnedStatusIds"
          :in-profile="true"
          :footer-slipgate="footerRef"
        />
        <Timeline
          key="replies"
          :label="$t('user_card.replies')"
          :count="user.statuses_count"
          :embedded="true"
          :title="$t('user_card.replies')"
          :timeline="replies"
          timeline-name="replies"
          :user-id="userId"
          :in-profile="true"
          :footer-slipgate="footerRef"
        />
        <div
          v-if="followsTabVisible"
          key="followees"
          :label="$t('user_card.followees')"
        >
          <tab-switcher
            :active-tab="followsTab"
            :render-only-focused="true"
            :on-switch="onFollowsTabSwitch"
          >
            <div
              key="users"
              :label="$t('user_card.followed_users')"
            >
              <FriendList :user-id="userId">
                <template #item="{item}">
                  <FollowCard :user="item" />
                </template>
              </FriendList>
            </div>
            <div
              key="tags"
              v-if="isUs"
              :label="$t('user_card.followed_tags')"
            >
              <FollowedTagList
                :user-id="userId"
                :get-key="(item) => item.name"
              >
                <template #item="{item}">
                  <FollowedTagCard :tag="item" />
                </template>
                <template #empty>
                  {{ $t('user_card.not_following_any_hashtags')}}
                </template>
              </FollowedTagList>
            </div>
          </tab-switcher>
        </div>
        <div
          v-if="followersTabVisible"
          key="followers"
          :label="$t('user_card.followers')"
        >
          <FollowerList :user-id="userId">
            <template #item="{item}">
              <FollowCard
                :user="item"
                :no-follows-you="isUs"
              />
            </template>
          </FollowerList>
        </div>
        <Timeline
          key="media"
          :label="$t('user_card.media')"
          :embedded="true"
          :title="$t('user_card.media')"
          timeline-name="media"
          :timeline="media"
          :user-id="userId"
          :in-profile="true"
          :footer-slipgate="footerRef"
        />
        <Timeline
          v-if="isUs"
          key="favorites"
          :label="$t('user_card.favorites')"
          :disabled="!isUs"
          :embedded="true"
          :title="$t('user_card.favorites')"
          timeline-name="favorites"
          :timeline="favorites"
          :in-profile="true"
          :footer-slipgate="footerRef"
        />
      </tab-switcher>
      <div
        :ref="setFooterRef"
        class="panel-footer"
      />
    </div>
    <div
      v-else
      class="panel user-profile-placeholder"
    >
      <div class="panel-heading">
        <div class="title">
          {{ $t('settings.profile_tab') }}
        </div>
      </div>
      <div class="panel-body">
        <span v-if="error">{{ error }}</span>
        <FAIcon
          v-else
          spin
          icon="circle-notch"
        />
      </div>
    </div>
  </div>
</template>

<script src="./user_profile.js"></script>

<style lang="scss">
@import '../../_variables.scss';

.user-profile {
  flex: 2;
  flex-basis: 500px;

  // No sticky header on user profile
  --currentPanelStack: 1;

  .user-profile-fields {
    margin: 0 0.5em;

    img {
      object-fit: contain;
      vertical-align: middle;
      max-width: 100%;
      max-height: 400px;

      &.emoji {
        width: 18px;
        height: 18px;
      }
    }

    .user-profile-field {
      display: flex;
      margin: 0.25em;
      border: 1px solid var(--border, $fallback--border);
      border-radius: $fallback--inputRadius;
      border-radius: var(--inputRadius, $fallback--inputRadius);

      .user-profile-field-name {
        flex: 0 1 30%;
        font-weight: 500;
        text-align: right;
        color: var(--lightText);
        min-width: 120px;
        border-right: 1px solid var(--border, $fallback--border);
      }

      .user-profile-field-value {
        flex: 1 1 70%;
        color: var(--text);
        margin: 0 0 0 0.25em;
      }

      .user-profile-field-name, .user-profile-field-value {
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding: 0.5em 1.5em;
        box-sizing: border-box;
      }

      .user-profile-field-validated {
        margin-left: 1rem;
        color: green;
      }
    }
  }

  .userlist-placeholder {
    display: flex;
    justify-content: center;
    align-items: middle;
    padding: 2em;
  }

  .note {
    position: relative;
    margin: 0.5em 0.75em;

    textarea {
      width: 100%;
    }

    .preview-spinner {
      position: absolute;
      top: 0;
      right: 0;
      margin: 0.5em 0.25em;
    }
  }
}
.user-profile-placeholder {
  .panel-body {
    display: flex;
    justify-content: center;
    align-items: middle;
    padding: 7em;
  }
}
</style>
