<template>
  <div class="AccountActions">
    <Popover
      trigger="click"
      placement="bottom"
      :bound-to="{ x: 'container' }"
      remove-padding
    >
      <template #content>
        <div class="dropdown-menu">
          <template v-if="relationship.following">
            <button
              v-if="relationship.showing_reblogs"
              class="btn button-default dropdown-item"
              @click="hideRepeats"
            >
              {{ $t('user_card.hide_repeats') }}
            </button>
            <button
              v-if="!relationship.showing_reblogs"
              class="btn button-default dropdown-item"
              @click="showRepeats"
            >
              {{ $t('user_card.show_repeats') }}
            </button>
            <div
              role="separator"
              class="dropdown-divider"
            />
          </template>
          <button
            v-if="relationship.followed_by"
            class="btn button-default btn-block dropdown-item"
            @click="removeUserFromFollowers"
          >
            {{ $t('user_card.remove_follower') }}
          </button>
          <button
            v-if="relationship.blocking"
            class="btn button-default btn-block dropdown-item"
            @click="unblockUser"
          >
            {{ $t('user_card.unblock') }}
          </button>
          <button
            v-else
            class="btn button-default btn-block dropdown-item"
            @click="blockUser"
          >
            {{ $t('user_card.block') }}
          </button>
          <button
            class="btn button-default btn-block dropdown-item"
            @click="reportUser"
          >
            {{ $t('user_card.report') }}
          </button>
          <button
            v-if="relationship.domain_blocking"
            class="btn button-default btn-block dropdown-item"
            @click="unmuteDomain"
          >
            {{ $t('user_card.domain_muted') }}
          </button>
          <button
            v-else-if="!user.is_local"
            class="btn button-default btn-block dropdown-item"
            @click="muteDomain"
          >
            {{ $t('user_card.mute_domain') }}
          </button>
        </div>
      </template>
      <template #trigger>
        <button class="button-unstyled ellipsis-button">
          <FAIcon
            class="icon"
            icon="ellipsis-v"
          />
        </button>
      </template>
    </Popover>
    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmBlock"
        :title="$t('user_card.block_confirm_title')"
        :confirm-text="$t('user_card.block_confirm_accept_button')"
        :cancel-text="$t('user_card.block_confirm_cancel_button')"
        @accepted="doBlockUser"
        @cancelled="hideConfirmBlock"
      >
        <i18n-t
          keypath="user_card.block_confirm"
          tag="span"
        >
          <template #user>
            <span
              v-text="user.screen_name_ui"
            />
          </template>
        </i18n-t>
      </confirm-modal>
    </teleport>
  </div>
</template>

<script src="./account_actions.js"></script>

<style lang="scss">
@import '../../_variables.scss';
.AccountActions {
  .ellipsis-button {
    width: 2.5em;
    margin: -0.5em 0;
    padding: 0.5em 0;
    text-align: center;

    &:not(:hover) .icon {
      color: $fallback--lightText;
      color: var(--lightText, $fallback--lightText);
    }
  }
}
</style>
